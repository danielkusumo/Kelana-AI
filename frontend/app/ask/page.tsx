"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ArrowLeft,
  Search,
  Sparkles,
  Database,
  Bot,
  FileText,
  ExternalLink,
  Loader2,
  CheckCircle2,
  CircleAlert,
} from "lucide-react";
import StarField from "@/components/trip-planner/StarField";
import GlassCard from "@/components/ui/GlassCard";
import RequireAuth from "@/components/RequireAuth";
import { askKnowledgeBase, askBaseModel } from "@/services/askService";
import type { AskSource } from "@/services/askService";

type View = "kb" | "base";

type Entry = {
  q: string;
  accepted?: boolean;
  kb?: string;
  sources?: AskSource[];
  base?: string;
  kbLoading?: boolean;
  baseLoading?: boolean;
};

function AskInner() {
  const [question, setQuestion] = useState("");
  const [current, setCurrent] = useState<Entry | null>(null);
  const [view, setView] = useState<View>("kb");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    setError(null);

    const entry: Entry = {
      q: question.trim(),
      kbLoading: true,
      baseLoading: true,
    };
    setCurrent(entry);
    setView("kb");
    setQuestion("");

    const kbPromise = askKnowledgeBase(entry.q)
      .then((r) => ({
        answer: r.answer,
        accepted: r.accepted,
        sources: r.sources ?? [],
      }))
      .catch((err) => {
        setError(err instanceof Error ? err.message : "KB request failed");
        return { answer: "(error)", accepted: false, sources: [] as AskSource[] };
      });
    const basePromise = askBaseModel(entry.q)
      .then((r) => r.answer)
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Base model request failed");
        return "(error)";
      });

    const [kbResult, baseAns] = await Promise.all([kbPromise, basePromise]);

    setCurrent((prev) =>
      prev && prev.q === entry.q
        ? {
            ...prev,
            kb: kbResult.answer,
            accepted: kbResult.accepted,
            sources: kbResult.sources,
            base: baseAns,
            kbLoading: false,
            baseLoading: false,
          }
        : prev
    );
  };

  const clear = () => {
    setCurrent(null);
    setError(null);
    setView("kb");
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 py-8 px-1">
      {/* Breadcrumb */}
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
          Home
        </Link>
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-violet-500/10 border border-violet-500/20">
            <Database className="w-7 h-7 text-violet-300" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Ask the Bot
            </h1>
            <p className="text-white/40 text-sm mt-1">
              Search your travel documents and compare answers against the base model
            </p>
          </div>
        </div>
      </motion.div>

      {/* Search bar */}
      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row gap-3"
      >
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Search your travel documents, e.g. customs, dining, IMEI..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3.5
              text-white placeholder-white/30
              focus:outline-none focus:border-violet-400/60 focus:ring-2 focus:ring-violet-400/20
              transition-all duration-300 text-sm"
          />
        </div>
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl
            bg-gradient-to-r from-violet-700/90 via-violet-600 to-fuchsia-700/90
            text-white font-medium hover:from-violet-600 hover:via-violet-500 hover:to-fuchsia-600
            transition-all duration-500 shadow-[0_0_20px_rgba(139,92,246,0.2)] disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          Search
        </button>
      </motion.form>

      {/* Error */}
      {error && (
        <div className="text-center text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl py-3 px-4">
          {error}
        </div>
      )}

      {/* Results */}
      {current && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="space-y-5"
        >
          {/* Query summary + view toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2 text-white/80 font-medium min-w-0">
              <Search className="w-4 h-4 text-violet-300 flex-shrink-0" />
              <span className="truncate">&quot;{current.q}&quot;</span>
            </div>

            <div className="sm:ml-auto flex items-center gap-3">
              <div className="inline-flex items-center p-1 rounded-xl bg-white/5 border border-white/10 gap-1">
                <button
                  onClick={() => setView("kb")}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                    view === "kb"
                      ? "bg-violet-500/20 text-violet-100"
                      : "text-white/50 hover:text-white"
                  }`}
                >
                  <Database className="w-4 h-4" />
                  Knowledge Base
                </button>
                <button
                  onClick={() => setView("base")}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                    view === "base"
                      ? "bg-amber-500/20 text-amber-100"
                      : "text-white/50 hover:text-white"
                  }`}
                >
                  <Bot className="w-4 h-4" />
                  Base Model
                </button>
              </div>

              <button
                onClick={clear}
                className="inline-flex items-center gap-1.5 text-white/30 hover:text-white/70 transition-colors text-xs"
              >
                Clear
              </button>
            </div>
          </div>

          {view === "kb" ? (
            <AnswerPanel
              icon={<Database className="w-5 h-5" />}
              label="Knowledge Base"
              accent="violet"
              loading={current.kbLoading}
              text={current.kb}
              accepted={current.accepted}
              sources={current.sources}
            />
          ) : (
            <AnswerPanel
              icon={<Bot className="w-5 h-5" />}
              label="Base Model"
              accent="amber"
              loading={current.baseLoading}
              text={current.base}
            />
          )}
        </motion.div>
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

function AnswerPanel({
  icon,
  label,
  accent,
  loading,
  text,
  accepted,
  sources,
}: {
  icon: React.ReactNode;
  label: string;
  accent: "violet" | "amber";
  loading?: boolean;
  text?: string;
  accepted?: boolean;
  sources?: AskSource[];
}) {
  const accentBox =
    accent === "violet"
      ? "bg-violet-500/10 border-violet-500/20 text-violet-300"
      : "bg-amber-500/10 border-amber-500/20 text-amber-300";

  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className={`p-2 rounded-lg border ${accentBox}`}>{icon}</div>
        <h2 className="text-white font-semibold text-lg">{label}</h2>
        {accepted !== undefined && (
          <span
            className={`ml-auto inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${
              accepted
                ? "bg-emerald-500/10 border-emerald-400/30 text-emerald-300"
                : "bg-amber-500/10 border-amber-400/30 text-amber-300"
            }`}
          >
            {accepted ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                Grounded
              </>
            ) : (
              <>
                <CircleAlert className="w-3.5 h-3.5" />
                No match in docs
              </>
            )}
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-white/40 text-sm py-4">
          <Loader2 className="w-4 h-4 animate-spin" />
          Generating...
        </div>
      ) : (
        <div className="prose prose-invert prose-sm max-w-none text-white/80">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{text || ""}</ReactMarkdown>
        </div>
      )}

      {sources && sources.length > 0 && (
        <div className="mt-6 pt-5 border-t border-white/8">
          <p className="text-white/50 text-xs uppercase tracking-wider mb-3">
            Sources
          </p>
          <div className="space-y-2.5">
            {uniqueSources(sources).map((s, i) => {
              const name = s.title === "Document" ? fileName(s.uri) : s.title;
              const pct = Math.min(100, Math.max(0, (s.score ?? 0) * 100));
              return (
                <div
                  key={i}
                  className="flex items-start gap-3 bg-white/[0.03] border border-white/10 rounded-xl px-3.5 py-3"
                >
                  <FileText className="w-4 h-4 text-violet-300 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-white/80 text-sm truncate">{name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-400"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-mono text-white/50 flex-shrink-0">
                        {pct.toFixed(1).replace(/\.0$/, "")}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
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