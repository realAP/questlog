// Entwurf der Wäsche-Quest. Gestaltungswerte stehen in DESIGN, der Ablauf in QUEST.
(() => {
  const DESIGN = {
    textOut: { duration: 0.1 },
    textIn: { duration: 0.25, distance: 8 },
    press: { scale: 0.97, bounce: 0.2, duration: 0.25 },
    celebrate: { hold: 0.2, pop: 1.12, ripple: 0.4, dots: 6, dotDistance: 46 },
    finale: { ring: 0.6, title: 0.3 },
  };
  const EASE_OUT = [0.16, 1, 0.3, 1];
  const wait = (seconds) => new Promise((resolve) => setTimeout(resolve, QL.reducedMotion ? 0 : seconds * 1000));

  const HOUR = 60;
  const DAY = 24 * HOUR;

  const QUEST = {
    name: "Wäsche",
    icon: "basket",
    stages: [
      {
        name: "Waschen",
        icon: "washer",
        steps: [
          { title: "Alles in den Wäschekorb", icon: "basket" },
          { title: "Nach unten bringen", icon: "stairs", needs: { icon: "key", label: "Schlüssel" } },
          {
            title: "Maschine starten",
            icon: "washer",
            startsWait: true,
            question: "Wie lange läuft der Waschgang?",
            action: "Waschvorgang starten",
            missing: "Waschmittel",
          },
        ],
        wait: { label: "Waschgang", presets: [3 * HOUR, 6 * HOUR], step: 15, min: 15, reminder: "alle 30 Minuten" },
      },
      {
        name: "Trocknen",
        icon: "clothesline",
        steps: [
          { title: "Wäsche holen", icon: "basket", needs: { icon: "key", label: "Schlüssel" } },
          { title: "Wäsche aufhängen", icon: "clothesline" },
          {
            title: "Trocknen lassen",
            icon: "clothesline",
            startsWait: true,
            question: "Wie lange soll die Wäsche trocknen?",
            action: "Trocknen starten",
          },
        ],
        wait: { label: "Trockenzeit", presets: [DAY, 2 * DAY, 3 * DAY], step: 12 * HOUR, min: 12 * HOUR, reminder: "morgens und abends" },
      },
      {
        name: "Aufräumen",
        icon: "hanger",
        steps: [
          { title: "Wäsche abnehmen", icon: "clothesline" },
          { title: "Wegräumen", icon: "hanger" },
          { title: "Wäscheleine freiräumen", icon: "clothesline" },
        ],
      },
    ],
  };
  const WAIT_SECONDS = 120;

  const SUBSTEP_VIEWS = [
    "Punkte unter dem Symbol",
    "Ring um das Symbol",
    "Symbolreihe",
    "Checkliste",
    "Segmentleiste",
  ];

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

  function laundryDraft() {
    return {
      quest: QUEST,
      views: SUBSTEP_VIEWS,
      view: 0,
      labels: false,
      screen: "start",
      stageIndex: 0,
      stepIndex: 0,
      remaining: 1,
      timer: null,
      busy: false,
      checking: false,
      packed: false,
      chosenMinutes: 0,
      custom: false,
      root: null,
      duration,

      init() {
        this.root = this.$el;
      },

      icon(name) {
        return document.getElementById(`icon-${name}`)?.innerHTML ?? "";
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
      get waiting() {
        return this.screen === "wait" || this.screen === "waitDone";
      },

      // ---------- Unterschritte der aktuellen Etappe, die Wartezeit eingeschlossen ----------
      get substeps() {
        const list = this.stage.steps.map((s) => ({ icon: s.icon, label: s.title }));
        if (this.stage.wait) list.push({ icon: "clock", label: this.stage.wait.label, isWait: true });
        return list;
      },
      get currentSub() {
        return this.waiting ? this.stage.steps.length : this.stepIndex;
      },
      subState(k) {
        if (k < this.currentSub) return "done";
        if (k === this.currentSub) return (this.checking || this.screen === "waitDone") ? "done" : "current";
        return "open";
      },
      stageState(s) {
        if (this.screen === "done" || s < this.stageIndex) return "done";
        return s === this.stageIndex ? "current" : "open";
      },
      // Segment k von n als Bogen im Ring um das Etappen-Symbol (pathLength 100).
      arc(k, n) {
        const gap = n > 1 ? 4 : 0;
        const length = 100 / n - gap;
        return { dasharray: `${length} ${100 - length}`, dashoffset: String(-(k * 100) / n - gap / 2) };
      },

      // Ring aus Segmenten um das aktuelle Etappen-Symbol, ein Segment pro Unterschritt.
      ringSvg() {
        const n = this.substeps.length;
        const color = { done: "var(--color-primary)", current: "color-mix(in oklch, var(--color-primary) 40%, var(--color-base-300))", open: "var(--color-base-300)" };
        const arcs = this.substeps.map((_, k) => {
          const a = this.arc(k, n);
          return `<circle cx="50" cy="50" r="46" fill="none" stroke-width="8" stroke-linecap="round" pathLength="100" stroke="${color[this.subState(k)]}" stroke-dasharray="${a.dasharray}" stroke-dashoffset="${a.dashoffset}"/>`;
        }).join("");
        return `<svg class="size-full -rotate-90" viewBox="0 0 100 100" aria-hidden="true">${arcs}</svg>`;
      },

      // ---------- Ablauf ----------
      async press(event) {
        const button = event?.currentTarget;
        if (button) QL.animate(button, { scale: [DESIGN.press.scale, 1] }, QL.spring(DESIGN.press.bounce, DESIGN.press.duration));
        await wait(0.06);
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

      // Mini-Celebration: Das Schritt-Symbol wird zum Häkchen, mit Welle und ein paar Punkten.
      async miniCelebrate() {
        this.checking = true;
        await this.$nextTick();
        const badge = [...this.root.querySelectorAll("[data-celebrate]")].find((el) => el.offsetParent !== null);
        if (!badge || QL.reducedMotion) {
          await wait(DESIGN.celebrate.hold);
          return;
        }
        QL.animate(badge, { scale: [1, DESIGN.celebrate.pop, 1] }, { duration: 0.32, ease: EASE_OUT });
        QL.animate(badge.querySelector("[data-ripple]"), { scale: [1, 1.7], opacity: [0.5, 0] }, { duration: DESIGN.celebrate.ripple, ease: "easeOut" });
        const layer = badge.querySelector("[data-burst]");
        const spread = badge.offsetWidth / 2;
        layer.replaceChildren();
        for (let i = 0; i < DESIGN.celebrate.dots; i += 1) {
          const dot = document.createElement("span");
          dot.className = "absolute left-1/2 top-1/2 -ml-1 -mt-1 size-2 rounded-full bg-primary";
          layer.append(dot);
          const angle = (i / DESIGN.celebrate.dots) * Math.PI * 2 - Math.PI / 2;
          const d = spread + DESIGN.celebrate.dotDistance * (spread / 48);
          Motion.animate(dot, { x: [Math.cos(angle) * spread, Math.cos(angle) * d], y: [Math.sin(angle) * spread, Math.sin(angle) * d], opacity: [1, 0], scale: [1, 0.5] },
            { duration: 0.42, ease: EASE_OUT });
        }
        await wait(DESIGN.celebrate.hold + 0.12);
      },

      async complete(event) {
        if (this.busy) return;
        this.busy = true;
        await this.press(event);
        await this.miniCelebrate();
        const last = this.stepIndex === this.stage.steps.length - 1;
        await this.show(() => {
          this.checking = false;
          this.packed = false;
          if (this.step.startsWait) {
            this.screen = "wait";
            this.remaining = 1;
          } else if (!last) {
            this.stepIndex += 1;
            this.prepareStep();
          } else {
            this.screen = "done";
          }
        });
        if (this.screen === "wait") this.startTimer();
        if (this.screen === "done") this.celebrate();
        this.busy = false;
      },

      prepareStep() {
        if (this.step.startsWait) {
          this.chosenMinutes = this.stage.wait.presets[0];
          this.custom = false;
        }
      },

      choosePreset(minutes) {
        this.chosenMinutes = minutes;
        this.custom = false;
      },

      adjust(sign) {
        const w = this.stage.wait;
        this.chosenMinutes = Math.max(w.min, this.chosenMinutes + sign * w.step);
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

      get shoppingLink() {
        const text = encodeURIComponent(this.step.missing ?? "");
        return `shortcuts://run-shortcut?name=${encodeURIComponent("Questlog Einkauf")}&input=text&text=${text}`;
      },

      startTimer() {
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
          this.prepareStep();
        });
        this.popNode(this.stageIndex);
      },

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
        QL.animate(title, { opacity: [0, 1], y: [DESIGN.textIn.distance, 0] }, { duration: DESIGN.finale.title, ease: EASE_OUT });
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
