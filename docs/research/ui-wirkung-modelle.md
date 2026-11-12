# Etablierte Modelle, um die Wirkung einer Oberfläche zu beschreiben und Gestaltung zu zerlegen

Stand der Recherche: 12.11.2026. Kennzeichnung: **Belegt** heißt, die Angabe stammt aus der genannten Quelle [n]. **Einschätzung** ist eine eigene Bewertung. **Unbestätigt** heißt, die Primärquelle war nicht erreichbar.

## 1. Kurzfassung

Es gibt kein einzelnes etabliertes Modell, das Wirkung und Gestaltungsmittel zusammen abdeckt. In der Praxis nutzt man dafür zwei getrennte Familien. Für die **Wirkung** gibt es validierte Fragebögen aus der UX-Forschung: UEQ bzw. UEQ+ (deutsches Original, Wortpaare) und AttrakDiff (ebenfalls deutsch, unterscheidet pragmatische und hedonische Qualität). Dazu kommen die 118 Product Reaction Cards von Microsoft als freies Wortvokabular. Für die **Gestaltungsmittel** gibt es Design-Systeme und Spezifikationen: die Stil-Kategorien von Material Design 3 (Farbe, Typografie, Form, Elevation, Bewegung, Zustände), die Foundations von Apple und die Token-Typen des W3C-Design-Tokens-Formats (stabile Version 2025.10). Diese lassen sich direkt auf CSS-Eigenschaften abbilden. Für Rückmeldung gibt es mit Saffers Microinteractions (Trigger, Regeln, Feedback, Loops & Modes) ein eigenes, etabliertes Zerlegungsmodell. Der Dreiklang „Erscheinung, Bewegung, Rückmeldung“ ist in keiner geprüften Quelle so belegt, passt aber grob zu dieser Aufteilung. Die selbst erfundenen „Wirkungsachsen“ sollte man durch die belegten UEQ/UEQ+-Wortpaare und die Reaction Cards ersetzen. **Einschätzung:** Die beste Kombination ist UEQ+ (Wortpaare) und die Reaction Cards für die Wirkung, dazu M3 bzw. DTCG-Token-Typen für die Mittel und Saffer für die Rückmeldung.

---

## 2. Teil A: Wirkung beschreiben

### A1. Don Norman: Emotional Design (viszeral, verhaltensbezogen, reflektiv)

- **Was / wer (belegt):** Don Norman, Buch *Emotional Design: Why We Love (or Hate) Everyday Things* (2004). Ein Kapitel heißt „Three Levels of Design: Visceral, Behavioral and Reflective“ [2]. Ein früher Kapitelentwurf von 2003 nennt als Ursprung des Drei-Ebenen-Modells Norman, Ortony & Russell (2003) (über eine Websuche gesehen, PDF nicht selbst geöffnet).
- **Schnitt (belegt, aus Normans Essay [1]):**
  - *Visceral:* „Visceral design refers primarily to that initial impact, to its appearance.“ Gemeint ist der erste Eindruck, das Aussehen.
  - *Behavioral:* „Behavioral design is about look and feel — the total experience of using a product.“ Gemeint ist das Erleben bei der Benutzung.
  - *Reflective:* Es geht um die Gedanken danach: wie man sich damit fühlt und welches Bild das Produkt nach außen vermittelt.
- **Stärken (Einschätzung):** Gut, um zu sortieren, *wann* ein Urteil entsteht: sofort beim Hinsehen, beim Tippen oder im Rückblick („motiviert mich die App, morgen wiederzukommen?“).
- **Grenzen (Einschätzung):** Das sind Verarbeitungsebenen beim Menschen und keine Gestaltungsmittel. Das Modell enthält keine Wortliste und keinen Fragebogen. Man kann damit nicht sagen, *was* an der Farbe oder Animation stört.

### A2. User Experience Questionnaire (UEQ, UEQ-S, UEQ+)

- **Was / wer (belegt):** Ein Fragebogen von Bettina Laugwitz, Theo Held und Martin Schrepp [3]. „The original German version of the UEQ was created in 2005.“ [4] Die Validierung ist veröffentlicht in Laugwitz, Schrepp & Held (2008), USAB 2008, LNCS 5298, S. 63–76 [4]. Der Fragebogen ist in über 30 Sprachen verfügbar und kostenlos. Es gibt einen Benchmark mit 452 Produktbewertungen und 20.190 Teilnehmenden (Stand im Handbuch V11, 12.09.2023) [3][4].
- **Form (belegt):** Ein semantisches Differenzial mit 26 Items. Jedes Item besteht aus zwei gegensätzlichen Begriffen mit einer 7-stufigen Skala von −3 bis +3 [4].
- **Skalen (belegt, [4]):** 6 Skalen. Attraktivität hat 6 Items, alle anderen Skalen haben 4.
  - *Attraktivität (Attractiveness)*: reine Gesamtbewertung, „mag ich / mag ich nicht“.
  - *Pragmatisch (zielbezogen)*: Durchschaubarkeit (Perspicuity), Effizienz (Efficiency), Steuerbarkeit (Dependability).
  - *Hedonisch (nicht zielbezogen)*: Stimulation, Originalität (Novelty).
- **Alle 26 englischen Wortpaare (belegt, Abbildung im Handbuch [4]; die Zuordnung zu den Skalen zeigt dort eine Grafik und wurde hier nicht vollständig übernommen):** annoying/enjoyable, not understandable/understandable, dull/creative, difficult to learn/easy to learn, inferior/valuable, boring/exciting, not interesting/interesting, unpredictable/predictable, slow/fast, conventional/inventive, obstructive/supportive, bad/good, complicated/easy, unlikable/pleasing, usual/leading edge, unpleasant/pleasant, not secure/secure, motivating/demotivating, does not meet expectations/meets expectations, inefficient/efficient, confusing/clear, impractical/practical, cluttered/organized, unattractive/attractive, unfriendly/friendly, conservative/innovative.
- **Deutsche Originalwörter (belegt, nur Auszug aus dem UEQ+-Handbuch [5]):**
  - Stimulation: langweilig/spannend, uninteressant/interessant, einschläfernd/aktivierend, minderwertig/wertvoll.
  - Originalität: phantasielos/kreativ, konventionell/originell, herkömmlich/neuartig, konservativ/innovativ.
  - Attraktivität (4 der 6 Items): unerfreulich/erfreulich, schlecht/gut, unangenehm/angenehm, unsympathisch/sympathisch.
  - Die vollständige deutsche 26er-Liste steht im Download-Paket auf ueq-online.org. Die direkte PDF-URL lieferte 404, daher habe ich sie hier nicht vollständig wiedergegeben.
- **UEQ-S (belegt, [4]):** Kurzversion mit 8 Items und zwei Skalen, Pragmatische und Hedonische Qualität. Englisch: obstructive/supportive, complicated/easy, inefficient/efficient, confusing/clear (pragmatisch); boring/exciting, not interesting/interesting, conventional/inventive, usual/leading edge (hedonisch). Die Autoren empfehlen sie nur für Sonderfälle.
- **UEQ+ (belegt, [5], Handbuch V6 vom 03.12.2023, Schrepp & Thomaschewski):** Ein Baukasten: „not a UX questionnaire, it is a tool to build concrete questionnaires“ [3]. Jede Skala hat 4 Items. Die Skalen mit deutschem Originalnamen: Attraktivität, Effizienz, Durchschaubarkeit, Steuerbarkeit, Stimulation, Originalität, **visuelle Ästhetik**, Anpassbarkeit, Nützlichkeit, Intuitive Bedienung, Wertigkeit, Inhaltsseriosität, Inhaltsqualität, Vertrauen, **Haptik**, **Akustik**, **Übersichtlichkeit**, Antwortverhalten, Antwortqualität. Besonders passend für die Gestaltung:
  - *Visuelle Ästhetik:* hässlich/schön, stillos/stilvoll, nicht ansprechend/ansprechend, unästhetisch/ästhetisch.
  - *Übersichtlichkeit (Clarity):* schlecht gegliedert/gut gegliedert, unstrukturiert/strukturiert, ungeordnet/geordnet, unorganisiert/organisiert. Laut [5] beschreibt die Skala den Eindruck von Ordnung, Struktur und visueller Komplexität.
  - *Haptik* bezieht sich laut [5] auf das Berühren physischer Produkte, *Akustik* auf Töne und Betriebsgeräusche.
- **Stärken (Einschätzung):** Deutsches Original, frei verfügbar, verbreitet und validiert. Die Wortpaare sind genau das gesuchte Vokabular („wirkt einschläfernd statt aktivierend“, „wirkt ungeordnet“). Mit UEQ+ kann man nur die relevanten Skalen auswählen.
- **Grenzen (Einschätzung):** Der Fragebogen misst Urteile, er erklärt keine Ursachen. Das Handbuch sagt selbst, dass er Verbesserungsbereiche nur indirekt anzeigt [4]. Mit einer einzigen Person (dem Entwickler) ergibt er keine Statistik, sondern nur ein Vokabular.

### A3. AttrakDiff (Hassenzahl, Burmester, Koller)

- **Was / wer (belegt):** Hassenzahl, Burmester & Koller (2003), „AttrakDiff: Ein Fragebogen zur Messung wahrgenommener hedonischer und pragmatischer Qualität“, *Mensch & Computer 2003*, S. 187–196 [8]. Die Entwicklung lief zum großen Teil im BMBF-Projekt INVITE. Das Werkzeug betreibt heute die UID GmbH auf attrakdiff.de [7].
- **Schnitt (belegt, [7][8]):** Vier Dimensionen.
  - *Pragmatische Qualität (PQ)*: Benutzbarkeit, also ob man seine Ziele erreicht.
  - *Hedonische Qualität – Identität (HQ-I)*: wie gut man sich mit dem Produkt identifizieren kann.
  - *Hedonische Qualität – Stimulation (HQ-S)*: neuartig, interessant, anregend.
  - *Attraktivität (ATT)*: globales Urteil.
- **Wortpaare (belegt, Tabelle 1 in [8], AttrakDiff 2; 7-stufig; Polung so wie abgedruckt):**
  - HQ-S: harmlos–herausfordernd, lahm–fesselnd, phantasielos–kreativ, originell–konventionell, neuartig–herkömmlich, innovativ–konservativ, mutig–vorsichtig.
  - HQ-I: ausgrenzend–einbeziehend, bringt mich den Leuten näher–trennt mich von Leuten, isolierend–verbindend, nicht vorzeigbar–vorzeigbar, minderwertig–wertvoll, stilvoll–stillos, fachmännisch–laienhaft.
  - PQ: praktisch–unpraktisch, widerspenstig–handhabbar, voraussagbar–unberechenbar, verwirrend–übersichtlich, umständlich–direkt, menschlich–technisch, einfach–kompliziert.
  - ATT: Laut [8] stammen die sieben Attraktivitätsitems aus dem AttrakDiff 1. Im Text abgedruckt sind nur Beispiele („gut“, „sympathisch“, „motivierend“). **Die vollständige ATT-Liste und die Gesamtzahl von 28 Items sind hier unbestätigt.**
- **Quellenhinweis:** Das PDF unter attrakdiff.de/files/… liefert inzwischen 404. Gelesen habe ich eine Kopie derselben Datei im Internet Archive.
- **Stärken (Einschätzung):** Deutsch und kostenlos nutzbar (bis 20 Teilnehmende [7]). Die Trennung „funktioniert gut“ (PQ) und „macht Lust“ (HQ) ist hilfreich für die Frage „gefällt mir nicht, weiß nicht warum“.
- **Grenzen (Einschätzung):** HQ-I (Identität, Status) ist für eine private Haushalts-App wenig relevant. Visuelle Ruhe bzw. Übersichtlichkeit fragt AttrakDiff nicht gezielt ab, die UEQ+-Skala „Übersichtlichkeit“ schon.

### A4. Microsoft Desirability Toolkit / Product Reaction Cards (Benedek & Miner, 2002)

- **Was / wer (belegt):** Joey Benedek und Trish Miner, Microsoft, „Measuring Desirability: New methods for evaluating desirability in a usability lab setting“, UPA 2002 [9]. Das Toolkit besteht aus zwei Teilen: einem Gesichter-Fragebogen und den Product Reaction Cards [9].
- **Methode (belegt, [9]):** Die Teilnehmenden wählen aus den Karten die Wörter, die das Produkt oder ihr Gefühl bei der Benutzung am besten beschreiben. Dann engen sie die Auswahl auf **5** ein und begründen jede Wahl. Angestrebt war ein Verhältnis von etwa 60 % positiven zu 40 % negativen oder neutralen Wörtern. Das Ergebnis sind ausdrücklich **qualitative** Daten. Die Zählungen zeigen nur Trends, das Wichtigste ist das Gespräch [9].
- **Umfang (belegt):** 118 Karten [9][10]. Die vollständige Liste aus [10] (englisch; Nutzung ist erlaubt mit dem Hinweis „Developed by and © 2002 Microsoft Corporation. All rights reserved.“):
  Accessible, Advanced, Annoying, Appealing, Approachable, Attractive, Boring, Business-like, Busy, Calm, Clean, Clear, Collaborative, Comfortable, Compatible, Compelling, Complex, Comprehensive, Confident, Confusing, Connected, Consistent, Controllable, Convenient, Creative, Customizable, Cutting edge, Dated, Desirable, Difficult, Disconnected, Disruptive, Distracting, Dull, Easy to use, Effective, Efficient, Effortless, Empowering, Energetic, Engaging, Entertaining, Enthusiastic, Essential, Exceptional, Exciting, Expected, Familiar, Fast, Flexible, Fragile, Fresh, Friendly, Frustrating, Fun, Gets in the way, Hard to Use, Helpful, High quality, Impersonal, Impressive, Incomprehensible, Inconsistent, Ineffective, Innovative, Inspiring, Integrated, Intimidating, Intuitive, Inviting, Irrelevant, Low Maintenance, Meaningful, Motivating, Not Secure, Not Valuable, Novel, Old, Optimistic, Ordinary, Organized, Overbearing, Overwhelming, Patronizing, Personal, Poor quality, Powerful, Predictable, Professional, Relevant, Reliable, Responsive, Rigid, Satisfying, Secure, Simplistic, Slow, Sophisticated, Stable, Sterile, Stimulating, Straight Forward, Stressful, Time-consuming, Time-Saving, Too Technical, Trustworthy, Unapproachable, Unattractive, Uncontrollable, Unconventional, Understandable, Undesirable, Unpredictable, Unrefined, Usable, Useful, Valuable.
- **Quellenhinweis:** Die Originaldokumente (Word) lagen unter microsoft.com/usability/UEPostings/… und sind nur noch im Internet Archive erhalten [9][10]. Eine offizielle deutsche Fassung habe ich nicht gefunden.
- **Stärken (Einschätzung):** Am nächsten an „ich habe keine Wörter dafür“. Man muss nichts formulieren, nur auswählen. Wörter wie *Calm, Busy, Overwhelming, Distracting, Stressful, Clean, Fresh, Fun, Energetic, Sterile* passen genau zu „Calm Focus“ und ADHS.
- **Grenzen (Einschätzung):** Nicht validiert und nicht skaliert. Ohne das Gespräch „warum dieses Wort?“ bleibt es oberflächlich.

### A5. Semantisches Differenzial (Osgood)

- **Was / wer:** Charles E. Osgood, George J. Suci und Percy H. Tannenbaum, *The Measurement of Meaning* (1957). Die Methode misst die konnotative Bedeutung, also das Gefühl, das jemand mit einem Begriff verbindet, über Gegensatzpaare mit meist 7 Stufen. **Unbestätigt:** Das Buch selbst war online nicht zugänglich. Die Angaben stammen aus Sekundärquellen (über eine Websuche gesehen, siehe [11]).
- **Schnitt (unbestätigt, Sekundärquellen):** Drei wiederkehrende Faktoren, „EPA“:
  - Bewertung (Evaluation): gut–schlecht, angenehm–unangenehm.
  - Potenz (Potency): stark–schwach, hart–weich, schwer–leicht.
  - Aktivität (Activity): aktiv–passiv, schnell–langsam, erregbar–ruhig.
- **Belegt ist die Abstammung:** UEQ und AttrakDiff nutzen ausdrücklich das Format des semantischen Differenzials [4][8].
- **Stärken / Grenzen (Einschätzung):** Das ist die methodische Grundlage, aber kein UI-spezifisches Vokabular. Interessant ist es als Beleg dafür, dass Achsen wie „ruhig–aktiv“ oder „leicht–schwer“ eine Tradition haben. Für die Praxis sind die abgeleiteten UI-Fragebögen (UEQ, AttrakDiff) geeigneter.

---

## 3. Teil B: Gestaltungsmittel zerlegen

### B1. Material Design 3 (Google)

- **Hinweis zur Quelle:** m3.material.io ist eine JavaScript-Anwendung. Über das Abrufwerkzeug kam nur der Seitentitel an, kein Inhalt [14]. Ich habe deshalb auf die maschinenlesbaren Token-Dateien von Google (Material Web, GitHub [12]) und die Android-API-Referenz [13] ausgewichen. Die Gliederung der Website selbst ist damit **unbestätigt**.
- **Token-/Stil-Kategorien (belegt über die Token-Dateien [12]):** Die System-Tokens sind aufgeteilt in `md-sys-color` (Farbe), `md-sys-typescale` (Typografie), `md-sys-shape` (Form), `md-sys-elevation` (Höhe/Tiefe), `md-sys-motion` (Bewegung) und `md-sys-state` (Interaktionszustände). Dazu kommen Referenz-Tokens `md-ref-palette` und `md-ref-typeface`.
- **Zustände / State Layers (belegt, [12]):** Die Tokens für die Deckkraft der State Layers: hover 0.08, focus 0.12, pressed 0.12, dragged 0.16. Ein State Layer ist eine halbtransparente Überlagerung, die einen Zustand sichtbar macht (die Definition stammt aus M3, die Website war aber nicht lesbar, daher hier unbestätigt). Werte für „disabled“ stehen nicht in dieser Datei. Ich habe sie hier nicht belegt.
- **Motion: Dauer und Easing (belegt, [12]):**
  - Dauer: short1–4 = 50/100/150/200 ms, medium1–4 = 250/300/350/400 ms, long1–4 = 450/500/550/600 ms, extra-long1–4 = 700/800/900/1000 ms.
  - Easing (alle als `cubic-bezier`): emphasized (0.2, 0, 0, 1), emphasized-decelerate (0.05, 0.7, 0.1, 1), emphasized-accelerate (0.3, 0, 0.8, 0.15), standard (0.2, 0, 0, 1), standard-decelerate (0, 0, 0, 1), standard-accelerate (0.3, 0, 1, 1), linear, dazu drei „legacy“-Kurven.
- **Springs / M3 Expressive (belegt über die Android-Referenz [13]):** Es gibt zwei Motion Schemes. `expressive` ist „Material's recommended motion scheme for prominent UI elements and hero interactions“. `standard` ist für „utilitarian UI elements and recurring interactions“. Jedes Scheme hat die Stufen fast, default und slow, jeweils für *spatial* und *effects*. Spatial gilt für Animationen, die Form oder Größe ändern. Effects gilt für Animationen ohne Formänderung, zum Beispiel Farbe oder Deckkraft. Konkrete Werte für Steifigkeit und Dämpfung habe ich nicht an einer Google-Quelle geprüft (**unbestätigt**).
- **Stärken (Einschätzung):** Die sauberste, öffentlich dokumentierte Zerlegung in benannte Kategorien mit konkreten Zahlen. Die Trennung „spatial vs. effects“ ist ein gutes Wort für „das wackelt“ vs. „das blendet über“.
- **Grenzen (Einschätzung):** Es ist Googles Designsprache, kein neutraler Standard. Die Zahlen sind Vorschläge und keine Wirkungsgesetze.

### B2. Apple Human Interface Guidelines (HIG)

- **Foundations (belegt, [15]):** Accessibility, App icons, Branding, Color, Dark Mode, Icons, Images, Immersive experiences, Inclusion, Layout, Materials, Motion, Privacy, Right to left, SF Symbols, Spatial layout, Typography, Writing.
- **Motion (belegt, [16]):** Kernregeln sind: Bewegung zweckgebunden einsetzen („Don’t add motion for the sake of adding motion“), Bewegung optional machen, Feedback-Animationen kurz und präzise halten, häufige Interaktionen nicht zusätzlich animieren, Animationen abbrechbar machen.
- **Feedback (belegt, [17]):** Feedback teilt Status, Erfolg oder Misserfolg, Warnungen und Korrekturmöglichkeiten mit. Die Art der Rückmeldung soll zur Bedeutung der Information passen. Erfolgsbestätigungen sind für wichtige Aktionen gedacht. Feedback soll über mehrere Kanäle zugänglich sein (Farbe, Text, Ton, Haptik).
- **Playing haptics (belegt, [18]):** Es gibt die Systemmuster Notification (Success, Warning, Error), Impact (Light, Medium, Heavy, Rigid, Soft) und Selection. Eigene Muster bestehen aus *transient* und *continuous* events, gesteuert über **intensity** und **sharpness**. Sharpness reicht von „soft, rounded, or organic“ bis „crisp, precise, or mechanical“. Weitere Regeln: Intensität und Schärfe der Haptik passend zur Animation wählen, Haptik sparsam einsetzen.
- **Web/PWA (belegt, [19]):** `navigator.vibrate()` wird laut MDN-Kompatibilitätsdaten in Safari nicht unterstützt (`version_added: false`), Safari auf iOS übernimmt diesen Eintrag. Eine iPhone-PWA kann also keine Vibration auslösen. Die HIG-Haptik-Regeln gelten nur für native Apps. Als Rückmeldekanäle bleiben Bild und Ton.
- **Stärken / Grenzen (Einschätzung):** Gut für Grundsätze, also *wann* Bewegung und Rückmeldung sinnvoll sind, und ein Maßstab dafür, wie sich iOS „anfühlt“. Apple liefert aber keine Token-Tabelle wie M3 und wenig Zahlenwerte.

### B3. W3C Design Tokens Community Group: Design Tokens Format Module

- **Status (belegt, [20][21]):** Version **2025.10**, veröffentlicht am **28.10.2025** als „Final Community Group Report“. Die Gruppe nennt sie „considered stable“. Sie ist **kein** W3C-Standard und steht nicht auf dem Standards Track. Daneben gibt es die Color- und Resolver-Module (ebenfalls 2025.10). Eine neuere stabile Version habe ich bis heute nicht gefunden.
- **Einfache Typen (belegt, Kap. 8 in [20]):** `color`, `dimension` (nur `px` oder `rem`), `fontFamily`, `fontWeight` (1–1000 oder Namen wie `light`, `regular`, `bold`), `duration` (nur `ms` oder `s`), `cubicBezier`, `number`.
- **Zusammengesetzte Typen (belegt, Kap. 9 in [20]):**
  - `strokeStyle`: `solid`, `dashed` usw. oder `dashArray` + `lineCap`.
  - `border`: color, width, style.
  - `transition`: duration, delay, timingFunction.
  - `shadow`: color, offsetX, offsetY, blur, spread, inset; auch mehrere Schatten als Liste.
  - `gradient`: Stopps aus color und position.
  - `typography`: fontFamily, fontSize, fontWeight, letterSpacing, lineHeight.
- **Stärken (Einschätzung):** Neutral, nicht an einen Anbieter gebunden, und fast jeder Typ entspricht direkt einer CSS-Eigenschaft. Gut als „technische Seite“ des mentalen Modells.
- **Grenzen (Einschätzung):** Es gibt keinen Typ für Federn bzw. Springs, für Deckkraft nur `number`, keine Zustände und keine Begriffe für Wirkung. Es ist ein Datenformat und kein Gestaltungsmodell.

### B4. Dan Saffer: Microinteractions

- **Was / wer (belegt):** Dan Saffer, *Microinteractions: Designing with Details*, O’Reilly, 2013 [22].
- **Schnitt (belegt, Interview mit Saffer [23]):** Trigger, Rules, Feedback, Loops and Modes.
  - *Trigger*: Auslöser, entweder manuell (Tippen, Klicken) oder vom System (wenn eine Bedingung eintritt).
  - *Rules*: was nach dem Auslöser passiert, also Ablauf und unsichtbare Einschränkungen.
  - *Feedback*: „the feedback is showing how the rules work“.
  - *Modes*: Varianten mit anderen Regeln, sparsam einsetzen.
  - *Loops*: Dauer und Wiederholung. Die Details dazu stehen im Buch; ich habe sie dort nicht selbst geprüft, sie stammen aus Sekundärquellen und sind daher **unbestätigt**.
- **Stärken (Einschätzung):** Das passende etablierte Modell für „Rückmeldung“, zum Beispiel beim Abhaken einer Aufgabe: Was löst aus, was passiert, was sehe oder höre ich, was passiert beim fünften Mal?
- **Grenzen (Einschätzung):** Es beschreibt den Ablauf einer Interaktion, nicht ihr Aussehen. Das Buch selbst habe ich nicht gelesen (Verlagsseite: 403).

### B5. Disney-Prinzipien und UX in Motion (Willenskomer)

- **Disney (unbestätigt, nur Sekundärquellen):** Frank Thomas & Ollie Johnston, *The Illusion of Life: Disney Animation* (1981) [25]. Die zwölf Prinzipien: Squash and Stretch, Anticipation, Staging, Straight Ahead Action and Pose to Pose, Follow Through and Overlapping Action, Slow In and Slow Out, Arc, Secondary Action, Timing, Exaggeration, Solid Drawing, Appeal. Das Buch war nicht online zugänglich.
- **UX in Motion (belegt, Neuveröffentlichung des Manifests in UX Magazine [24]; das Medium-Original lieferte 403):** Issara Willenskomer nennt 12 Prinzipien:
  - Easing, Offset & Delay (Timing)
  - Parenting (Objektbeziehung)
  - Transformation, Value Change, Masking, Overlay, Cloning (Objektkontinuität)
  - Parallax (zeitliche Hierarchie)
  - Obscuration, Dimensionality, Dolly & Zoom (räumliche Kontinuität)
  - Bewegung unterstützt laut ihm die Usability auf vier Wegen: Expectation, Continuity, Narrative, Relationship.
  - Nur zwei der Prinzipien gehen auf Disney zurück: Easing auf „Slow In and Slow Out“ und Offset & Delay auf „Follow Through and Overlapping Action“. Disney ziele auf ansprechende Animation, UX in Motion auf Benutzbarkeit.
- **Stärken / Grenzen (Einschätzung):** Willenskomer liefert Wörter dafür, *was* eine Animation leistet (zum Beispiel „zeigt, woher das Element kommt“ = Cloning, „Zahl zählt hoch“ = Value Change). Die Disney-Begriffe (Squash and Stretch, Anticipation) helfen dabei, die Lebendigkeit einer Animation zu benennen. Beide Modelle stammen von Praktikern und sind nicht empirisch validiert.

### B6. Layout: Gestaltgesetze und visuelle Hierarchie

- **Einschätzung:** Für „Layout“ reichen in diesem Projekt die Kategorie Layout der HIG [15], die UEQ+-Skala Übersichtlichkeit [5] und die Abstands-Tokens (`dimension`). Die Gestaltgesetze (Nähe, Ähnlichkeit usw.) sind die übliche Grundlage dafür, *warum* Gruppierung wirkt. Ich habe sie hier nicht an einer Primärquelle geprüft.

---

## 4. Gegenprüfung des selbst konstruierten Modells

| Bestandteil | Abgleich | Bewertung |
|---|---|---|
| „Wirkung entsteht aus Erscheinung, Bewegung, Rückmeldung“ | In keiner geprüften Quelle als Modell belegt. **Einschätzung:** Die Aufteilung passt grob. *Erscheinung* ≈ M3-Kategorien Farbe, Typografie, Form, Elevation [12] bzw. die HIG-Foundations [15]. *Bewegung* ≈ M3 Motion [12][13] bzw. HIG Motion [16]. *Rückmeldung* ≈ HIG Feedback [17], Saffer [23] und M3 States [12]. | Als Sortierhilfe vertretbar, aber als eigene Erfindung kennzeichnen. Es fehlen ausdrücklich **Layout/Abstand** und **Zustände**. „Rückmeldung“ sollte man durch Saffers vier Teile und die M3-Zustände genauer fassen. Nicht mit Normans Ebenen vermischen: Die beschreiben Verarbeitungsebenen beim Menschen, keine Gestaltungsmittel [1]. |
| ruhig – lebendig | Nahe an UEQ Stimulation „einschläfernd/aktivierend“ [5] und Osgoods Aktivitätsfaktor (unbestätigt). Reaction Cards: Calm, Energetic [10]. | Ersetzen durch UEQ-Paar „einschläfernd/aktivierend“ bzw. die Karten *Calm, Energetic, Busy*. |
| weich – knackig | Belegt nur für Haptik: Apples *sharpness*, von „soft, rounded, organic“ bis „crisp, precise, mechanical“ [18]. Bei Animation entspricht es am ehesten Easing bzw. Spring-Stufen [12][13] (Einschätzung). | Als Begriff für Bewegung brauchbar, aber am Mittel festmachen: Easing-Kurve, Dauer, spatial vs. effects. |
| leicht – schwer | Osgoods Potenzfaktor nennt schwer–leicht (unbestätigt, Sekundärquellen). In den geprüften UI-Fragebögen kommt es nicht vor. | Nicht als „UI-Achse“ ausgeben. Stattdessen konkret die Mittel benennen: `fontWeight`, `shadow`/Elevation, Dauer. |
| warm – kühl | In keiner der geprüften Quellen gefunden. | Als Farbbeschreibung umgangssprachlich üblich, hier aber nicht belegt. Konkret am `color`-Token festmachen. |
| luftig – dicht | Inhaltlich nahe an UEQ+ Übersichtlichkeit (Ordnung, visuelle Komplexität) [5], UEQ „cluttered/organized“ [4] und den Karten *Busy, Overwhelming, Clean* [10]. | Ersetzen durch „ungeordnet/geordnet“ und „cluttered/organized“. Mittel: Abstände (`dimension` → `gap`, `padding`). |
| leise – laut | Nicht gefunden. Nahe Karten: *Distracting, Overbearing, Calm* [10]. | Ersetzen durch die Karten. |
| ernst – verspielt | Nicht als Achse gefunden. Nahe Karten: *Business-like, Professional* vs. *Fun, Entertaining* [10]. | Ersetzen durch die Karten. |

**Fazit (Einschätzung):** Die Achsen sind keine erfundenen Unsinnsbegriffe, sondern Alltagswörter, und einige haben Verwandte in Osgoods Faktoren oder in Apples Haptik-Begriffen. Als „Modell“ sind sie aber nicht belegt und nicht vollständig. Die validierten Wortpaare (UEQ/UEQ+, AttrakDiff) und die Reaction Cards leisten dasselbe mit Quelle.

---

## 5. Empfehlung: Kombination für diesen Nutzer

**Einschätzung.** Nichts Neues erfinden, sondern drei Ebenen aus bestehenden Modellen verbinden:

**Ebene 1: Was spüre ich? (Wirkung, Vokabular)**
- Freie Wahl: **Product Reaction Cards** [10]. Zu einem Screen 5 Wörter wählen und begründen, wie in [9] beschrieben. Kandidaten für Calm Focus und ADHS: Calm, Clean, Fresh, Fun, Energetic, Busy, Overwhelming, Distracting, Stressful, Sterile, Boring.
- Strukturiert: **UEQ+**-Skalen mit deutschen Wortpaaren [5]. Empfohlene Auswahl: Übersichtlichkeit, visuelle Ästhetik, Stimulation, Durchschaubarkeit, Effizienz.
- Zeitpunkt nach **Norman** [1]: erster Blick (viszeral), beim Bedienen (verhaltensbezogen), am nächsten Tag (reflektiv).

**Ebene 2: Woran liegt es? (Gestaltungsmittel → Token-Typ → CSS)**
- **Farbe**: M3 `md-sys-color` [12] → DTCG `color` [20] → `color`, `background-color`.
- **Typografie**: M3 `md-sys-typescale` → DTCG `typography` (fontFamily, fontSize, fontWeight, letterSpacing, lineHeight) → `font-family`, `font-size`, `font-weight`, `letter-spacing`, `line-height`.
- **Form**: M3 `md-sys-shape` → DTCG `dimension` → `border-radius`; Rahmen → DTCG `border` → `border`.
- **Layout/Abstand**: HIG Layout [15] → DTCG `dimension` → `padding`, `margin`, `gap`. Prüfwort: UEQ+ Übersichtlichkeit.
- **Tiefe**: M3 `md-sys-elevation` / HIG Materials → DTCG `shadow` → `box-shadow`.
- **Bewegung**
  - *Dauer*: M3 short…extra-long [12] → DTCG `duration` → `transition-duration`, `animation-duration`.
  - *Beschleunigung*: M3 easing [12] → DTCG `cubicBezier` → `transition-timing-function`. Federn (M3 spatial/effects [13]) lassen sich in CSS mit `linear()` annähern; die Funktion ist laut MDN seit Dezember 2023 in allen gängigen Browsern verfügbar [26].
  - *Kombiniert*: DTCG `transition` (duration, delay, timingFunction) → `transition`.
  - *Was die Bewegung leistet*: Willenskomer-Begriffe [24] (Easing, Offset & Delay, Transformation, Value Change …).
  - *Rücksicht*: HIG „Make motion optional“ [16] → `@media (prefers-reduced-motion: reduce)` [27].

**Ebene 3: Was passiert, wenn ich etwas tue? (Rückmeldung)**
- **Ablauf** nach Saffer [23]: Trigger → Rules → Feedback → Loops & Modes.
- **Zustände** nach M3 [12]: hover, focus, pressed, dragged (State-Layer-Deckkraft als DTCG `number`) → `:hover`, `:focus-visible`, `:active`, `:disabled`, `opacity`. **Einschätzung:** Auf dem iPhone spielt hover praktisch keine Rolle.
- **Kanäle** nach HIG Feedback [17]: Bild und Ton. **Keine Haptik in der iOS-PWA** [19].

---

## 6. Quellen

1. Don Norman: „Emotional Design: People and Things“, jnd.org (auf der Seite datiert 17.11.2008). https://jnd.org/emotional-design-people-and-things/
2. Don Norman: *Emotional Design: Why We Love (or Hate) Everyday Things*, Buchseite. https://jnd.org/books/emotional-design-why-we-love-or-hate-everyday-things/
3. User Experience Questionnaire, offizielle Website. https://www.ueq-online.org/
4. M. Schrepp: User Experience Questionnaire Handbook, Version 11 (12.09.2023). https://www.ueq-online.org/Material/Handbook.pdf
5. M. Schrepp, J. Thomaschewski: Handbook for the modular extension of the UEQ (UEQ+), Version 6 (03.12.2023). https://ueqplus.ueq-research.org/Material/UEQ+_Handbook_V6.pdf
6. (Primärpublikation, nicht separat abgerufen, zitiert nach [4]) Laugwitz, B., Schrepp, M. & Held, T. (2008): Construction and evaluation of a user experience questionnaire. USAB 2008, LNCS 5298, 63–76.
7. AttrakDiff, offizielle Website (UID GmbH). https://www.attrakdiff.de/
8. Hassenzahl, M., Burmester, M. & Koller, F. (2003): AttrakDiff: Ein Fragebogen zur Messung wahrgenommener hedonischer und pragmatischer Qualität. Mensch & Computer 2003, 187–196. Original-URL https://www.attrakdiff.de/files/mc2003_hassenzahl_review.pdf (heute 404), gelesen über das Internet Archive.
9. Benedek, J. & Miner, T. (2002): Measuring Desirability: New methods for evaluating desirability in a usability lab setting. UPA 2002. Archiv: https://web.archive.org/web/20030708234901/https://www.microsoft.com/usability/UEPostings/DesirabilityToolkit.doc
10. Benedek, J. & Miner, T. (2002): Product Reaction Cards (vollständige Liste der 118 Wörter). Archiv: https://web.archive.org/web/20030709123349/http://www.microsoft.com/usability/UEPostings/ProductReactionCards.doc
11. Osgood, C. E., Suci, G. J. & Tannenbaum, P. H. (1957): *The Measurement of Meaning*. **Nicht erreichbar.** Die Angaben stammen aus Sekundärquellen, z. B. https://www.simplypsychology.org/semantic-differential.html
12. Google Material Web, generierte M3-System-Tokens (v0_192): `_md-sys-motion.scss`, `_md-sys-state.scss`, Dateiliste. https://github.com/material-components/material-web/tree/main/tokens/versions/v0_192
13. Android Developers: `MotionScheme` (Jetpack Compose Material 3). https://developer.android.com/reference/kotlin/androidx/compose/material3/MotionScheme
14. Material Design 3, offizielle Website (Inhalt über das Abrufwerkzeug **nicht lesbar**, nur der Seitentitel). https://m3.material.io/
15. Apple HIG: Foundations. https://developer.apple.com/design/human-interface-guidelines/foundations
16. Apple HIG: Motion. https://developer.apple.com/design/human-interface-guidelines/motion
17. Apple HIG: Feedback. https://developer.apple.com/design/human-interface-guidelines/feedback
18. Apple HIG: Playing haptics. https://developer.apple.com/design/human-interface-guidelines/playing-haptics
19. MDN Browser Compatibility Data: `Navigator.vibrate`. https://github.com/mdn/browser-compat-data/blob/main/api/Navigator.json (Doku: https://developer.mozilla.org/docs/Web/API/Navigator/vibrate)
20. Design Tokens Community Group: Design Tokens Format Module 2025.10 (28.10.2025). https://www.designtokens.org/tr/2025.10/format/
21. W3C DTCG: „Design Tokens specification reaches first stable version“ (28.10.2025). https://www.w3.org/community/design-tokens/2025/10/28/design-tokens-specification-reaches-first-stable-version/
22. Saffer, D. (2013): *Microinteractions: Designing with Details*. O’Reilly. Katalogeintrag: https://dl.acm.org/doi/book/10.5555/2531374
23. UIE Brainsparks: Interview mit Dan Saffer, „Big Considerations from Microinteractions“ (2014). https://archive.uie.com/brainsparks/2014/08/01/dan-saffer-big-considerations-from-microinteractions/
24. Willenskomer, I.: „Creating Usability with Motion: The UX in Motion Manifesto“, UX Magazine (Neuveröffentlichung). https://uxmag.com/articles/creating-usability-with-motion-the-ux-in-motion-manifesto (Original auf Medium: 403)
25. Thomas, F. & Johnston, O. (1981): *The Illusion of Life: Disney Animation*. **Nicht erreichbar.** Liste nur aus Sekundärquellen.
26. MDN: `linear()` easing function. https://developer.mozilla.org/en-US/docs/Web/CSS/easing-function/linear
27. MDN: `prefers-reduced-motion`. https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion
