// Live-Beispiele des Glossars. Jedes Beispiel ist eine benannte Demo, die ein Alpine-Element mit
// x-data="demo('name')" startet. Die Demo findet ihre Teile über data-part-Attribute.
(() => {
  const EASE_OUT = [0.16, 1, 0.3, 1];
  const part = (root, name) => root.querySelector(`[data-part="${name}"]`);
  const parts = (root, name) => [...root.querySelectorAll(`[data-part="${name}"]`)];

  function slideIn(root, ease) {
    return QL.animate(part(root, "card"), { x: ["-110%", "0%"] }, { duration: 0.6, ease });
  }

  function popIn(root, transition) {
    return QL.animate(part(root, "target"), { scale: [0.8, 1] }, transition);
  }

  function enterRows(root, delay) {
    return QL.animate(parts(root, "row"), { opacity: [0, 1], y: [14, 0] }, { duration: 0.4, ease: EASE_OUT, delay });
  }

  function breathe(root) {
    return QL.animate(part(root, "breath"), { scale: [1, 1.08, 1], opacity: [0.55, 0.9, 0.55] }, {
      duration: 4,
      ease: "easeInOut",
      repeat: Infinity,
    });
  }

  function checkWithFeedback(root) {
    const done = root.dataset.done === "true";
    root.dataset.done = String(!done);
    QL.setRing(part(root, "tick"), 0);
    if (done) {
      return;
    }
    QL.animate(part(root, "box"), { scale: [0.8, 1] }, QL.spring(0.5, 0.35));
    QL.tween(0, 1, (value) => QL.setRing(part(root, "tick"), value), { duration: 0.3, delay: 0.08, ease: EASE_OUT });
    QL.animate(part(root, "pulse"), { scale: [1, 1.9], opacity: [0.45, 0] }, { duration: 0.55, ease: "easeOut" });
  }

  function confetti(root) {
    const layer = part(root, "confetti");
    layer.replaceChildren();
    if (QL.reducedMotion) {
      return;
    }
    const colors = ["var(--color-primary)", "var(--color-base-content)", "var(--color-accent)"];
    for (let index = 0; index < 14; index += 1) {
      const piece = document.createElement("span");
      piece.className = "absolute left-1/2 top-1/2 h-2.5 w-1.5 rounded-full";
      piece.style.background = colors[index % colors.length];
      layer.append(piece);
      const angle = (index / 14) * Math.PI * 2;
      const distance = 70 + (index % 3) * 22;
      Motion.animate(piece, {
        x: [0, Math.cos(angle) * distance],
        y: [0, Math.sin(angle) * distance + 30],
        rotate: [0, (index % 2 ? 1 : -1) * 180],
        opacity: [1, 1, 0],
      }, { duration: 1.1, ease: EASE_OUT });
    }
  }

  async function celebrate(root) {
    const ring = part(root, "ring");
    part(root, "title").style.opacity = "0";
    await QL.tween(0.83, 1, (value) => QL.setRing(ring, value), { duration: 0.6, ease: EASE_OUT });
    confetti(root);
    QL.animate(part(root, "ring-group"), { scale: [1, 1.1, 1] }, { duration: 0.5, ease: "easeOut" });
    QL.animate(part(root, "title"), { opacity: [0, 1], y: [10, 0] }, QL.spring(0.4, 0.4));
  }

  const DEMOS = {
    "easing-race": (root) => {
      const ease = ["linear", "easeOut", "easeInOut"];
      parts(root, "dot").forEach((dot, index) => {
        const distance = dot.parentElement.clientWidth - dot.offsetWidth;
        QL.animate(dot, { x: [0, distance] }, { duration: 1.4, ease: ease[index] });
      });
    },
    "easing-linear": (root) => slideIn(root, "linear"),
    "easing-out": (root) => slideIn(root, EASE_OUT),
    "spring-tune": (root) => popIn(root, QL.spring(Number(root.dataset.bounce ?? 0.4), 0.5)),
    "spring-off": (root) => popIn(root, { duration: 0.2, ease: "easeOut" }),
    "spring-on": (root) => popIn(root, QL.spring(0.5, 0.5)),
    "ambient-on": breathe,
    "stagger-off": (root) => enterRows(root, 0),
    "stagger-on": (root) => enterRows(root, QL.stagger(0.09)),
    "stagger-tune": (root) => enterRows(root, QL.stagger(Number(root.dataset.delay ?? 90) / 1000)),
    "micro-off": (root) => {
      root.dataset.done = String(root.dataset.done !== "true");
    },
    "micro-on": checkWithFeedback,
    "celebrate-off": (root) => {
      part(root, "title").style.opacity = "1";
    },
    "celebrate-on": celebrate,
  };

  // Fortschritt: Schritt-Ring füllt sich mit jedem Schritt, Timer-Ring läuft ab.
  function progressDemo(steps) {
    return {
      done: 0,
      steps,
      timerRunning: false,
      advance() {
        const from = this.done / this.steps;
        this.done = this.done === this.steps ? 0 : this.done + 1;
        const ring = this.$refs.stepRing;
        QL.tween(from, this.done / this.steps, (value) => QL.setRing(ring, value), QL.spring(0.25, 0.5));
      },
      async runTimer() {
        if (this.timerRunning) {
          return;
        }
        this.timerRunning = true;
        const ring = this.$refs.timerRing;
        await QL.tween(1, 0, (value) => QL.setRing(ring, value), { duration: 6, ease: "linear" });
        this.timerRunning = false;
        QL.setRing(ring, 1);
      },
    };
  }

  // Single-Task-View: zeigt immer nur einen Schritt; Abhaken blendet den nächsten ein.
  function singleTask(steps) {
    return {
      steps,
      index: 0,
      get step() {
        return this.steps[this.index];
      },
      async next() {
        const card = this.$refs.card;
        await QL.animate(card, { opacity: 0, y: -16 }, { duration: 0.18, ease: "easeIn" });
        this.index = (this.index + 1) % this.steps.length;
        await this.$nextTick();
        QL.animate(card, { opacity: [0, 1], y: [16, 0] }, { duration: 0.35, ease: EASE_OUT });
      },
    };
  }

  document.addEventListener("alpine:init", () => {
    // $el meint bei einem Klick den Button; die Demo braucht aber das Element mit x-data.
    Alpine.data("demo", (name) => ({
      root: null,
      init() {
        this.root = this.$el;
        if (this.root.hasAttribute("data-autoplay")) {
          DEMOS[name](this.root);
        }
      },
      play() {
        DEMOS[name](this.root);
      },
    }));
    Alpine.data("progressDemo", progressDemo);
    Alpine.data("singleTask", singleTask);
  });
})();
