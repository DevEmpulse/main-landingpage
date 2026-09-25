import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { initClocks } from "./clock";
import { initMenu } from "./menu";

gsap.registerPlugin(ScrollTrigger, SplitText);

/*
 * Site-wide motion entry point (loaded once from Layout.astro).
 * - Easing: expo.out for entrances, "none" for scrubbed scroll, linear CSS for marquees.
 * - Only transform/opacity are animated.
 * - Reduced motion: nothing is pinned, scrubbed or hidden; content renders statically.
 */

const MOTION_OK = "(prefers-reduced-motion: no-preference)";
const DESKTOP_MOTION = "(min-width: 1024px) and (prefers-reduced-motion: no-preference)";
const FINE_POINTER = "(hover: hover) and (pointer: fine)";

declare global {
  interface Window {
    __empulseMotionReady?: boolean;
  }
}

/* ---------- Intro (above the fold) ---------- */

function heroIntro() {
  const hero = document.querySelector<HTMLElement>("#home");
  if (!hero) return;

  const slats = hero.querySelectorAll(".hero-slat");
  const lines = hero.querySelectorAll("[data-meta-line]");
  const letters = hero.querySelectorAll("[data-hero-letter]");
  const intro = hero.querySelectorAll("[data-intro]");

  gsap
    .timeline({ defaults: { ease: "expo.out" } })
    .fromTo(slats, { scaleY: 1 }, { scaleY: 0, duration: 1.1, ease: "expo.inOut", stagger: 0.05 })
    .fromTo(lines, { scaleX: 0 }, { scaleX: 1, duration: 1.2, stagger: 0.07 }, 0.35)
    .fromTo(letters, { y: 0, yPercent: 105 }, { yPercent: 0, duration: 1.3, stagger: 0.06 }, 0.45)
    .fromTo(intro, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 1, stagger: 0.05 }, 0.65);
}

function pageIntro() {
  const intro = Array.from(document.querySelectorAll<HTMLElement>("[data-intro]")).filter(
    (el) => !el.closest("#home"),
  );
  if (!intro.length) return;
  gsap.fromTo(
    intro,
    { autoAlpha: 0, y: 16 },
    { autoAlpha: 1, y: 0, duration: 1, ease: "expo.out", stagger: 0.07, delay: 0.1 },
  );
}

/* ---------- Scroll reveals ---------- */

function splitReveals() {
  document.querySelectorAll<HTMLElement>("[data-split]").forEach((el) => {
    SplitText.create(el, {
      type: "lines",
      mask: "lines",
      autoSplit: true,
      onSplit: (self) =>
        gsap.from(self.lines, {
          yPercent: 110,
          duration: 1.1,
          ease: "expo.out",
          stagger: 0.08,
          scrollTrigger: { trigger: el, start: "top 82%", once: true },
        }),
    });
  });

  document.querySelectorAll<HTMLElement>("[data-split-chars]").forEach((el) => {
    SplitText.create(el, {
      type: "words,chars",
      mask: "chars",
      onSplit: (self) =>
        gsap.from(self.chars, {
          yPercent: 110,
          duration: 1.2,
          ease: "expo.out",
          stagger: 0.035,
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        }),
    });
  });
}

function indexRows() {
  document.querySelectorAll<HTMLElement>("[data-index-row]").forEach((row) => {
    const lines = row.querySelectorAll("[data-index-line]");
    const labels = Array.from(row.children).filter((child) => !child.hasAttribute("data-index-line"));

    gsap
      .timeline({ scrollTrigger: { trigger: row, start: "top 90%", once: true } })
      .fromTo(lines, { scaleX: 0 }, { scaleX: 1, transformOrigin: "left center", duration: 1.2, ease: "expo.out" })
      .fromTo(
        labels,
        { autoAlpha: 0, y: 10 },
        { autoAlpha: 1, y: 0, duration: 0.8, ease: "expo.out", stagger: 0.08 },
        0.15,
      );
  });
}

function blockReveals() {
  const targets = gsap.utils.toArray<HTMLElement>("[data-reveal]");
  if (!targets.length) return;

  gsap.set(targets, { autoAlpha: 0, y: 24 });
  ScrollTrigger.batch(targets, {
    start: "top 88%",
    once: true,
    onEnter: (batch) =>
      gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.9, ease: "expo.out", stagger: 0.07 }),
  });
}

function counters() {
  document.querySelectorAll<HTMLElement>("[data-counter]").forEach((counter) => {
    const target = Number(counter.dataset.target || "0");
    const state = { value: 0 };
    counter.textContent = "0";

    gsap.to(state, {
      value: target,
      duration: 1.6,
      ease: "expo.out",
      scrollTrigger: { trigger: counter, start: "top 90%", once: true },
      onUpdate: () => {
        counter.textContent = String(Math.round(state.value));
      },
    });
  });
}

function footerWordmark() {
  const wordmark = document.querySelector<HTMLElement>("[data-footer-wordmark]");
  if (!wordmark) return;
  gsap.from(wordmark.querySelectorAll("[data-footer-letter]"), {
    yPercent: 105,
    duration: 1.3,
    ease: "expo.out",
    stagger: 0.06,
    scrollTrigger: { trigger: wordmark, start: "top 95%", once: true },
  });
}

/* ---------- Pinned horizontal services (desktop only) ---------- */

function servicesHorizontal() {
  const pin = document.querySelector<HTMLElement>("[data-services-pin]");
  const track = pin?.querySelector<HTMLElement>("[data-services-track]");
  if (!pin || !track) return;

  const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);

  gsap.to(track, {
    x: () => -distance(),
    ease: "none",
    scrollTrigger: {
      trigger: pin,
      start: "top top",
      end: () => `+=${distance()}`,
      pin: true,
      scrub: 0.8,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
  });
}

/* ---------- Interaction ---------- */

function magnetic() {
  if (!window.matchMedia(FINE_POINTER).matches) return;
  if (!window.matchMedia(MOTION_OK).matches) return;

  document.querySelectorAll<HTMLElement>("[data-magnetic]").forEach((el) => {
    // GSAP owns transform here, so drop the CSS transform transition to avoid fighting it.
    el.style.transitionProperty = "background-color, color, border-color";

    const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" });
    const strength = 0.3;

    el.addEventListener("pointermove", (event) => {
      const rect = el.getBoundingClientRect();
      xTo((event.clientX - (rect.left + rect.width / 2)) * strength);
      yTo((event.clientY - (rect.top + rect.height / 2)) * strength);
    });
    el.addEventListener("pointerleave", () => {
      xTo(0);
      yTo(0);
    });
    el.addEventListener("pointerdown", () => gsap.to(el, { scale: 0.97, duration: 0.12, ease: "power2.out" }));
    const release = () => gsap.to(el, { scale: 1, duration: 0.2, ease: "power2.out" });
    el.addEventListener("pointerup", release);
    el.addEventListener("pointercancel", release);
  });
}

function headerState() {
  const header = document.getElementById("site-header");
  if (!header) return;
  let ticking = false;
  const update = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 40);
    ticking = false;
  };
  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    },
    { passive: true },
  );
  update();
}

/* ---------- Boot ---------- */

function init() {
  if (window.__empulseMotionReady) return;
  window.__empulseMotionReady = true;

  initMenu();
  initClocks();
  headerState();
  magnetic();

  const mm = gsap.matchMedia();

  // The pin is registered first so triggers below it account for its spacer.
  mm.add(DESKTOP_MOTION, () => {
    servicesHorizontal();
  });

  mm.add(MOTION_OK, () => {
    heroIntro();
    pageIntro();
    splitReveals();
    indexRows();
    blockReveals();
    counters();
    footerWordmark();
  });

  // Recalculate trigger positions (in document order) once webfonts and images settle.
  const refresh = () => {
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
  };
  document.fonts?.ready.then(refresh);
  window.addEventListener("load", refresh, { once: true });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init, { once: true });
} else {
  init();
}
