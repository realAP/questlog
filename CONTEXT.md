# Questlog

Questlog führt durch wiederkehrende Haushaltsaufgaben, damit man nicht selbst planen muss, was als
Nächstes kommt: Man arbeitet vorgegebene Schritte ab, und die App meldet sich, wenn es weitergeht.

## Ablauf einer Quest

**Quest**:
Eine einzeln gestaltete Haushaltsaufgabe von Anfang bis Ende, etwa Wäsche oder Spülmaschine. Sie
besteht aus Etappen und hat ihre eigenen Einstellungen.
_Avoid_: Aufgabe, Task, To-do, Vorlage

**Durchlauf**:
Ein einzelnes Mal, das eine Quest gemacht wird, vom Start bis zum Abschluss oder Abbruch.
_Avoid_: Instanz, laufende Quest, Session

**Etappe**:
Ein Abschnitt einer Quest, der am Stück erledigt wird, etwa Waschen, Trocknen oder Aufräumen. Eine
Etappe besteht aus Schritten und kann mit einer Wartezeit enden.
_Avoid_: Phase, Abschnitt, Stage

**Schritt**:
Eine einzelne Handlung innerhalb einer Etappe, die man erledigt und abhakt, etwa „Alles in den
Wäschekorb“.
_Avoid_: Unterschritt, Microstep, Task

**Wartezeit**:
Die Zeit am Ende einer Etappe, in der nichts zu tun ist, weil etwas von selbst läuft, etwa der
Waschgang oder die Trockenzeit. Der Schritt davor startet sie.
_Avoid_: Timer, Pause, Warteschritt

**Vorgabe**:
Eine Dauer, die beim Start einer Wartezeit zur Wahl steht, etwa 3 h oder 6 h für den Waschgang.
Eine Vorgabe ist vorausgewählt; man kann auch eine andere Dauer wählen.
_Avoid_: Default, Preset, Standardzeit

**Fertig-Zeitpunkt**:
Uhrzeit und Tag, zu denen eine Wartezeit endet.
_Avoid_: Ablaufzeit, Deadline

**Voraussetzung**:
Etwas, das man für einen Schritt braucht und woran die App nur erinnert, etwa „Schlüssel nicht
vergessen“. Sie wird nicht abgehakt.
_Avoid_: Erinnerung, Requirement, Item

**Fehlmeldung**:
Die Meldung, dass etwas Benötigtes nicht da ist, etwa Waschmittel. Der Durchlauf wartet an diesem
Schritt, bis es da ist; das Fehlende kann auf die Einkaufsliste.
_Avoid_: Etwas fehlt, Problem, Blocker

**Abschluss**:
Das Ende eines Durchlaufs, wenn alle Etappen erledigt sind.
_Avoid_: Fertigstellung, Done

**Abbruch**:
Das vorzeitige Ende eines Durchlaufs auf eigenen Wunsch.
_Avoid_: Fehlschlag, Scheitern

## Benachrichtigung

**Erinnerung**:
Eine Push-Nachricht, die nach dem Fertig-Zeitpunkt zum Weitermachen auffordert. Sie wiederholt
sich, bis die nächste Etappe beginnt.
_Avoid_: Notification, Alarm, Hinweis

**Erinnerungsrhythmus**:
Wie oft sich eine Erinnerung wiederholt, etwa „alle 30 Minuten“ oder „morgens und abends“. Er wird
je Wartezeit einer Quest eingestellt.
_Avoid_: Erinnerungsprofil, Intervall

**Ruhezeit**:
Ein Zeitraum, in dem keine Erinnerung kommt, standardmäßig 22 bis 8 Uhr. Fällt eine Erinnerung
hinein, kommt sie am Ende der Ruhezeit.
_Avoid_: Nachtmodus, Do not disturb

## Rückmeldung

**Ereignis**:
Ein Moment in einem Durchlauf, an den ein Sound geknüpft werden kann. Es gibt: Quest gestartet,
Schritt erledigt, Etappe abgeschlossen, Wartezeit gestartet, Wartezeit vorbei, Quest
abgeschlossen, Quest abgebrochen, Fehlmeldung und Woche geschafft.
_Avoid_: Event, Aktion, Trigger

**Sound**:
Eine hochgeladene Audiodatei, die bei einem Ereignis einer Quest abgespielt wird. Bei „Wartezeit
vorbei“ kommt die Erinnerung als Push, dort ist nur der Systemton möglich.
_Avoid_: Sound-Slot, Klang

**Woche geschafft**:
Das Ereignis, wenn alle Quests erledigt sind, die in einer Woche angefallen sind.
_Avoid_: Level-up, Wochenziel
