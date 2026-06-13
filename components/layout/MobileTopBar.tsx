"use client";
import { useState } from "react";
import { useUI } from "@/components/providers/ThemeLanguageProvider";
import type { SiteConfig } from "@/types";

const SECTIONS = [
  { id: "about", key: "about" as const },
  { id: "education", key: "education" as const },
  { id: "experience", key: "experience" as const },
  { id: "skills", key: "skills" as const },
  { id: "honors", key: "honors" as const },
  { id: "projects", key: "projects" as const },
  { id: "contact", key: "contactMe" as const },
];

export default function MobileTopBar({ config }: { config: Partial<SiteConfig> }) {
  const { theme, toggleTheme, lang, setLang, t } = useUI();
  const [open, setOpen] = useState(false);

  const go = (id: string) => {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="md:hidden sticky top-0 z-40" style={{ background: "var(--sidebar-bg)", color: "var(--sidebar-ink)" }}>
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2.5 min-w-0">
          {config.avatar_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={config.avatar_url} alt={config.name} className="w-8 h-8 rounded-full object-cover" />
          )}
          <span className="font-semibold font-serif-display truncate">{config.name}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={toggleTheme} className="px-2 py-1 rounded-lg hover:bg-white/10" aria-label="Toggle theme">
            {theme === "light" ? "🌙" : "☀️"}
          </button>
          {(["en", "cn"] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className="text-xs px-2 py-1 rounded-md"
              style={{ background: lang === l ? "var(--matcha)" : "transparent", color: lang === l ? "#fff" : "var(--sidebar-ink-soft)" }}
            >
              {l === "en" ? "EN" : "中"}
            </button>
          ))}
          <button onClick={() => setOpen((o) => !o)} className="px-2 py-1 rounded-lg hover:bg-white/10 text-lg" aria-label="Menu">
            {open ? "✕" : "☰"}
          </button>
        </div>
      </div>
      {open && (
        <nav className="px-4 pb-3 grid grid-cols-2 gap-1" style={{ borderTop: "1px solid rgba(255,255,255,0.12)" }}>
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => go(s.id)}
              className="text-left px-3 py-2 rounded-lg text-sm hover:bg-white/10"
              style={{ color: "var(--sidebar-ink-soft)" }}
            >
              {t[s.key]}
            </button>
          ))}
          {config.cv_filename && (
            <a
              href={`/uploads/${config.cv_filename}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-left px-3 py-2 rounded-lg text-sm col-span-2 text-center btn-matcha mt-1"
            >
              ↓ {t.downloadCV}
            </a>
          )}
        </nav>
      )}
    </div>
  );
}
