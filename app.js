// ============================
// PRO HERO SLIDER (Smooth)
// ============================
(function () {
  const root = document.getElementById("heroSlider");
  if (!root) return;

  const slides = Array.from(root.querySelectorAll(".slide"));
  const prevBtn = root.querySelector(".slider-btn.prev");
  const nextBtn = root.querySelector(".slider-btn.next");
  const dotsWrap = root.querySelector(".slider-dots");

  if (!slides.length) return;

  let idx = 0;
  let timer = null;
  const AUTOPLAY_MS = 6000; // ✅ 6 seconds premium

  // build dots
  slides.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "slider-dot" + (i === 0 ? " active" : "");
    dot.setAttribute("aria-label", `Go to slide ${i + 1}`);
    dot.addEventListener("click", () => goTo(i, true));
    dotsWrap.appendChild(dot);
  });

  const dots = Array.from(dotsWrap.querySelectorAll(".slider-dot"));

  function render() {
    slides.forEach((s, i) => s.classList.toggle("active", i === idx));
    dots.forEach((d, i) => d.classList.toggle("active", i === idx));
  }

  function goTo(i, userAction = false) {
    idx = (i + slides.length) % slides.length;
    render();
    if (userAction) restart();
  }

  function next() { goTo(idx + 1); }
  function prev() { goTo(idx - 1); }

  function start() {
    stop();
    timer = setInterval(next, AUTOPLAY_MS);
  }

  function stop() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  function restart() { start(); }

  // buttons
  nextBtn?.addEventListener("click", () => goTo(idx + 1, true));
  prevBtn?.addEventListener("click", () => goTo(idx - 1, true));

  // pause on hover
  root.addEventListener("mouseenter", stop);
  root.addEventListener("mouseleave", start);

  // swipe on mobile
  let x0 = null;
  root.addEventListener("touchstart", (e) => {
    x0 = e.touches[0].clientX;
  }, { passive: true });

  root.addEventListener("touchend", (e) => {
    if (x0 == null) return;
    const x1 = e.changedTouches[0].clientX;
    const dx = x1 - x0;
    if (Math.abs(dx) > 45) {
      if (dx < 0) goTo(idx + 1, true);
      else goTo(idx - 1, true);
    }
    x0 = null;
  }, { passive: true });

  // init
  render();
  start();
})();
