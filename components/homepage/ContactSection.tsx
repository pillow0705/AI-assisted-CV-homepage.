"use client";
import { motion } from "framer-motion";
import { useUI } from "@/components/providers/ThemeLanguageProvider";
import type { SiteConfig } from "@/types";

interface ContactSectionProps {
  config: Partial<SiteConfig>;
  onOpenChat: () => void;
}

export default function ContactSection({ config, onOpenChat }: ContactSectionProps) {
  const { t } = useUI();
  return (
    <motion.section
      id="contact"
      className="scroll-mt-24 text-center py-10"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6 }}
    >
      <h2 className="text-3xl font-bold mb-4 gradient-text font-serif-display">{t.getInTouch}</h2>
      <p className="mb-10 max-w-md mx-auto" style={{ color: "var(--ink-soft)" }}>
        {t.contactBlurb}
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
        {config.email && (
          <a
            href={`mailto:${config.email}`}
            className="px-8 py-3.5 rounded-full font-semibold transition-all duration-300"
            style={{ background: "var(--surface)", color: "var(--ink-soft)", border: "1px solid var(--border)" }}
          >
            ✉️ {t.sendEmail}
          </a>
        )}
        <button onClick={onOpenChat} className="btn-matcha px-8 py-3.5 rounded-full font-semibold">
          ✦ {t.askMyAI}
        </button>
      </div>

      <div className="flex justify-center gap-6 text-sm" style={{ color: "var(--ink-faint)" }}>
        {config.github && (
          <a href={config.github} target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">GitHub</a>
        )}
        {config.linkedin && (
          <a href={config.linkedin} target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">LinkedIn</a>
        )}
        {config.twitter && (
          <a href={config.twitter} target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">Twitter</a>
        )}
      </div>

      <p className="mt-16 text-xs" style={{ color: "var(--ink-faint)" }}>{t.builtWith}</p>
    </motion.section>
  );
}
