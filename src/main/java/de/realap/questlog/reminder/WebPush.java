package de.realap.questlog.reminder;

import java.math.BigInteger;
import java.net.URI;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.AlgorithmParameters;
import java.security.GeneralSecurityException;
import java.security.KeyFactory;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.SecureRandom;
import java.security.Signature;
import java.security.interfaces.ECPrivateKey;
import java.security.interfaces.ECPublicKey;
import java.security.spec.ECGenParameterSpec;
import java.security.spec.ECParameterSpec;
import java.security.spec.ECPoint;
import java.security.spec.ECPrivateKeySpec;
import java.security.spec.ECPublicKeySpec;
import java.time.Duration;
import java.time.Instant;
import java.util.Arrays;
import java.util.Base64;
import javax.crypto.Cipher;
import javax.crypto.KeyAgreement;
import javax.crypto.Mac;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;

/**
 * Verschlüsselt Nachrichten für Web Push (RFC 8291, aes128gcm) und signiert sie mit VAPID (RFC
 * 8292). Kommt ohne Fremdbibliothek aus, alles steckt im JDK.
 */
final class WebPush {

  private static final Base64.Encoder B64 = Base64.getUrlEncoder().withoutPadding();
  private static final Base64.Decoder B64D = Base64.getUrlDecoder();
  private static final ECParameterSpec P256 = curve();
  private static final int RECORD_SIZE = 4096;
  private static final Duration TOKEN_VALIDITY = Duration.ofHours(12);

  private final SecureRandom random = new SecureRandom();
  private final ECPublicKey vapidPublic;
  private final ECPrivateKey vapidPrivate;
  private final String subject;

  WebPush(String publicKey, String privateKey, String subject) {
    this.vapidPublic = publicKey(B64D.decode(publicKey));
    this.vapidPrivate = privateKey(B64D.decode(privateKey));
    this.subject = subject;
  }

  /** Inhalt verschlüsselt für ein Abo, fertig als Request-Body. */
  // Der Schlüssel wird je Nachricht abgeleitet, PMD hält ihn fälschlich für fest eingebaut.
  @SuppressWarnings("PMD.HardCodedCryptoKey")
  byte[] encrypt(byte[] plaintext, String p256dh, String auth) {
    try {
      byte[] uaPublic = B64D.decode(p256dh);
      KeyPairGenerator generator = KeyPairGenerator.getInstance("EC");
      generator.initialize(new ECGenParameterSpec("secp256r1"), random);
      KeyPair local = generator.generateKeyPair();
      byte[] asPublic = raw((ECPublicKey) local.getPublic());

      KeyAgreement agreement = KeyAgreement.getInstance("ECDH");
      agreement.init(local.getPrivate());
      agreement.doPhase(publicKey(uaPublic), true);
      byte[] ecdhSecret = agreement.generateSecret();

      byte[] prkKey = hmac(B64D.decode(auth), ecdhSecret);
      byte[] keyInfo = concat(ascii("WebPush: info\0"), uaPublic, asPublic, new byte[] {1});
      byte[] ikm = hmac(prkKey, keyInfo);

      byte[] salt = new byte[16];
      random.nextBytes(salt);
      byte[] prk = hmac(salt, ikm);
      byte[] cek = Arrays.copyOf(hmac(prk, ascii("Content-Encoding: aes128gcm\0\1")), 16);
      byte[] nonce = Arrays.copyOf(hmac(prk, ascii("Content-Encoding: nonce\0\1")), 12);

      Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
      cipher.init(
          Cipher.ENCRYPT_MODE, new SecretKeySpec(cek, "AES"), new GCMParameterSpec(128, nonce));
      // 0x02 markiert den letzten und einzigen Datensatz.
      byte[] ciphertext = cipher.doFinal(concat(plaintext, new byte[] {2}));

      return ByteBuffer.allocate(16 + 4 + 1 + asPublic.length + ciphertext.length)
          .put(salt)
          .putInt(RECORD_SIZE)
          .put((byte) asPublic.length)
          .put(asPublic)
          .put(ciphertext)
          .array();
    } catch (GeneralSecurityException e) {
      throw new IllegalStateException("Push-Nachricht ließ sich nicht verschlüsseln", e);
    }
  }

  /** Authorization-Header für den Push-Dienst des Abos. */
  String authorization(URI endpoint, Instant now) {
    String audience = endpoint.getScheme() + "://" + endpoint.getRawAuthority();
    String header = B64.encodeToString(ascii("{\"typ\":\"JWT\",\"alg\":\"ES256\"}"));
    String claims =
        B64.encodeToString(
            ("{\"aud\":\""
                    + audience
                    + "\",\"exp\":"
                    + now.plus(TOKEN_VALIDITY).getEpochSecond()
                    + ",\"sub\":\""
                    + subject
                    + "\"}")
                .getBytes(StandardCharsets.UTF_8));
    String unsigned = header + "." + claims;
    try {
      Signature signer = Signature.getInstance("SHA256withECDSAinP1363Format");
      signer.initSign(vapidPrivate);
      signer.update(ascii(unsigned));
      String token = unsigned + "." + B64.encodeToString(signer.sign());
      return "vapid t=" + token + ", k=" + B64.encodeToString(raw(vapidPublic));
    } catch (GeneralSecurityException e) {
      throw new IllegalStateException("VAPID-Token ließ sich nicht signieren", e);
    }
  }

  static ECPublicKey publicKey(byte[] raw) {
    if (raw.length != 65 || raw[0] != 4) {
      throw new IllegalArgumentException("Kein unkomprimierter P-256-Schlüssel");
    }
    ECPoint point =
        new ECPoint(
            new BigInteger(1, Arrays.copyOfRange(raw, 1, 33)),
            new BigInteger(1, Arrays.copyOfRange(raw, 33, 65)));
    try {
      return (ECPublicKey)
          KeyFactory.getInstance("EC").generatePublic(new ECPublicKeySpec(point, P256));
    } catch (GeneralSecurityException e) {
      throw new IllegalArgumentException("Ungültiger P-256-Schlüssel", e);
    }
  }

  static ECPrivateKey privateKey(byte[] raw) {
    try {
      return (ECPrivateKey)
          KeyFactory.getInstance("EC")
              .generatePrivate(new ECPrivateKeySpec(new BigInteger(1, raw), P256));
    } catch (GeneralSecurityException e) {
      throw new IllegalArgumentException("Ungültiger privater Schlüssel", e);
    }
  }

  static byte[] raw(ECPublicKey key) {
    return concat(
        new byte[] {4}, unsigned32(key.getW().getAffineX()), unsigned32(key.getW().getAffineY()));
  }

  static byte[] hmac(byte[] key, byte[] data) throws GeneralSecurityException {
    Mac mac = Mac.getInstance("HmacSHA256");
    mac.init(new SecretKeySpec(key, "HmacSHA256"));
    return mac.doFinal(data);
  }

  static byte[] ascii(String text) {
    return text.getBytes(StandardCharsets.US_ASCII);
  }

  static byte[] concat(byte[]... parts) {
    int length = 0;
    for (byte[] part : parts) {
      length += part.length;
    }
    ByteBuffer buffer = ByteBuffer.allocate(length);
    for (byte[] part : parts) {
      buffer.put(part);
    }
    return buffer.array();
  }

  private static byte[] unsigned32(BigInteger value) {
    byte[] bytes = value.toByteArray();
    byte[] out = new byte[32];
    int length = Math.min(bytes.length, 32);
    System.arraycopy(bytes, bytes.length - length, out, 32 - length, length);
    return out;
  }

  private static ECParameterSpec curve() {
    try {
      AlgorithmParameters parameters = AlgorithmParameters.getInstance("EC");
      parameters.init(new ECGenParameterSpec("secp256r1"));
      return parameters.getParameterSpec(ECParameterSpec.class);
    } catch (GeneralSecurityException e) {
      throw new IllegalStateException("P-256 fehlt im JDK", e);
    }
  }
}
