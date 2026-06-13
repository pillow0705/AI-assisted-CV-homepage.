"use client";
import { motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import { useUI } from "@/components/providers/ThemeLanguageProvider";
import type { Honor } from "@/types";

export default function HonorsSection({ honors }: { honors: Honor[] }) {
  const { t } = useUI();
  if (!honors.length) return null;

  return (
    <motion.section
      id="honors"
      className="scroll-mt-24"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-center gap-3 pb-3 mb-8" style={{ borderBottom: "1px solid var(--border)" }}>
        <span className="text-2xl">🏆</span>
        <h2 className="text-2xl font-bold font-serif-display" style={{ color: "var(--ink)" }}>{t.honors}</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {honors.map((honor, i) => (
          <motion.div
            key={honor.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.06 }}
          >
            <GlassCard hover className="h-full">
              <div className="flex items-start gap-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
                  style={{ background: "var(--matcha-soft)" }}
                >
                  🏅
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm leading-tight mb-1" style={{ color: "var(--ink)" }}>
                    {honor.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs" style={{ color: "var(--ink-faint)" }}>
                    <span>{honor.issuer}</span>
                    <span style={{ color: "var(--matcha)" }}>·</span>
                    <span style={{ color: "var(--matcha-deep)" }}>{honor.year}</span>
                  </div>
                  {honor.description && (
                    <p className="mt-2 text-xs leading-relaxed" style={{ color: "var(--ink-soft)" }}>
                      {honor.description}
                    </p>
                  )}
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
