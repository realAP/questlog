package de.realap.questlog.reminder;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.sql.Timestamp;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import tools.jackson.databind.json.JsonMapper;

/**
 * Geplante Erinnerungen. Sie liegen in der Datenbank, damit sie einen Neustart überstehen, und
 * gehen als Web Push an alle Geräte mit Abo, sobald sie fällig sind.
 */
@Component
class Reminders {

  private static final Logger LOG = LoggerFactory.getLogger(Reminders.class);
  private static final int GONE = 410;
  private static final int NOT_FOUND = 404;
  private static final int FIRST_NON_SUCCESS = 300;

  private final JdbcClient jdbc;
  private final JsonMapper json;
  private final WebPush push;
  private final HttpClient http =
      HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();

  Reminders(JdbcClient jdbc, JsonMapper json, PushProperties properties) {
    this.jdbc = jdbc;
    this.json = json;
    this.push =
        properties.enabled()
            ? new WebPush(properties.publicKey(), properties.privateKey(), properties.subject())
            : null;
    if (push == null) {
      LOG.warn("Web Push ist aus: QUESTLOG_VAPID_PUBLIC_KEY, _PRIVATE_KEY und _SUBJECT setzen");
    }
  }

  void subscribe(String endpoint, String p256dh, String auth) {
    jdbc.sql(
            """
            insert into push_subscription (endpoint, p256dh, auth) values (?, ?, ?)
            on conflict (endpoint) do update set p256dh = excluded.p256dh, auth = excluded.auth
            """)
        .params(endpoint, p256dh, auth)
        .update();
  }

  void plan(String name, Instant dueAt, String title, String body, String url) {
    jdbc.sql(
            """
            insert into reminder (name, due_at, title, body, url) values (?, ?, ?, ?, ?)
            on conflict (name) do update set due_at = excluded.due_at, title = excluded.title,
              body = excluded.body, url = excluded.url
            """)
        .params(name, Timestamp.from(dueAt), title, body, url)
        .update();
  }

  void cancel(String name) {
    jdbc.sql("delete from reminder where name = ?").params(name).update();
  }

  /** Schaut alle zehn Sekunden nach fälligen Erinnerungen. */
  @Scheduled(fixedDelay = 10_000)
  void sendDue() {
    if (push == null) {
      return;
    }
    List<Due> due =
        jdbc.sql("select name, title, body, url from reminder where due_at <= now()")
            .query(Due.class)
            .list();
    if (due.isEmpty()) {
      return;
    }
    List<Subscription> subscriptions =
        jdbc.sql("select endpoint, p256dh, auth from push_subscription")
            .query(Subscription.class)
            .list();
    for (Due reminder : due) {
      byte[] payload =
          json.writeValueAsBytes(
              Map.of(
                  "title", reminder.title(),
                  "body", reminder.body(),
                  "url", reminder.url(),
                  "tag", reminder.name()));
      subscriptions.forEach(subscription -> send(subscription, payload));
      cancel(reminder.name());
    }
  }

  // Den Interrupt weiterzureichen ist hier richtig, PMD zählt das als Thread-Nutzung.
  @SuppressWarnings("PMD.DoNotUseThreads")
  private void send(Subscription subscription, byte[] payload) {
    URI endpoint = URI.create(subscription.endpoint());
    HttpRequest request =
        HttpRequest.newBuilder(endpoint)
            .timeout(Duration.ofSeconds(20))
            .header("Authorization", push.authorization(endpoint, Instant.now()))
            .header("Content-Encoding", "aes128gcm")
            .header("Content-Type", "application/octet-stream")
            .header("TTL", "86400")
            .header("Urgency", "high")
            .POST(
                HttpRequest.BodyPublishers.ofByteArray(
                    push.encrypt(payload, subscription.p256dh(), subscription.auth())))
            .build();
    try {
      HttpResponse<Void> response = http.send(request, HttpResponse.BodyHandlers.discarding());
      int status = response.statusCode();
      if (status == GONE || status == NOT_FOUND) {
        jdbc.sql("delete from push_subscription where endpoint = ?")
            .params(subscription.endpoint())
            .update();
        LOG.info("Abgelaufenes Push-Abo entfernt");
      } else if (status >= FIRST_NON_SUCCESS && LOG.isWarnEnabled()) {
        LOG.warn("Push vom Push-Dienst abgelehnt: HTTP {}", status);
      }
    } catch (IOException e) {
      LOG.warn("Push-Dienst nicht erreichbar");
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
    }
  }

  private record Due(String name, String title, String body, String url) {}

  private record Subscription(String endpoint, String p256dh, String auth) {}
}
