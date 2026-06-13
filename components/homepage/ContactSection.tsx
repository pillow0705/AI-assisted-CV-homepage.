"use client";
import { motion } from "framer-motion";
import type { SiteConfig } from "@/types";

interface ContactSectionProps {
  config: Partial<SiteConfig>;
  onOpenChat: () => void;
}

export default function ContactSection({ config, onOpenChat }: ContactSectionProps) {
  return (
    <section id="contact" className="py-24 px-4 max-w-5xl mx-auto text-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7 }}
      >
        <h2 className="text-3xl font-bold mb-4 gradient-text">Get in Touch</h2>
        <p className="text-slate-400 mb-10 max-w-md mx-auto">
          Whether you have a question, want to collaborate, or just want to say hello — feel free to reach out.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          {config.email && (
            <a
              href={`mailto:${config.email}`}
              className="px-8 py-3.5 rounded-full text-white font-semibold border border-purple-500/40 hover:border-purple-400 hover:bg-purple-500/10 transition-all duration-300"
            >
              ✉ Send an Email
            </a>
          )}
          <button
            onClick={onOpenChat}
            className="btn-glow px-8 py-3.5 rounded-full text-white font-semibold"
          >
            ✦ Ask my AI Assistant
          </button>
        </div>

        <div className="flex justify-center gap-6 text-slate-500 text-sm">
          {config.github && (
            <a href={config.github} target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 transition-colors">GitHub</a>
          )}
          {config.linkedin && (
            <a href={config.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">LinkedIn</a>
          )}
          {config.twitter && (
            <a href={config.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-pink-400 transition-colors">Twitter</a>
          )}
        </div>

        <p className="mt-16 text-slate-700 text-xs">
          Built with ♥ · Powered by AI
        </p>
      </motion.div>
    </section>
  );
}
