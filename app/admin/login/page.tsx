"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import FloatingOrbs from "@/components/ui/FloatingOrbs";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      setError("Invalid password.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      <FloatingOrbs />
      <div
        className="w-full max-w-sm rounded-2xl p-8 relative z-10"
        style={{
          background: "rgba(15,12,30,0.9)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(168,85,247,0.2)",
        }}
      >
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-xl mx-auto mb-3">🔐</div>
          <h1 className="text-xl font-bold text-white">Admin Login</h1>
          <p className="text-slate-500 text-sm mt-1">Enter your admin password</p>
        </div>
        <form onSubmit={login}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 outline-none focus:border-purple-500/60 transition-all text-sm mb-3"
            autoFocus
          />
          {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full btn-glow py-3 rounded-xl text-white font-semibold disabled:opacity-40"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <a href="/" className="block text-center text-slate-600 text-xs mt-4 hover:text-slate-400 transition-colors">← Back to homepage</a>
      </div>
    </div>
  );
}
