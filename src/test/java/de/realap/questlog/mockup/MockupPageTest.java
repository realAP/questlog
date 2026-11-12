package de.realap.questlog.mockup;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.redirectedUrl;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import de.realap.questlog.PostgresContainerConfig;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
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
class MockupPageTest {

  @Autowired private MockMvc mvc;

  @ParameterizedTest
  @ValueSource(strings = {"zurueckhaltend", "mittel", "verspielt"})
  void eachIntensityShowsTheLaundryQuestWithItsProfile(String slug) throws Exception {
    mvc.perform(get("/mockups/" + slug))
        .andExpect(status().isOk())
        .andExpect(content().string(containsString("data-intensity=\"" + slug + "\"")))
        .andExpect(content().string(containsString("/js/mockup.js")));
  }

  @Test
  void overviewStartsWithTheRestrainedMockup() throws Exception {
    mvc.perform(get("/mockups")).andExpect(redirectedUrl("/mockups/zurueckhaltend"));
  }

  @Test
  void laundryDraftExplainsItsDesignDecisions() throws Exception {
    mvc.perform(get("/entwurf/waesche"))
        .andExpect(status().isOk())
        .andExpect(content().string(containsString("x-data=\"laundryDraft\"")))
        .andExpect(content().string(containsString("Was passiert hier?")))
        .andExpect(content().string(containsString("/js/draft.js")));
  }

  @Test
  void unknownIntensityIsNotFound() throws Exception {
    mvc.perform(get("/mockups/wild")).andExpect(status().isNotFound());
  }
}
