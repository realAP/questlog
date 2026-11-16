# Questlog Design

Dieses Dokument hält fest, wie Questlog aussieht, sich bewegt und sich anfühlt. Es beschreibt den Stand der App vom 15.11.2026 und ist die Vorgabe für alles, was neu dazukommt.

**Ziel:** Wer von null anfängt, kommt mit diesem Dokument und den unter [Quellen](#11-quellen-und-neubau-von-null) genannten Dateien wieder genau hier heraus.

**Regeln für dieses Dokument**

- Werte stehen im Code. Hier steht, *wofür* sie da sind und *wie* sie zusammenspielen. Ändert sich ein Wert im Code, wird er hier nachgezogen.
- Begriffe kommen aus dem [Glossar](CONTEXT.md): Quest, Etappe, Schritt, Wartezeit, Voraussetzung, Fehlmeldung, Abschluss.
- Bilder aller Bildschirme liegen in [`docs/design/`](docs/design/), jeweils hell und dunkel, aufgenommen in WebKit auf iPhone-15-Größe.

---

## 1. Haltung

Questlog ist für einen Menschen mit ADHS gemacht, der wiederkehrende Haushaltsaufgaben nicht selbst planen will. Daraus folgt alles Weitere.

| Grundsatz | Was das konkret heißt |
|---|---|
| **Eine Sache im Fokus** | Pro Bildschirm ein Schritt, eine Hauptaktion. Kein Menü, keine Liste mit zehn Dingen. |
| **Ruhig statt hektisch** | Warme, gedämpfte Farben. Bewegungen fahren weich an und bremsen weich ab. Nichts blinkt grell, nichts springt. |
| **Alltagsnah statt technisch** | Szenen zeigen, was man wirklich sieht: Korb mit Klappdeckel, Aufzug, Waschmaschine mit Display, Wäscheständer mit Drähten. Keine Schnittzeichnungen, keine Schilder, keine Abkürzungen wie „2/K“. |
| **Kein Text in Szenen** | Zeiten und Hinweise stehen als eigenes Element unter der Szene, nie in der Zeichnung. |
| **Zustand am Gerät zeigen** | Ein Fortschritt ist dort zu sehen, wo er passiert: Display an der Maschine statt einer Leiste daneben. |
| **Grün funkeln heißt fertig** | Das grüne Funkeln ist das eine Zeichen für „geschafft“. Es wird für nichts anderes verwendet. |
| **Kleine Rückmeldung pro Schritt, große Feier am Ende** | Abhaken bekommt einen kurzen Haken mit Lichthof. Nur der Abschluss der Quest bekommt die große Szene. |
| **Zeiten als Uhrzeit** | „Fertig um 14:30“ statt nur „noch 2 h 13 min“. Tage ohne Kommazahlen („3 Tage“, nicht „2,5 Tage“). |
| **Nichts dazuerfinden** | Gestaltet wird, was beschrieben ist. Eigene Zusätze werden als Vorschlag benannt, nicht still eingebaut. |
| **Sprache** | Deutsch, kurz, per Du, ohne Ausrufezeichen. „Danach erinnere ich dich alle 30 Minuten.“ |

Die Wirkung in Worten: **ruhig, warm, freundlich, aufgeräumt, mit kleinen Momenten von Freude.**

---

## 2. Technische Grundlage

| Baustein | Rolle |
|---|---|
| Tailwind CSS 4 (Standalone-CLI) + daisyUI 5 | Utility-Klassen und die zwei Themes. Kein Node, kein npm. |
| Thymeleaf-Fragmente | Wiederverwendbare Teile: `head`, `icons`, `scenes`. |
| Alpine.js | Zustand und Verhalten im Browser. |
| Motion (`motion.js`) über `motion-kit.js` (`QL`) | Alle per Skript gesteuerten Animationen. |
| CSS-Keyframes in `scenes.css` | Alle Szenen-Animationen und der Abschluss. |
| Systemschrift | Keine Webfonts. Auf dem iPhone ist das SF Pro. |

Zielgerät ist das **iPhone als PWA vom Homescreen**, Hochformat, Breite 390 px. Es gibt nur ein Layout, ein Desktop-Layout gibt es nicht.

---

## 3. Farbe

Die Farbwerte stehen in [`src/main/frontend/app.css`](src/main/frontend/app.css) als die daisyUI-Themes `questlog-light` und `questlog-dark`. Hell oder dunkel richtet sich nur nach der Systemeinstellung, einen Schalter in der App gibt es nicht.

Die Palette ist warm: Die Grautöne haben einen leichten Beige-Stich (Farbton 70–85), das Grün ist gedämpft (Farbton 165).

| Rolle | Hell | Dunkel | Wofür |
|---|---|---|---|
| `base-100` | `oklch(98.5% 0.006 85)` | `oklch(21% 0.008 70)` | Seitenhintergrund |
| `base-200` | `oklch(95.5% 0.008 85)` | `oklch(25% 0.01 70)` | Karten, Felder, Segment-Leiste, inaktive Knoten |
| `base-300` | `oklch(91% 0.01 85)` | `oklch(31% 0.012 70)` | Linien, Rahmen, leere Spur von Balken und Ringen |
| `base-content` | `oklch(28% 0.015 70)` | `oklch(92% 0.008 85)` | Text und Konturen in Szenen |
| `primary` | `oklch(52% 0.07 165)` | `oklch(72% 0.08 165)` | **Nur** Hauptaktion, Fortschritt, Erledigt, Funkeln |
| `accent` | `oklch(74% 0.11 70)` | `oklch(78% 0.1 70)` | Überzeit, Hinweis-Pille für Voraussetzungen |
| `error` | `oklch(58% 0.15 30)` | `oklch(70% 0.13 30)` | Fehlmeldung („Waschmittel fehlt“), falsches Passwort |

`neutral`, `secondary`, `info`, `success` und `warning` sind definiert, werden aber kaum oder gar nicht genutzt. `success` ist absichtlich gleich `primary`: Erledigt ist immer dasselbe Grün.

**Abstufungen von Text** erfolgen über Deckkraft, nicht über weitere Farben:

| Stufe | Klasse | Wofür |
|---|---|---|
| voll | `text-base-content` | Titel, Schritt, Werte |
| zweitrangig | `/55` bis `/65` | Status, Fragen, Untertitel, Platzhalter |
| leise | `/40` | Inaktive Symbole, Stand-Anzeige |

**Getönte Flächen** entstehen aus der Rollenfarbe mit Deckkraft: `bg-primary/15` für erledigte Knoten, `bg-primary/12` für den Haken-Kreis vor dem Abhaken, `bg-accent/25` für die Voraussetzungs-Pille, `bg-error/12` für das Fehlmeldungs-Symbol.

**Szenenfarben** sind die einzigen eigenen Werte außerhalb der Themes. Sie stehen in [`scenes.css`](src/main/resources/static/css/scenes.css) unter `.ql-scene`:

| Variable | Hell | Dunkel | Wofür |
|---|---|---|---|
| `--pr2` | `oklch(80% 0.05 165)` | `oklch(45% 0.05 165)` | helles Grün, z. B. Socke |
| `--c3` | `oklch(86% 0.02 70)` | `oklch(40% 0.02 70)` | Beige, z. B. Hose |
| `--water` | `oklch(60% 0.05 200 / .35)` | `oklch(72% 0.05 200 / .35)` | Wasser in der Trommel |
| `--wick` | `oklch(83% 0.06 78)` | `oklch(50% 0.05 72)` | Korbgeflecht, Holz |

**Browserleiste und Splash:** `theme-color` ist `#f9f7f2` (hell) und `#262320` (dunkel), im Manifest ist `#f9f7f2` gesetzt.

---

## 4. Typografie

Es gibt eine Schrift, die Systemschrift. Die Grundgröße ist 16 px, Eingabefelder haben mindestens 16 px, damit iOS beim Antippen nicht zoomt. Ziffern, die sich ändern, laufen mit `tabular-nums`.

Die Größen sind beim Gestalten einzeln gewählt worden. Ein festes Raster gibt es nicht. Im Einsatz sind:

| Größe | Gewicht | Wofür |
|---|---|---|
| 34 px | bold, `leading-none` | Quest-Name auf der Startseite der Quest |
| 32 px | bold | „Questlog“ in der Übersicht und beim Login |
| 30 px | semibold, `leading-tight` | **Schritt-Titel** („Alles in den Wäschekorb“), Fehlmeldungs-Titel |
| 28 px | semibold | „Wäsche geschafft“ |
| 20–22 px | semibold | Wartezeit-Status („Waschgang läuft“), Etappen im Ablauf, Quest-Name in der Fokus-Karte |
| 17 px | normal / semibold | Buttons, Eingaben, Fließtext, „‹ Übersicht“ |
| 15 px | normal | Zweitrangiger Text: Fragen, Fertig-Uhrzeit, Hinweise, Segment-Leiste |
| 13–14 px | semibold, `uppercase`, `tracking-[0.1em]` | Abschnitts-Überschriften („ALS NÄCHSTES“), Datum |
| 12 px | normal | Stand-Anzeige, Zeitstrahl-Beschriftung |
| 10–11 px | semibold | Tage am Zeitstrahl |

**Hierarchie-Regel:** Der Schritt-Titel ist das Größte, was sich während einer Quest ändert, und wird als Erstes gelesen. Alles andere tritt per Größe oder Deckkraft zurück.

---

## 5. Raum und Form

### Layout

- Inhalt auf `max-w-md` (448 px), zentriert, Seitenrand `px-5` (20 px).
- Safe Areas über `env(safe-area-inset-*)` am `body`.
- Bildschirme sind eine Spalte über volle Höhe (`min-h-dvh`): oben Kopfzeile, in der Mitte Inhalt, **unten die Hauptaktion** mit `pb-6`. Die Hauptaktion liegt immer im unteren Drittel und ist einhändig erreichbar.
- Im normalen Ablauf soll nichts scrollen. Szenen skalieren mit `--scene: min(80vw, 34dvh, 340px)`.

### Maße

| Element | Maß |
|---|---|
| Hauptbutton | Höhe 52 px, volle Breite, Radius 14 px, Text 17 px |
| Eingabefeld | Höhe 52 px, Radius 12 px (`rounded-xl`), Rahmen 1,5 px |
| Touch-Ziel minimal | 44 × 44 px (`size-11`, `h-11`) |
| Fokus-Karte | Radius 24 px (`rounded-3xl`) |
| Quest-Symbol groß | 80 px, Radius 24 px |
| Etappen-Knoten | 44 px rund, im Ablauf 46 px |
| Unterschritt-Knoten | 36 px rund |
| Pillen, Segment-Leiste, Zweitaktion | `rounded-full` |
| daisyUI-Radien | `--radius-selector` 1 rem, `--radius-field` 0,75 rem, `--radius-box` 1,25 rem |

**Tiefe:** Flach. `--depth: 0`, `--noise: 0`. Schatten nur, wo etwas schwebt: das aufgeklappte Unterschritt-Menü (`0 4px 20px oklch(0% 0 0 / .12)`) und das gewählte Segment der Zeitwahl (`shadow-sm`).

---

## 6. Bewegung

### Kurven

| Name | Werte | Wofür |
|---|---|---|
| **Soft** | `cubic-bezier(.65, 0, .35, 1)` | Standard. Text aus und ein, Ring füllen und wandern, fast alle Szenen. Sanft anfahren, sanft abbremsen. |
| **Out** | `cubic-bezier(.16, 1, .3, 1)` | Etwas kommt herein und kommt zur Ruhe: Teile erscheinen, Lichthof, Regal füllt sich. |
| Feder | `QL.spring(bounce, dauer)` | Antippen: nachgeben und zurückfedern |
| `linear` | | Nur für Dauerdrehung und Zeitbalken, die der echten Uhr folgen |

Die Werte stehen als `EASE_SOFT` und `EASE_OUT` in `draft.js` und als Keyframe-Kurven in `scenes.css`.

### Dauern

| Ereignis | Dauer | Quelle |
|---|---|---|
| Text raus | 0,32 s, 14 px nach oben | `DESIGN.textOut` |
| Text rein | 0,42 s, 14 px von unten | `DESIGN.textIn` |
| Drücken | auf 97 %, Feder bounce 0,2, 0,25 s | `DESIGN.press` |
| Plus/Minus antippen | auf 88 %, Feder bounce 0,35, 0,25 s | `nudge()` |
| Häkchen zeichnen | 0,42 s | `DESIGN.celebrate.check` |
| Lichthof | 0,8 s, auf 135 %, ausblenden | `DESIGN.celebrate.glow` |
| Ruhe nach dem Haken | 0,3 s | `DESIGN.celebrate.rest` |
| Ring-Segment füllen | 0,5 s | `RING.sweep` |
| Ring wandert zur nächsten Etappe | 0,55 s | `RING.travel` |
| Ring kommt an | 0,22 s | `RING.settle` |
| Knoten erscheint | von 80 %, Feder bounce 0,3, 0,4 s | `popNode()` |
| Unterschritte aufklappen / zu | 0,2 s / 0,15 s, 4 px | Alpine `x-transition` |
| Abhaken-Kasten färben | 0,15 s | `.ql-check` |
| Wartezeit überspringen (Beta) | 1 s | `skipTime()` |
| Abschluss | 3,2 s, läuft einmal | `.ql-finale` |
| Szenen-Schleifen | 6–26 s | `scenes.css` |

### Bewegung reduzieren

Ist „Bewegung reduzieren“ am Gerät an, gilt:

- Bewegungen springen sofort ans Ziel. Nur Ein- und Ausblenden bleibt mit 0,15 s sichtbar (`motion-kit.js`).
- Dauerbewegung entfällt ganz. CSS-Animationen und Übergänge laufen in 0,01 ms (`app.css`).
- Der wandernde Ring entfällt, die Mini-Feier wird zur kurzen Pause.
- Beim Abschluss steht das Endbild sofort, ohne Funkeln.
- Die Wartungsseite zeigt das saubere Logo still.

---

## 7. Komponenten

### Buttons

| Art | Aussehen | Wofür |
|---|---|---|
| **Hauptaktion** | `btn btn-primary`, 52 px, Radius 14, 17 px | Genau eine pro Bildschirm: „Erledigt“, „Quest starten“, „Waschvorgang starten“, „Weiter: Trocknen“, „Anmelden“ |
| **Zweitaktion (Fläche)** | `btn`, Rahmen 2 px `base-300`, transparent, semibold | Gleichwertige Alternative: „Auf die Einkaufsliste“ |
| **Zweitaktion (Pille)** | 44 px hoch, `rounded-full`, Rahmen 1,5 px, Symbol links im getönten Kreis | Abweichung melden: „Waschmittel fehlt“. Sitzt über der Hauptaktion. |
| **Neutral** | `btn` ohne Farbe | „Nochmal von vorn“ |
| **Beta** | `btn-ghost`, Kolben-Symbol, `/60` | Testfunktionen: „Überspringen“, „Testnachricht in 15 s“ |

Jeder Button gibt beim Antippen nach und federt zurück (siehe Bewegung). Eigene Zustände für „lädt“ und „deaktiviert“ sind noch nicht gestaltet. Doppeltes Tippen fängt der Ablauf über `busy` ab.

### Eingabefeld (Login)

52 px hoch, `base-200`, Rahmen 1,5 px `base-300`, Radius 12. Links ein Symbol (Person, Schloss) in `/55` statt eines Labels, beim Passwort rechts ein Auge zum Zeigen und Verbergen. Mit Fokus wird der Rahmen `primary`, bei Fehler `error`. Die Fehlermeldung hat immer ihren reservierten Platz, damit nichts springt.

### Stepper (Etappen oben)

- Eine Reihe runder Etappen-Knoten (44 px) mit Symbol, verbunden durch eine 2 px-Linie.
- **offen:** `base-200`, Symbol `/40`. **aktuell:** `primary` gefüllt. **erledigt:** `primary/15`, Symbol grün.
- Um die aktuelle Etappe liegt ein **Ring mit Segmenten**, eins je Unterschritt, die Wartezeit eingeschlossen. Erledigte Segmente laufen sichtbar voll (Radius 46, Strichstärke 9, Lücke 6 im 100er-Raster).
- Beim Etappenwechsel **wandert der volle Ring** über die Linie zum nächsten Knoten, schrumpft unterwegs auf 55 % und blendet am Ziel in den neuen Ring über. Die Linie füllt sich in 550 ms.
- Antippen der aktuellen Etappe klappt die **Unterschritte als Symbolreihe** auf (36 px-Knoten, erledigte zeigen einen Haken). Sie schließt nach 3 s oder beim Tippen daneben.

### Szene

Quadratische Fläche (`--scene`) mit einer SVG-Animation des Schritts, siehe [Szenen](#9-szenen). Beim Abhaken blendet sie aus, an ihrer Stelle erscheint der Haken-Kreis (96 px).

### Voraussetzungs-Pille

`rounded-full`, `bg-accent/25`, links das Symbol im hellen Kreis, Text „Schlüssel nicht vergessen“. Sie ist nur ein Hinweis, nichts zum Abhaken.

### Zeitwahl

- Frage in 15 px darüber („Wie lange läuft der Waschgang?“).
- **Segment-Leiste:** 52 px, `base-200`, `rounded-full`, die Vorgaben plus „Andere“. Das gewählte Segment ist `base-100`, semibold, `shadow-sm`.
- „Andere“ tauscht die Leiste gegen **Minus | Wert | Plus | Vorgaben**.
- Darunter mit Uhr-Symbol, wann es fertig ist: „heute, 18:08“.

### Zeitstrahl (Wartezeit)

Unter der Szene: Kopf mit Uhr und Fertig-Uhrzeit, Balken 6 px, Markierung 14 px (blinkt ruhig), Ziel-Haken am Ende, Tage als Striche mit Beschriftung. Ist die Zeit um, steht am Balkenende ein grüner Haken mit Uhr, der überzogene Teil wird `accent`, darunter die Überzeit in `accent` („+25 Min“).

### Fokus-Karte (Übersicht)

`base-200`, Radius 24, zentriert: Szene der aktuellen Position, Quest-Name, Status („Bereit zum Starten“, „Waschgang läuft“), bei Wartezeit ein Zeitbalken mit Restzeit. Die ganze Karte ist der Link in die Quest und gibt beim Drücken leicht nach (`active:scale-[0.99]`).

### Kopfzeile (in der Quest)

Links „‹ Übersicht“ in `primary`, 17 px. Rechts der Quest-Name in 15 px `/55`. Zurück verlässt die Quest nicht, sie behält ihren Stand.

### Symbole

Eigene Linien-Symbole in [`fragments/icons.html`](src/main/resources/templates/fragments/icons.html), in derselben Strichart wie die Szenen: `check`, `key`, `detergent`, `clock`, `washer`, `hanger`, `basket`, `stairs`, `clothesline`, `plus`, `minus`, `back`, `person`, `lock`, `eye`, `eyeOff`, `flask`, `appLogo`. Größe per Klasse, Farbe über `currentColor`.

### App-Logo

Dunkles abgerundetes Quadrat, darin ein grüner Fortschrittsring mit einem hellen Punkt in der Mitte. Die Icons in `static/icons/` sind daraus erzeugt, im Login steht es als `appLogo`.

---

## 8. Bildschirme

| Bildschirm | Aufbau von oben nach unten | Bild |
|---|---|---|
| **Login** | Logo, „Questlog“, Name, Passwort mit Auge, Platz für Fehler, „Anmelden“. Passt mit offener Tastatur ohne Scrollen. | [hell](docs/design/login-hell.png) · [dunkel](docs/design/login-dunkel.png) |
| **Übersicht** | Datum, „Questlog“, ALS NÄCHSTES mit Fokus-Karte, WEITERE QUESTS („Noch keine.“), unten der Beta-Button | [hell](docs/design/uebersicht-hell.png) · [dunkel](docs/design/uebersicht-dunkel.png) |
| **Quest-Start** | Quest-Symbol groß, „QUEST“, Name, „3 Etappen · 2 Wartezeiten“, Ablauf als senkrechte Liste mit Wartezeiten dazwischen, „Quest starten“ | [hell](docs/design/quest-start-hell.png) · [dunkel](docs/design/quest-start-dunkel.png) |
| **Schritt** | Kopfzeile, Stepper, Szene, Schritt-Titel, ggf. Voraussetzungs-Pille, „Erledigt“ | [hell](docs/design/schritt-hell.png) · [dunkel](docs/design/schritt-dunkel.png) |
| **Schritt mit Zeitwahl** | wie Schritt, statt der Pille die Zeitwahl, darüber die Zweitaktion „… fehlt“, Hauptaktion „Waschvorgang starten“ | [hell](docs/design/zeitwahl-hell.png) · [dunkel](docs/design/zeitwahl-dunkel.png) |
| **Fehlmeldung** | durchgestrichenes Symbol im roten Kreis, „Waschmittel fehlt“, „Die Quest wartet hier …“, „Auf die Einkaufsliste“, „Waschmittel ist da“ | [hell](docs/design/fehlmeldung-hell.png) · [dunkel](docs/design/fehlmeldung-dunkel.png) |
| **Wartezeit läuft** | Szene mit Zeitstrahl, „Waschgang läuft“, „Danach erinnere ich dich …“, Beta „Überspringen“ | [hell](docs/design/wartezeit-hell.png) · [dunkel](docs/design/wartezeit-dunkel.png) |
| **Wartezeit fertig** | Szene, Zeitstrahl mit Überzeit, „Waschgang fertig“, „Weiter: Trocknen“ | [hell](docs/design/wartezeit-fertig-hell.png) · [dunkel](docs/design/wartezeit-fertig-dunkel.png) |
| **Abschluss** | Regal-Szene mit Haken und Funkeln, „Wäsche geschafft“, „Nochmal von vorn“ | [hell](docs/design/abschluss-hell.png) · [dunkel](docs/design/abschluss-dunkel.png) |
| **Wartung** | eigene Seite für Coolify, siehe unten | – |

Bildschirmwechsel laufen immer gleich ab: Die Teile mit `data-enter` gleiten 14 px nach oben und verschwinden, dann gleiten die neuen von unten herein.

---

## 9. Szenen

Jeder Schritt hat eine kleine Animation, die zeigt, was zu tun ist. Die Szenen stehen in [`fragments/scenes.html`](src/main/resources/templates/fragments/scenes.html), ihre Bewegung in [`scenes.css`](src/main/resources/static/css/scenes.css). Sie sind Handarbeit und werden beim Neubau übernommen, nicht neu beschrieben.

### Zeichenstil

- `viewBox="0 0 120 120"`, quadratisch, Boden als Linie unten.
- Konturen in `--ink` (= Textfarbe), Strich **2,5**, Enden und Ecken **rund**.
- Flächen aus wenigen Farben: Grün (`--pr`, `--pr2`), Orange (`--ac`), Beige (`--c3`, `--wick`), Grau (`--line`). Leicht überzeichnet, freundlich, keine Details um ihrer selbst willen.
- Endlosschleife. Jede Szene endet so, dass der Anfang ohne Sprung folgt.
- Fertig-Momente in einer Szene enden mit dem **grünen Funkeln**: vierzackige Sterne, die aufgehen, sich um 45° drehen und vergehen.

### Die Szenen der Wäsche-Quest

| Szene | Schritt | Was passiert | Schleife |
|---|---|---|---|
| `s1` | Alles in den Wäschekorb | Socke, Shirt und Hose hüpfen nacheinander in den Korb, der Klappdeckel geht auf und zu. | 7 s |
| `s2` | Nach unten bringen | Korb in den Aufzug, Tür zu, Fahrt nach unten, mit dem Schlüssel zur Kellertür. | 13,5 s |
| `s3` | Maschine starten | Deckel des Korbs auf, Wäsche in die Trommel, Waschmittel ins Fach, Tür zu, Maschine läuft an. | 9,5 s |
| `s4` | Wartezeit Waschgang | Trommel dreht, das Display an der Maschine zeigt die Phasen, zum Schluss Schleudern. | 12 s |
| `s5` | Wäsche holen | Mit dem Schlüssel in den Keller, Wäsche aus der Maschine in den Korb, mit dem Aufzug zurück nach oben. | 26 s |
| `s6` | Wäsche aufhängen | Ständer klappt auf, drei Teile landen nacheinander auf den Drähten. | 8 s |
| `s7` | Trocknen lassen / Wartezeit | Wäsche hängt und dampft leicht, Sonne und Mond ziehen vorbei, die Nässe verschwindet. | 12 s |
| `s8` | Wäsche abnehmen | Teile wandern vom Ständer in einen Stapel. | 9 s |
| `s9` | Wegräumen | Teile fliegen nacheinander ins Regal, am Ende funkelt es. | 6 s |
| `s10` | Ständer wegräumen | Ständer klappt zusammen, wandert hinter die Tür, die Tür geht zu, es funkelt. | 11 s |

`s4-done` und `s7-done` sind die Standbilder für „Wartezeit fertig“.

---

## 10. Momente

### Abhaken (Mini-Feier)

1. Der Button gibt nach (0,25 s).
2. Die Szene blendet aus, ein hellgrüner Kreis erscheint und wird voll grün (0,3 s).
3. Der Haken zeichnet sich ein (0,42 s, Soft), dazu ein Lichthof, der sich auf 135 % weitet und vergeht (0,8 s, Out).
4. Kurze Ruhe (0,3 s), dann wechselt der Bildschirm zum nächsten Schritt.
5. Im Stepper läuft das Segment des Schritts voll (0,5 s).

### Etappenwechsel

Nach „Weiter: Trocknen“ wandert der volle Ring über die Linie zur nächsten Etappe (0,55 s), der Bildschirm wechselt, der neue Ring mit leeren Segmenten blendet ein (0,22 s), und der neue Knoten federt kurz auf.

### Abschluss (3,2 s, einmal)

| Zeit | Was passiert |
|---|---|
| 0,2–1,5 s | Ein leeres Regal. Vier Päckchen gleiten nacheinander von unten hinein (Out). |
| 1,5–1,9 s | Das Regal wird etwas kleiner und rückt nach oben. |
| 1,8–2,3 s | Ein grüner Kreis ploppt oben auf (auf 110 %, dann 100 %). |
| 2,05–2,5 s | Der Haken erscheint darin. |
| 2,25–3,1 s | Vier grüne Sterne funkeln versetzt um das Regal. |
| 2,4–2,7 s | „Wäsche geschafft“ gleitet herein. |

### Wartungsseite

[`coolify/wartung.html`](coolify/wartung.html) ist eine eigenständige Datei für Coolify mit Farben und Logo der App. Thema ist ein **Boxenstopp**: Ein Kran baut sich auf, in einer Box mit Wagenheber, zwei Pfosten und vier Armen wird das abgenutzte Logo gereinigt. Je nach Schaden kommen Luft, Bürste, Schleifer oder Tuch zum Einsatz, die Lämpchen an den Armen werden grün. Bei Bereitschaft wird die Ampel gelb und die Szene wartet. Antwortet die App wieder, wird die Ampel grün, die Box baut sich ab, es funkelt und die Seite lädt neu. Entwürfe dazu liegen in `entwuerfe/wartung-*.html`.

---

## 11. Quellen und Neubau von null

**Feste Bausteine.** Sie werden beim Neubau übernommen, nicht nachgebaut:

| Datei | Inhalt |
|---|---|
| [`src/main/frontend/app.css`](src/main/frontend/app.css) | Themes (alle Farben, Radien), Grundstil, Ring- und Abhaken-Klassen, reduzierte Bewegung |
| [`static/css/scenes.css`](src/main/resources/static/css/scenes.css) | Szenenfarben, alle Szenen-Keyframes, Zeitstrahl, Abschluss |
| [`templates/fragments/scenes.html`](src/main/resources/templates/fragments/scenes.html) | Die zehn Szenen als SVG |
| [`templates/fragments/icons.html`](src/main/resources/templates/fragments/icons.html) | Alle Symbole und das Logo |
| [`static/js/motion-kit.js`](src/main/resources/static/js/motion-kit.js) | `QL.animate`, `QL.spring`, `QL.tween`, Verhalten bei „Bewegung reduzieren“ |
| [`static/icons/`](src/main/resources/static/icons/) | App-Icons |
| [`coolify/wartung.html`](coolify/wartung.html) | Wartungsseite |

**Referenz für Aufbau und Verhalten:** [`templates/mockup/draft-laundry.html`](src/main/resources/templates/mockup/draft-laundry.html) mit [`static/js/draft.js`](src/main/resources/static/js/draft.js) (Konstanten `DESIGN`, `RING`, `EASE_*` ganz oben), [`templates/quest/overview.html`](src/main/resources/templates/quest/overview.html) und [`templates/login.html`](src/main/resources/templates/login.html).

**Entstehung:** Die Varianten, aus denen gewählt wurde, liegen in [`entwuerfe/`](entwuerfe/). Die Recherche zu Begriffen für Wirkung und Gestaltung steht in [`docs/research/ui-wirkung-modelle.md`](docs/research/ui-wirkung-modelle.md).

**Prüfen, ob ein Neubau stimmt:** Jeden Bildschirm aus [Abschnitt 8](#8-bildschirme) auf iPhone-15-Größe (390 × 844) hell und dunkel aufnehmen und neben die Bilder in `docs/design/` legen.

---

## 12. Bewusst nicht

- Keine technischen Darstellungen: Schnitte, Schächte, Beschriftungen, Abkürzungen.
- Kein Text und keine Zahlen in Szenen.
- Keine Pausen oder Effekte, die niemand verlangt hat.
- Nichts Schnelles oder Ruckartiges, etwa ein Deckel, der aufschnappt.
- Keine zweite Hauptaktion auf einem Bildschirm.
- Kein Grün für etwas anderes als Fortschritt und Erledigt.
- Keine Kommazahlen bei Tagen.
- Keine Begrüßungs- oder Erklärtexte, wo das Bild reicht (etwa beim Login).

---

## 13. Noch offen

- **Leerzustand:** Wie die Übersicht ohne laufende Quest einen Vorschlag macht, ohne zu drängen (#21).
- **Seite `/design`:** Alle Komponenten in allen Zuständen zum Antippen (#8).
- **Button-Zustände** „lädt“ und „deaktiviert“.
- **Quest-Editor:** Eingabefeld, Auswahl, Listenzeile mit Ziehgriff (#17).
- **Kontrast:** Textkontrast nach WCAG AA ist nicht automatisch geprüft.
- **Schriftgrößen:** Es sind zwölf Größen im Einsatz. Ob sie so bleiben oder zusammengelegt werden, ist nicht entschieden.
