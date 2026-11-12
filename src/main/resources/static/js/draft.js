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
        wait: { label: "Waschgang", presets: [3 * HOUR, 6 * HOUR], preselect: 0, step: 15, min: 15, reminder: "alle 30 Minuten" },
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
        wait: { label: "Trockenzeit", presets: [2 * DAY, 3 * DAY, 4 * DAY], preselect: 1, step: 12 * HOUR, min: 12 * HOUR, reminder: "morgens und abends" },
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

  // Varianten für die Mitte, je nach Ansicht verschieden.
  const MIDDLE_VIEWS = {
    choose: ["Leiste", "Drehen", "Fertig um"],
    wait: ["Countdown", "Fertig um", "Segmente"],
  };
  // Segmente unterscheiden sich in der Dicke: erledigt und aktiv dick, offen dünn.
  const RING = { radius: 46, width: 9, thin: 3.5, gap: 6, sweep: 0.35, travel: 0.55, settle: 0.22 };

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

  const pad = (n) => String(n).padStart(2, "0");

  function parts(minutes) {
    const total = Math.max(0, Math.round(minutes * 60));
    return { d: Math.floor(total / 86400), h: Math.floor((total % 86400) / 3600), m: Math.floor((total % 3600) / 60), s: total % 60 };
  }

  // Countdown wie eine Uhr: Tage, dann Stunden, Minuten, Sekunden.
  function countdown(minutes) {
    const t = parts(minutes);
    return t.d > 0 ? `${t.d} T ${t.h}:${pad(t.m)}` : `${t.h}:${pad(t.m)}:${pad(t.s)}`;
  }

  // Restzeit in Worten, ohne Kommazahlen.
  function inWords(minutes) {
    const t = parts(minutes);
    const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
    if (t.d > 0) return `noch ${plural(t.d, "Tag", "Tage")}${t.h ? `, ${plural(t.h, "Stunde", "Stunden")}` : ""}`;
    if (t.h > 0) return `noch ${plural(t.h, "Stunde", "Stunden")}${t.m ? `, ${plural(t.m, "Minute", "Minuten")}` : ""}`;
    return `noch ${plural(t.m, "Minute", "Minuten")}`;
  }

  // Wann eine Wartezeit endet: "heute, 18:00", "morgen, 9:30" oder "So, 18:00".
  function finishedAt(date) {
    const today = new Date();
    const days = Math.round((new Date(date).setHours(0, 0, 0, 0) - new Date(today).setHours(0, 0, 0, 0)) / 86400000);
    const time = date.toLocaleTimeString("de-DE", { hour: "numeric", minute: "2-digit" });
    if (days === 0) return `heute, ${time}`;
    if (days === 1) return `morgen, ${time}`;
    return `${date.toLocaleDateString("de-DE", { weekday: "short" }).replace(".", "")}, ${time}`;
  }

  function laundryDraft() {
    return {
      quest: QUEST,
      middle: 0,
      sheet: false,
      endsAt: null,
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
      peek: false,
      travelFrom: null,
      peekTimer: null,
      ringFill: {},
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
      get minutesLeft() {
        return this.remaining * this.chosenMinutes;
      },
      get countdownText() {
        return countdown(this.minutesLeft);
      },
      get wordsText() {
        return inWords(this.minutesLeft);
      },
      get endText() {
        return this.endsAt ? finishedAt(this.endsAt) : "";
      },
      endFor(minutes) {
        return finishedAt(new Date(Date.now() + minutes * 60000));
      },
      // Welche Mittel-Varianten es in der aktuellen Ansicht gibt.
      get middleKind() {
        if (this.screen === "step" && this.step.startsWait) return "choose";
        if (this.screen === "wait") return "wait";
        return null;
      },
      get middleViews() {
        return MIDDLE_VIEWS[this.middleKind] ?? [];
      },
      // Segmente der laufenden Wartezeit: Stunden beim Waschen, Tage beim Trocknen.
      get waitSegments() {
        const unit = this.chosenMinutes >= DAY ? DAY : HOUR;
        const n = Math.max(1, Math.min(12, Math.round(this.chosenMinutes / unit)));
        const left = this.remaining * n;
        return Array.from({ length: n }, (_, k) => Math.max(0, Math.min(1, left - k)));
      },
      waitRingSvg() {
        const n = this.waitSegments.length;
        const gap = n > 1 ? 2 : 0;
        const circles = this.waitSegments.map((fill, k) => {
          const length = 100 / n - gap;
          const offset = -(k * 100) / n - gap / 2;
          const common = `cx="50" cy="50" r="47" fill="none" stroke-width="2.5" stroke-linecap="round" pathLength="100" stroke-dashoffset="${offset}"`;
          return `<circle ${common} stroke="var(--color-base-300)" stroke-dasharray="${length} ${100 - length}"/>`
            + `<circle ${common} stroke="var(--color-primary)" stroke-dasharray="${length * fill} ${100 - length * fill}"/>`;
        }).join("");
        return `<svg class="size-full -rotate-90" viewBox="0 0 100 100" aria-hidden="true">${circles}</svg>`;
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

      // ---------- Ring um die aktuelle Etappe ----------
      // Ändert sich dieser Schlüssel, wird der Ring neu gezeichnet.
      get ringKey() {
        return `${this.screen}|${this.stageIndex}|${this.stepIndex}|${this.checking}`;
      },

      segment(k, n) {
        const length = 100 / n - (n > 1 ? RING.gap : 0);
        const offset = -(k * 100) / n - (n > 1 ? RING.gap / 2 : 0);
        return { length, offset };
      },

      fillOf(k) {
        const state = this.subState(k);
        if (state === "done") return 1;
        return state === "current" ? 0.0001 : 0;
      },

      ringSvg(s) {
        const n = this.substeps.length;
        const circles = this.substeps.map((_, k) => {
          const { length, offset } = this.segment(k, n);
          const state = this.subState(k);
          const open = state === "open";
          const track = state === "current"
            ? "color-mix(in oklch, var(--color-primary) 40%, transparent)"
            : "var(--color-base-300)";
          const base = `cx="50" cy="50" r="${RING.radius}" fill="none" stroke-linecap="butt" pathLength="100" stroke-dashoffset="${offset}"`;
          const filled = length * (this.ringFill[`${s}-${k}`] ?? 0);
          return `<circle ${base} stroke-width="${open ? RING.thin : RING.width}" stroke="${track}" stroke-dasharray="${length} ${100 - length}"/>`
            + `<circle ${base} stroke-width="${RING.width}" data-seg="${k}" stroke="var(--color-primary)" stroke-dasharray="${filled} ${100 - filled}"/>`;
        }).join("");
        return `<svg class="size-full -rotate-90 overflow-visible" viewBox="0 0 100 100" aria-hidden="true">${circles}</svg>${this.clockMarker(n)}`;
      },

      // Kleine Uhr auf dem Ring, mittig über dem Segment der Wartezeit.
      clockMarker(n) {
        if (!this.stage.wait) return "";
        const angle = ((n - 0.5) / n) * Math.PI * 2;
        const x = 50 + 50 * Math.sin(angle);
        const y = 50 - 50 * Math.cos(angle);
        const done = this.subState(n - 1) === "done";
        return `<span class="absolute grid size-4 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full ${done ? "bg-primary text-primary-content" : "bg-base-100 text-base-content/60 ring-1 ring-base-300"}" style="left:${x}%;top:${y}%"><span class="size-3">${this.icon("clock")}</span></span>`;
      },

      fullRingSvg() {
        return `<svg class="size-full -rotate-90" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="${RING.radius}" fill="none" stroke-width="3" stroke="color-mix(in oklch, var(--color-primary) 45%, transparent)"/></svg>`;
      },

      // Zeichnet die Ringe und lässt neu erledigte Segmente sichtbar volllaufen.
      updateRings() {
        if (!this.root) return;
        this.quest.stages.forEach((_, s) => {
          const host = this.root.querySelector(`[data-ring-host="${s}"]`);
          if (!host || host.dataset.travelling) return;
          if (s !== this.stageIndex) {
            host.innerHTML = this.stageState(s) === "done" ? this.fullRingSvg() : "";
            return;
          }
          const sweeping = [];
          this.substeps.forEach((_, k) => {
            const key = `${s}-${k}`;
            const target = this.fillOf(k);
            if ((this.ringFill[key] ?? 0) < 1 && target === 1) sweeping.push(k);
            else this.ringFill[key] = target;
          });
          host.innerHTML = this.ringSvg(s);
          sweeping.forEach((k) => this.sweep(host, s, k));
        });
      },

      sweep(host, s, k) {
        const key = `${s}-${k}`;
        const circle = host.querySelector(`[data-seg="${k}"]`);
        const { length } = this.segment(k, this.substeps.length);
        QL.tween(this.ringFill[key] ?? 0, 1, (v) => {
          this.ringFill[key] = v;
          circle?.setAttribute("stroke-dasharray", `${length * v} ${100 - length * v}`);
        }, { duration: RING.sweep, ease: EASE_OUT });
      },

      // Der volle Ring wandert entlang der Linie zur nächsten Etappe und bleibt dort stehen,
      // bis der neue, segmentierte Ring darunter gezeichnet ist.
      async travelRing(from, to) {
        const fromHost = this.root.querySelector(`[data-ring-host="${from}"]`);
        const toHost = this.root.querySelector(`[data-ring-host="${to}"]`);
        if (!fromHost || !toHost || QL.reducedMotion) return null;
        const a = fromHost.getBoundingClientRect();
        const b = toHost.getBoundingClientRect();
        const traveller = document.createElement("span");
        traveller.className = "pointer-events-none fixed z-20";
        Object.assign(traveller.style, { left: `${a.left}px`, top: `${a.top}px`, width: `${a.width}px`, height: `${a.height}px` });
        traveller.innerHTML = `<svg class="size-full -rotate-90" viewBox="0 0 100 100"><circle cx="50" cy="50" r="${RING.radius}" fill="none" stroke-width="${RING.width}" stroke="var(--color-primary)"/></svg>`;
        document.body.append(traveller);
        fromHost.dataset.travelling = "true";
        this.travelFrom = from;
        fromHost.innerHTML = this.fullRingSvg();
        await Motion.animate(traveller, { x: [0, b.left - a.left], scale: [1, 0.55, 1], opacity: [1, 0.8, 1] },
          { duration: RING.travel, ease: [0.65, 0, 0.35, 1] }).finished;
        delete fromHost.dataset.travelling;
        this.travelFrom = null;
        return traveller;
      },

      async settleRing(traveller, to) {
        if (!traveller) return;
        await this.$nextTick();
        await this.$nextTick();
        const host = this.root.querySelector(`[data-ring-host="${to}"]`);
        if (host) Motion.animate(host, { opacity: [0, 1] }, { duration: RING.settle });
        await Motion.animate(traveller, { opacity: [1, 0] }, { duration: RING.settle }).finished;
        traveller.remove();
      },

      // Variante 3: Antippen der aktuellen Etappe zeigt ihre Unterschritte als Symbole.
      togglePeek(s) {
        if (s !== this.stageIndex) return;
        this.peek = !this.peek;
        clearTimeout(this.peekTimer);
        if (this.peek) this.peekTimer = setTimeout(() => (this.peek = false), 3000);
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
          this.chosenMinutes = this.stage.wait.presets[this.stage.wait.preselect ?? 0];
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
        this.endsAt = new Date(Date.now() + this.chosenMinutes * 60000);
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
        this.peek = false;
        const from = this.stageIndex;
        const traveller = await this.travelRing(from, from + 1);
        await this.show(() => {
          this.stageIndex += 1;
          this.stepIndex = 0;
          this.screen = "step";
          this.prepareStep();
        });
        await this.settleRing(traveller, from + 1);
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
