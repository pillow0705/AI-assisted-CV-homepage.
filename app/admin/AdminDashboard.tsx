"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SiteConfig, Honor, Project, AIProvider } from "@/types";
import { AI_MODELS } from "@/types";
import FloatingOrbs from "@/components/ui/FloatingOrbs";

type Tab = "profile" | "ai" | "content" | "cv";

interface Props {
  initialConfig: Partial<SiteConfig>;
  initialHonors: Honor[];
  initialProjects: Project[];
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
        active ? "bg-purple-500/25 text-purple-300 border border-purple-500/40" : "text-slate-400 hover:text-white hover:bg-white/5"
      }`}
    >
      {children}
    </button>
  );
}

function Field({ label, value, onChange, type = "text", textarea = false, rows = 3, placeholder = "" }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; textarea?: boolean; rows?: number; placeholder?: string;
}) {
  const cls = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 outline-none focus:border-purple-500/60 transition-all text-sm";
  return (
    <div className="mb-4">
      <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wide">{label}</label>
      {textarea
        ? <textarea className={cls} rows={rows} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
        : <input className={cls} type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />}
    </div>
  );
}

export default function AdminDashboard({ initialConfig, initialHonors, initialProjects }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("profile");
  const [config, setConfig] = useState<Partial<SiteConfig>>(initialConfig);
  const [honors, setHonors] = useState<Honor[]>(initialHonors);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [uploadingCv, setUploadingCv] = useState(false);

  const setC = (key: keyof SiteConfig) => (val: string) =>
    setConfig((c) => ({ ...c, [key]: val }));

  const save = async () => {
    setSaving(true);
    setSaved(false);
    await fetch("/api/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ config, honors, projects }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
  };

  const logout = async () => {
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/");
    router.refresh();
  };

  const uploadCv = async () => {
    if (!cvFile) return;
    setUploadingCv(true);
    const fd = new FormData();
    fd.append("cv", cvFile);
    const res = await fetch("/api/cv", { method: "POST", body: fd });
    if (res.ok) {
      const { filename } = await res.json();
      setConfig((c) => ({ ...c, cv_filename: filename }));
    }
    setUploadingCv(false);
    setCvFile(null);
  };

  const addHonor = () => setHonors((h) => [...h, { id: Date.now(), title: "", issuer: "", year: "", order_index: h.length }]);
  const removeHonor = (id: number) => setHonors((h) => h.filter((x) => x.id !== id));
  const updateHonor = (id: number, key: keyof Honor, val: string) =>
    setHonors((h) => h.map((x) => x.id === id ? { ...x, [key]: val } : x));

  const addProject = () => setProjects((p) => [...p, { id: Date.now(), title: "", description: "", url: "", tech_stack: "", order_index: p.length }]);
  const removeProject = (id: number) => setProjects((p) => p.filter((x) => x.id !== id));
  const updateProject = (id: number, key: keyof Project, val: string) =>
    setProjects((p) => p.map((x) => x.id === id ? { ...x, [key]: val } : x));

  return (
    <div className="min-h-screen relative">
      <FloatingOrbs />
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold gradient-text">Admin Dashboard</h1>
            <p className="text-slate-500 text-sm mt-0.5">Manage your homepage and AI assistant</p>
          </div>
          <div className="flex gap-3">
            <a href="/" className="px-4 py-2 rounded-lg text-sm text-slate-400 border border-white/10 hover:border-white/20 transition-all">← View Site</a>
            <button onClick={logout} className="px-4 py-2 rounded-lg text-sm text-red-400/70 border border-red-500/20 hover:border-red-500/40 transition-all">Sign Out</button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <TabBtn active={tab === "profile"} onClick={() => setTab("profile")}>👤 Profile</TabBtn>
          <TabBtn active={tab === "ai"} onClick={() => setTab("ai")}>🤖 AI Config</TabBtn>
          <TabBtn active={tab === "content"} onClick={() => setTab("content")}>📋 Content</TabBtn>
          <TabBtn active={tab === "cv"} onClick={() => setTab("cv")}>📄 CV Upload</TabBtn>
        </div>

        {/* Panel */}
        <div
          className="rounded-2xl p-6"
          style={{
            background: "rgba(15,12,30,0.85)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(168,85,247,0.15)",
          }}
        >
          {tab === "profile" && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-5">Profile Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                <Field label="Full Name" value={config.name || ""} onChange={setC("name")} />
                <Field label="Title" value={config.title || ""} onChange={setC("title")} />
                <Field label="Tagline" value={config.tagline || ""} onChange={setC("tagline")} />
                <Field label="Email" value={config.email || ""} onChange={setC("email")} type="email" />
                <Field label="Location" value={config.location || ""} onChange={setC("location")} />
                <Field label="Institution" value={config.institution || ""} onChange={setC("institution")} />
                <Field label="GitHub URL" value={config.github || ""} onChange={setC("github")} />
                <Field label="LinkedIn URL" value={config.linkedin || ""} onChange={setC("linkedin")} />
                <Field label="Twitter URL" value={config.twitter || ""} onChange={setC("twitter")} />
                <Field label="Avatar URL" value={config.avatar_url || ""} onChange={setC("avatar_url")} placeholder="https://..." />
              </div>
              <Field label="About Me" value={config.about || ""} onChange={setC("about")} textarea rows={6} />
            </div>
          )}

          {tab === "ai" && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-5">AI Configuration</h2>
              <div className="mb-4">
                <label className="block text-xs text-slate-400 mb-2 uppercase tracking-wide">Provider</label>
                <div className="grid grid-cols-3 gap-3">
                  {(["openai", "anthropic", "deepseek"] as AIProvider[]).map((p) => (
                    <button key={p} onClick={() => {
                      const defaultModel = AI_MODELS[p][0].id;
                      setConfig((c) => ({ ...c, ai_provider: p, ai_model: defaultModel }));
                    }}
                      className={`py-2.5 rounded-xl border text-sm font-medium transition-all ${config.ai_provider === p ? "border-purple-500 bg-purple-500/20 text-purple-300" : "border-white/10 text-slate-400 hover:border-white/20"}`}
                    >
                      {p === "openai" ? "OpenAI" : p === "anthropic" ? "Claude" : "DeepSeek"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wide">Model</label>
                <select
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-purple-500/60 transition-all text-sm"
                  value={config.ai_model || ""}
                  onChange={(e) => setConfig((c) => ({ ...c, ai_model: e.target.value }))}
                >
                  {AI_MODELS[config.ai_provider || "openai"].map((m) => (
                    <option key={m.id} value={m.id} className="bg-[#0a0a14]">{m.label}</option>
                  ))}
                </select>
              </div>
              <Field label="API Key" value={config.ai_api_key || ""} onChange={setC("ai_api_key")} type="password" placeholder="sk-..." />
              <Field label="Suggested Questions (one per line)" value={config.suggested_questions || ""} onChange={setC("suggested_questions")} textarea rows={4} placeholder={"What are you researching?\nAre you open to collaborations?"} />
              <div className="mb-4">
                <label className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wide">Private Notes (only visible to AI)</label>
                <div className="mb-1.5 p-3 rounded-lg bg-amber-500/8 border border-amber-500/15">
                  <p className="text-amber-300/80 text-xs">🔒 This context is only accessible to your AI. Visitors cannot see or retrieve it.</p>
                </div>
                <textarea
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 outline-none focus:border-purple-500/60 transition-all text-sm"
                  rows={8}
                  value={config.ai_private_notes || ""}
                  onChange={(e) => setC("ai_private_notes")(e.target.value)}
                  placeholder="Availability, salary range, collaboration preferences, personal anecdotes..."
                />
              </div>
            </div>
          )}

          {tab === "content" && (
            <div>
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white">Honors & Awards</h2>
                  <button onClick={addHonor} className="text-sm text-purple-400 border border-purple-500/30 px-3 py-1.5 rounded-lg hover:bg-purple-500/10 transition-all">+ Add</button>
                </div>
                {honors.map((h) => (
                  <div key={h.id} className="mb-3 p-4 rounded-xl bg-white/3 border border-white/8">
                    <div className="flex gap-2 mb-2">
                      <input className="flex-1 bg-transparent border-b border-white/10 text-white text-sm py-1 outline-none focus:border-purple-500/60" placeholder="Title" value={h.title} onChange={(e) => updateHonor(h.id, "title", e.target.value)} />
                      <button onClick={() => removeHonor(h.id)} className="text-red-400/60 hover:text-red-400 text-sm px-2">✕</button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input className="bg-transparent border-b border-white/10 text-white text-xs py-1 outline-none placeholder-slate-600" placeholder="Issuer" value={h.issuer} onChange={(e) => updateHonor(h.id, "issuer", e.target.value)} />
                      <input className="bg-transparent border-b border-white/10 text-white text-xs py-1 outline-none placeholder-slate-600" placeholder="Year" value={h.year} onChange={(e) => updateHonor(h.id, "year", e.target.value)} />
                    </div>
                    <input className="mt-2 w-full bg-transparent border-b border-white/10 text-white text-xs py-1 outline-none placeholder-slate-600" placeholder="Description (optional)" value={h.description || ""} onChange={(e) => updateHonor(h.id, "description", e.target.value)} />
                  </div>
                ))}
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white">Projects</h2>
                  <button onClick={addProject} className="text-sm text-blue-400 border border-blue-500/30 px-3 py-1.5 rounded-lg hover:bg-blue-500/10 transition-all">+ Add</button>
                </div>
                {projects.map((p) => (
                  <div key={p.id} className="mb-3 p-4 rounded-xl bg-white/3 border border-white/8">
                    <div className="flex gap-2 mb-2">
                      <input className="flex-1 bg-transparent border-b border-white/10 text-white text-sm py-1 outline-none focus:border-purple-500/60" placeholder="Title" value={p.title} onChange={(e) => updateProject(p.id, "title", e.target.value)} />
                      <button onClick={() => removeProject(p.id)} className="text-red-400/60 hover:text-red-400 text-sm px-2">✕</button>
                    </div>
                    <textarea className="w-full bg-transparent text-white text-xs py-1 outline-none placeholder-slate-600 resize-none" rows={2} placeholder="Description" value={p.description} onChange={(e) => updateProject(p.id, "description", e.target.value)} />
                    <div className="grid grid-cols-2 gap-3 mt-1">
                      <input className="bg-transparent border-b border-white/10 text-white text-xs py-1 outline-none placeholder-slate-600" placeholder="URL" value={p.url || ""} onChange={(e) => updateProject(p.id, "url", e.target.value)} />
                      <input className="bg-transparent border-b border-white/10 text-white text-xs py-1 outline-none placeholder-slate-600" placeholder="Tech stack (comma-separated)" value={p.tech_stack || ""} onChange={(e) => updateProject(p.id, "tech_stack", e.target.value)} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "cv" && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-5">CV / Resume</h2>
              {config.cv_filename && (
                <div className="mb-5 p-4 rounded-xl bg-green-500/8 border border-green-500/20 flex items-center justify-between">
                  <div>
                    <p className="text-green-300 text-sm font-medium">Current CV</p>
                    <p className="text-green-400/60 text-xs mt-0.5">{config.cv_filename}</p>
                  </div>
                  <a href={`/uploads/${config.cv_filename}`} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-green-400 border border-green-500/30 px-3 py-1.5 rounded-lg hover:bg-green-500/10 transition-all">
                    View PDF ↗
                  </a>
                </div>
              )}
              <div
                className="border-2 border-dashed border-white/15 rounded-xl p-8 text-center hover:border-purple-500/40 transition-all"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file?.type === "application/pdf") setCvFile(file);
                }}
              >
                <div className="text-4xl mb-3">📄</div>
                <p className="text-slate-300 text-sm mb-2">Drag & drop your CV PDF here</p>
                <p className="text-slate-600 text-xs mb-4">or</p>
                <label className="btn-glow px-5 py-2 rounded-xl text-sm text-white cursor-pointer">
                  Browse Files
                  <input type="file" accept="application/pdf" className="hidden" onChange={(e) => setCvFile(e.target.files?.[0] || null)} />
                </label>
                {cvFile && (
                  <div className="mt-4 flex items-center justify-center gap-3">
                    <span className="text-slate-300 text-sm">{cvFile.name}</span>
                    <button
                      onClick={uploadCv}
                      disabled={uploadingCv}
                      className="px-4 py-1.5 rounded-lg text-sm bg-purple-500/20 border border-purple-500/40 text-purple-300 hover:bg-purple-500/30 transition-all disabled:opacity-40"
                    >
                      {uploadingCv ? "Uploading..." : "Upload"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Save button */}
          <div className="mt-6 pt-5 border-t border-white/5 flex justify-end">
            <button
              onClick={save}
              disabled={saving}
              className="btn-glow px-8 py-2.5 rounded-xl text-sm text-white font-semibold flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Saving...</>
              ) : saved ? "✓ Saved!" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
