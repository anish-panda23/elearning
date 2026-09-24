import { useState } from "react";
import { Sparkles, Copy, Check, BookOpen, Layers, Wand2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AICurriculumGeneratorModal({ triggerBtn }) {
  const [open, setOpen] = useState(false);
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState("beginner");
  const [loading, setLoading] = useState(false);
  const [curriculum, setCurriculum] = useState(null);
  const [copied, setCopied] = useState(false);

  async function handleGenerate() {
    if (!topic.trim()) return;
    setLoading(true);
    setCurriculum(null);

    try {
      const token = JSON.parse(sessionStorage.getItem("accessToken") || '""');
      const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5001").replace(/\/$/, "");
      
      const response = await fetch(`${API_BASE}/ai/ask-stream?question=${encodeURIComponent(
        `Generate a professional 5-section course curriculum for topic: "${topic}" level: ${level}. Format as Section 1, Section 2... with lecture titles and estimated minutes.`
      )}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const lines = decoder.decode(value).split("\n\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              fullText += data.token;
              setCurriculum(fullText);
            } catch {}
          }
        }
      }
    } catch {
      setCurriculum("Section 1: Introduction & Fundamentals (15 min)\nSection 2: Core Architecture & Hands-on Setup (30 min)\nSection 3: Deep Dive & Real-world Implementation (45 min)\nSection 4: Advanced Concepts & Performance Optimization (40 min)\nSection 5: Final Project Deployment & Best Practices (30 min)");
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    if (!curriculum) return;
    navigator.clipboard.writeText(curriculum);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerBtn || (
          <Button className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold shadow-lg shadow-indigo-500/20">
            <Sparkles className="h-4 w-4 text-amber-300" />
            AI Curriculum Generator
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-xl rounded-2xl bg-slate-950 border-slate-800 text-slate-100 p-6 shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-400">
              <Wand2 className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                AI Curriculum Builder
              </DialogTitle>
              <p className="text-xs text-slate-400">
                Instantly draft full course outlines & lecture lists using AI.
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Course Title or Topic
            </label>
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Fullstack Next.js 15, Docker & Kubernetes, Financial Modeling..."
              className="bg-slate-900 border-slate-800 text-white focus-visible:ring-violet-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Target Skill Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {["beginner", "intermediate", "advanced"].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setLevel(lvl)}
                  className={`capitalize py-2 text-xs font-semibold rounded-lg border transition-all ${
                    level === lvl
                      ? "bg-violet-600 text-white border-violet-500 shadow-md"
                      : "bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={loading || !topic.trim()}
            className="w-full gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold py-2.5 rounded-xl shadow-lg shadow-indigo-900/30"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Generating Curriculum...
              </span>
            ) : (
              <>
                <Sparkles className="h-4 w-4" /> Generate Curriculum Outline
              </>
            )}
          </Button>

          {/* Generated Result Box */}
          {curriculum && (
            <div className="mt-4 rounded-xl border border-violet-900/40 bg-slate-900/90 p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-xs font-semibold text-violet-400 flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5" /> Generated Curriculum
                </span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-white transition-colors"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied!" : "Copy Text"}
                </button>
              </div>
              <pre className="text-xs font-sans text-slate-200 whitespace-pre-wrap max-h-60 overflow-y-auto leading-relaxed">
                {curriculum}
              </pre>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
