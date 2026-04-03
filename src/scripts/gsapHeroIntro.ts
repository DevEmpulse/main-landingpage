import { gsap } from "gsap";

function initHeroIntro() {
  const hero = document.querySelector<HTMLElement>("#home");
  if (!hero) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const badge = hero.querySelector("p");
  const title = hero.querySelector("h1");
  const description = hero.querySelector("h1 + p");
  const buttons = hero.querySelectorAll("a");

  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

  tl.from(badge, { y: 10, autoAlpha: 0, duration: 0.35 })
    .from(title, { y: 18, autoAlpha: 0, duration: 0.55 }, "-=0.1")
    .from(description, { y: 14, autoAlpha: 0, duration: 0.45 }, "-=0.28")
    .from(buttons, { y: 10, autoAlpha: 0, duration: 0.35, stagger: 0.08 }, "-=0.2");
}

function scheduleHeroIntro() {
  if ("requestIdleCallback" in window) {
    (window as Window & { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(
      initHeroIntro
    );
  } else {
    setTimeout(initHeroIntro, 0);
  }
}

if (document.readyState === "complete") {
  scheduleHeroIntro();
} else {
  window.addEventListener("load", scheduleHeroIntro, { once: true });
}
