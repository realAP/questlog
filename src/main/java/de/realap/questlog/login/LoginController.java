package de.realap.questlog.login;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/** Zeigt die Anmeldeseite; die Prüfung der Zugangsdaten übernimmt Spring Security. */
@Controller
class LoginController {

  @GetMapping("/login")
  String login() {
    return "login";
  }
}
