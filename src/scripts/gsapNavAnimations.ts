import { gsap } from "gsap";

export function gsapNav() {
  const navAnimation = document.querySelector<HTMLElement>("header");
  if (navAnimation) {
    // La animación ahora es una transición de opacidad pura,
    // sin movimientos, para un efecto homogéneo y notorio.
    gsap.timeline().from("header", {
      opacity: -1,
      duration: 1, // Duración de la animación en segundos (muy notoria)
      ease: "linear", // Animación homogénea (velocidad constante)
    });
  }
}

// Llama a la función de inicialización
gsapNav();
