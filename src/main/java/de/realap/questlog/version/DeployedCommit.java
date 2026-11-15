package de.realap.questlog.version;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.boot.info.GitProperties;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ModelAttribute;

/** Stellt jeder Seite den laufenden Stand bereit: „24.12. 14:32 - a1b2c3d4“. */
@ControllerAdvice
final class DeployedCommit {

  private static final DateTimeFormatter FORMAT =
      DateTimeFormatter.ofPattern("dd.MM. HH:mm").withZone(ZoneId.of("Europe/Berlin"));

  private final String text;

  DeployedCommit(ObjectProvider<GitProperties> git) {
    this.text = label(git.getIfAvailable());
  }

  static String label(GitProperties git) {
    if (git == null) {
      return null;
    }
    String commitId = git.getCommitId();
    Instant time = git.getCommitTime();
    if (commitId == null || time == null) {
      return null;
    }
    return FORMAT.format(time) + " - " + commitId.substring(0, Math.min(8, commitId.length()));
  }

  @ModelAttribute("deployedCommit")
  String deployedCommit() {
    return text;
  }
}
