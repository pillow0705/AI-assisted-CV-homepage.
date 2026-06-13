"use client";
import { useState } from "react";
import ContactSection from "@/components/homepage/ContactSection";
import ChatWidget from "@/components/chat/ChatWidget";
import type { SiteConfig } from "@/types";

interface HomepageClientProps {
  config: Partial<SiteConfig>;
  suggestedQuestions: string[];
}

export default function HomepageClient({ config, suggestedQuestions }: HomepageClientProps) {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <>
      <ContactSection config={config} onOpenChat={() => setChatOpen(true)} />
      <ChatWidget
        ownerName={config.name || "the owner"}
        aiProvider={config.ai_provider || "openai"}
        suggestedQuestions={suggestedQuestions}
        isOpen={chatOpen}
        onOpenChange={setChatOpen}
      />
    </>
  );
}
