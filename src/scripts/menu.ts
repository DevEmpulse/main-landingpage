import { gsap } from "gsap";

/**
 * Full-screen overlay menu: GSAP enter/exit, focus management,
 * Escape to close, focus trap and in-page anchor handling.
 */
export function initMenu() {
  const toggle = document.getElementById("menu-toggle");
  const overlay = document.getElementById("menu-overlay");
  const closeButton = document.getElementById("menu-close");
  if (!toggle || !overlay || !closeButton) return;

  const items = overlay.querySelectorAll<HTMLElement>("[data-menu-item]");
  const meta = overlay.querySelector<HTMLElement>("[data-menu-meta]");
  const links = overlay.querySelectorAll<HTMLAnchorElement>("a[data-menu-link]");
  const prefersReducedMotion = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let isOpen = false;
  let timeline: gsap.core.Timeline | gsap.core.Tween | null = null;

  const lockScroll = (locked: boolean) => {
    document.documentElement.style.overflow = locked ? "hidden" : "";
  };

  const open = () => {
    if (isOpen) return;
    isOpen = true;
    timeline?.kill();
    overlay.hidden = false;
    lockScroll(true);
    toggle.setAttribute("aria-expanded", "true");

    if (prefersReducedMotion()) {
      timeline = gsap.fromTo(overlay, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2, ease: "power1.out" });
    } else {
      timeline = gsap
        .timeline()
        .fromTo(overlay, { yPercent: -100, autoAlpha: 1 }, { yPercent: 0, duration: 0.7, ease: "expo.out" })
        .fromTo(items, { yPercent: 110 }, { yPercent: 0, duration: 0.8, ease: "expo.out", stagger: 0.05 }, 0.12)
        .fromTo(meta, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.6, ease: "expo.out" }, 0.3);
    }

    closeButton.focus({ preventScroll: true });
  };

  const close = (restoreFocus = true) => {
    if (!isOpen) return;
    isOpen = false;
    timeline?.kill();
    lockScroll(false);
    toggle.setAttribute("aria-expanded", "false");

    const done = () => {
      overlay.hidden = true;
      gsap.set(overlay, { clearProps: "transform,opacity,visibility" });
    };

    // Exit is faster than enter.
    timeline = prefersReducedMotion()
      ? gsap.to(overlay, { autoAlpha: 0, duration: 0.15, onComplete: done })
      : gsap.to(overlay, { yPercent: -100, duration: 0.45, ease: "power3.inOut", onComplete: done });

    if (restoreFocus) toggle.focus({ preventScroll: true });
  };

  toggle.addEventListener("click", () => (isOpen ? close() : open()));
  closeButton.addEventListener("click", () => close());

  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      const url = new URL(link.href, window.location.href);
      const isSamePage = url.pathname === window.location.pathname && url.hash;
      if (!isSamePage) {
        close(false);
        return;
      }

      const target = document.querySelector<HTMLElement>(url.hash);
      if (!target) return;
      event.preventDefault();
      close(false);
      history.pushState(null, "", url.hash);
      requestAnimationFrame(() => {
        const smooth = !prefersReducedMotion();
        target.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
      });
    });
  });

  overlay.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }

    if (event.key !== "Tab") return;
    const focusables = Array.from(
      overlay.querySelectorAll<HTMLElement>("a[href], button:not([disabled])"),
    );
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (!first || !last) return;

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
}
