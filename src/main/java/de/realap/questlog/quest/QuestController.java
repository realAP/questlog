package de.realap.questlog.quest;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/** Übersicht: zeigt groß die Quest, die als Nächstes dran ist. */
@Controller
class QuestController {

  @GetMapping("/")
  String overview() {
    return "quest/overview";
  }
}
