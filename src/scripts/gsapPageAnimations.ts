import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function initPageAnimations() {
  const sections = gsap.utils.toArray<HTMLElement>("[data-motion-section]");
  if (!sections.length) return;

  sections.forEach((section) => {
    ScrollTrigger.create({
      trigger: section,
      start: "top 85%",
      once: true,
      onEnter: () => {
        const allTargets = section.querySelectorAll(
          "h2, h3, p, article, a, li, form, .contact-card"
        );
        const targets = Array.from(allTargets).filter(
          (target) => !target.closest("[data-motion-ignore]")
        );
        if (!targets.length) return;

        gsap.fromTo(
          targets,
          { y: 18, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.45,
            stagger: 0.025,
            ease: "power3.out",
            clearProps: "opacity,transform,visibility",
          }
        );
      },
    });
  });
}

function schedulePageAnimations() {
  if ("requestIdleCallback" in window) {
    (window as Window & { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(
      initPageAnimations
    );
  } else {
    setTimeout(initPageAnimations, 0);
  }
}

if (document.readyState === "complete") {
  schedulePageAnimations();
} else {
  window.addEventListener("load", schedulePageAnimations, { once: true });
}
