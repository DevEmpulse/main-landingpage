/**
 * Live local clocks (Argentina, GMT-3).
 * Usage: <span data-clock></span> renders HH:MM, add data-clock-seconds for HH:MM:SS.
 */
const TIME_ZONE = "America/Argentina/Buenos_Aires";

function createFormatter(withSeconds: boolean) {
  return new Intl.DateTimeFormat("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    second: withSeconds ? "2-digit" : undefined,
    hour12: false,
    timeZone: TIME_ZONE,
  });
}

let intervalId: number | undefined;

export function initClocks() {
  const clocks = Array.from(document.querySelectorAll<HTMLElement>("[data-clock]"));
  if (!clocks.length) return;

  const short = createFormatter(false);
  const long = createFormatter(true);

  const tick = () => {
    const now = new Date();
    clocks.forEach((clock) => {
      const formatter = clock.hasAttribute("data-clock-seconds") ? long : short;
      clock.textContent = formatter.format(now);
    });
  };

  tick();
  if (intervalId !== undefined) window.clearInterval(intervalId);
  intervalId = window.setInterval(tick, 1000);
}
