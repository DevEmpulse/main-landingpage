// src/scripts/gsapScroll.ts

import { gsap } from "gsap";
import { ScrollTrigger, ScrollToPlugin } from "gsap/all";

// Registra los plugins al inicio del script
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

export function initGsapScroll() {
  // 1. Obtiene todas las secciones que tengan la clase 'snap-section'
  const sections = gsap.utils.toArray<HTMLElement>(".snap-section");

  // Si no hay secciones con esta clase, sal de la función
  if (sections.length === 0) return;

  // 2. Itera sobre cada sección y crea un ScrollTrigger individual
  sections.forEach((section) => {
    ScrollTrigger.create({
      trigger: section,
      start: "top top",
      scrub: 1, // Habilita el "scrub" para suavizar el scroll
      // Si quieres que el "snap" suceda al inicio de cada sección
      // simplemente usa snap: 1.
      snap: {
        snapTo: 1,
        duration: 0.8,
        ease: "power4.inOut",
        inertia: false, // Desactivar la inercia para un salto más directo
      },
    });
  });
  // Animaciones de entrada (mantenemos tu código, pero solo se ejecutará
  // en el primer elemento con el ID '#home')
  const homeSection = document.querySelector<HTMLElement>("#home");
  if (homeSection) {
    gsap
      .timeline()
      .from("#home h1", { x: -50, opacity: 0, duration: 2 }) // Animación desde la izquierda
      .from("#home p", { x: 50, opacity: 0, duration: 2 }, "<") // Animación desde la derecha
      .from("#home a", { x: -50, opacity: 0, duration: 1 }, "<"); // Animación desde la izquierda
  }
}

// Llama a la función de inicialización
initGsapScroll();
