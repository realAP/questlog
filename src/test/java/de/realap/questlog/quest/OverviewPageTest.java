package de.realap.questlog.quest;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import de.realap.questlog.PostgresContainerConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@Import(PostgresContainerConfig.class)
@WithMockUser
class OverviewPageTest {

  @Autowired private MockMvc mvc;

  @Test
  void overviewLeadsToTheLaundryQuestAndNothingElse() throws Exception {
    mvc.perform(get("/"))
        .andExpect(status().isOk())
        .andExpect(content().string(containsString("x-data=\"questOverview\"")))
        .andExpect(content().string(containsString("href=\"/entwurf/waesche\"")))
        .andExpect(content().string(containsString("id=\"scene-s1\"")))
        .andExpect(content().string(not(containsString("/glossar"))))
        .andExpect(content().string(not(containsString("/mockups"))));
  }

  @Test
  void questLeadsBackToTheOverview() throws Exception {
    mvc.perform(get("/entwurf/waesche"))
        .andExpect(content().string(containsString("data-label=\"Kopfzeile\"")))
        .andExpect(content().string(containsString("href=\"/\"")));
  }
}
