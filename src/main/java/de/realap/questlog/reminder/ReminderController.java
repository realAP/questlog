package de.realap.questlog.reminder;

import java.time.Instant;
import java.util.regex.Pattern;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/** Push-Abo eines Geräts und Erinnerungen, die die Seite plant oder zurücknimmt. */
@RestController
class ReminderController {

  private static final Pattern NAME = Pattern.compile("[a-z0-9-]{1,40}");
  private static final int MAX_TEXT = 200;

  private final Reminders reminders;
  private final PushProperties properties;

  ReminderController(Reminders reminders, PushProperties properties) {
    this.reminders = reminders;
    this.properties = properties;
  }

  /** Öffentlicher VAPID-Schlüssel; 404, solange Push nicht eingerichtet ist. */
  @GetMapping("/push/schluessel")
  ResponseEntity<String> key() {
    return properties.enabled()
        ? ResponseEntity.ok(properties.publicKey())
        : ResponseEntity.notFound().build();
  }

  @PostMapping("/push/abo")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  void subscribe(@RequestBody Subscription subscription) {
    if (subscription.endpoint() == null
        || !subscription.endpoint().startsWith("https://")
        || subscription.keys() == null
        || subscription.keys().p256dh() == null
        || subscription.keys().auth() == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
    }
    reminders.subscribe(
        subscription.endpoint(), subscription.keys().p256dh(), subscription.keys().auth());
  }

  @PutMapping("/erinnerungen/{name}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  void plan(@PathVariable String name, @RequestBody Plan plan) {
    if (!NAME.matcher(name).matches()
        || plan.dueAt() == null
        || !isText(plan.title())
        || !isText(plan.body())
        || plan.url() == null
        || !plan.url().startsWith("/")
        || plan.url().startsWith("//")) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
    }
    reminders.plan(name, plan.dueAt(), plan.title(), plan.body(), plan.url());
  }

  @DeleteMapping("/erinnerungen/{name}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  void cancel(@PathVariable String name) {
    reminders.cancel(name);
  }

  private static boolean isText(String value) {
    return value != null && !value.isBlank() && value.length() <= MAX_TEXT;
  }

  record Subscription(String endpoint, Keys keys) {
    record Keys(String p256dh, String auth) {}
  }

  record Plan(Instant dueAt, String title, String body, String url) {}
}
