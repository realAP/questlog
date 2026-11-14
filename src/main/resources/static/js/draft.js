// Entwurf der Wäsche-Quest. Gestaltungswerte stehen in DESIGN, der Ablauf in QUEST.
(() => {
  const DESIGN = {
    // Alle Übergänge nutzen dieselbe weiche Kurve wie der wandernde Ring:
    // sanft anfahren, sanft abbremsen, eine Bewegung statt vieler.
    textOut: { duration: 0.32, distance: 14 },
    textIn: { duration: 0.42, distance: 14 },
    press: { scale: 0.97, bounce: 0.2, duration: 0.25 },
    // Mini-Celebration: Kreis wird grün, das Häkchen zeichnet sich ein, ein langsamer Lichthof.
    celebrate: { check: 0.42, glow: 0.8, rest: 0.3 },
  };
  const EASE_OUT = [0.16, 1, 0.3, 1];
  const EASE_SOFT = [0.65, 0, 0.35, 1];
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
          { title: "Alles in den Wäschekorb", icon: "basket", scene: "s1" },
          { title: "Nach unten bringen", icon: "stairs", scene: "s2", needs: { icon: "key", label: "Schlüssel" } },
          {
            title: "Maschine starten",
            icon: "washer",
            scene: "s3",
            small: true,
            startsWait: true,
            question: "Wie lange läuft der Waschgang?",
            action: "Waschvorgang starten",
            missing: "Waschmittel",
          },
        ],
        wait: { label: "Waschgang", scene: "s4", presets: [3 * HOUR, 6 * HOUR], preselect: 0, step: 15, min: 15, reminder: "alle 30 Minuten" },
      },
      {
        name: "Trocknen",
        icon: "clothesline",
        steps: [
          { title: "Wäsche holen", icon: "basket", scene: "s5", needs: { icon: "key", label: "Schlüssel" } },
          { title: "Wäsche aufhängen", icon: "clothesline", scene: "s6" },
          {
            title: "Trocknen lassen",
            icon: "clothesline",
            scene: "s7",
            startsWait: true,
            question: "Wie lange soll die Wäsche trocknen?",
            action: "Trocknen starten",
          },
        ],
        wait: { label: "Trockenzeit", scene: "s7", presets: [2 * DAY, 3 * DAY, 4 * DAY], preselect: 1, step: 12 * HOUR, min: 12 * HOUR, reminder: "morgens und abends" },
      },
      {
        name: "Aufräumen",
        icon: "hanger",
        steps: [
          { title: "Wäsche abnehmen", icon: "clothesline", scene: "s8" },
          { title: "Wegräumen", icon: "hanger", scene: "s9" },
          { title: "Ständer wegräumen", icon: "clothesline", scene: "s10" },
        ],
      },
    ],
  };
  // Der Stand liegt im Gerät, damit die Quest nach einem Blick auf die Übersicht an derselben
  // Stelle weitergeht. Rest- und Überzeit kommen immer aus der echten Uhr.
  const STORE = "questlog.entwurf.waesche";
  const SAVED = ["screen", "stageIndex", "stepIndex", "chosenMinutes", "custom"];

  // Erinnerung per Web Push, wenn eine Wartezeit endet. Fehler hier dürfen die Quest nie stören.
  const Push = {
    asking: null,

    // Muss direkt beim Tippen laufen, sonst zeigt iOS die Abfrage nicht.
    ask() {
      if (!("Notification" in window) || !("PushManager" in window)) return Promise.resolve(false);
      if (Notification.permission !== "default") return Promise.resolve(Notification.permission === "granted");
      this.asking ??= Notification.requestPermission().then((answer) => answer === "granted");
      return this.asking;
    },

    async request(method, url, body) {
      const csrf = document.querySelector("meta[name=csrf]");
      const headers = { "Content-Type": "application/json" };
      if (csrf) headers[csrf.dataset.header] = csrf.content;
      const response = await fetch(url, { method, headers, body: body && JSON.stringify(body) });
      if (!response.ok) throw new Error(`${method} ${url}: ${response.status}`);
      return response;
    },

    async subscribe() {
      const key = await (await this.request("GET", "/push/schluessel")).text();
      const registration = await navigator.serviceWorker.ready;
      const raw = atob(key.replace(/-/g, "+").replace(/_/g, "/"));
      const subscription = (await registration.pushManager.getSubscription())
        ?? (await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: Uint8Array.from(raw, (c) => c.charCodeAt(0)) }));
      await this.request("POST", "/push/abo", subscription.toJSON());
    },

    async plan(name, at, title, body) {
      try {
        if (!(await this.ask())) return;
        await this.subscribe();
        await this.request("PUT", `/erinnerungen/${name}`, { dueAt: at.toISOString(), title, body, url: location.pathname });
      } catch (error) {
        console.warn("Erinnerung nicht geplant", error);
      }
    },

    // Beta: Testnachricht in 15 Sekunden. Sagt bei jedem Schritt, woran es hängt.
    async test() {
      if (!window.isSecureContext) {
        return `Mitteilungen brauchen HTTPS, ${location.origin} ist unverschlüsselt. Über einen HTTPS-Tunnel öffnen.`;
      }
      if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
        return "Dieses Gerät kann hier keine Mitteilungen. Auf dem iPhone die App vom Home-Bildschirm öffnen, nicht in Safari.";
      }
      if (!(await this.ask())) return "Mitteilungen sind nicht erlaubt. In den iOS-Einstellungen unter Mitteilungen → Questlog einschalten.";
      const key = await fetch("/push/schluessel");
      if (key.status === 404) return "Push ist auf dem Server nicht eingerichtet: die VAPID-Variablen fehlen.";
      try {
        await this.subscribe();
      } catch (error) {
        return `Anmelden beim Push-Dienst ging nicht: ${error.message}`;
      }
      try {
        await this.request("PUT", "/erinnerungen/test", { dueAt: new Date(Date.now() + 15000).toISOString(), title: "Questlog", body: "Testnachricht angekommen", url: "/" });
      } catch (error) {
        return `Server hat die Erinnerung nicht angenommen: ${error.message}`;
      }
      return "Kommt in etwa 15 Sekunden. Du kannst das Handy sperren.";
    },

    cancel(name) {
      this.request("DELETE", `/erinnerungen/${name}`).catch((error) => console.warn("Erinnerung nicht gelöscht", error));
    },
  };
  const REMINDER = "waesche";

  function timing(endsAt, minutes) {
    const left = endsAt - Date.now();
    return left > 0
      ? { screen: "wait", remaining: left / (minutes * 60000), over: 0 }
      : { screen: "waitDone", remaining: 0, over: -left / 60000 };
  }

  function loadState() {
    let state;
    try {
      state = JSON.parse(localStorage.getItem(STORE));
    } catch {
      return null;
    }
    if (!state || !["step", "missing", "wait", "waitDone"].includes(state.screen)) return null;
    if (state.screen === "wait" || state.screen === "waitDone") Object.assign(state, timing(state.endsAt, state.chosenMinutes));
    return state;
  }

  function saveState(quest) {
    const state = Object.fromEntries(SAVED.map((key) => [key, quest[key]]));
    state.endsAt = quest.endsAt?.getTime() ?? null;
    localStorage.setItem(STORE, JSON.stringify(state));
  }

  // Segmente unterscheiden sich in der Dicke: erledigt und aktiv dick, offen dünn.
  const RING = { radius: 46, width: 9, thin: 3.5, gap: 6, sweep: 0.5, travel: 0.55, settle: 0.22 };

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

  // Wie lange eine fertige Wartezeit schon wartet: "+20 Min", "+3 Std", "+1 Tag 2 Std".
  function overdue(minutes) {
    const t = parts(minutes);
    if (t.d > 0) return `+${t.d} ${t.d === 1 ? "Tag" : "Tage"}${t.h ? ` ${t.h} Std` : ""}`;
    if (t.h > 0) return `+${t.h} Std`;
    return `+${t.m} Min`;
  }

  // Zeitlinie unter der Wartezeit: Tagesgrenzen als Striche, Wochentage mittig darunter.
  // Bei fertigen Wartezeiten nimmt die Zeit bis zum Ziel 80 % ein, der Rest ist die Überzeit.
  function dayMarks(start, end, scale) {
    const marks = { ticks: [], labels: [] };
    if (end - start < DAY * 60000) return marks;
    const bounds = [start];
    const midnight = new Date(start);
    midnight.setHours(24, 0, 0, 0);
    while (midnight.getTime() < end) {
      bounds.push(midnight.getTime());
      midnight.setDate(midnight.getDate() + 1);
    }
    bounds.push(end);
    const at = (t) => ((t - start) / (end - start)) * scale;
    bounds.slice(1, -1).forEach((t) => marks.ticks.push(at(t)));
    bounds.slice(0, -1).forEach((t, i) => {
      if (at(bounds[i + 1]) - at(t) < 10) return;
      const text = new Date(t).toLocaleDateString("de-DE", { weekday: "short" }).replace(".", "");
      marks.labels.push({ text, at: (at(t) + at(bounds[i + 1])) / 2 });
    });
    return marks;
  }

  function laundryDraft() {
    return {
      quest: QUEST,
      endsAt: null,
      labels: false,
      screen: "start",
      stageIndex: 0,
      stepIndex: 0,
      remaining: 1,
      timer: null,
      over: 0,
      overTimer: null,
      busy: false,
      checking: false,
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
        const saved = loadState();
        if (saved) {
          [...SAVED, "remaining", "over"].forEach((key) => (this[key] = saved[key]));
          this.endsAt = saved.endsAt ? new Date(saved.endsAt) : null;
          if (this.screen === "wait") this.timer = setInterval(() => this.tick(), 1000);
          if (this.screen === "waitDone") this.overTimer = setInterval(() => this.tickOver(), 1000);
        }
        Alpine.effect(() => saveState(this));
      },

      icon(name) {
        return document.getElementById(`icon-${name}`)?.innerHTML ?? "";
      },

      scene(name) {
        return name ? document.getElementById(`scene-${name}`)?.innerHTML ?? "" : "";
      },

      // ---------- Wartezeit als Szene mit Zeitlinie ----------
      get waitScene() {
        const name = this.stage.wait?.scene;
        return this.screen === "waitDone" ? `${name}-done` : name;
      },
      get progress() {
        return this.screen === "waitDone" ? 80 : (1 - this.remaining) * 100;
      },
      get overText() {
        return overdue(this.over);
      },
      get marks() {
        if (!this.endsAt) return { ticks: [], labels: [] };
        const end = this.endsAt.getTime();
        return dayMarks(end - this.chosenMinutes * 60000, end, this.screen === "waitDone" ? 80 : 100);
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
      get wordsText() {
        return inWords(this.minutesLeft);
      },
      get endText() {
        return this.endsAt ? finishedAt(this.endsAt) : "";
      },
      endFor(minutes) {
        return finishedAt(new Date(Date.now() + minutes * 60000));
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
        }, { duration: RING.sweep, ease: EASE_SOFT });
      },

      // Der volle Ring wandert entlang der Linie zur nächsten Etappe und bleibt dort stehen,
      // bis der neue, segmentierte Ring darunter gezeichnet ist.
      async travelRing(from, to) {
        const fromHost = this.root.querySelector(`[data-ring-host="${from}"]`);
        const toHost = this.root.querySelector(`[data-ring-host="${to}"]`);
        if (!fromHost || !toHost || QL.reducedMotion) return null;
        const header = fromHost.closest("header");
        const origin = header.getBoundingClientRect();
        const a = fromHost.getBoundingClientRect();
        const b = toHost.getBoundingClientRect();
        const traveller = document.createElement("span");
        traveller.className = "pointer-events-none absolute z-20";
        Object.assign(traveller.style, { left: `${a.left - origin.left}px`, top: `${a.top - origin.top}px`, width: `${a.width}px`, height: `${a.height}px` });
        traveller.innerHTML = `<svg class="size-full -rotate-90" viewBox="0 0 100 100"><circle cx="50" cy="50" r="${RING.radius}" fill="none" stroke-width="${RING.width}" stroke="var(--color-primary)"/></svg>`;
        header.append(traveller);
        fromHost.dataset.travelling = "true";
        this.travelFrom = from;
        fromHost.innerHTML = this.fullRingSvg();
        traveller.dataset.x = String(b.left - a.left);
        traveller.dataset.y = String(b.top - a.top);
        await Motion.animate(traveller, { x: [0, b.left - a.left], y: [0, b.top - a.top], scale: [1, 0.55, 1], opacity: [1, 0.8, 1] },
          { duration: RING.travel, ease: [0.65, 0, 0.35, 1] }).finished;
        delete fromHost.dataset.travelling;
        return traveller;
      },

      async settleRing(traveller, to) {
        if (!traveller) return;
        await this.$nextTick();
        await this.$nextTick();
        const host = this.root.querySelector(`[data-ring-host="${to}"]`);
        if (host) {
          // Hat sich das Layout währenddessen verschoben, den Rest mit derselben Verschiebung ausgleichen.
          const now = traveller.getBoundingClientRect();
          const target = host.getBoundingClientRect();
          const x = Number(traveller.dataset.x) + (target.left - now.left);
          const y = Number(traveller.dataset.y) + (target.top - now.top);
          Motion.animate(traveller, { x, y }, { duration: 0.12, ease: EASE_OUT });
          Motion.animate(host, { opacity: [0, 1] }, { duration: RING.settle });
        }
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

      closePeek() {
        this.peek = false;
        clearTimeout(this.peekTimer);
      },

      // Kurzes Nachgeben für kleine Bedienelemente wie Minus und Plus.
      nudge(event, sign) {
        QL.animate(event.currentTarget, { scale: [0.88, 1] }, QL.spring(0.35, 0.25));
        this.adjust(sign);
      },

      // ---------- Ablauf ----------
      async press(event) {
        const button = event?.currentTarget;
        if (button) QL.animate(button, { scale: [DESIGN.press.scale, 1] }, QL.spring(DESIGN.press.bounce, DESIGN.press.duration));
        await wait(0.06);
      },

      async show(change) {
        const parts = this.parts();
        if (parts.length) {
          await QL.animate(parts, { opacity: 0, y: -DESIGN.textOut.distance }, { duration: DESIGN.textOut.duration, ease: EASE_SOFT });
        }
        change();
        await this.$nextTick();
        QL.animate(this.parts(), { opacity: [0, 1], y: [DESIGN.textIn.distance, 0] }, { duration: DESIGN.textIn.duration, ease: EASE_SOFT });
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
        const c = DESIGN.celebrate;
        if (!badge || QL.reducedMotion) {
          await wait(c.rest + 0.2);
          return;
        }
        const tick = badge.querySelector("[data-tick] svg path");
        tick?.setAttribute("pathLength", "1");
        // Erst blendet die Szene aus und der Kreis ein, danach Häkchen und Lichthof.
        const after = 0.3;
        if (tick) {
          tick.style.strokeDasharray = "1";
          tick.style.strokeDashoffset = "1";
        }
        const running = [
          Motion.animate(badge.querySelector("[data-ripple]"), { scale: [1, 1.35], opacity: [0.35, 0] }, { duration: c.glow, delay: after + 0.15, ease: EASE_OUT }),
        ];
        if (tick) running.push(Motion.animate(tick, { strokeDashoffset: [1, 0] }, { duration: c.check, delay: after, ease: EASE_SOFT }));
        await running[running.length - 1].finished;
        await wait(c.rest);
      },

      async complete(event) {
        // Die Frage nach Mitteilungen kommt beim Start der Wartezeit, noch im selben Tippen.
        if (this.step.startsWait) Push.ask();
        if (this.busy) return;
        this.busy = true;
        await this.press(event);
        await this.miniCelebrate();
        const last = this.stepIndex === this.stage.steps.length - 1;
        await this.show(() => {
          this.checking = false;
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
        this.timer = setInterval(() => this.tick(), 1000);
        this.planReminder(this.endsAt);
      },

      planReminder(at) {
        Push.plan(REMINDER, at, `${this.stage.wait.label} fertig`, `Weiter: ${this.nextStage?.name ?? "Abschluss"}`);
      },

      tick() {
        const t = timing(this.endsAt.getTime(), this.chosenMinutes);
        this.remaining = t.remaining;
        if (t.screen === "waitDone") this.finishWaiting();
      },

      tickOver() {
        this.over = timing(this.endsAt.getTime(), this.chosenMinutes).over;
      },

      // Beta: beendet die Wartezeit sofort, die Erinnerung kommt dann gleich.
      async skipTime() {
        clearInterval(this.timer);
        this.planReminder(new Date());
        await QL.tween(this.remaining, 0, (v) => {
          this.remaining = v;
        }, { duration: 1, ease: "easeInOut" });
        this.endsAt = new Date();
        this.finishWaiting();
      },

      // Danach zählt die Überzeit ab dem Ende der Wartezeit.
      finishWaiting() {
        clearInterval(this.timer);
        this.remaining = 0;
        this.tickOver();
        this.overTimer = setInterval(() => this.tickOver(), 1000);
        this.show(() => {
          this.screen = "waitDone";
        });
      },

      async continueQuest(event) {
        Push.cancel(REMINDER);
        await this.press(event);
        clearInterval(this.overTimer);
        this.peek = false;
        const from = this.stageIndex;
        const traveller = await this.travelRing(from, from + 1);
        await this.show(() => {
          this.stageIndex += 1;
          this.travelFrom = null;
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

      // Abschluss: das Regal füllt sich, dann grüner Haken und Funkeln. Die Abfolge steckt im CSS
      // (.ql-finale.play), hier wird sie nur neu gestartet.
      async celebrate() {
        const parts = [this.$refs.finale, this.$refs.doneTitle];
        parts.forEach((el) => el.classList.remove("play"));
        await this.$nextTick();
        void this.$refs.finale.offsetWidth;
        parts.forEach((el) => el.classList.add("play"));
      },

      restart() {
        Push.cancel(REMINDER);
        clearInterval(this.timer);
        clearInterval(this.overTimer);
        this.show(() => {
          this.screen = "start";
          this.stageIndex = 0;
          this.stepIndex = 0;
        });
      },
    };
  }

  // Übersicht: zeigt groß, was als Nächstes dran ist, mit der Szene der Stelle, an der die Quest steht.
  function questOverview() {
    return {
      quest: QUEST,
      state: null,
      sceneName: "",
      today: new Date().toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" }),

      init() {
        this.refresh();
        setInterval(() => this.refresh(), 1000);
      },

      // Die Szene nur tauschen, wenn sie wechselt, sonst startet ihre Animation jede Sekunde neu.
      refresh() {
        this.state = loadState();
        const name = this.currentScene();
        if (name !== this.sceneName) this.sceneName = name;
      },

      currentScene() {
        const s = this.state;
        if (!s) return QUEST.stages[0].steps[0].scene;
        if (s.screen === "wait") return this.stage.wait.scene;
        if (s.screen === "waitDone") return `${this.stage.wait.scene}-done`;
        return this.stage.steps[s.stepIndex].scene;
      },

      scene(name) {
        return document.getElementById(`scene-${name}`)?.innerHTML ?? "";
      },

      get stage() {
        return QUEST.stages[this.state?.stageIndex ?? 0];
      },

      get timed() {
        return this.state?.screen === "wait" || this.state?.screen === "waitDone";
      },

      get late() {
        return this.state?.screen === "waitDone";
      },

      get status() {
        const s = this.state;
        if (!s) return "Bereit zum Starten";
        const step = this.stage.steps[s.stepIndex];
        if (s.screen === "missing") return `${step.missing} fehlt`;
        if (s.screen === "wait") return `${this.stage.wait.label} läuft · fertig ${finishedAt(new Date(s.endsAt))}`;
        if (s.screen === "waitDone") return `${this.stage.wait.label} fertig`;
        return `${this.stage.name} · ${step.title}`;
      },

      get progress() {
        return (1 - (this.state?.remaining ?? 1)) * 100;
      },

      pushNote: "",
      async testPush() {
        this.pushNote = "Einen Moment …";
        this.pushNote = await Push.test().catch((error) => `Fehler: ${error.message}`);
      },

      get timeText() {
        const s = this.state;
        if (!this.timed) return "";
        return this.late ? overdue(s.over) : inWords(s.remaining * s.chosenMinutes);
      },
    };
  }

  document.addEventListener("alpine:init", () => {
    Alpine.data("laundryDraft", laundryDraft);
    Alpine.data("questOverview", questOverview);
  });
})();
