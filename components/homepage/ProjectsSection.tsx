"use client";
import { motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import type { Project } from "@/types";

export default function ProjectsSection({ projects }: { projects: Project[] }) {
  if (!projects.length) return null;

  return (
    <section id="projects" className="py-20 px-4 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7 }}
      >
        <h2 className="text-3xl font-bold mb-10 gradient-text">Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="h-full"
            >
              <GlassCard hover className="h-full flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center text-base flex-shrink-0">
                    🚀
                  </div>
                  {project.url && (
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-500 hover:text-purple-400 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                </div>
                <h3 className="font-semibold text-white mb-2">{project.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed flex-1">{project.description}</p>
                {project.tech_stack && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {project.tech_stack.split(",").map((tech) => (
                      <span
                        key={tech.trim()}
                        className="px-2 py-0.5 rounded text-xs bg-purple-500/15 text-purple-300 border border-purple-500/20"
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
      </motion.div>
    </section>
  );
}
