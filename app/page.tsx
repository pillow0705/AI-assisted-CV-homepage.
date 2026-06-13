import { getSiteConfig, getHonors, getProjects } from "@/lib/config";
import { isSetupComplete } from "@/lib/db";
import { redirect } from "next/navigation";
import AnimatedBackground from "@/components/ui/AnimatedBackground";
import FloatingOrbs from "@/components/ui/FloatingOrbs";
import HeroSection from "@/components/homepage/HeroSection";
import AboutSection from "@/components/homepage/AboutSection";
import HonorsSection from "@/components/homepage/HonorsSection";
import ProjectsSection from "@/components/homepage/ProjectsSection";
import HomepageClient from "./HomepageClient";

export const dynamic = "force-dynamic";

export default function HomePage() {
  if (!isSetupComplete()) {
    redirect("/setup");
  }

  const config = getSiteConfig();
  const honors = getHonors();
  const projects = getProjects();

  const suggestedQuestions = config.suggested_questions
    ? config.suggested_questions.split("\n").map((q) => q.trim()).filter(Boolean).slice(0, 3)
    : [];

  return (
    <main className="relative">
      <AnimatedBackground />
      <FloatingOrbs />

      <div className="relative z-10">
        <HeroSection config={config} />
        <AboutSection config={config} />
        <HonorsSection honors={honors} />
        <ProjectsSection projects={projects} />
        <HomepageClient
          config={config}
          suggestedQuestions={suggestedQuestions}
        />
      </div>
    </main>
  );
}
