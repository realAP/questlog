package de.realap.questlog.quest;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/** Hauptansicht. Zeigt bis zur Umsetzung der Quest-Logik den Leerzustand. */
@Controller
class QuestController {

  @GetMapping("/")
  String current() {
    return "quest/current";
  }
}
