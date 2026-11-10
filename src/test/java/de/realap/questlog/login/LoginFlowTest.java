package de.realap.questlog.login;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestBuilders.formLogin;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.redirectedUrl;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import de.realap.questlog.PostgresContainerConfig;
import jakarta.servlet.http.Cookie;
import java.time.Duration;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@Import(PostgresContainerConfig.class)
class LoginFlowTest {

  private static final long SIX_WEEKS = Duration.ofDays(42).toSeconds();

  @Autowired private MockMvc mvc;

  @Test
  void anonymousVisitorIsSentToLogin() throws Exception {
    mvc.perform(get("/")).andExpect(status().is3xxRedirection());
    mvc.perform(get("/login")).andExpect(status().isOk());
  }

  @Test
  void pwaFilesAndHealthAreReachableWithoutLogin() throws Exception {
    mvc.perform(get("/manifest.webmanifest"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.name").value("Questlog"))
        .andExpect(jsonPath("$.short_name").value("Questlog"));
    mvc.perform(get("/sw.js")).andExpect(status().isOk());
    mvc.perform(get("/icons/icon-192.png")).andExpect(status().isOk());
    mvc.perform(get("/css/app.css")).andExpect(status().isOk());
    mvc.perform(get("/actuator/health"))
        .andExpect(status().isOk())
        .andExpect(content().json("{\"status\":\"UP\"}"));
  }

  @Test
  void wrongPasswordIsRejected() throws Exception {
    mvc.perform(formLogin().user("held").password("falsch"))
        .andExpect(redirectedUrl("/login?error"));
  }

  @Test
  void loginKeepsTheUserSignedInForWeeksWithoutSession() throws Exception {
    Cookie rememberMe =
        mvc.perform(formLogin().user("held").password("geheim"))
            .andExpect(redirectedUrl("/"))
            .andReturn()
            .getResponse()
            .getCookie("remember-me");

    assertThat(rememberMe).isNotNull();
    assertThat((long) rememberMe.getMaxAge()).isGreaterThanOrEqualTo(SIX_WEEKS);

    mvc.perform(get("/").cookie(rememberMe)).andExpect(status().isOk());
  }
}
