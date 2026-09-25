import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";

gsap.registerPlugin(ScrollTrigger);

interface ProjectImage {
  src: string;
  srcSet: string;
  sizes: string;
  width: number;
  height: number;
}

interface Project {
  title: string;
  subtitle: string;
  description: string;
  image: ProjectImage;
  category: "Automatización" | "Landing Page";
  date: string;
  technologies: readonly string[];
  problem: string;
  solution: string;
  result: string;
  liveUrl?: string;
}

interface ProjectsSectionProps {
  projects: Project[];
}

// Keep in sync with `.project-wrap` sticky offsets in global.css.
const STICKY_TOP_REM = 5.5;
const STICKY_STEP_PX = 14;

function getProjectContactUrl(projectTitle: string) {
  const subject = encodeURIComponent(`Consulta sobre ${projectTitle}`);
  const body = encodeURIComponent(
    `Hola, me interesa una solución similar al proyecto "${projectTitle}".`,
  );
  return `mailto:hola@empulse.site?subject=${subject}&body=${body}`;
}

function getInitials(title: string) {
  return title
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

const pad = (value: number) => String(value).padStart(2, "0");

export default function ProjectsSection({ projects }: ProjectsSectionProps) {
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const listRef = useRef<HTMLOListElement | null>(null);

  // Sticky stack: each card scales down and dims while the next one covers it.
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const mm = gsap.matchMedia();
    mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
      const wraps = Array.from(list.querySelectorAll<HTMLElement>("[data-project-wrap]"));
      const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;

      wraps.forEach((wrap, index) => {
        const next = wraps[index + 1];
        if (!next) return;
        const card = wrap.querySelector<HTMLElement>("[data-project-card]");
        const shade = wrap.querySelector<HTMLElement>("[data-card-shade]");
        if (!card || !shade) return;

        const topOffset = STICKY_TOP_REM * rootFontSize + (index + 1) * STICKY_STEP_PX;
        const scrollTrigger = {
          trigger: next,
          start: "top bottom",
          end: `top top+=${topOffset}`,
          scrub: true,
        };

        gsap.to(card, { scale: 0.9, ease: "none", scrollTrigger });
        gsap.to(shade, { opacity: 0.6, ease: "none", scrollTrigger: { ...scrollTrigger } });
      });

      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    });

    return () => mm.revert();
  }, []);

  return (
    <ol ref={listRef} className="project-stack" aria-label="Proyectos destacados">
      {projects.map((project, index) => {
        const imageFailed = failedImages[project.title] === true;
        const isPriorityImage = index === 0;
        const wrapStyle = { "--i": index } as CSSProperties;

        return (
          <li key={project.title} data-project-wrap className="project-wrap" style={wrapStyle}>
            <article
              data-project-card
              className="project-card relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-ink-2"
            >
              {/* Caption row */}
              <div className="meta flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4 text-white/60 md:px-7">
                <span className="flex min-w-0 items-center gap-3">
                  <span className="text-accent">({pad(index + 1)})</span>
                  <span className="truncate text-bone">
                    {project.title}
                    <span className="text-white/45"> / {project.category}</span>
                  </span>
                </span>
                <span className="shrink-0">© {project.date}</span>
              </div>

              {/* Media */}
              <div className="project-media group relative overflow-hidden bg-ink-3">
                {!imageFailed ? (
                  <img
                    src={project.image.src}
                    srcSet={project.image.srcSet}
                    sizes={project.image.sizes}
                    width={project.image.width}
                    height={project.image.height}
                    alt={`Captura del proyecto ${project.title}`}
                    loading={isPriorityImage ? "eager" : "lazy"}
                    decoding="async"
                    className="project-img h-full w-full object-cover object-top"
                    onError={() =>
                      setFailedImages((prev) => ({ ...prev, [project.title]: true }))
                    }
                  />
                ) : (
                  <div
                    aria-label={`Fallback visual para ${project.title}`}
                    className="display-tight flex h-full w-full items-center justify-center text-6xl text-accent"
                  >
                    {getInitials(project.title)}
                  </div>
                )}
                <span className="meta absolute left-4 top-4 rounded-full bg-ink/80 px-3 py-1.5 text-bone backdrop-blur-sm md:left-6 md:top-6">
                  {project.subtitle}
                </span>
              </div>

              {/* Details */}
              <div className="grid gap-6 px-5 py-6 md:grid-cols-12 md:gap-8 md:px-7">
                <div className="md:col-span-5">
                  <p className="text-sm leading-relaxed text-white/70 md:text-[0.95rem]">
                    {project.description}
                  </p>
                  <p className="meta mt-3 text-white/45">{project.technologies.join(" · ")}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-semibold">
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="link-u link-u--static text-accent"
                      >
                        Ver proyecto <span className="arrow-nudge" aria-hidden="true">↗</span>
                      </a>
                    )}
                    <a href={getProjectContactUrl(project.title)} className="link-u text-white/70 hover:text-bone">
                      Consultar proyecto <span className="arrow-nudge" aria-hidden="true">→</span>
                    </a>
                  </div>
                </div>

                <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:col-span-7 md:gap-6">
                  {[
                    { label: "Problema", value: project.problem },
                    { label: "Solución", value: project.solution },
                    { label: "Resultado", value: project.result },
                  ].map((item) => (
                    <div key={`${project.title}-${item.label}`} className="border-t border-white/10 pt-3">
                      <dt className="meta mb-2 text-white/45">{item.label}</dt>
                      <dd
                        className={`text-sm leading-snug ${
                          item.label === "Resultado" ? "font-semibold text-accent" : "text-bone/90"
                        }`}
                      >
                        {item.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div
                data-card-shade
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-black opacity-0"
              />
            </article>
          </li>
        );
      })}
    </ol>
  );
}
