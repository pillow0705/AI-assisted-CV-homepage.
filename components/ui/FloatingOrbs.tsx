"use client";
export default function FloatingOrbs() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Top-left matcha orb */}
      <div
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-25 animate-float-slow"
        style={{ background: "radial-gradient(circle, #8FBE74, transparent 70%)", filter: "blur(40px)" }}
      />
      {/* Center-right warm-gold orb */}
      <div
        className="absolute top-1/3 -right-24 w-80 h-80 rounded-full opacity-20 animate-float-medium"
        style={{ background: "radial-gradient(circle, #E8D08A, transparent 70%)", filter: "blur(50px)", animationDelay: "2s" }}
      />
      {/* Bottom-center deep-matcha orb */}
      <div
        className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[600px] h-64 rounded-full opacity-15 animate-float-fast"
        style={{ background: "radial-gradient(circle, #6E9F57, transparent 70%)", filter: "blur(60px)", animationDelay: "4s" }}
      />
      {/* Small accent orb */}
      <div
        className="absolute top-1/2 left-1/4 w-48 h-48 rounded-full opacity-15 animate-float-medium"
        style={{ background: "radial-gradient(circle, #A9D38C, transparent 70%)", filter: "blur(30px)", animationDelay: "1s" }}
      />
    </div>
  );
}
