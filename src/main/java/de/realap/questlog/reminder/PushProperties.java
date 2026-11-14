package de.realap.questlog.reminder;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * VAPID-Schlüssel für Web Push. Fehlen sie, bleibt Push aus und die App läuft ohne.
 *
 * @param publicKey öffentlicher Schlüssel, unkomprimierter P-256-Punkt in Base64url
 * @param privateKey privater Schlüssel, 32 Byte in Base64url
 * @param subject Kontakt für die Push-Dienste, eine https- oder mailto-Adresse
 */
@ConfigurationProperties("questlog.push")
public record PushProperties(String publicKey, String privateKey, String subject) {

  /** Push ist nur an, wenn alle drei Angaben gesetzt sind. */
  public boolean enabled() {
    return hasText(publicKey) && hasText(privateKey) && hasText(subject);
  }

  private static boolean hasText(String value) {
    return value != null && !value.isBlank();
  }
}
