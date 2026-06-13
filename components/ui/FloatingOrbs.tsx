"use client";
export default function FloatingOrbs() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Top-left pink orb */}
      <div
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20 animate-float-slow"
        style={{
          background: "radial-gradient(circle, #F472B6, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      {/* Center-right purple orb */}
      <div
        className="absolute top-1/3 -right-24 w-80 h-80 rounded-full opacity-15 animate-float-medium"
        style={{
          background: "radial-gradient(circle, #A855F7, transparent 70%)",
          filter: "blur(50px)",
          animationDelay: "2s",
        }}
      />
      {/* Bottom-center blue orb */}
      <div
        className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[600px] h-64 rounded-full opacity-10 animate-float-fast"
        style={{
          background: "radial-gradient(circle, #60A5FA, transparent 70%)",
          filter: "blur(60px)",
          animationDelay: "4s",
        }}
      />
      {/* Small accent orbs */}
      <div
        className="absolute top-1/2 left-1/4 w-48 h-48 rounded-full opacity-10 animate-float-medium"
        style={{
          background: "radial-gradient(circle, #C084FC, transparent 70%)",
          filter: "blur(30px)",
          animationDelay: "1s",
        }}
      />
    </div>
  );
}
