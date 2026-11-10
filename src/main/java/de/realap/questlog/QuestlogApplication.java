package de.realap.questlog;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

/** Einstiegspunkt der Anwendung. */
@SpringBootApplication
@ConfigurationPropertiesScan
public class QuestlogApplication {

  /**
   * Startet die Anwendung.
   *
   * @param args Kommandozeilenargumente
   */
  public static void main(String[] args) {
    SpringApplication.run(QuestlogApplication.class, args);
  }
}
