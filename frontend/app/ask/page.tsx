"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ArrowLeft,
  Sparkles,
  Send,
  Bot,
  Database,
  FileText,
  Loader2,
  ExternalLink,
} from "lucide-react";
import StarField from "@/components/trip-planner/StarField";
import GlassCard from "@/components/ui/GlassCard";
import RequireAuth from "@/components/RequireAuth";
import { askKnowledgeBase, askBaseModel } from "@/services/askService";
import type { AskSource } from "@/services/askService";

type Entry = {
  q: string;
  rag?: string;
  base?: string;
  sources?: AskSource[];
  ragLoading?: boolean;
  baseLoading?: boolean;
};

function AskInner() {
  const [question, setQuestion] = useState("");
  const [current, setCurrent] = useState<Entry | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    setError(null);

    const entry: Entry = {
      q: question.trim(),
      ragLoading: true,
      baseLoading: true,
    };
    setCurrent(entry);
    setQuestion("");

    const ragPromise = askKnowledgeBase(entry.q)
      .then((r) => ({ answer: r.answer, sources: r.sources ?? [] }))
      .catch((err) => {
        setError(err instanceof Error ? err.message : "KB request failed");
        return { answer: "(error)", sources: [] as AskSource[] };
      });
    const basePromise = askBaseModel(entry.q)
      .then((r) => r.answer)
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Base model request failed");
        return "(error)";
      });

    const [ragResult, baseAns] = await Promise.all([ragPromise, basePromise]);

    setCurrent((prev) =>
      prev && prev.q === entry.q
        ? {
            ...prev,
            rag: ragResult.answer,
            sources: ragResult.sources,
            base: baseAns,
            ragLoading: false,
            baseLoading: false,
          }
        : prev
    );
  };

  const clear = () => {
    setCurrent(null);
    setError(null);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6 py-8">
      {/* Back */}
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-2"
      >
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-white/40 hover:text-white transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>
        <Link
          href="/trips"
          className="ml-auto inline-flex items-center gap-1.5 text-white/40 hover:text-white transition-colors text-sm"
        >
          <Sparkles className="w-4 h-4" />
          My Trips
        </Link>
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20">
          <Bot className="w-6 h-6 text-violet-300" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Ask the Bot</h1>
          <p className="text-white/40 text-sm">
            Compare RAG answers vs. the base model
          </p>
        </div>
      </motion.div>

      {/* Input */}
      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        onSubmit={handleSubmit}
        className="flex gap-3"
      >
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question about your travel documents..."
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-violet-400/60 focus:ring-2 focus:ring-violet-400/20 transition-all duration-300"
        />
        <button
          type="submit"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-violet-700/80 via-violet-600/90 to-fuchsia-700/80 text-white font-medium hover:from-violet-600 hover:via-violet-500 hover:to-fuchsia-600 transition-all duration-500 shadow-[0_0_20px_rgba(139,92,246,0.2)] disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          Ask
        </button>
      </motion.form>

      {/* Current question only */}
      {current && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-white/80 font-medium">
            <Sparkles className="w-4 h-4 text-violet-300" />
            {current.q}
            <button
              onClick={clear}
              className="ml-auto inline-flex items-center gap-1.5 text-white/30 hover:text-white/70 transition-colors text-xs"
            >
              Clear
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <AnswerCard
              title="RAG (Knowledge Base)"
              icon={<Database className="w-4 h-4" />}
              loading={current.ragLoading}
              text={current.rag}
              sources={current.sources}
              accent="violet"
            />
            <AnswerCard
              title="Base Model"
              icon={<Bot className="w-4 h-4" />}
              loading={current.baseLoading}
              text={current.base}
              accent="amber"
            />
          </div>
        </div>
      )}

      {error && !current && (
        <div className="text-center text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl py-3 px-4">
          {error}
        </div>
      )}
    </div>
  );
}

function fileName(uri?: string | null): string {
  if (!uri) return "Document";
  try {
    return decodeURIComponent(uri.split("/").pop() || "Document");
  } catch {
    return uri.split("/").pop() || "Document";
  }
}

function uniqueSources(sources: AskSource[]): AskSource[] {
  const seen = new Set<string>();
  const out: AskSource[] = [];
  for (const s of sources) {
    const key = s.uri || s.title || s.snippet || "";
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(s);
  }
  return out;
}

function AnswerCard({
  title,
  icon,
  loading,
  text,
  sources,
  accent,
}: {
  title: string;
  icon: React.ReactNode;
  loading?: boolean;
  text?: string;
  sources?: AskSource[];
  accent: "violet" | "amber";
}) {
  const accentCls =
    accent === "violet"
      ? "bg-violet-500/10 border-violet-500/20"
      : "bg-amber-500/10 border-amber-500/20";
  return (
    <GlassCard className="p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className={`p-1.5 rounded-lg border ${accentCls}`}>{icon}</div>
        <span className="text-white/70 text-sm font-medium">{title}</span>
      </div>
      {loading ? (
        <div className="flex items-center gap-2 text-white/40 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          Generating...
        </div>
      ) : (
        <div className="prose prose-invert prose-sm max-w-none text-white/80">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{text || ""}</ReactMarkdown>
        </div>
      )}

      {sources && sources.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/8">
          <p className="text-white/50 text-xs uppercase tracking-wider mb-2">
            Sources
          </p>
          <div className="space-y-2">
            {uniqueSources(sources).map((s, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2"
              >
                <FileText className="w-4 h-4 text-violet-300 flex-shrink-0" />
                <span className="flex-1 text-white/80 text-sm truncate">
                  {s.title === "Document" ? fileName(s.uri) : s.title}
                </span>
                <span className="text-[11px] font-mono px-1.5 py-0.5 rounded-md bg-violet-500/15 border border-violet-400/30 text-violet-200">
                  {(s.score ?? 0).toFixed(3)}
                </span>
                {s.uri && (
                  <a
                    href={s.uri}
                    target="_blank"
                    rel="noreferrer"
                    className="text-white/40 hover:text-white/80 transition-colors"
                    title={s.uri}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </GlassCard>
  );
}

export default function AskPage() {
  return (
    <RequireAuth>
      <main className="cosmic-bg relative flex-1 flex flex-col overflow-x-hidden">
        <StarField />
        <div className="nebula-1" />
        <div className="nebula-2" />
        <div className="relative z-10 flex flex-col flex-1 items-center px-4 py-8">
          <AskInner />
        </div>
      </main>
    </RequireAuth>
  );
}