"use client";
import { motion } from "framer-motion";
import { useUI } from "@/components/providers/ThemeLanguageProvider";
import type { SiteConfig } from "@/types";

interface AboutSectionProps {
  config: Partial<SiteConfig>;
}

/** Render **bold** markdown inline. */
function renderInline(text: string) {
  return text.split(/(\*\*.*?\*\*)/).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} style={{ color: "var(--ink)", fontWeight: 600 }}>
        {part.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

export default function AboutSection({ config }: AboutSectionProps) {
  const { t } = useUI();
  if (!config.about) return null;

  return (
    <motion.section
      id="about"
      className="scroll-mt-24"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6 }}
    >
      <h1 className="text-4xl md:text-5xl font-bold font-serif-display tracking-tight mb-6" style={{ color: "var(--ink)" }}>
        {t.about === "About" ? (
          <>Hi, I&apos;m <span className="gradient-text">{config.name}</span>.</>
        ) : (
          <>你好，我是 <span className="gradient-text">{config.name}</span>。</>
        )}
      </h1>
      <div className="space-y-4 text-lg leading-relaxed font-serif-display" style={{ color: "var(--ink-soft)" }}>
        {config.about.split("\n").map((line, i) =>
          line.trim() ? <p key={i}>{renderInline(line)}</p> : null
        )}
      </div>
      <div className="mt-7 flex flex-wrap gap-3">
        {config.cv_filename && (
          <a
            href={`/uploads/${config.cv_filename}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-matcha inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium text-sm"
          >
            ↓ {t.downloadCV}
          </a>
        )}
        {config.email && (
          <a
            href={`mailto:${config.email}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium text-sm transition-colors"
            style={{ background: "var(--surface)", color: "var(--ink-soft)", border: "1px solid var(--border)" }}
          >
            ✉️ {t.contactMe}
          </a>
        )}
      </div>
    </motion.section>
  );
}
