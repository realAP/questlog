// Entwurf der Wäsche-Quest. Alle Gestaltungswerte stehen in DESIGN, die Erklärungen in NOTES
// lesen dieselben Werte, damit Beschreibung und Verhalten nicht auseinanderlaufen.
(() => {
  const DESIGN = {
    textOut: { duration: 0.12 },
    textIn: { duration: 0.25, distance: 8 },
    press: { scale: 0.97, bounce: 0.2, duration: 0.25 },
    ringStep: { duration: 0.4 },
    finale: { ring: 0.6, title: 0.3, sparks: 8 },
  };
  const EASE_OUT = [0.16, 1, 0.3, 1];
  const ms = (seconds) => `${Math.round(seconds * 1000)} ms`;

  const QUEST = {
    name: "Wäsche",
    stages: [
      {
        name: "Waschen",
        steps: ["Wäsche sammeln", "In den Wäschekorb", "Nach unten bringen", "In die Maschine geben", "Maschine starten"],
        wait: { label: "Waschgang", minutes: 120, reminder: "alle 30 Minuten" },
      },
      {
        name: "Aufhängen",
        steps: ["Wäsche holen", "Wäsche aufhängen"],
        wait: { label: "Trocknen", minutes: 2 * 24 * 60, reminder: "morgens und abends" },
      },
      { name: "Abnehmen", steps: ["Wäsche abnehmen", "Wegräumen", "Wäscheleine freiräumen"] },
    ],
  };
  const WAIT_SECONDS = 120;

  // Ein Eintrag verweist auf den Glossar-Begriff, der die Entscheidung benennt.
  const note = (term, anchor, text) => ({ term, anchor, text });

  const NOTES = {
    start: {
      statisch: [
        note("Hierarchie", "typografische-hierarchie", "Der Questname ist das Größte. Die Etappen darunter sind ruhiger und kleiner."),
        note("Gruppierung", "gruppierung", "Jede Etappe steht mit ihrer Wartezeit in einer Zeile, damit man sieht, was danach kommt."),
        note("Akzentfarbe", "akzentfarbe", "Nur „Quest starten“ ist farbig. Das ist die einzige Aktion."),
      ],
      interaktiv: [note("Feedback", "feedback", `Der Button gibt beim Drücken leicht nach (auf ${DESIGN.press.scale * 100} %).`)],
      bewegt: [note("Übergang", "uebergang", "Beim Start blendet die Übersicht aus und der erste Schritt ein, genau wie zwischen zwei Schritten.")],
    },
    step: {
      statisch: [
        note("Hierarchie", "typografische-hierarchie", "Der Schritt ist groß (34 px, halbfett) und steht in der Mitte. Der Kontext oben ist klein (15 px) und gedämpft."),
        note("Weißraum", "weissraum", "Um den Schritt herum ist bewusst viel frei. Nichts konkurriert mit ihm."),
        note("Ausrichtung", "ausrichtung", "Kontext, Schritt und Button stehen an derselben linken Kante."),
        note("Akzentfarbe", "akzentfarbe", "Nur der Button ist farbig. Er sitzt im unteren Drittel und ist einhändig mit dem Daumen erreichbar."),
      ],
      interaktiv: [
        note("Feedback", "feedback", `Beim Drücken gibt der Button auf ${DESIGN.press.scale * 100} % nach und federt kaum merklich zurück.`),
        note("Feedback", "feedback", "Im Kontext oben zählt der Schritt hoch. Mit der Variante „Ring“ füllt sich zusätzlich ein kleiner Ring."),
      ],
      bewegt: [
        note("Übergang", "uebergang", `Der alte Schritt blendet in ${ms(DESIGN.textOut.duration)} aus. Der neue kommt in ${ms(DESIGN.textIn.duration)} ${DESIGN.textIn.distance} px von unten, mit Ease-out.`),
        note("Spring-Animation", "spring-animation", "Kein Nachfedern im Text, das ist die zurückhaltende Stufe aus den Mockups."),
      ],
    },
    wait: {
      statisch: [
        note("Hierarchie", "typografische-hierarchie", "Die Restzeit ist das Größte auf der Seite."),
        note("Kontrast", "kontrast", "Der Ring ist dünn und ruhig, damit er nicht drängt."),
        note("Weißraum", "weissraum", "Unten ist kein farbiger Button, weil es gerade nichts zu tun gibt. Die App darf weggelegt werden."),
      ],
      interaktiv: [note("Feedback", "feedback", "Die Erinnerung kommt später als Push. Hier steht nur, wie oft sie kommt.")],
      bewegt: [
        note("Progress-Ring", "progress-ring", "Der Ring läuft gleichmäßig ab und wird jede Sekunde aktualisiert."),
        note("Ambient Motion", "ambient-motion", "Bewusst keine Dauerbewegung, das wäre lebendiger, aber unruhiger."),
      ],
    },
    waitDone: {
      statisch: [note("Akzentfarbe", "akzentfarbe", "Der Button wird wieder farbig, es gibt wieder etwas zu tun.")],
      interaktiv: [note("Feedback", "feedback", "Ein Häkchen im vollen Ring zeigt: Die Wartezeit ist vorbei. Der Button nennt die nächste Etappe.")],
      bewegt: [note("Übergang", "uebergang", "Häkchen und Button blenden ruhig ein.")],
    },
    done: {
      statisch: [note("Hierarchie", "typografische-hierarchie", "Nur Ring, Häkchen und ein Satz. Der Abschluss steht für sich.")],
      interaktiv: [note("Feedback", "feedback", "Später kommt hier der Abschluss-Sound aus den Sound-Slots dazu.")],
      bewegt: [
        note("Celebration-Moment", "celebration-moment", `Der Ring schließt sich in ${ms(DESIGN.finale.ring)}, danach blendet der Satz ein. Bewusst nur am Ende der ganzen Quest, nicht nach jeder Etappe.`),
        note("Celebration-Moment", "celebration-moment", `Mit der Variante „Funken“ fliegen zusätzlich ${DESIGN.finale.sparks} kleine Punkte.`),
      ],
    },
  };

  // Stellen, an denen bewusst zwei Varianten zur Wahl stehen.
  const CHOICES = {
    step: [
      { key: "context", label: "Kontext oben", options: [["text", "nur Text"], ["ring", "Text und Ring"]] },
      { key: "shape", label: "Button-Form", options: [["rounded", "abgerundet"], ["capsule", "Kapsel"]] },
    ],
    done: [{ key: "finale", label: "Abschluss", options: [["calm", "ruhig"], ["sparks", "mit Funken"]] }],
  };

  function formatRemaining(minutes) {
    if (minutes >= 24 * 60) return `${(minutes / (24 * 60)).toFixed(1).replace(".", ",")} Tage`;
    if (minutes >= 60) return `${Math.floor(minutes / 60)}:${String(Math.ceil(minutes % 60)).padStart(2, "0")} h`;
    return `${Math.ceil(minutes)} min`;
  }

  function laundryDraft() {
    return {
      quest: QUEST,
      screen: "start",
      stageIndex: 0,
      stepIndex: 0,
      remaining: 1,
      timer: null,
      busy: false,
      notesOpen: false,
      choice: { context: "text", shape: "rounded", finale: "calm" },
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
        return formatRemaining(this.remaining * (this.stage.wait?.minutes ?? 0));
      },
      get notes() {
        return NOTES[this.screen];
      },
      get choices() {
        return CHOICES[this.screen] ?? [];
      },

      async press(event) {
        const button = event?.currentTarget;
        if (button) {
          QL.animate(button, { scale: [DESIGN.press.scale, 1] }, QL.spring(DESIGN.press.bounce, DESIGN.press.duration));
        }
        await new Promise((resolve) => setTimeout(resolve, 90));
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
        QL.setRing(this.$refs.stepRing, 0);
      },

      async complete(event) {
        if (this.busy) return;
        this.busy = true;
        await this.press(event);
        const ring = this.$refs.stepRing;
        const from = this.stepIndex / this.stage.steps.length;
        const to = (this.stepIndex + 1) / this.stage.steps.length;
        QL.tween(from, to, (v) => QL.setRing(ring, v), { duration: DESIGN.ringStep.duration, ease: EASE_OUT });
        const last = this.stepIndex === this.stage.steps.length - 1;
        if (!last) {
          await this.show(() => {
            this.stepIndex += 1;
          });
        } else if (this.stage.wait) {
          await this.show(() => {
            this.screen = "wait";
            this.remaining = 1;
          });
          this.startWaiting();
        } else {
          await this.show(() => {
            this.screen = "done";
          });
          this.celebrate();
        }
        this.busy = false;
      },

      startWaiting() {
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
        QL.setRing(this.$refs.stepRing, 0);
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
