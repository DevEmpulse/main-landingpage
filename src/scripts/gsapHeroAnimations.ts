// src/scripts/gsapScroll.ts

import { gsap } from "gsap";

export function initGsapScroll() {
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
