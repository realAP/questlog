package de.realap.questlog.version;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Properties;
import org.junit.jupiter.api.Test;
import org.springframework.boot.info.GitProperties;

class DeployedCommitTest {

  @Test
  void showsBerlinTimeWithDayAndEightCharacterHash() {
    Properties props = new Properties();
    props.setProperty("commit.id", "a1b2c3d4e5f60718293a4b5c6d7e8f9012345678");
    props.setProperty("commit.time", "2026-12-24T13:32:00Z");

    assertThat(DeployedCommit.label(new GitProperties(props))).isEqualTo("24.12. 14:32 - a1b2c3d4");
  }

  @Test
  void staysEmptyWithoutGitInformation() {
    assertThat(DeployedCommit.label(null)).isNull();
    assertThat(DeployedCommit.label(new GitProperties(new Properties()))).isNull();
  }
}
