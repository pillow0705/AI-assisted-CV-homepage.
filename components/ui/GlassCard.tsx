import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
}

export default function GlassCard({ children, className = "", hover = false, gradient = false }: GlassCardProps) {
  return (
    <div
      className={`
        glass-card p-6
        ${hover ? "transition-all duration-300 hover:bg-white/[0.07] hover:border-white/20 hover:-translate-y-1 hover:shadow-glow cursor-default" : ""}
        ${gradient ? "gradient-border" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
