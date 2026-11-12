package de.realap.questlog.glossary;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/** Visuelles Glossar: Vokabular für Gestaltung und Bewegung, jeweils mit Live-Beispiel. */
@Controller
class GlossaryController {

  @GetMapping("/glossar")
  String glossary() {
    return "glossary/index";
  }
}
