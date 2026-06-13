"use client";
import { motion } from "framer-motion";
import { useUI } from "@/components/providers/ThemeLanguageProvider";
import type { CVSection } from "@/types";

interface Entry {
  title?: string;
  subtitle?: string;
  institution?: string;
  date_range?: string;
  description?: string;
  bullets?: string[];
}

function parse(section: CVSection): Entry {
  try {
    return JSON.parse(section.content_json) as Entry;
  } catch {
    return {};
  }
}

function SectionHeader({ icon, title }: { icon: string; title: string }) {
  return (
    <div
      className="flex items-center gap-3 pb-3 mb-8"
      style={{ borderBottom: "1px solid var(--border)" }}
    >
      <span className="text-2xl">{icon}</span>
      <h2 className="text-2xl font-bold font-serif-display" style={{ color: "var(--ink)" }}>
        {title}
      </h2>
    </div>
  );
}

function TimelineItem({ entry, last }: { entry: Entry; last: boolean }) {
  return (
    <div className="group flex gap-5 relative">
      {/* date column */}
      <div className="w-28 shrink-0 pt-1 text-right hidden sm:block">
        <span
          className="text-xs font-bold uppercase tracking-wide transition-colors"
          style={{ color: "var(--ink-faint)" }}
        >
          {entry.date_range}
        </span>
      </div>
      {/* line + dot */}
      <div className="relative shrink-0 flex flex-col items-center">
        <span
          className="w-3 h-3 rounded-full mt-1.5 z-10 transition-transform group-hover:scale-125"
          style={{ background: "var(--surface)", border: "3px solid var(--matcha)" }}
        />
        {!last && <span className="w-px flex-1 -mt-1" style={{ background: "var(--border)" }} />}
      </div>
      {/* content */}
      <div className="flex-1 pb-8">
        <span className="text-xs font-bold uppercase tracking-wide sm:hidden block mb-1" style={{ color: "var(--ink-faint)" }}>
          {entry.date_range}
        </span>
        <h3 className="text-lg font-bold transition-colors" style={{ color: "var(--ink)" }}>
          {entry.title}
        </h3>
        {(entry.institution || entry.subtitle) && (
          <div className="font-medium mt-0.5" style={{ color: "var(--ink-soft)" }}>
            {entry.institution}
            {entry.subtitle && (
              <span className="font-normal" style={{ color: "var(--ink-faint)" }}>
                {entry.institution ? " — " : ""}
                {entry.subtitle}
              </span>
            )}
          </div>
        )}
        {entry.description && (
          <p className="text-sm mt-1" style={{ color: "var(--ink-soft)" }}>{entry.description}</p>
        )}
        {entry.bullets && entry.bullets.length > 0 && (
          <ul className="list-disc list-outside ml-4 space-y-1 mt-2 text-sm leading-relaxed" style={{ color: "var(--ink-soft)" }}>
            {entry.bullets.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function CVSections({ sections }: { sections: CVSection[] }) {
  const { t } = useUI();
  if (!sections.length) return null;

  const education = sections.filter((s) => s.section_type === "education");
  const experience = sections.filter((s) => s.section_type === "experience");
  const skills = sections.filter((s) => s.section_type === "skill");

  const block = (icon: string, title: string, items: CVSection[], id: string) => {
    if (!items.length) return null;
    return (
      <motion.section
        id={id}
        className="scroll-mt-24"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
      >
        <SectionHeader icon={icon} title={title} />
        <div>
          {items.map((s, i) => (
            <TimelineItem key={s.id} entry={parse(s)} last={i === items.length - 1} />
          ))}
        </div>
      </motion.section>
    );
  };

  // Skills rendered as tag groups rather than a timeline.
  const skillsBlock = () => {
    if (!skills.length) return null;
    return (
      <motion.section
        id="skills"
        className="scroll-mt-24"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
      >
        <SectionHeader icon="🛠" title={t.skills} />
        <div className="space-y-3">
          {skills.map((s) => {
            const e = parse(s);
            return (e.bullets ?? []).map((line, i) => {
              const [label, rest] = line.includes(":")
                ? [line.slice(0, line.indexOf(":")), line.slice(line.indexOf(":") + 1)]
                : ["", line];
              const items = rest.split(/[,，]/).map((x) => x.trim()).filter(Boolean);
              return (
                <div key={`${s.id}-${i}`} className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-5">
                  {label && (
                    <h3 className="w-28 shrink-0 font-bold" style={{ color: "var(--ink)" }}>{label}</h3>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {items.map((item, j) => (
                      <span
                        key={j}
                        className="px-3 py-1 rounded-full text-sm font-medium"
                        style={{
                          background: "var(--matcha-soft)",
                          color: "var(--matcha-deep)",
                          border: "1px solid var(--border)",
                        }}
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              );
            });
          })}
        </div>
      </motion.section>
    );
  };

  return (
    <div className="space-y-20">
      {block("🎓", t.education, education, "education")}
      {block("💼", t.experience, experience, "experience")}
      {skillsBlock()}
    </div>
  );
}
