package de.realap.questlog.mockup;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.server.ResponseStatusException;

/** Statische Mockups der Wäsche-Quest zum Vergleich der Animationsstärken. */
@Controller
class MockupController {

  @GetMapping("/mockups")
  String index() {
    return "redirect:/mockups/" + Intensity.RESTRAINED.getSlug();
  }

  @GetMapping("/mockups/{slug}")
  String mockup(@PathVariable String slug, Model model) {
    Intensity intensity =
        Intensity.fromSlug(slug)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    model.addAttribute("intensity", intensity);
    model.addAttribute("intensities", Intensity.values());
    return "mockup/laundry";
  }
}
