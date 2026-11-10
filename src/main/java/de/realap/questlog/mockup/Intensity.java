package de.realap.questlog.mockup;

import java.util.Arrays;
import java.util.Optional;

/**
 * Animationsstärke eines Mockups. Alle Mockups zeigen dieselbe Quest, nur die Bewegung ändert sich.
 */
public enum Intensity {
  RESTRAINED("zurueckhaltend", "Zurückhaltend"),
  MEDIUM("mittel", "Mittel"),
  PLAYFUL("verspielt", "Verspielt");

  private final String slug;
  private final String label;

  Intensity(String slug, String label) {
    this.slug = slug;
    this.label = label;
  }

  /**
   * Liefert die Stärke zum URL-Bestandteil.
   *
   * @param slug URL-Bestandteil, etwa {@code mittel}
   * @return die passende Stärke, leer bei unbekanntem Wert
   */
  public static Optional<Intensity> fromSlug(String slug) {
    return Arrays.stream(values()).filter(intensity -> intensity.slug.equals(slug)).findFirst();
  }

  /**
   * URL-Bestandteil der Stärke.
   *
   * @return etwa {@code mittel}
   */
  public String getSlug() {
    return slug;
  }

  /**
   * Anzeigename der Stärke.
   *
   * @return etwa {@code Mittel}
   */
  public String getLabel() {
    return label;
  }
}
