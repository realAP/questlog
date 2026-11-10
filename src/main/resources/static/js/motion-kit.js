// Gemeinsame Animationshelfer auf Basis von Motion.
// Ist auf dem Gerät "Bewegung reduzieren" aktiv, werden Animationen abgeschwächt: Bewegungen
// springen sofort ans Ziel, nur Ein- und Ausblenden bleibt kurz sichtbar, Dauerbewegung entfällt.
(() => {
  const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  function animate(target, keyframes, options = {}) {
    if (!reducedQuery.matches) {
      return Motion.animate(target, keyframes, options);
    }
    if (options.repeat === Infinity) {
      return null;
    }
    const { opacity, ...movement } = keyframes;
    const jump = Object.keys(movement).length > 0 ? Motion.animate(target, movement, { duration: 0 }) : null;
    return opacity === undefined ? jump : Motion.animate(target, { opacity }, { duration: 0.15 });
  }

  // Animiert eine Zahl, etwa den Füllstand eines Rings, und meldet jeden Zwischenwert.
  function tween(from, to, onUpdate, options = {}) {
    const effective = reducedQuery.matches ? { duration: 0 } : options;
    return Motion.animate(from, to, { ...effective, onUpdate });
  }

  function spring(bounce = 0.3, visualDuration = 0.4) {
    return { type: Motion.spring, bounce, visualDuration };
  }

  // Setzt einen SVG-Kreis mit pathLength="100" auf einen Füllgrad zwischen 0 und 1.
  function setRing(circle, fraction) {
    circle.style.strokeDashoffset = String(100 - Math.max(0, Math.min(1, fraction)) * 100);
  }

  window.QL = {
    animate,
    tween,
    spring,
    setRing,
    stagger: (...args) => Motion.stagger(...args),
    get reducedMotion() {
      return reducedQuery.matches;
    },
  };
})();
