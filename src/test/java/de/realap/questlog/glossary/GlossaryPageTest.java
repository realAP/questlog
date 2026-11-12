package de.realap.questlog.glossary;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import de.realap.questlog.PostgresContainerConfig;
import java.util.regex.Pattern;
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
class GlossaryPageTest {

  private static final Pattern ENTRY = Pattern.compile("<article [^>]*data-term");

  @Autowired private MockMvc mvc;

  @Test
  void glossaryNeedsLogin() throws Exception {
    mvc.perform(get("/glossar")).andExpect(status().is3xxRedirection());
  }

  @Test
  @WithMockUser
  void everyTermHasDefinitionExampleComparisonAndFeedbackSentence() throws Exception {
    String html =
        mvc.perform(get("/glossar"))
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsString();

    long terms = ENTRY.matcher(html).results().count();
    assertThat(terms).isGreaterThanOrEqualTo(10);
    assertThat(count(html, "class=\"ql-definition")).isEqualTo(terms);
    assertThat(count(html, "class=\"ql-example")).isEqualTo(terms);
    assertThat(count(html, "class=\"ql-compare")).isEqualTo(terms);
    assertThat(count(html, "class=\"ql-feedback")).isEqualTo(terms);
  }

  @Test
  @WithMockUser
  void glossaryCoversAllSevenCategories() throws Exception {
    String html = mvc.perform(get("/glossar")).andReturn().getResponse().getContentAsString();

    assertThat(html)
        .contains(
            "id=\"layout\"",
            "id=\"typografie\"",
            "id=\"farbe\"",
            "id=\"bewegung\"",
            "id=\"feedback\"",
            "id=\"interaktion\"",
            "id=\"wirkung\"");
  }

  private static long count(String text, String fragment) {
    return Pattern.compile(Pattern.quote(fragment)).matcher(text).results().count();
  }
}
