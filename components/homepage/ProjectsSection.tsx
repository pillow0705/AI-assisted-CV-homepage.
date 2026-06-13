"use client";
import { motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import { useUI } from "@/components/providers/ThemeLanguageProvider";
import type { Project } from "@/types";

export default function ProjectsSection({ projects }: { projects: Project[] }) {
  const { t } = useUI();
  if (!projects.length) return null;

  return (
    <motion.section
      id="projects"
      className="scroll-mt-24"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-center gap-3 pb-3 mb-8" style={{ borderBottom: "1px solid var(--border)" }}>
        <span className="text-2xl">📦</span>
        <h2 className="text-2xl font-bold font-serif-display" style={{ color: "var(--ink)" }}>{t.projects}</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {projects.map((project, i) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="h-full"
          >
            <GlassCard hover className="h-full flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                  style={{ background: "var(--matcha-soft)" }}
                >
                  🌱
                </div>
                {project.url && (
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors"
                    style={{ color: "var(--ink-faint)" }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
              </div>
              <h3 className="font-semibold mb-2" style={{ color: "var(--ink)" }}>{project.title}</h3>
              <p className="text-sm leading-relaxed flex-1" style={{ color: "var(--ink-soft)" }}>
                {project.description}
              </p>
              {project.tech_stack && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {project.tech_stack.split(",").map((tech) => (
                    <span
                      key={tech.trim()}
                      className="px-2 py-0.5 rounded text-xs"
                      style={{ background: "var(--matcha-soft)", color: "var(--matcha-deep)", border: "1px solid var(--border)" }}
                    >
                      {tech.trim()}
                    </span>
                  ))}
                </div>
              )}
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
