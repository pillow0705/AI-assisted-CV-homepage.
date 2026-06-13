import { getSiteConfig, getHonors, getProjects, getCVSections } from "@/lib/config";
import { isSetupComplete } from "@/lib/db";
import { redirect } from "next/navigation";
import HomeShell from "./HomeShell";

export const dynamic = "force-dynamic";

export default function HomePage() {
  if (!isSetupComplete()) {
    redirect("/setup");
  }

  const config = getSiteConfig();
  const honors = getHonors();
  const projects = getProjects();
  const cvSections = getCVSections();

  const suggestedQuestions = config.suggested_questions
    ? config.suggested_questions.split("\n").map((q) => q.trim()).filter(Boolean).slice(0, 4)
    : [];

  return (
    <HomeShell
      config={config}
      honors={honors}
      projects={projects}
      cvSections={cvSections}
      suggestedQuestions={suggestedQuestions}
    />
  );
}
