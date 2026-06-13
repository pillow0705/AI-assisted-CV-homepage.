"use client";
import { useState } from "react";
import { useUI } from "@/components/providers/ThemeLanguageProvider";
import { localize } from "@/lib/localize";
import Sidebar from "@/components/layout/Sidebar";
import AnimatedBackground from "@/components/ui/AnimatedBackground";
import FloatingOrbs from "@/components/ui/FloatingOrbs";
import AboutSection from "@/components/homepage/AboutSection";
import CVSections from "@/components/homepage/CVSections";
import HonorsSection from "@/components/homepage/HonorsSection";
import ProjectsSection from "@/components/homepage/ProjectsSection";
import ContactSection from "@/components/homepage/ContactSection";
import ChatWidget from "@/components/chat/ChatWidget";
import MobileTopBar from "@/components/layout/MobileTopBar";
import type { SiteConfig, Honor, Project, CVSection } from "@/types";

interface HomeShellProps {
  config: Partial<SiteConfig>;
  honors: Honor[];
  projects: Project[];
  cvSections: CVSection[];
  suggestedQuestions: string[];
}

export default function HomeShell({
  config: rawConfig,
  honors: rawHonors,
  projects: rawProjects,
  cvSections: rawCV,
  suggestedQuestions,
}: HomeShellProps) {
  const [chatOpen, setChatOpen] = useState(false);
  const { lang } = useUI();

  // Apply the Chinese overlay when the language is 中文.
  const { config, honors, projects, cvSections } = localize(
    lang,
    rawConfig,
    rawHonors,
    rawProjects,
    rawCV
  );

  return (
    <div className="relative min-h-screen animated-cream-bg">
      <AnimatedBackground />
      <FloatingOrbs />

      {/* Desktop sidebar */}
      <Sidebar config={config} />
      {/* Mobile top bar (sidebar collapses) */}
      <MobileTopBar config={config} />

      {/* Main content column, offset for the fixed sidebar on desktop */}
      <main className="relative z-10 md:ml-72">
        <div className="max-w-3xl mx-auto px-6 md:px-12 py-16 md:py-24 space-y-20">
          <AboutSection config={config} />
          <CVSections sections={cvSections} />
          <HonorsSection honors={honors} />
          <ProjectsSection projects={projects} />
          <ContactSection config={config} onOpenChat={() => setChatOpen(true)} />
        </div>
      </main>

      <ChatWidget
        ownerName={config.name || "the owner"}
        aiProvider={config.ai_provider || "openai"}
        suggestedQuestions={suggestedQuestions}
        isOpen={chatOpen}
        onOpenChange={setChatOpen}
      />
    </div>
  );
}
