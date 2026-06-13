"use client";
import { motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import type { Honor } from "@/types";

export default function HonorsSection({ honors }: { honors: Honor[] }) {
  if (!honors.length) return null;

  return (
    <section id="honors" className="py-20 px-4 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7 }}
      >
        <h2 className="text-3xl font-bold mb-10 gradient-text">Honors & Awards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {honors.map((honor, i) => (
            <motion.div
              key={honor.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <GlassCard hover className="h-full">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500/30 to-purple-500/30 flex items-center justify-center flex-shrink-0 text-lg">
                    🏆
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white text-sm leading-tight mb-1">{honor.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span>{honor.issuer}</span>
                      <span className="text-purple-500">·</span>
                      <span className="text-purple-400">{honor.year}</span>
                    </div>
                    {honor.description && (
                      <p className="mt-2 text-xs text-slate-500 leading-relaxed">{honor.description}</p>
                    )}
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
