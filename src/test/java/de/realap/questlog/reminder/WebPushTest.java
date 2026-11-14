package de.realap.questlog.reminder;

import static org.assertj.core.api.Assertions.assertThat;

import java.net.URI;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.Signature;
import java.security.interfaces.ECPrivateKey;
import java.security.interfaces.ECPublicKey;
import java.security.spec.ECGenParameterSpec;
import java.time.Instant;
import java.util.Arrays;
import java.util.Base64;
import javax.crypto.Cipher;
import javax.crypto.KeyAgreement;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import org.junit.jupiter.api.Test;

/** Prüft die Verschlüsselung aus Sicht des Browsers, der sie wieder entschlüsselt. */
class WebPushTest {

  private static final Base64.Encoder B64 = Base64.getUrlEncoder().withoutPadding();
  private static final Base64.Decoder B64D = Base64.getUrlDecoder();

  @Test
  void browserCanDecryptTheMessage() throws GeneralSecurityException {
    KeyPair browser = p256();
    byte[] auth = new byte[16];
    Arrays.fill(auth, (byte) 7);
    byte[] browserPublic = WebPush.raw((ECPublicKey) browser.getPublic());
    byte[] message = "{\"title\":\"Waschgang fertig\"}".getBytes(StandardCharsets.UTF_8);

    byte[] body =
        sender(p256(), "mailto:test@example.org")
            .encrypt(message, B64.encodeToString(browserPublic), B64.encodeToString(auth));
    byte[] plain = decrypt(body, browser, auth);

    assertThat(plain[plain.length - 1]).isEqualTo((byte) 2);
    assertThat(Arrays.copyOf(plain, plain.length - 1)).isEqualTo(message);
  }

  @Test
  void vapidTokenIsSignedForTheEndpointOrigin() throws GeneralSecurityException {
    KeyPair vapid = p256();
    String header =
        sender(vapid, "https://questlog.example")
            .authorization(
                URI.create("https://web.push.apple.com/abc"), Instant.ofEpochSecond(1000));
    String token = header.substring("vapid t=".length(), header.indexOf(", k="));
    String[] parts = token.split("\\.");
    String claims = new String(B64D.decode(parts[1]), StandardCharsets.UTF_8);

    assertThat(header)
        .endsWith(", k=" + B64.encodeToString(WebPush.raw((ECPublicKey) vapid.getPublic())));
    assertThat(claims)
        .isEqualTo(
            "{\"aud\":\"https://web.push.apple.com\",\"exp\":44200,"
                + "\"sub\":\"https://questlog.example\"}");
    Signature verifier = Signature.getInstance("SHA256withECDSAinP1363Format");
    verifier.initVerify(vapid.getPublic());
    verifier.update((parts[0] + "." + parts[1]).getBytes(StandardCharsets.US_ASCII));
    assertThat(verifier.verify(B64D.decode(parts[2]))).isTrue();
  }

  /** Entschlüsselt wie der Browser nach RFC 8291. */
  @SuppressWarnings("PMD.HardCodedCryptoKey")
  private static byte[] decrypt(byte[] body, KeyPair browser, byte[] auth)
      throws GeneralSecurityException {
    ByteBuffer reader = ByteBuffer.wrap(body);
    byte[] salt = new byte[16];
    reader.get(salt);
    assertThat(reader.getInt()).isEqualTo(4096);
    byte[] serverPublic = new byte[reader.get()];
    reader.get(serverPublic);
    byte[] ciphertext = new byte[reader.remaining()];
    reader.get(ciphertext);

    KeyAgreement agreement = KeyAgreement.getInstance("ECDH");
    agreement.init(browser.getPrivate());
    agreement.doPhase(WebPush.publicKey(serverPublic), true);
    byte[] browserPublic = WebPush.raw((ECPublicKey) browser.getPublic());
    byte[] info =
        WebPush.concat(
            WebPush.ascii("WebPush: info\0"), browserPublic, serverPublic, new byte[] {1});
    byte[] ikm = WebPush.hmac(WebPush.hmac(auth, agreement.generateSecret()), info);
    byte[] prk = WebPush.hmac(salt, ikm);
    byte[] cek =
        Arrays.copyOf(WebPush.hmac(prk, WebPush.ascii("Content-Encoding: aes128gcm\0\1")), 16);
    byte[] nonce =
        Arrays.copyOf(WebPush.hmac(prk, WebPush.ascii("Content-Encoding: nonce\0\1")), 12);
    Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
    cipher.init(
        Cipher.DECRYPT_MODE, new SecretKeySpec(cek, "AES"), new GCMParameterSpec(128, nonce));
    return cipher.doFinal(ciphertext);
  }

  private static WebPush sender(KeyPair vapid, String subject) {
    return new WebPush(
        B64.encodeToString(WebPush.raw((ECPublicKey) vapid.getPublic())),
        B64.encodeToString(unsigned32((ECPrivateKey) vapid.getPrivate())),
        subject);
  }

  private static KeyPair p256() throws GeneralSecurityException {
    KeyPairGenerator generator = KeyPairGenerator.getInstance("EC");
    generator.initialize(new ECGenParameterSpec("secp256r1"));
    return generator.generateKeyPair();
  }

  private static byte[] unsigned32(ECPrivateKey key) {
    byte[] bytes = key.getS().toByteArray();
    byte[] out = new byte[32];
    int length = Math.min(bytes.length, 32);
    System.arraycopy(bytes, bytes.length - length, out, 32 - length, length);
    return out;
  }
}
