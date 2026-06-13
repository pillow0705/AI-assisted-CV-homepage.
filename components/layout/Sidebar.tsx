"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useUI } from "@/components/providers/ThemeLanguageProvider";
import type { SiteConfig } from "@/types";

interface SidebarProps {
  config: Partial<SiteConfig>;
}

const SECTIONS = [
  { id: "about", key: "about" as const },
  { id: "education", key: "education" as const },
  { id: "experience", key: "experience" as const },
  { id: "skills", key: "skills" as const },
  { id: "honors", key: "honors" as const },
  { id: "projects", key: "projects" as const },
  { id: "contact", key: "contactMe" as const },
];

export default function Sidebar({ config }: SidebarProps) {
  const { theme, toggleTheme, lang, setLang, t } = useUI();
  const [active, setActive] = useState("about");

  // Scroll-spy: highlight the section currently in view.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <aside
      className="hidden md:flex fixed left-0 top-0 h-screen w-72 flex-col p-7 overflow-y-auto z-30"
      style={{ background: "var(--sidebar-bg)", color: "var(--sidebar-ink)" }}
    >
      {/* Profile */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center mb-8"
      >
        {config.avatar_url && (
          <div className="relative mb-4">
            <div className="absolute inset-0 rounded-full animate-glow-pulse" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={config.avatar_url}
              alt={config.name}
              className="w-28 h-28 rounded-full object-cover relative z-10"
              style={{ border: "3px solid rgba(255,255,255,0.25)" }}
            />
          </div>
        )}
        <h1 className="text-xl font-bold text-center font-serif-display tracking-wide">
          {config.name}
        </h1>
        {config.title && (
          <p
            className="text-sm text-center mt-2 font-light leading-snug"
            style={{ color: "var(--sidebar-ink-soft)" }}
          >
            {config.title}
          </p>
        )}
        {config.institution && (
          <p
            className="text-[11px] text-center mt-1 uppercase tracking-wider"
            style={{ color: "var(--sidebar-ink-soft)", opacity: 0.8 }}
          >
            {config.institution}
          </p>
        )}
      </motion.div>

      {/* Nav */}
      <nav className="flex-1 w-full space-y-1">
        {SECTIONS.map((s) => {
          const isActive = active === s.id;
          return (
            <button
              key={s.id}
              onClick={() => scrollTo(s.id)}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-200 text-left"
              style={{
                background: isActive ? "rgba(255,255,255,0.12)" : "transparent",
                color: isActive ? "#fff" : "var(--sidebar-ink-soft)",
                fontWeight: isActive ? 600 : 400,
                borderLeft: isActive
                  ? "2px solid var(--matcha)"
                  : "2px solid transparent",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full transition-all"
                style={{
                  background: isActive ? "var(--matcha)" : "var(--sidebar-ink-soft)",
                  opacity: isActive ? 1 : 0.4,
                }}
              />
              {t[s.key]}
            </button>
          );
        })}
      </nav>

      {/* CV download */}
      {config.cv_filename && (
        <a
          href={`/uploads/${config.cv_filename}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-matcha mt-6 mb-5 px-4 py-2.5 rounded-full text-sm font-semibold text-center"
        >
          ↓ {t.downloadCV}
        </a>
      )}

      {/* Controls: theme + language */}
      <div
        className="flex items-center justify-between gap-2 p-2 rounded-xl mb-5"
        style={{ background: "rgba(255,255,255,0.08)" }}
      >
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors hover:bg-white/10"
          style={{ color: "var(--sidebar-ink)" }}
          aria-label="Toggle theme"
        >
          {theme === "light" ? "🌙" : "☀️"}
          <span className="text-xs">{theme === "light" ? "Dark" : "Light"}</span>
        </button>
        {/* Language */}
        <div className="flex gap-1">
          {(["en", "cn"] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className="text-xs px-2.5 py-1 rounded-md transition-colors"
              style={{
                background: lang === l ? "var(--matcha)" : "transparent",
                color: lang === l ? "#fff" : "var(--sidebar-ink-soft)",
                fontWeight: lang === l ? 600 : 400,
              }}
            >
              {l === "en" ? "EN" : "中文"}
            </button>
          ))}
        </div>
      </div>

      {/* Contact / social */}
      <div
        className="pt-5 space-y-3 text-sm"
        style={{ borderTop: "1px solid rgba(255,255,255,0.12)" }}
      >
        {config.location && (
          <div className="flex items-center gap-3" style={{ color: "var(--sidebar-ink-soft)" }}>
            <span>📍</span>
            <span className="font-light">{config.location}</span>
          </div>
        )}
        {config.email && (
          <a
            href={`mailto:${config.email}`}
            className="flex items-center gap-3 transition-colors hover:opacity-80"
            style={{ color: "var(--sidebar-ink-soft)" }}
          >
            <span>✉️</span>
            <span className="truncate font-light">{config.email}</span>
          </a>
        )}
        <div className="flex gap-4 pt-2 justify-center">
          {config.github && (
            <a href={config.github} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform" style={{ color: "var(--sidebar-ink)" }} aria-label="GitHub">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" /></svg>
            </a>
          )}
          {config.linkedin && (
            <a href={config.linkedin} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform" style={{ color: "var(--sidebar-ink)" }} aria-label="LinkedIn">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
            </a>
          )}
        </div>
      </div>
    </aside>
  );
}
