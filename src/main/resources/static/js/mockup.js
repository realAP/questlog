// Mockup der Wäsche-Quest. Ablauf und Inhalt sind für alle drei Mockups gleich; die Profile
// unten legen nur fest, wie stark sich etwas bewegt.
(() => {
  const EASE_OUT = [0.16, 1, 0.3, 1];

  const QUEST = {
    name: "Wäsche",
    stages: [
      {
        name: "Waschen",
        steps: [
          { title: "Wäsche sammeln" },
          { title: "In den Wäschekorb" },
          { title: "Nach unten bringen", needs: ["key"] },
          { title: "In die Maschine geben" },
          { title: "Waschmittel prüfen", check: true, needs: ["detergent"] },
          { title: "Maschine starten" },
        ],
        wait: { label: "Waschgang", minutes: 120, repeat: "alle 30 Minuten" },
      },
      {
        name: "Aufhängen",
        steps: [{ title: "Wäsche holen" }, { title: "Wäsche aufhängen" }],
        wait: { label: "Trocknen", minutes: 2 * 24 * 60, repeat: "morgens und abends" },
      },
      {
        name: "Abnehmen",
        steps: [{ title: "Wäsche abnehmen" }, { title: "Wegräumen" }, { title: "Wäscheleine freiräumen" }],
      },
    ],
  };

  const NEEDS = {
    key: { label: "Schlüssel" },
    detergent: { label: "Waschmittel" },
  };

  // Eine Wartezeit läuft im Mockup in zwei Minuten ab, egal wie lang sie fachlich ist.
  const WAIT_SECONDS = 120;

  const PROFILES = {
    zurueckhaltend: {
      exit: { keyframes: { opacity: 0 }, options: { duration: 0.15 } },
      enter: { keyframes: { opacity: [0, 1], y: [8, 0] }, options: { duration: 0.3, ease: EASE_OUT } },
      stagger: 0,
      press: null,
      ring: { duration: 0.4, ease: EASE_OUT },
      breathe: null,
      burst: 0,
      confetti: 0,
    },
    mittel: {
      exit: { keyframes: { opacity: 0, y: -16 }, options: { duration: 0.18, ease: "easeIn" } },
      enter: { keyframes: { opacity: [0, 1], y: [24, 0] }, options: QL.spring(0.25, 0.45) },
      stagger: 0.06,
      press: { keyframes: { scale: [0.94, 1] }, options: QL.spring(0.4, 0.35) },
      ring: QL.spring(0.25, 0.5),
      breathe: { scale: [1, 1.06, 1], opacity: [0.5, 0.85, 0.5] },
      burst: 0,
      confetti: 0,
    },
    verspielt: {
      exit: { keyframes: { opacity: 0, y: -30, scale: 0.94 }, options: { duration: 0.2, ease: "easeIn" } },
      enter: {
        keyframes: { opacity: [0, 1], y: [48, 0], scale: [0.9, 1], rotate: [-3, 0] },
        options: QL.spring(0.5, 0.55),
      },
      stagger: 0.1,
      press: { keyframes: { scale: [0.82, 1] }, options: QL.spring(0.65, 0.45) },
      ring: QL.spring(0.55, 0.6),
      breathe: { scale: [1, 1.14, 0.97, 1], opacity: [0.45, 0.9, 0.6, 0.45] },
      burst: 8,
      confetti: 28,
    },
  };

  function formatRemaining(minutes) {
    if (minutes >= 24 * 60) {
      const days = minutes / (24 * 60);
      return `${days.toFixed(1).replace(".", ",")} Tage`;
    }
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      return `${hours}:${String(Math.ceil(minutes % 60)).padStart(2, "0")} h`;
    }
    return `${Math.ceil(minutes)} min`;
  }

  // Fliegende Punkte, etwa um einen Button oder um den Abschlussring.
  function scatter(layer, count, spread) {
    layer.replaceChildren();
    if (QL.reducedMotion || count === 0) {
      return;
    }
    const colors = ["var(--color-primary)", "var(--color-accent)", "var(--color-base-content)"];
    for (let index = 0; index < count; index += 1) {
      const piece = document.createElement("span");
      piece.className = "absolute left-1/2 top-1/2 h-2.5 w-1.5 rounded-full";
      piece.style.background = colors[index % colors.length];
      layer.append(piece);
      const angle = (index / count) * Math.PI * 2 + Math.random() * 0.4;
      const distance = spread * (0.7 + Math.random() * 0.5);
      Motion.animate(piece, {
        x: [0, Math.cos(angle) * distance],
        y: [0, Math.sin(angle) * distance + spread * 0.35],
        rotate: [0, (Math.random() - 0.5) * 360],
        opacity: [1, 1, 0],
      }, { duration: 0.9 + Math.random() * 0.4, ease: EASE_OUT });
    }
  }

  function laundryMockup(intensity) {
    const profile = PROFILES[intensity];

    return {
      quest: QUEST,
      needs: NEEDS,
      screen: "start",
      stageIndex: 0,
      stepIndex: 0,
      missing: false,
      remaining: 1,
      timer: null,
      breathing: null,
      rootElement: null,

      init() {
        this.rootElement = this.$el;
      },

      get stage() {
        return this.quest.stages[this.stageIndex];
      },
      get step() {
        return this.stage.steps[this.stepIndex];
      },
      get isLastStage() {
        return this.stageIndex === this.quest.stages.length - 1;
      },
      get nextStage() {
        return this.quest.stages[this.stageIndex + 1];
      },
      get remainingText() {
        return formatRemaining(this.remaining * (this.stage.wait?.minutes ?? 0));
      },

      async start(event) {
        await this.press(event);
        await this.show(() => {
          this.screen = "step";
        });
        this.updateStepRing(0);
      },

      async complete(event) {
        await this.press(event);
        const lastStep = this.stepIndex === this.stage.steps.length - 1;
        this.updateStepRing((this.stepIndex + 1) / this.stage.steps.length);
        if (!lastStep) {
          await this.show(() => {
            this.stepIndex += 1;
            this.missing = false;
          });
          return;
        }
        await this.show(() => {
          this.screen = this.isLastStage ? "done" : "wait";
          this.remaining = 1;
        });
        if (this.screen === "wait") {
          this.startWaiting();
        } else {
          this.celebrate();
        }
      },

      markMissing() {
        this.missing = true;
        QL.animate(this.$refs.needs, { x: [0, -6, 6, -3, 0] }, { duration: 0.35 });
      },

      startWaiting() {
        QL.setRing(this.$refs.timerRing, 1);
        this.timer = setInterval(() => this.tick(1 / WAIT_SECONDS), 1000);
        if (profile.breathe) {
          this.breathing = QL.animate(this.$refs.breath, profile.breathe, {
            duration: 4.5,
            ease: "easeInOut",
            repeat: Infinity,
          });
        }
      },

      tick(amount) {
        this.remaining = Math.max(0, this.remaining - amount);
        QL.setRing(this.$refs.timerRing, this.remaining);
        if (this.remaining === 0) {
          this.finishWaiting();
        }
      },

      async skipTime() {
        clearInterval(this.timer);
        const ring = this.$refs.timerRing;
        await QL.tween(this.remaining, 0, (value) => {
          this.remaining = value;
          QL.setRing(ring, value);
        }, { duration: 1.2, ease: "easeInOut" });
        this.finishWaiting();
      },

      finishWaiting() {
        clearInterval(this.timer);
        this.breathing?.stop();
        this.screen = "waitDone";
        this.enter();
      },

      async continueQuest(event) {
        await this.press(event);
        await this.show(() => {
          this.stageIndex += 1;
          this.stepIndex = 0;
          this.missing = false;
          this.screen = "step";
        });
        QL.setRing(this.$refs.stepRing, 0);
      },

      async celebrate() {
        const ring = this.$refs.doneRing;
        QL.setRing(ring, 0);
        const title = this.$refs.doneTitle;
        title.style.opacity = "0";
        await QL.tween(0, 1, (value) => QL.setRing(ring, value), { ...profile.ring, duration: 0.9 });
        scatter(this.$refs.confetti, profile.confetti, 140);
        if (intensity !== "zurueckhaltend") {
          QL.animate(this.$refs.doneRingGroup, { scale: [1, 1.12, 1] }, { duration: 0.5 });
        }
        QL.animate(title, { opacity: [0, 1], y: [12, 0] }, profile.enter.options);
      },

      restart() {
        clearInterval(this.timer);
        this.breathing?.stop();
        this.show(() => {
          this.screen = "start";
          this.stageIndex = 0;
          this.stepIndex = 0;
          this.missing = false;
        });
      },

      // Rückmeldung auf den Daumen: Button gibt nach, im verspielten Profil fliegen Punkte.
      async press(event) {
        const button = event?.currentTarget;
        if (!button || !profile.press) {
          return;
        }
        QL.animate(button, profile.press.keyframes, profile.press.options);
        const burst = button.querySelector("[data-burst]");
        if (burst) {
          scatter(burst, profile.burst, 60);
        }
        await new Promise((resolve) => setTimeout(resolve, 120));
      },

      updateStepRing(fraction) {
        const ring = this.$refs.stepRing;
        const from = Number(100 - Number(ring.style.strokeDashoffset || 100)) / 100;
        QL.tween(from, fraction, (value) => QL.setRing(ring, value), profile.ring);
      },

      // Wechselt die Ansicht: alte Elemente gehen, Zustand ändert sich, neue Elemente kommen.
      async show(change) {
        const current = this.visibleParts();
        if (current.length > 0) {
          await QL.animate(current, profile.exit.keyframes, profile.exit.options);
        }
        change();
        await this.$nextTick();
        this.enter();
      },

      enter() {
        const delay = profile.stagger > 0 ? QL.stagger(profile.stagger) : 0;
        QL.animate(this.visibleParts(), profile.enter.keyframes, { ...profile.enter.options, delay });
      },

      visibleParts() {
        return [...this.rootElement.querySelectorAll("[data-enter]")].filter((element) => element.offsetParent !== null);
      },
    };
  }

  document.addEventListener("alpine:init", () => {
    Alpine.data("laundryMockup", laundryMockup);
  });
})();
