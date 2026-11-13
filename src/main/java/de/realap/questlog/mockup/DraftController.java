package de.realap.questlog.mockup;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Entwurf der Wäsche-Quest im festgelegten Stil. Jede Ansicht erklärt auf Wunsch, was in ihr
 * passiert, damit Feedback auf konkrete Gestaltungsentscheidungen zeigen kann.
 */
@Controller
class DraftController {

  @GetMapping("/entwurf/waesche")
  String laundry() {
    return "mockup/draft-laundry";
  }
}
