"use client";
import { useEffect, useState } from "react";

interface TypewriterTextProps {
  texts: string[];
  className?: string;
  speed?: number;
  pause?: number;
}

export default function TypewriterText({
  texts,
  className = "",
  speed = 60,
  pause = 2000,
}: TypewriterTextProps) {
  const [displayText, setDisplayText] = useState("");
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!texts.length) return;
    const current = texts[textIndex];

    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          if (charIndex < current.length) {
            setDisplayText(current.slice(0, charIndex + 1));
            setCharIndex((c) => c + 1);
          } else {
            setTimeout(() => setIsDeleting(true), pause);
          }
        } else {
          if (charIndex > 0) {
            setDisplayText(current.slice(0, charIndex - 1));
            setCharIndex((c) => c - 1);
          } else {
            setIsDeleting(false);
            setTextIndex((i) => (i + 1) % texts.length);
          }
        }
      },
      isDeleting ? speed / 2 : speed
    );

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, textIndex, texts, speed, pause]);

  return (
    <span className={className}>
      {displayText}
      <span className="animate-pulse text-purple-400">|</span>
    </span>
  );
}
