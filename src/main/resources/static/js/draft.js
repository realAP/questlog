// Entwurf der Wäsche-Quest. Alle Gestaltungswerte stehen in DESIGN, die Erklärungen in NOTES
// lesen dieselben Werte, damit Beschreibung und Verhalten nicht auseinanderlaufen.
(() => {
  const DESIGN = {
    textOut: { duration: 0.12 },
    textIn: { duration: 0.25, distance: 8 },
    press: { scale: 0.97, bounce: 0.2, duration: 0.25 },
    check: { hold: 0.38, bounce: 0.35, duration: 0.3 },
    dot: { pulse: 1.6, fly: 0.45 },
    line: { duration: 0.45 },
    finale: { ring: 0.6, title: 0.3, sparks: 8 },
  };
  const EASE_OUT = [0.16, 1, 0.3, 1];
  const ms = (seconds) => `${Math.round(seconds * 1000)} ms`;
  const wait = (seconds) => new Promise((resolve) => setTimeout(resolve, QL.reducedMotion ? 0 : seconds * 1000));

  const HOUR = 60;
  const DAY = 24 * HOUR;

  const QUEST = {
    name: "Wäsche",
    stages: [
      {
        name: "Waschen",
        icon: "washer",
        steps: [
          { title: "Alles in den Wäschekorb" },
          {
            title: "Nach unten bringen",
            hint: "und die Maschine starten",
            needs: { icon: "key", label: "Schlüssel mitnehmen" },
            missing: { label: "Waschmittel fehlt", icon: "detergent" },
          },
        ],
        wait: { label: "Waschgang", question: "Wie lange läuft der Waschgang?", presets: [HOUR, 2 * HOUR, 3 * HOUR], step: 15, min: 15, reminder: "alle 30 Minuten" },
      },
      {
        name: "Aufhängen",
        icon: "hanger",
        steps: [
          { title: "Wäsche holen", needs: { icon: "key", label: "Schlüssel mitnehmen" } },
          { title: "Wäsche aufhängen" },
        ],
        wait: { label: "Trocknen", question: "Wie lange soll die Wäsche trocknen?", presets: [DAY, 2 * DAY, 3 * DAY], step: 12 * HOUR, min: 12 * HOUR, reminder: "morgens und abends" },
      },
      {
        name: "Abnehmen",
        icon: "basket",
        steps: [{ title: "Wäsche abnehmen" }, { title: "Wegräumen" }, { title: "Wäscheleine freiräumen" }],
      },
    ],
  };
  const WAIT_SECONDS = 120;

  function duration(minutes) {
    if (minutes >= DAY) {
      const days = minutes / DAY;
      return `${String(days).replace(".", ",")} ${days === 1 ? "Tag" : "Tage"}`;
    }
    if (minutes >= HOUR) {
      const hours = Math.floor(minutes / HOUR);
      const rest = minutes % HOUR;
      return rest ? `${hours}:${String(rest).padStart(2, "0")} h` : `${hours} h`;
    }
    return `${minutes} min`;
  }

  function remaining(minutes) {
    if (minutes >= DAY) return `${(minutes / DAY).toFixed(1).replace(".", ",")} Tage`;
    if (minutes >= HOUR) return `${Math.floor(minutes / HOUR)}:${String(Math.ceil(minutes % HOUR)).padStart(2, "0")} h`;
    return `${Math.ceil(minutes)} min`;
  }

  // Ein Eintrag verweist auf den Glossar-Begriff, der die Entscheidung benennt.
  const note = (term, anchor, text) => ({ term, anchor, text });

  const NOTES = {
    start: {
      statisch: [
        note("Hierarchie", "typografische-hierarchie", "Der Questname ist das Größte. Darunter liegt der Ablauf als senkrechte Zeitleiste."),
        note("Stepper", "progress-ring", "Etappen sind Punkte auf einer Linie, die Wartezeiten liegen auf der Linie dazwischen. Die erste Etappe ist hervorgehoben, dort geht es los."),
        note("Akzentfarbe", "akzentfarbe", "Nur „Quest starten“ und der erste Punkt sind farbig."),
      ],
      interaktiv: [note("Feedback", "feedback", `Der Button gibt beim Drücken leicht nach (auf ${DESIGN.press.scale * 100} %).`)],
      bewegt: [note("Übergang", "uebergang", "Die Übersicht blendet aus und der erste Schritt ein, genau wie zwischen zwei Schritten.")],
    },
    step: {
      statisch: [
        note("Stepper", "progress-ring", "Oben steht der Ablauf als Symbole: Waschmaschine, Kleiderbügel, Wäschekorb. Die aktuelle Etappe ist farbig und als einzige beschriftet."),
        note("Gruppierung", "gruppierung", "Die Punkte unter der Leiste sind die Schritte der aktuellen Etappe. Sie ersetzen „Schritt 1 von 2“."),
        note("Hierarchie", "typografische-hierarchie", "Der Schritt ist groß (34 px, halbfett) in der Mitte. Was du dafür brauchst, steht als hervorgehobene Marke direkt darüber."),
        note("Akzentfarbe", "akzentfarbe", "Farbig sind nur der Button, die Marke „Schlüssel mitnehmen“ und der Fortschritt."),
      ],
      interaktiv: [
        note("Feedback", "feedback", `Beim Abhaken springt für ${ms(DESIGN.check.hold)} ein Häkchen an die Stelle des Textes, und der Punkt des Schritts füllt sich mit einem kleinen Puls.`),
        note("Feedback", "feedback", "Mit der Variante „Punkt fliegt“ wandert zusätzlich ein Punkt vom Button hoch in die Leiste."),
        note("Feedback", "feedback", "„Waschmittel fehlt“ ist eine zweite, leise Aktion neben „Erledigt“. Sie hält die Quest an, statt sie abzubrechen."),
      ],
      bewegt: [
        note("Micro-Interaction", "micro-interaction", "Häkchen und Puls sind die kleine Rückmeldung pro Schritt. Den großen Celebration-Moment gibt es nur am Ende der Quest."),
        note("Übergang", "uebergang", `Danach blendet der neue Schritt in ${ms(DESIGN.textIn.duration)} ${DESIGN.textIn.distance} px von unten ein. Beim Wechsel der Etappe füllt sich die Linie zum nächsten Symbol in ${ms(DESIGN.line.duration)}.`),
      ],
    },
    missing: {
      statisch: [
        note("Hierarchie", "typografische-hierarchie", "Das fehlende Waschmittel ist das Thema der Seite, als Symbol und als Satz."),
        note("Kontrast", "kontrast", "Rot nur am Symbol, nicht flächig. Es ist ein Hinweis, kein Alarm."),
      ],
      interaktiv: [
        note("Feedback", "feedback", "Die Quest wartet an dieser Stelle. Mit „Waschmittel ist da“ geht es genau hier weiter."),
        note("Feedback", "feedback", "Fachlich noch offen: Soll das eine Erinnerung zum Einkaufen auslösen oder auf eine Einkaufsliste wandern?"),
      ],
      bewegt: [note("Übergang", "uebergang", "Derselbe ruhige Übergang wie zwischen zwei Schritten.")],
    },
    time: {
      statisch: [
        note("Hierarchie", "typografische-hierarchie", "Die Frage oben, darunter drei große Vorgaben. Die mittlere ist vorausgewählt."),
        note("Gruppierung", "gruppierung", "Vorgaben und eigene Zeit stehen zusammen. „Timer starten“ sitzt unten, wie jede Hauptaktion."),
      ],
      interaktiv: [
        note("Feedback", "feedback", "Antippen wählt eine Vorgabe. „Andere Zeit“ blendet einen Regler mit Minus und Plus ein."),
        note("Feedback", "feedback", "Nach der gewählten Zeit kommt eine Push-Nachricht, danach erinnert die App nach dem Erinnerungsprofil."),
      ],
      bewegt: [note("Übergang", "uebergang", "Die Auswahl wechselt ohne Bewegung, nur die Markierung springt um.")],
    },
    wait: {
      statisch: [
        note("Hierarchie", "typografische-hierarchie", "Die Restzeit ist das Größte auf der Seite."),
        note("Stepper", "progress-ring", "Oben steht die Linie zwischen zwei Etappen halb gefüllt, dort ist die Wartezeit."),
        note("Weißraum", "weissraum", "Unten ist kein farbiger Button, weil es gerade nichts zu tun gibt. Die App darf weggelegt werden."),
      ],
      interaktiv: [note("Feedback", "feedback", "Der Satz unten sagt, wann die App sich meldet und wie oft sie danach erinnert.")],
      bewegt: [
        note("Progress-Ring", "progress-ring", "Der Ring läuft gleichmäßig ab und wird jede Sekunde aktualisiert."),
        note("Ambient Motion", "ambient-motion", "Bewusst keine Dauerbewegung, das wäre lebendiger, aber unruhiger."),
      ],
    },
    waitDone: {
      statisch: [note("Akzentfarbe", "akzentfarbe", "Der Button wird wieder farbig, es gibt wieder etwas zu tun.")],
      interaktiv: [note("Feedback", "feedback", "Ein Häkchen im vollen Ring zeigt: Die Wartezeit ist vorbei. Der Button nennt die nächste Etappe.")],
      bewegt: [note("Übergang", "uebergang", `Mit „Weiter“ füllt sich die Linie oben bis zum nächsten Symbol (${ms(DESIGN.line.duration)}), das Symbol wird farbig.`)],
    },
    done: {
      statisch: [note("Hierarchie", "typografische-hierarchie", "Nur Ring, Häkchen und ein Satz. Der Abschluss steht für sich.")],
      interaktiv: [note("Feedback", "feedback", "Später kommt hier der Abschluss-Sound aus den Sound-Slots dazu.")],
      bewegt: [
        note("Celebration-Moment", "celebration-moment", `Der Ring schließt sich in ${ms(DESIGN.finale.ring)}, danach blendet der Satz ein. Bewusst nur am Ende der ganzen Quest.`),
        note("Celebration-Moment", "celebration-moment", `Mit der Variante „mit Funken“ fliegen zusätzlich ${DESIGN.finale.sparks} kleine Punkte.`),
      ],
    },
  };

  // Stellen, an denen bewusst zwei Varianten zur Wahl stehen.
  const CHOICES = {
    step: [
      { key: "feedback", label: "Rückmeldung pro Schritt", options: [["check", "Häkchen und Puls"], ["fly", "Punkt fliegt"]] },
      { key: "shape", label: "Button-Form", options: [["rounded", "abgerundet"], ["capsule", "Kapsel"]] },
    ],
    done: [{ key: "finale", label: "Abschluss", options: [["calm", "ruhig"], ["sparks", "mit Funken"]] }],
  };

  function laundryDraft() {
    return {
      quest: QUEST,
      screen: "start",
      stageIndex: 0,
      stepIndex: 0,
      remaining: 1,
      timer: null,
      busy: false,
      checking: false,
      notesOpen: false,
      chosenMinutes: 0,
      customOpen: false,
      choice: { feedback: "check", shape: "rounded", finale: "calm" },
      root: null,

      init() {
        this.root = this.$el;
      },

      get stage() {
        return this.quest.stages[this.stageIndex];
      },
      get step() {
        return this.stage.steps[this.stepIndex];
      },
      get nextStage() {
        return this.quest.stages[this.stageIndex + 1];
      },
      get remainingText() {
        return remaining(this.remaining * this.chosenMinutes);
      },
      get notes() {
        return NOTES[this.screen];
      },
      get choices() {
        return CHOICES[this.screen] ?? [];
      },
      get buttonShape() {
        return this.choice.shape === "capsule" ? "rounded-full" : "rounded-[14px]";
      },
      duration,

      // ---------- Zustand des Prozesses ----------
      stageState(index) {
        if (this.screen === "done" || index < this.stageIndex) return "done";
        if (index > this.stageIndex) return "open";
        return this.screen === "wait" || this.screen === "waitDone" || this.screen === "time" ? "done" : "current";
      },
      lineFill(index) {
        if (this.screen === "done" || index < this.stageIndex) return 1;
        if (index > this.stageIndex) return 0;
        if (this.screen === "wait" || this.screen === "time") return 0.5;
        return this.screen === "waitDone" ? 0.5 : 0;
      },
      dotState(k) {
        if (k < this.stepIndex) return "done";
        if (k === this.stepIndex && this.checking) return "done";
        return k === this.stepIndex ? "current" : "open";
      },

      // ---------- Ablauf ----------
      async press(event) {
        const button = event?.currentTarget;
        if (button) QL.animate(button, { scale: [DESIGN.press.scale, 1] }, QL.spring(DESIGN.press.bounce, DESIGN.press.duration));
        await wait(0.09);
      },

      async show(change) {
        const parts = this.parts();
        if (parts.length) await QL.animate(parts, { opacity: 0 }, { duration: DESIGN.textOut.duration });
        change();
        await this.$nextTick();
        QL.animate(this.parts(), { opacity: [0, 1], y: [DESIGN.textIn.distance, 0] }, { duration: DESIGN.textIn.duration, ease: EASE_OUT });
      },

      parts() {
        return [...this.root.querySelectorAll("[data-enter]")].filter((el) => el.offsetParent !== null);
      },

      async start(event) {
        await this.press(event);
        await this.show(() => {
          this.screen = "step";
        });
        this.popNode(0);
      },

      // Kleine Rückmeldung pro Schritt: Häkchen statt Text, Punkt füllt sich.
      async stepFeedback(button) {
        const dot = this.root.querySelector(`[data-dot="${this.stepIndex}"]`);
        if (this.choice.feedback === "fly" && dot && button && !QL.reducedMotion) {
          await this.flyDot(button, dot);
        }
        this.checking = true;
        const title = this.$refs.stepTitle;
        const check = this.$refs.stepCheck;
        QL.animate(title, { opacity: 0 }, { duration: 0.1 });
        QL.animate(check, { opacity: [0, 1], scale: [0.6, 1] }, QL.spring(DESIGN.check.bounce, DESIGN.check.duration));
        await this.$nextTick();
        if (dot) QL.animate(dot, { scale: [DESIGN.dot.pulse, 1] }, QL.spring(0.3, 0.35));
        await wait(DESIGN.check.hold);
        QL.animate(check, { opacity: 0 }, { duration: 0.1 });
      },

      async flyDot(button, dot) {
        const from = button.getBoundingClientRect();
        const to = dot.getBoundingClientRect();
        const flyer = document.createElement("span");
        flyer.className = "pointer-events-none fixed z-30 size-2.5 rounded-full bg-primary";
        flyer.style.left = `${from.left + from.width / 2 - 5}px`;
        flyer.style.top = `${from.top + from.height / 2 - 5}px`;
        document.body.append(flyer);
        await Motion.animate(flyer, {
          x: [0, to.left + to.width / 2 - (from.left + from.width / 2)],
          y: [0, to.top + to.height / 2 - (from.top + from.height / 2)],
          scale: [1.4, 1],
        }, { duration: DESIGN.dot.fly, ease: [0.5, 0, 0.2, 1] }).finished;
        flyer.remove();
      },

      async complete(event) {
        if (this.busy) return;
        this.busy = true;
        const button = event?.currentTarget;
        await this.press(event);
        await this.stepFeedback(button);
        const last = this.stepIndex === this.stage.steps.length - 1;
        await this.show(() => {
          this.checking = false;
          if (!last) {
            this.stepIndex += 1;
          } else if (this.stage.wait) {
            this.screen = "time";
            this.chosenMinutes = this.stage.wait.presets[1];
            this.customOpen = false;
          } else {
            this.screen = "done";
          }
        });
        this.$refs.stepTitle.style.opacity = "";
        if (this.screen === "done") this.celebrate();
        this.busy = false;
      },

      async reportMissing(event) {
        await this.press(event);
        await this.show(() => {
          this.screen = "missing";
        });
      },

      async resolveMissing(event) {
        await this.press(event);
        await this.show(() => {
          this.screen = "step";
        });
      },

      adjust(sign) {
        const w = this.stage.wait;
        this.chosenMinutes = Math.max(w.min, this.chosenMinutes + sign * w.step);
      },

      async startTimer(event) {
        await this.press(event);
        await this.show(() => {
          this.screen = "wait";
          this.remaining = 1;
        });
        QL.setRing(this.$refs.timerRing, 1);
        this.timer = setInterval(() => this.tick(1 / WAIT_SECONDS), 1000);
      },

      tick(amount) {
        this.remaining = Math.max(0, this.remaining - amount);
        QL.setRing(this.$refs.timerRing, this.remaining);
        if (this.remaining === 0) this.finishWaiting();
      },

      async skipTime() {
        clearInterval(this.timer);
        const ring = this.$refs.timerRing;
        await QL.tween(this.remaining, 0, (v) => {
          this.remaining = v;
          QL.setRing(ring, v);
        }, { duration: 1, ease: "easeInOut" });
        this.finishWaiting();
      },

      finishWaiting() {
        clearInterval(this.timer);
        this.show(() => {
          this.screen = "waitDone";
        });
      },

      async continueQuest(event) {
        await this.press(event);
        await this.show(() => {
          this.stageIndex += 1;
          this.stepIndex = 0;
          this.screen = "step";
        });
        this.popNode(this.stageIndex);
      },

      // Das Symbol der neuen Etappe wird farbig und federt kurz.
      popNode(index) {
        this.$nextTick(() => {
          const node = this.root.querySelector(`[data-node="${index}"]`);
          if (node) QL.animate(node, { scale: [0.8, 1] }, QL.spring(0.3, 0.4));
        });
      },

      async celebrate() {
        const ring = this.$refs.doneRing;
        const title = this.$refs.doneTitle;
        QL.setRing(ring, 0);
        title.style.opacity = "0";
        await QL.tween(0, 1, (v) => QL.setRing(ring, v), { duration: DESIGN.finale.ring, ease: EASE_OUT });
        if (this.choice.finale === "sparks") this.sparks();
        QL.animate(title, { opacity: [0, 1], y: [DESIGN.textIn.distance, 0] }, { duration: DESIGN.finale.title, ease: EASE_OUT });
      },

      sparks() {
        const layer = this.$refs.sparks;
        layer.replaceChildren();
        if (QL.reducedMotion) return;
        for (let i = 0; i < DESIGN.finale.sparks; i += 1) {
          const dot = document.createElement("span");
          dot.className = "absolute left-1/2 top-1/2 size-2 rounded-full bg-primary";
          layer.append(dot);
          const angle = (i / DESIGN.finale.sparks) * Math.PI * 2 - Math.PI / 2;
          Motion.animate(dot, { x: [0, Math.cos(angle) * 130], y: [0, Math.sin(angle) * 130], opacity: [1, 0] }, { duration: 0.8, ease: EASE_OUT });
        }
      },

      replayFinale() {
        if (this.screen === "done") this.celebrate();
      },

      restart() {
        clearInterval(this.timer);
        this.show(() => {
          this.screen = "start";
          this.stageIndex = 0;
          this.stepIndex = 0;
        });
      },
    };
  }

  document.addEventListener("alpine:init", () => {
    Alpine.data("laundryDraft", laundryDraft);
  });
})();
