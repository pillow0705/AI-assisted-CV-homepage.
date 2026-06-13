"use client";
import { motion } from "framer-motion";
import TypewriterText from "@/components/ui/TypewriterText";
import type { SiteConfig } from "@/types";

interface HeroSectionProps {
  config: Partial<SiteConfig>;
}

export default function HeroSection({ config }: HeroSectionProps) {
  const taglines = config.tagline
    ? [config.tagline, ...(config.title ? [`${config.title}`, `Based in ${config.location || "the World"}`] : [])]
    : ["Researcher. Developer. Creator.", "Building the future.", "Let's connect."];

  const scrollToChat = () => {
    document.getElementById("chat-trigger")?.click();
  };

  const scrollToAbout = () => {
    document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 pt-20">
      <div className="text-center max-w-4xl mx-auto z-10">
        {/* Avatar */}
        {config.avatar_url && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="mb-8 flex justify-center"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-full animate-glow-pulse" />
              <img
                src={config.avatar_url}
                alt={config.name}
                className="w-28 h-28 rounded-full object-cover border-2 border-purple-500/50 relative z-10"
              />
            </div>
          </motion.div>
        )}

        {/* Name */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold mb-4 tracking-tight"
        >
          <span className="gradient-text">{config.name || "Your Name"}</span>
        </motion.h1>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="text-xl md:text-2xl text-slate-300 font-medium mb-2"
        >
          {config.title || "Professional Title"}
        </motion.div>

        {/* Location / Institution */}
        {(config.institution || config.location) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="text-slate-400 text-sm mb-6 flex items-center justify-center gap-2"
          >
            <span>📍</span>
            <span>
              {[config.institution, config.location].filter(Boolean).join(" · ")}
            </span>
          </motion.div>
        )}

        {/* Typewriter */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="text-lg md:text-xl text-purple-300 min-h-[2rem] mb-10"
        >
          <TypewriterText texts={taglines} speed={55} pause={2200} />
        </motion.div>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button
            onClick={scrollToChat}
            className="btn-glow px-8 py-3.5 rounded-full text-white font-semibold text-lg"
          >
            ✦ Chat with my AI
          </button>
          <button
            onClick={scrollToAbout}
            className="px-8 py-3.5 rounded-full text-slate-300 font-semibold text-lg border border-white/10 hover:border-purple-500/50 hover:text-white transition-all duration-300 hover:bg-white/5"
          >
            Learn More ↓
          </button>
        </motion.div>

        {/* Social links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-10 flex items-center justify-center gap-6"
        >
          {config.github && (
            <a
              href={config.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-purple-400 transition-colors duration-200 text-sm flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              GitHub
            </a>
          )}
          {config.linkedin && (
            <a
              href={config.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-blue-400 transition-colors duration-200 text-sm flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              LinkedIn
            </a>
          )}
          {config.email && (
            <a
              href={`mailto:${config.email}`}
              className="text-slate-400 hover:text-pink-400 transition-colors duration-200 text-sm flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Email
            </a>
          )}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-slate-500 text-xs"
      >
        <span>scroll</span>
        <div className="w-px h-8 bg-gradient-to-b from-slate-500 to-transparent animate-pulse" />
      </motion.div>
    </section>
  );
}
