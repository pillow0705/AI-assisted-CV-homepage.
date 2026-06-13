"use client";
import { motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import type { SiteConfig } from "@/types";

interface AboutSectionProps {
  config: Partial<SiteConfig>;
}

export default function AboutSection({ config }: AboutSectionProps) {
  if (!config.about) return null;

  return (
    <section id="about" className="py-20 px-4 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7 }}
      >
        <h2 className="text-3xl font-bold mb-10 gradient-text">About Me</h2>
        <GlassCard gradient className="flex flex-col md:flex-row gap-8 items-start">
          {config.avatar_url && (
            <img
              src={config.avatar_url}
              alt={config.name}
              className="w-32 h-32 rounded-2xl object-cover border border-purple-500/30 flex-shrink-0"
            />
          )}
          <div>
            <p className="text-slate-300 leading-relaxed text-lg whitespace-pre-wrap">{config.about}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              {config.institution && (
                <span className="px-3 py-1 rounded-full text-sm bg-purple-500/15 text-purple-300 border border-purple-500/20">
                  🏛 {config.institution}
                </span>
              )}
              {config.location && (
                <span className="px-3 py-1 rounded-full text-sm bg-blue-500/15 text-blue-300 border border-blue-500/20">
                  📍 {config.location}
                </span>
              )}
              {config.email && (
                <a
                  href={`mailto:${config.email}`}
                  className="px-3 py-1 rounded-full text-sm bg-pink-500/15 text-pink-300 border border-pink-500/20 hover:bg-pink-500/25 transition-colors"
                >
                  ✉ {config.email}
                </a>
              )}
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </section>
  );
}
