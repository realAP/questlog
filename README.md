# Questlog

Questlog nimmt bei wiederkehrenden Haushaltsaufgaben die Planung ab: Jede Quest ist eine feste
Kette kleiner Schritte, Wartezeiten laufen auf dem Server, und eine Push-Nachricht meldet, wann es
weitergeht.

Stack: Spring Boot 4.1, Java 25, Thymeleaf, Spring Security, Spring Data JPA, Flyway, PostgreSQL 18,
daisyUI 5 auf Tailwind 4. Ausgeliefert als PWA.

## Entwicklung

```bash
./mvnw verify            # Build, alle Tests (Testcontainers, Docker nötig) und statische Prüfungen
./mvnw spotless:apply    # Code formatieren
scripts/smoke-test.sh    # Image bauen, docker-compose.yml starten, Endpunkte prüfen
```

**Build-Tool Maven:** Spotless, Checkstyle, PMD und SpotBugs sind ausgereifte Maven-Plugins, die
sich an `verify` binden lassen und den Build bei einem Verstoß abbrechen. Die Build-Logik bleibt
deklarativ in `pom.xml`.

**CSS:** Die Tailwind-Standalone-CLI und das daisyUI-Plugin werden beim Build in festen Versionen
geladen (`pom.xml`, Properties `tailwind.version` und `daisyui.version`). Node und npm sind nicht
nötig. Eingabe ist `src/main/frontend/app.css`, Ausgabe `static/css/app.css` im JAR.

**Statische Prüfungen** (Konfiguration in `config/`):

- Spotless mit google-java-format
- Checkstyle mit den Google-Checks
- PMD mit allen Kategorien, kognitive Komplexität höchstens 10, höchstens 30 Anweisungen pro Methode,
  Copy-Paste-Erkennung
- SpotBugs auf höchster Stufe einschließlich FindSecBugs
- ArchUnit (`ArchitectureTest`): Pakete nach Fachlichkeit, keine Zyklen, keine Feldinjektion

## Pipeline

`.github/workflows/pipeline.yml` läuft bei jedem Pull Request und bei jedem Push auf `main`:

1. **Build und Tests:** Build, alle Tests, danach die statischen Prüfungen
2. **Smoke-Test:** baut das Image aus dem `Dockerfile` und startet die echte `docker-compose.yml`
   mit Testwerten. Danach fragt er Health-Endpunkt, Login-Seite und Manifest ab.
3. **Deploy:** nur auf `main` und nur, wenn alles grün ist. Ruft den Deploy-Webhook von Coolify auf,
   und Coolify baut und deployt neu.

## Einrichtung in Coolify

Einmalig, von Hand.

1. **Ressource anlegen:** Projekt `Questlog` → *New Resource* → *Private Repository (with GitHub App)*
   bzw. *Public Repository* → Repository `realAP/questlog`, Branch `main`.
2. **Build Pack:** *Docker Compose*, Pfad `/docker-compose.yml`.
3. **Domain:** beim Service `app` die Domain mit Container-Port eintragen, z. B.
   `https://questlog.example.de:8080`. Coolify routet über Traefik auf Port 8080 und stellt das
   Zertifikat aus.
4. **Umgebungsvariablen** (*Environment Variables*):

   | Variable                   | Inhalt                                                    |
   |----------------------------|-----------------------------------------------------------|
   | `QUESTLOG_DB_PASSWORD`     | Datenbank-Passwort, z. B. `openssl rand -base64 24`       |
   | `QUESTLOG_USERNAME`        | Benutzername für die Anmeldung                            |
   | `QUESTLOG_PASSWORD`        | Passwort für die Anmeldung                                |
   | `QUESTLOG_REMEMBER_ME_KEY` | Schlüssel für das Remember-me-Cookie, `openssl rand -base64 32` |

   Ändert sich das Passwort oder der Remember-me-Schlüssel, müssen sich alle Geräte neu anmelden.
5. **Auto-Deploy abschalten:** in den Einstellungen der Ressource *Auto Deploy* deaktivieren. Sonst
   deployt Coolify bei jedem Push auch ohne grüne Pipeline.
6. **Deploy-Webhook:** in der Ressource unter *Webhooks* die *Deploy Webhook*-URL kopieren.
7. **API-Token:** *Keys & Tokens* → *API Tokens* → neues Token mit Recht *deploy* anlegen.
8. **GitHub-Secrets** hinterlegen:

   ```bash
   gh secret set COOLIFY_WEBHOOK --repo realAP/questlog   # URL aus Schritt 6
   gh secret set COOLIFY_TOKEN   --repo realAP/questlog   # Token aus Schritt 7
   ```

9. **Erstes Deployment** in Coolify einmal manuell starten. Danach deployt nur noch die Pipeline.

## Branch Protection

Auf `main` ist kein direkter Push erlaubt. Änderungen laufen über Pull Requests, und die Jobs
*Build und Tests* und *Smoke-Test* müssen grün sein. Die Regel gilt auch für Admins, damit auch ein
KI-Agent nichts ungeprüft auf `main` bringt. Prüfen unter *Settings → Branches* oder per
`gh api repos/realAP/questlog/branches/main/protection`.

## Auf dem iPhone installieren

Die Domain in Safari öffnen → Teilen → *Zum Home-Bildschirm*. Nach der ersten Anmeldung bleibt die
App acht Wochen angemeldet; jede Nutzung verlängert das nicht, nach Ablauf ist eine neue Anmeldung
nötig.
