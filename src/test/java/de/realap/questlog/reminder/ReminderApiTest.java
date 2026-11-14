package de.realap.questlog.reminder;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import de.realap.questlog.PostgresContainerConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@Import(PostgresContainerConfig.class)
@WithMockUser
class ReminderApiTest {

  private static final String WAESCHE = "/erinnerungen/waesche";

  @Autowired private MockMvc mvc;

  @Test
  void pushStaysOffWithoutKeys() throws Exception {
    mvc.perform(get("/push/schluessel")).andExpect(status().isNotFound());
  }

  @Test
  void reminderCanBePlannedAndCancelled() throws Exception {
    String plan =
        """
        {"dueAt":"2026-11-13T21:00:00Z","title":"Waschgang fertig","body":"Weiter: Trocknen","url":"/entwurf/waesche"}
        """;
    mvc.perform(put(WAESCHE).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(plan))
        .andExpect(status().isNoContent());
    mvc.perform(delete(WAESCHE).with(csrf())).andExpect(status().isNoContent());
  }

  @Test
  void reminderOnlyLinksIntoTheApp() throws Exception {
    String plan =
        """
        {"dueAt":"2026-11-13T21:00:00Z","title":"x","body":"y","url":"//example.org"}
        """;
    mvc.perform(put(WAESCHE).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(plan))
        .andExpect(status().isBadRequest());
  }

  @Test
  void subscriptionNeedsHttpsEndpointAndKeys() throws Exception {
    mvc.perform(
            post("/push/abo")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {"endpoint":"https://web.push.apple.com/x","keys":{"p256dh":"a","auth":"b"}}
                    """))
        .andExpect(status().isNoContent());
    mvc.perform(
            post("/push/abo")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    "{\"endpoint\":\"http://intern/x\",\"keys\":{\"p256dh\":\"a\",\"auth\":\"b\"}}"))
        .andExpect(status().isBadRequest());
  }

  @Test
  void writesNeedCsrfToken() throws Exception {
    mvc.perform(delete(WAESCHE)).andExpect(status().isForbidden());
  }
}
