"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import FloatingOrbs from "@/components/ui/FloatingOrbs";
import type { SetupData, AIProvider } from "@/types";
import { AI_MODELS } from "@/types";

const TOTAL_STEPS = 5;

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${
              i < current
                ? "bg-gradient-to-br from-pink-500 to-purple-500 text-white"
                : i === current
                ? "bg-purple-500/30 border-2 border-purple-500 text-purple-300"
                : "bg-white/5 border border-white/10 text-slate-600"
            }`}
          >
            {i < current ? "✓" : i + 1}
          </div>
          {i < total - 1 && (
            <div className={`h-px w-8 transition-all duration-300 ${i < current ? "bg-purple-500" : "bg-white/10"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function InputField({
  label, name, value, onChange, type = "text", placeholder = "", required = false, textarea = false, rows = 4,
}: {
  label: string; name: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; required?: boolean; textarea?: boolean; rows?: number;
}) {
  const cls = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 outline-none focus:border-purple-500/60 focus:bg-white/7 transition-all text-sm";
  return (
    <div className="mb-4">
      <label className="block text-sm text-slate-300 mb-1.5">
        {label}{required && <span className="text-pink-400 ml-0.5">*</span>}
      </label>
      {textarea ? (
        <textarea className={cls} rows={rows} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      ) : (
        <input className={cls} type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      )}
    </div>
  );
}

export default function SetupPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [data, setData] = useState<SetupData>({
    name: "", title: "", tagline: "", about: "", email: "",
    github: "", linkedin: "", twitter: "", location: "", institution: "",
    ai_provider: "openai", ai_model: "gpt-4o", ai_api_key: "",
    honors: [], projects: [],
    ai_private_notes: "", suggested_questions: "",
    admin_password: "",
  });

  const set = (key: keyof SetupData) => (val: string) =>
    setData((d) => ({ ...d, [key]: val }));

  const addHonor = () =>
    setData((d) => ({ ...d, honors: [...d.honors, { title: "", issuer: "", year: "", description: "" }] }));

  const removeHonor = (i: number) =>
    setData((d) => ({ ...d, honors: d.honors.filter((_, idx) => idx !== i) }));

  const updateHonor = (i: number, key: string, val: string) =>
    setData((d) => {
      const h = [...d.honors];
      h[i] = { ...h[i], [key]: val };
      return { ...d, honors: h };
    });

  const addProject = () =>
    setData((d) => ({ ...d, projects: [...d.projects, { title: "", description: "", url: "", tech_stack: "" }] }));

  const removeProject = (i: number) =>
    setData((d) => ({ ...d, projects: d.projects.filter((_, idx) => idx !== i) }));

  const updateProject = (i: number, key: string, val: string) =>
    setData((d) => {
      const p = [...d.projects];
      p[i] = { ...p[i], [key]: val };
      return { ...d, projects: p };
    });

  const canAdvance = () => {
    if (step === 0) return data.name.trim().length > 0;
    if (step === 1) return data.ai_provider && data.ai_model && data.ai_api_key.trim().length > 0;
    if (step === 4) return data.admin_password.length >= 6;
    return true;
  };

  const submit = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const j = await res.json();
        setError(j.error || "Setup failed");
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const stepVariants = {
    enter: { opacity: 0, x: 30 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
  };

  const stepTitles = ["Identity", "AI Setup", "Public Content", "Private Notes", "Admin Access"];
  const stepSubtitles = [
    "Tell the world who you are",
    "Configure your AI assistant",
    "Add your achievements and projects",
    "Give your AI private context",
    "Secure your admin panel",
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative">
      <FloatingOrbs />

      <div className="w-full max-w-xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/15 border border-purple-500/25 text-purple-300 text-sm mb-4">
            ✦ Setup Wizard
          </div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Welcome!</h1>
          <p className="text-slate-400 text-sm">Let&apos;s set up your AI-assisted homepage in 5 steps.</p>
        </div>

        <div
          className="rounded-2xl p-8"
          style={{
            background: "rgba(15,12,30,0.85)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(168,85,247,0.2)",
          }}
        >
          <StepIndicator current={step} total={TOTAL_STEPS} />

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white">
              {stepTitles[step]}
            </h2>
            <p className="text-slate-500 text-sm mt-0.5">{stepSubtitles[step]}</p>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.22 }}
            >
              {step === 0 && (
                <div>
                  <InputField label="Full Name" name="name" value={data.name} onChange={set("name")} required placeholder="Jane Doe" />
                  <InputField label="Professional Title" name="title" value={data.title} onChange={set("title")} placeholder="PhD Candidate in Computer Science" />
                  <InputField label="Tagline" name="tagline" value={data.tagline} onChange={set("tagline")} placeholder="Building AI systems for a better world" />
                  <InputField label="About Me" name="about" value={data.about} onChange={set("about")} textarea rows={4} placeholder="Write a brief bio that visitors and your AI will use..." />
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="Email" name="email" value={data.email} onChange={set("email")} type="email" placeholder="jane@example.com" />
                    <InputField label="Location" name="location" value={data.location || ""} onChange={set("location")} placeholder="New York, USA" />
                  </div>
                  <InputField label="Institution / Company" name="institution" value={data.institution || ""} onChange={set("institution")} placeholder="MIT · FAANG" />
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="GitHub URL" name="github" value={data.github || ""} onChange={set("github")} placeholder="https://github.com/..." />
                    <InputField label="LinkedIn URL" name="linkedin" value={data.linkedin || ""} onChange={set("linkedin")} placeholder="https://linkedin.com/in/..." />
                  </div>
                </div>
              )}

              {step === 1 && (
                <div>
                  <div className="mb-4">
                    <label className="block text-sm text-slate-300 mb-2">AI Provider <span className="text-pink-400">*</span></label>
                    <div className="grid grid-cols-3 gap-3">
                      {(["openai", "anthropic", "deepseek"] as AIProvider[]).map((p) => (
                        <button
                          key={p}
                          onClick={() => {
                            const defaultModel = AI_MODELS[p][0].id;
                            setData((d) => ({ ...d, ai_provider: p, ai_model: defaultModel }));
                          }}
                          className={`py-3 rounded-xl border text-sm font-medium transition-all ${
                            data.ai_provider === p
                              ? "border-purple-500 bg-purple-500/20 text-purple-300"
                              : "border-white/10 bg-white/3 text-slate-400 hover:border-white/20"
                          }`}
                        >
                          {p === "openai" ? "OpenAI" : p === "anthropic" ? "Claude" : "DeepSeek"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm text-slate-300 mb-1.5">Model</label>
                    <select
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-purple-500/60 transition-all text-sm"
                      value={data.ai_model}
                      onChange={(e) => setData((d) => ({ ...d, ai_model: e.target.value }))}
                    >
                      {AI_MODELS[data.ai_provider].map((m) => (
                        <option key={m.id} value={m.id} className="bg-[#0a0a14]">{m.label}</option>
                      ))}
                    </select>
                  </div>

                  <InputField
                    label="API Key"
                    name="ai_api_key"
                    value={data.ai_api_key}
                    onChange={set("ai_api_key")}
                    type="password"
                    required
                    placeholder="sk-..."
                  />
                  <p className="text-xs text-slate-600 -mt-2 mb-4">
                    Your API key is stored securely on your server and never exposed to visitors.
                  </p>
                </div>
              )}

              {step === 2 && (
                <div>
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-slate-300">Honors & Awards</h3>
                      <button onClick={addHonor} className="text-xs text-purple-400 hover:text-purple-300 border border-purple-500/30 px-3 py-1 rounded-lg transition-colors">+ Add</button>
                    </div>
                    {data.honors.map((h, i) => (
                      <div key={i} className="mb-3 p-4 rounded-xl bg-white/3 border border-white/8">
                        <div className="flex gap-2 mb-2">
                          <input className="flex-1 bg-transparent border-b border-white/10 text-white text-sm py-1 outline-none focus:border-purple-500/60 placeholder-slate-600" placeholder="Honor title" value={h.title} onChange={(e) => updateHonor(i, "title", e.target.value)} />
                          <button onClick={() => removeHonor(i)} className="text-red-400/60 hover:text-red-400 text-xs">✕</button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input className="bg-transparent border-b border-white/10 text-white text-xs py-1 outline-none focus:border-purple-500/60 placeholder-slate-600" placeholder="Issuer" value={h.issuer} onChange={(e) => updateHonor(i, "issuer", e.target.value)} />
                          <input className="bg-transparent border-b border-white/10 text-white text-xs py-1 outline-none focus:border-purple-500/60 placeholder-slate-600" placeholder="Year" value={h.year} onChange={(e) => updateHonor(i, "year", e.target.value)} />
                        </div>
                      </div>
                    ))}
                    {!data.honors.length && <p className="text-slate-600 text-xs text-center py-4">No honors yet. Click &quot;+ Add&quot; to begin.</p>}
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-slate-300">Projects</h3>
                      <button onClick={addProject} className="text-xs text-blue-400 hover:text-blue-300 border border-blue-500/30 px-3 py-1 rounded-lg transition-colors">+ Add</button>
                    </div>
                    {data.projects.map((p, i) => (
                      <div key={i} className="mb-3 p-4 rounded-xl bg-white/3 border border-white/8">
                        <div className="flex gap-2 mb-2">
                          <input className="flex-1 bg-transparent border-b border-white/10 text-white text-sm py-1 outline-none focus:border-purple-500/60 placeholder-slate-600" placeholder="Project name" value={p.title} onChange={(e) => updateProject(i, "title", e.target.value)} />
                          <button onClick={() => removeProject(i)} className="text-red-400/60 hover:text-red-400 text-xs">✕</button>
                        </div>
                        <textarea className="w-full bg-transparent text-white text-xs py-1 outline-none focus:border-purple-500/60 placeholder-slate-600 resize-none" rows={2} placeholder="Description" value={p.description} onChange={(e) => updateProject(i, "description", e.target.value)} />
                        <div className="grid grid-cols-2 gap-2 mt-1">
                          <input className="bg-transparent border-b border-white/10 text-white text-xs py-1 outline-none placeholder-slate-600" placeholder="URL (optional)" value={p.url || ""} onChange={(e) => updateProject(i, "url", e.target.value)} />
                          <input className="bg-transparent border-b border-white/10 text-white text-xs py-1 outline-none placeholder-slate-600" placeholder="Tech (comma-separated)" value={p.tech_stack || ""} onChange={(e) => updateProject(i, "tech_stack", e.target.value)} />
                        </div>
                      </div>
                    ))}
                    {!data.projects.length && <p className="text-slate-600 text-xs text-center py-4">No projects yet. Click &quot;+ Add&quot; to begin.</p>}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div>
                  <div className="mb-4 p-4 rounded-xl bg-amber-500/8 border border-amber-500/20">
                    <p className="text-amber-300 text-xs leading-relaxed">
                      🔒 This information is <strong>only visible to your AI</strong> — it will never appear on your homepage or be accessible to visitors. Use it to give your AI extra context: your availability, salary range, preferred collaboration types, personal anecdotes, or anything else that helps it represent you better.
                    </p>
                  </div>
                  <InputField
                    label="Private Notes for AI"
                    name="ai_private_notes"
                    value={data.ai_private_notes}
                    onChange={set("ai_private_notes")}
                    textarea
                    rows={8}
                    placeholder={`Examples:\n- Currently open to PhD positions and research internships\n- Prefer academic collaborations over commercial projects\n- Available for consulting at $X/hour\n- Fun fact: I won a national math olympiad at age 15\n- If asked about salary, my expectation is $X-Y range`}
                  />
                  <InputField
                    label="Suggested Questions (optional)"
                    name="suggested_questions"
                    value={data.suggested_questions}
                    onChange={set("suggested_questions")}
                    textarea
                    rows={3}
                    placeholder={"One question per line:\nWhat are you currently researching?\nAre you open to collaborations?"}
                  />
                  <p className="text-xs text-slate-600 -mt-2">These appear as clickable chips in the chat widget. Leave empty to auto-generate.</p>
                </div>
              )}

              {step === 4 && (
                <div>
                  <div className="mb-4 p-4 rounded-xl bg-blue-500/8 border border-blue-500/20">
                    <p className="text-blue-300 text-xs">
                      🛡 Set a password to protect your admin panel at <code className="text-blue-200">/admin</code>. You&apos;ll use it to update your profile, AI configuration, and view visitor conversations.
                    </p>
                  </div>
                  <InputField
                    label="Admin Password"
                    name="admin_password"
                    value={data.admin_password}
                    onChange={set("admin_password")}
                    type="password"
                    required
                    placeholder="At least 6 characters"
                  />
                  {error && (
                    <div className="mt-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                      {error}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <button
              onClick={() => setStep((s) => s - 1)}
              disabled={step === 0}
              className="px-6 py-2.5 rounded-xl text-sm text-slate-400 border border-white/10 hover:border-white/20 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ← Back
            </button>

            {step < TOTAL_STEPS - 1 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                disabled={!canAdvance()}
                className="btn-glow px-6 py-2.5 rounded-xl text-sm text-white font-medium disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={submit}
                disabled={!canAdvance() || loading}
                className="btn-glow px-8 py-2.5 rounded-xl text-sm text-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Deploying...
                  </>
                ) : (
                  "🚀 Launch Homepage"
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
