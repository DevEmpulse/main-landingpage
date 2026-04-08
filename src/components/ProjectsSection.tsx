import { gsap } from "gsap";
import type { CSSProperties, MouseEvent } from "react";
import { useEffect, useRef, useState } from "react";

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
  category: "Automatizacion" | "Landing Page";
  date: string;
  technologies: readonly string[];
  problem: string;
  solution: string;
  result: string;
  liveUrl?: string;
}

const ITEMS_PER_PAGE = 4;
const FLOAT_DURATIONS = [3.2, 3.5, 3.8, 4.1];
const FLOAT_DELAYS = [0, 0.4, 0.75, 0.2];
const CARD_HEIGHT = 580;

function getProjectContactUrl(projectTitle: string) {
  const subject = encodeURIComponent(`Consulta sobre ${projectTitle}`);
  const body = encodeURIComponent(
    `Hola, me interesa una solucion similar al proyecto "${projectTitle}".`,
  );
  return `mailto:hola@empulse.site?subject=${subject}&body=${body}`;
}

function getCategoryAccent(category: Project["category"]) {
  if (category === "Automatizacion") {
    return {
      badgeBackground: "rgba(139,92,246,0.15)",
      badgeColor: "#a78bfa",
      accent: "#a78bfa",
    };
  }
  return {
    badgeBackground: "rgba(20,184,166,0.15)",
    badgeColor: "#2dd4bf",
    accent: "#2dd4bf",
  };
}

function getInitials(title: string) {
  return title
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

interface ProjectsSectionProps {
  projects: Project[];
}

export default function ProjectsSection({ projects }: ProjectsSectionProps) {
  const [page, setPage] = useState(0);
  const [visiblePage, setVisiblePage] = useState(0);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [isAnimating, setIsAnimating] = useState(false);

  const gridRef = useRef<HTMLDivElement | null>(null);
  const floatTweens = useRef<Map<number, gsap.core.Tween>>(new Map());

  const totalPages = Math.ceil(projects.length / ITEMS_PER_PAGE);
  const visibleProjects = projects.slice(
    visiblePage * ITEMS_PER_PAGE,
    visiblePage * ITEMS_PER_PAGE + ITEMS_PER_PAGE,
  );

  const killAllFloats = () => {
    floatTweens.current.forEach((t) => t.kill());
    floatTweens.current.clear();
  };

  const getCards = (): HTMLElement[] => {
    if (!gridRef.current) return [];
    return Array.from(
      gridRef.current.querySelectorAll<HTMLElement>("[data-project-card]"),
    );
  };

  const startFloat = (element: HTMLElement, index: number) => {
    floatTweens.current.get(index)?.kill();
    const tween = gsap.to(element, {
      y: -(12 + index * 2),
      duration: FLOAT_DURATIONS[index % FLOAT_DURATIONS.length],
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
      delay: FLOAT_DELAYS[index % FLOAT_DELAYS.length],
    });
    floatTweens.current.set(index, tween);
  };

  useEffect(() => {
    const cards = getCards();
    if (cards.length === 0) return;

    killAllFloats();
    gsap.set(cards, { opacity: 0, y: 40, scale: 1 });

    const tl = gsap.timeline({ onComplete: () => setIsAnimating(false) });

    cards.forEach((card, index) => {
      tl.to(
        card,
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: "power2.out",
          onComplete: () => startFloat(card, index),
        },
        index * 0.08,
      );
    });

    return () => {
      tl.kill();
      killAllFloats();
    };
  }, [visiblePage]);

  useEffect(() => {
    return () => {
      killAllFloats();
      if (gridRef.current) gsap.killTweensOf(gridRef.current);
    };
  }, []);

  const handlePageChange = (nextPage: number) => {
    if (nextPage === page || isAnimating) return;

    setIsAnimating(true);
    killAllFloats();

    const cards = getCards();
    cards.forEach((card) => {
      gsap.killTweensOf(card);
      card.style.zIndex = "1";
    });

    gsap.to(cards, {
      opacity: 0,
      y: -20,
      duration: 0.25,
      ease: "power2.in",
      stagger: 0.04,
      onComplete: () => {
        setPage(nextPage);
        setVisiblePage(nextPage);
      },
    });
  };

  const gridStyle: CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: "24px",
    gridAutoRows: `${CARD_HEIGHT}px`,
  };

  const navButtonStyle: CSSProperties = {
    width: "44px",
    height: "44px",
    borderRadius: "999px",
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.04)",
    color: "#f0f0f8",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition:
      "transform 180ms ease, border-color 180ms ease, background 180ms ease",
  };

  return (
    <div>
      <div ref={gridRef} style={gridStyle}>
        {visibleProjects.map((project, index) => {
          const categoryAccent = getCategoryAccent(project.category);
          const imageFailed = failedImages[project.title] === true;
          const isPriorityImage = index === 0;

          return (
            <article
              key={project.title}
              data-project-card
              onMouseEnter={(event: MouseEvent<HTMLElement>) => {
                const card = event.currentTarget;
                const cardIndex = getCards().findIndex((c) => c === card);
                floatTweens.current.get(cardIndex)?.pause();
                gsap.killTweensOf(card);
                card.style.zIndex = "10";
                card.style.boxShadow = "0 32px 64px rgba(0,0,0,0.6)";
                gsap.to(card, {
                  y: -24,
                  scale: 1.04,
                  duration: 0.35,
                  ease: "power2.out",
                });
              }}
              onMouseLeave={(event: MouseEvent<HTMLElement>) => {
                const card = event.currentTarget;
                const cardIndex = getCards().findIndex((c) => c === card);
                gsap.killTweensOf(card);
                gsap.to(card, {
                  y: 0,
                  scale: 1,
                  duration: 0.4,
                  ease: "power2.inOut",
                  onComplete: () => {
                    card.style.zIndex = "1";
                    card.style.boxShadow = "0 12px 40px rgba(0,0,0,0.45)";
                    if (cardIndex >= 0) startFloat(card, cardIndex);
                  },
                });
              }}
              style={{
                height: `${CARD_HEIGHT}px`,
                background: "#0e0e16",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "20px",
                boxShadow: "0 12px 40px rgba(0,0,0,0.45)",
                overflow: "hidden",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                transformOrigin: "center bottom",
                zIndex: 1,
                transition: "box-shadow 220ms ease",
              }}
            >
              <div
                style={{
                  position: "relative",
                  flexShrink: 0,
                  height: "200px",
                  overflow: "hidden",
                  background:
                    "linear-gradient(180deg, rgba(28,28,40,0.92) 0%, rgba(10,10,16,1) 100%)",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "16px",
                    left: "16px",
                    zIndex: 2,
                    padding: "6px 12px",
                    borderRadius: "999px",
                    background: categoryAccent.badgeBackground,
                    color: categoryAccent.badgeColor,
                    fontSize: "11px",
                    lineHeight: 1,
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  {project.category}
                </div>

                {!imageFailed ? (
                  <img
                    src={project.image.src}
                    srcSet={project.image.srcSet}
                    sizes={project.image.sizes}
                    width={project.image.width}
                    height={project.image.height}
                    alt={project.title}
                    loading={isPriorityImage ? "eager" : "lazy"}
                    fetchPriority={isPriorityImage ? "high" : "auto"}
                    decoding="async"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                    onError={() =>
                      setFailedImages((prev) => ({
                        ...prev,
                        [project.title]: true,
                      }))
                    }
                  />
                ) : (
                  <div
                    aria-label={`Fallback visual para ${project.title}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background:
                        "radial-gradient(circle at top, rgba(255,255,255,0.06), transparent 55%), #0b0b12",
                      color: categoryAccent.accent,
                      fontSize: "40px",
                      fontWeight: 800,
                      letterSpacing: "0.08em",
                    }}
                  >
                    {getInitials(project.title)}
                  </div>
                )}
              </div>

              <div
                style={{
                  flex: 1,
                  padding: "18px 18px 20px",
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: "12px",
                    marginBottom: "10px",
                  }}
                >
                  <div>
                    <div
                      style={{
                        color: "#f0f0f8",
                        fontSize: "16px",
                        lineHeight: 1.25,
                        fontWeight: 700,
                      }}
                    >
                      {project.title}
                    </div>
                    <div
                      style={{
                        marginTop: "3px",
                        color: "rgba(224,64,251,0.8)",
                        fontSize: "12px",
                        lineHeight: 1.3,
                        fontWeight: 600,
                      }}
                    >
                      {project.subtitle}
                    </div>
                  </div>
                  <div
                    style={{
                      flexShrink: 0,
                      color: "rgba(240,240,248,0.45)",
                      fontSize: "12px",
                      fontWeight: 600,
                    }}
                  >
                    {project.date}
                  </div>
                </div>

                <p
                  style={{
                    color: "rgba(200,200,220,0.55)",
                    fontSize: "13px",
                    lineHeight: 1.6,
                    margin: "0 0 14px",
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {project.description}
                </p>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                    gap: "8px",
                    padding: "12px",
                    borderRadius: "14px",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.05)",
                    marginBottom: "14px",
                  }}
                >
                  {[
                    {
                      label: "Problema",
                      value: project.problem,
                      color: "rgba(255,171,171,0.9)",
                    },
                    {
                      label: "Solucion",
                      value: project.solution,
                      color: "rgba(147,197,253,0.9)",
                    },
                    {
                      label: "Resultado",
                      value: project.result,
                      color: "rgba(134,239,172,0.9)",
                    },
                  ].map((item) => (
                    <div key={`${project.title}-${item.label}`}>
                      <div
                        style={{
                          color: "rgba(255,255,255,0.3)",
                          fontSize: "9px",
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          fontWeight: 700,
                          marginBottom: "5px",
                        }}
                      >
                        {item.label}
                      </div>
                      <div
                        style={{
                          color: item.color,
                          fontSize: "11px",
                          lineHeight: 1.4,
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "6px",
                    marginBottom: "14px",
                  }}
                >
                  {project.technologies.map((tech) => (
                    <span
                      key={`${project.title}-${tech}`}
                      style={{
                        padding: "5px 10px",
                        borderRadius: "999px",
                        background: "rgba(255,255,255,0.06)",
                        color: "rgba(255,255,255,0.5)",
                        fontSize: "11px",
                        lineHeight: 1,
                        fontWeight: 600,
                      }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Actions pinned to bottom */}
                <div
                  style={{
                    marginTop: "auto",
                    display: "flex",
                    alignItems: "center",
                    gap: "18px",
                    flexWrap: "wrap",
                  }}
                >
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        color: "#e040fb",
                        fontSize: "13px",
                        fontWeight: 700,
                        textDecoration: "none",
                      }}
                    >
                      Ver proyecto →
                    </a>
                  )}
                  <a
                    href={getProjectContactUrl(project.title)}
                    style={{
                      color: "rgba(240,240,248,0.55)",
                      fontSize: "13px",
                      fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    Consultar proyecto →
                  </a>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
            marginTop: "36px",
          }}
        >
          <button
            type="button"
            aria-label="Pagina anterior"
            disabled={isAnimating}
            onClick={() =>
              handlePageChange((page - 1 + totalPages) % totalPages)
            }
            style={{
              ...navButtonStyle,
              opacity: isAnimating ? 0.45 : 1,
              cursor: isAnimating ? "default" : "pointer",
            }}
          >
            ←
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={`dot-${i}`}
                type="button"
                aria-label={`Ir a la pagina ${i + 1}`}
                disabled={isAnimating}
                onClick={() => handlePageChange(i)}
                style={{
                  width: i === page ? "32px" : "8px",
                  height: "8px",
                  borderRadius: "999px",
                  border: "none",
                  background: i === page ? "#e040fb" : "rgba(255,255,255,0.22)",
                  cursor: isAnimating ? "default" : "pointer",
                  opacity: isAnimating && i !== page ? 0.5 : 1,
                  transition: "width 220ms ease, background 220ms ease",
                  padding: 0,
                }}
              />
            ))}
          </div>

          <button
            type="button"
            aria-label="Pagina siguiente"
            disabled={isAnimating}
            onClick={() => handlePageChange((page + 1) % totalPages)}
            style={{
              ...navButtonStyle,
              opacity: isAnimating ? 0.45 : 1,
              cursor: isAnimating ? "default" : "pointer",
            }}
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}
