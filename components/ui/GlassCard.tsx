import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
}

/** Cream surface card (formerly glassmorphism). Keeps the same API. */
export default function GlassCard({ children, className = "", hover = false }: GlassCardProps) {
  return (
    <div
      className={`
        cream-card p-6
        ${hover ? "hover:-translate-y-1 hover:shadow-glow-matcha cursor-default" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
