package de.realap.questlog.login;

import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Zugangsdaten des einzigen Benutzers und Einstellungen für das Remember-me-Cookie. Die Werte
 * kommen aus Umgebungsvariablen.
 *
 * @param username Benutzername
 * @param password Passwort im Klartext
 * @param rememberMeKey geheimer Schlüssel zum Signieren des Remember-me-Cookies
 * @param rememberMeValidity Gültigkeit des Remember-me-Cookies
 */
@ConfigurationProperties("questlog.login")
public record LoginProperties(
    String username, String password, String rememberMeKey, Duration rememberMeValidity) {

  /** Bricht den Start ab, wenn eine Angabe fehlt. */
  public LoginProperties {
    requireText(username, "QUESTLOG_USERNAME");
    requireText(password, "QUESTLOG_PASSWORD");
    requireText(rememberMeKey, "QUESTLOG_REMEMBER_ME_KEY");
    if (rememberMeValidity == null || rememberMeValidity.isNegative()) {
      throw new IllegalArgumentException("questlog.login.remember-me-validity fehlt");
    }
  }

  private static void requireText(String value, String variable) {
    if (value == null || value.isBlank()) {
      throw new IllegalArgumentException("Umgebungsvariable " + variable + " ist nicht gesetzt");
    }
  }
}
