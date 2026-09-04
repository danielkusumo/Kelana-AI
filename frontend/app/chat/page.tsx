"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ArrowLeft,
  Plus,
  Send,
  Loader2,
  User,
  Bot,
  MessageSquare,
  FileText,
  ExternalLink,
  CheckCircle2,
  Menu,
  AlertCircle,
  Pencil,
  Trash2,
} from "lucide-react";
import StarField from "@/components/trip-planner/StarField";
import GlassCard from "@/components/ui/GlassCard";
import RequireAuth from "@/components/RequireAuth";
import {
  createConversation,
  listConversations,
  getConversation,
  sendMessage,
  updateConversation,
  deleteConversation,
} from "@/services/chatService";
import type { Conversation, ChatMessage, ConversationSource } from "@/types/chat";

function uniqueSources(sources: ConversationSource[]): ConversationSource[] {
  const seen: string[] = [];
  const out: ConversationSource[] = [];
  for (const s of sources) {
    const key = s.uri || s.title || "";
    if (seen.includes(key)) continue;
    seen.push(key);
    out.push(s);
  }
  return out;
}

function fileName(uri?: string | null): string {
  if (!uri) return "Document";
  try {
    return decodeURIComponent(uri.split("/").pop() || "Document");
  } catch {
    return uri.split("/").pop() || "Document";
  }
}

function preview(text: string, len = 48): string {
  const t = text.replace(/\s+/g, " ").trim();
  return t.length > len ? t.slice(0, len) + "…" : t;
}

/** Format an ISO timestamp: time if today, date+time otherwise. */
function fmtTime(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  const hhmm = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (sameDay) return hhmm;
  return d.toLocaleDateString([], { month: "short", day: "numeric" }) + ", " + hhmm;
}

function ChatInner() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sources, setSources] = useState<ConversationSource[]>([]);
  const [accepted, setAccepted] = useState<boolean | null>(null);
  const [input, setInput] = useState("");
  const [loadingList, setLoadingList] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [creating, setCreating] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    listConversations()
      .then((data) => setConversations(data))
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load conversations")
      )
      .finally(() => setLoadingList(false));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sources, sending]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [activeId]);

  const selectConversation = async (id: number) => {
    setActiveId(id);
    setLoadingMsgs(true);
    setError(null);
    try {
      const detail = await getConversation(id);
      setMessages(detail.messages);
      setSources([]);
      setAccepted(null);
      setSidebarOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load conversation");
    } finally {
      setLoadingMsgs(false);
    }
  };

  const newChat = async () => {
    setError(null);
    setCreating(true);
    try {
      const conv = await createConversation();
      setConversations((prev) => [conv, ...prev]);
      setActiveId(conv.id);
      setMessages([]);
      setSources([]);
      setAccepted(null);
      setSidebarOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start a new chat");
    } finally {
      setCreating(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending || activeId === null) return;
    setError(null);
    setSending(true);
    setInput("");

    const temp: ChatMessage = {
      id: -Date.now(),
      conversation_id: activeId,
      role: "user",
      content: text,
      created_at: null,
    };
    setMessages((prev) => [...prev, temp]);

    try {
      const result = await sendMessage(activeId, text);
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== temp.id),
        result.user_message,
        result.assistant_message,
      ]);
      setSources(result.sources ?? []);
      setAccepted(result.accepted);
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeId
            ? {
                ...c,
                message_count: result.conversation.message_count,
                last_message: text,
                title: c.title || result.conversation.title,
              }
            : c
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
      setMessages((prev) => prev.filter((m) => m.id !== temp.id));
      setInput(text);
    } finally {
      setSending(false);
    }
  };

  const startRename = () => {
    if (activeConv) {
      setTitleDraft(activeConv.title || "");
      setEditingTitle(true);
      setTimeout(() => titleRef.current?.focus(), 0);
    }
  };

  const saveTitle = async () => {
    const title = titleDraft.trim();
    if (!title || activeId === null) {
      setEditingTitle(false);
      return;
    }
    try {
      const updated = await updateConversation(activeId, title);
      setConversations((prev) =>
        prev.map((c) => (c.id === activeId ? { ...c, title: updated.title } : c))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to rename chat");
    } finally {
      setEditingTitle(false);
    }
  };

  const removeConversation = async () => {
    if (activeId === null) return;
    if (!window.confirm("Delete this conversation?")) return;
    try {
      await deleteConversation(activeId);
      const remaining = conversations.filter((c) => c.id !== activeId);
      setConversations(remaining);
      if (remaining.length > 0) {
        await selectConversation(remaining[0].id);
      } else {
        setActiveId(null);
        setMessages([]);
        setSources([]);
        setAccepted(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete conversation");
    }
  };

  const activeConv = conversations.find((c) => c.id === activeId) ?? null;

  return (
    <div className="w-full max-w-6xl mx-auto py-8">
      {/* Top bar */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-white/40 hover:text-white transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Home
        </Link>
        <button
          onClick={() => setSidebarOpen((o) => !o)}
          className="lg:hidden ml-auto inline-flex items-center gap-1.5 text-white/40 hover:text-white transition-colors text-sm"
        >
          <Menu className="w-4 h-4" />
          Chat list
        </button>
      </div>

      <div className="flex gap-5">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? "block" : "hidden"
          } lg:block w-full lg:w-72 flex-shrink-0`}
        >
          <GlassCard className="p-3 sticky top-6">
            <button
              type="button"
              onClick={newChat}
              disabled={creating}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 mb-3 rounded-xl
                bg-gradient-to-r from-violet-700/90 via-violet-600 to-fuchsia-700/90
                text-white font-medium hover:from-violet-600 hover:via-violet-500 hover:to-fuchsia-600
                transition-all duration-500 shadow-[0_0_20px_rgba(139,92,246,0.2)] disabled:opacity-60"
            >
              {creating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              {creating ? "Creating..." : "New chat"}
            </button>

            <p className="text-white/40 text-xs uppercase tracking-wider px-2 mb-2">
              Conversations
            </p>

            {loadingList ? (
              <div className="flex items-center gap-2 text-white/40 text-sm px-2 py-4">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading...
              </div>
            ) : conversations.length === 0 ? (
              <p className="text-white/30 text-sm px-2 py-4">
                No conversations yet.
              </p>
            ) : (
              <div className="space-y-1">
                {conversations.map((c) => (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => selectConversation(c.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl transition-colors
                      ${
                        c.id === activeId
                          ? "bg-violet-500/15 border border-violet-400/30"
                          : "hover:bg-white/5 border border-transparent"
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-3.5 h-3.5 text-violet-300 flex-shrink-0" />
                      <span className="text-white/70 text-sm truncate">
                        {c.title ? preview(c.title, 40) : "New conversation"}
                      </span>
                    </div>
                    <p className="text-white/30 text-[11px] pl-5.5 mt-0.5">
                      {c.message_count} message{c.message_count !== 1 ? "s" : ""}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </GlassCard>
        </aside>

        {/* Main thread */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Global error — always visible when present */}
          {error && (
            <div className="flex items-center gap-2 text-red-300 text-sm bg-red-500/10 border border-red-500/25 rounded-xl py-3 px-4 mb-4">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {activeId === null ? (
            <GlassCard className="p-10 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 rounded-full bg-violet-500/10 border border-violet-500/20">
                  <MessageSquare className="w-8 h-8 text-violet-300" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                Start a conversation
              </h2>
              <p className="text-white/50 text-sm mb-6 max-w-md mx-auto">
                Ask anything about your travel
              </p>
              <button
                type="button"
                onClick={newChat}
                disabled={creating}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-700/80 via-violet-600/90 to-fuchsia-700/80 text-white font-medium hover:from-violet-600 hover:via-violet-500 hover:to-fuchsia-600 transition-all duration-500 disabled:opacity-60"
              >
                {creating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                {creating ? "Creating..." : "New chat"}
              </button>
            </GlassCard>
          ) : (
            <>
              {/* Conversation header: editable title + actions */}
              <div className="flex items-center gap-2 mb-3">
                {editingTitle ? (
                  <input
                    ref={titleRef}
                    value={titleDraft}
                    onChange={(e) => setTitleDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveTitle();
                      if (e.key === "Escape") setEditingTitle(false);
                    }}
                    onBlur={saveTitle}
                    maxLength={60}
                    className="flex-1 bg-white/5 border border-violet-400/50 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-400/20"
                  />
                ) : (
                  <h2 className="text-lg font-semibold text-white min-w-0 truncate">
                    {activeConv?.title || "New conversation"}
                  </h2>
                )}
                <button
                  type="button"
                  onClick={startRename}
                  title="Rename"
                  className="inline-flex items-center gap-1.5 text-white/40 hover:text-white transition-colors text-xs p-1.5 rounded-lg hover:bg-white/5"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={removeConversation}
                  title="Delete chat"
                  className="inline-flex items-center gap-1.5 text-white/40 hover:text-red-300 transition-colors text-xs p-1.5 rounded-lg hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 space-y-5 min-h-[420px]">
                {loadingMsgs ? (
                  <div className="flex items-center justify-center py-20 gap-3 text-white/50">
                    <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
                    <span className="text-sm">Loading messages...</span>
                  </div>
                ) : messages.length === 0 ? (
                  <GlassCard className="p-10 text-center">
                    <p className="text-white/40 text-sm">
                      Ask anything about your travel
                    </p>
                  </GlassCard>
                ) : (
                  <>
                    {messages.map((m) => (
                      <MessageBubble key={m.id} message={m} />
                    ))}
                    {sending && <TypingBubble />}
                  </>
                )}

                {sources.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="pl-12"
                  >
                    <GlassCard className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <FileText className="w-4 h-4 text-violet-300" />
                        <span className="text-white/50 text-xs uppercase tracking-wider">
                          Sources
                        </span>
                        {accepted === true && (
                          <span className="ml-auto inline-flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-300">
                            <CheckCircle2 className="w-3 h-3" />
                            Grounded
                          </span>
                        )}
                      </div>
                      <div className="space-y-2">
                        {uniqueSources(sources).map((s, i) => {
                          const name = s.title === "Document" ? fileName(s.uri) : s.title;
                          const pct = Math.min(100, Math.max(0, (s.score ?? 0) * 100));
                          return (
                            <div
                              key={i}
                              className="flex items-center gap-3 bg-white/[0.03] border border-white/10 rounded-xl px-3.5 py-2.5"
                            >
                              <FileText className="w-4 h-4 text-violet-300 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 mb-1.5">
                                  <span className="text-white/80 text-sm truncate">
                                    {name}
                                  </span>
                                  {s.uri && (
                                    <a
                                      href={s.uri}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-white/40 hover:text-white/80 transition-colors flex-shrink-0"
                                      title={s.uri}
                                    >
                                      <ExternalLink className="w-4 h-4" />
                                    </a>
                                  )}
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
                    </GlassCard>
                  </motion.div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Composer */}
              <form onSubmit={handleSend} className="flex gap-3 mt-4">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about your travel documents..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/30 focus:outline-none focus:border-violet-400/60 focus:ring-2 focus:ring-violet-400/20 transition-all duration-300"
                />
                <button
                  type="submit"
                  disabled={sending || !input.trim()}
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-gradient-to-r from-violet-700/90 via-violet-600 to-fuchsia-700/90 text-white font-medium hover:from-violet-600 hover:via-violet-500 hover:to-fuchsia-600 transition-all duration-500 disabled:opacity-50"
                >
                  {sending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Send
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function TypingBubble() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex gap-3"
    >
      <div className="w-8 h-8 rounded-full bg-violet-500/15 border border-violet-400/30 flex-shrink-0 flex items-center justify-center mt-1">
        <Bot className="w-4 h-4 text-violet-300" />
      </div>
      <div className="rounded-2xl rounded-tl-md px-4 py-3.5 border bg-white/5 border-white/10 flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-violet-300"
            animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18 }}
          />
        ))}
      </div>
    </motion.div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  const time = fmtTime(message.created_at);
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isUser ? "justify-end" : ""}`}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-violet-500/15 border border-violet-400/30 flex-shrink-0 flex items-center justify-center mt-1">
          <Bot className="w-4 h-4 text-violet-300" />
        </div>
      )}
      <div
        className={`max-w-[78%] rounded-2xl px-4 py-3 border text-sm leading-relaxed ${
          isUser
            ? "bg-gradient-to-r from-violet-600/80 to-fuchsia-600/80 border-violet-500/30 text-white"
            : "bg-white/5 border-white/10 text-white/80"
        }`}
      >
        {isUser ? (
          <span className="whitespace-pre-wrap">{message.content}</span>
        ) : (
          <div className="prose prose-invert prose-sm max-w-none text-white/80">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>
        )}
        {time && (
          <div className={`text-[11px] mt-1.5 ${isUser ? "text-white/70 text-right" : "text-white/40"}`}>
            {time}
          </div>
        )}
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex-shrink-0 flex items-center justify-center mt-1">
          <User className="w-4 h-4 text-white/60" />
        </div>
      )}
    </motion.div>
  );
}

export default function ChatPage() {
  return (
    <RequireAuth>
      <main className="cosmic-bg relative flex-1 flex flex-col overflow-x-hidden">
        <StarField />
        <div className="nebula-1" />
        <div className="nebula-2" />
        <div className="relative z-10 flex flex-col flex-1 items-center px-4 py-8">
          <ChatInner />
        </div>
      </main>
    </RequireAuth>
  );
}
