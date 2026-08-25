"use client";

import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Wallet,
  Utensils,
  Bus,
  MapPin,
  Soup,
} from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";

interface ItineraryContentProps {
  markdown: string;
}

interface Section {
  heading: string;
  body: string;
}

type SectionKind = "day" | "budget" | "food" | "transport" | "other";

function splitSections(markdown: string): Section[] {
  const sections: Section[] = [];
  const h2Regex = /^##\s+(.+)$/gm;
  const matches: { heading: string; index: number; length: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = h2Regex.exec(markdown)) !== null) {
    matches.push({ heading: m[1].trim(), index: m.index, length: m[0].length });
  }

  if (matches.length === 0) {
    if (markdown.trim()) sections.push({ heading: "", body: markdown.trim() });
    return sections;
  }

  const first = matches[0];
  if (first.index > 0) {
    const pre = markdown.slice(0, first.index).trim();
    if (pre) sections.push({ heading: "", body: pre });
  }

  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index + matches[i].length;
    const end = i + 1 < matches.length ? matches[i + 1].index : markdown.length;
    sections.push({
      heading: matches[i].heading,
      body: markdown.slice(start, end).trim(),
    });
  }
  return sections;
}

function classifySection(heading: string): SectionKind {
  const h = heading.toLowerCase();
  if (/(^day\s+\d)|(^\d+[.:)])/.test(h)) return "day";
  if (h.includes("budget") || h.includes("cost")) return "budget";
  if (
    h.includes("food") ||
    h.includes("dining") ||
    h.includes("meal") ||
    h.includes("cuisine") ||
    h.includes("kitchen")
  )
    return "food";
  if (
    h.includes("transport") ||
    h.includes("getting around") ||
    h.includes("travel") ||
    h.includes("commute")
  )
    return "transport";
  return "other";
}

function getDayInfo(heading: string): { num: number; title: string } {
  const m =
    heading.match(/^day\s+(\d+)\s*[:\s\-–—]*\s*(.*)$/i) ||
    heading.match(/^(\d+)\s*[.:)\s]+\s*(.*)$/);
  if (m) return { num: parseInt(m[1], 10), title: (m[2] || "").trim() };
  return { num: 0, title: heading };
}

function parseTable(body: string): string[][] {
  const rows: string[][] = [];
  for (const lineRaw of body.split("\n")) {
    const line = lineRaw.trim();
    if (!line.startsWith("|") || !line.endsWith("|")) continue;
    const cells = line
      .slice(1, -1)
      .split("|")
      .map((c) => c.trim().replace(/\*\*/g, ""));
    if (cells.every((c) => c === "" || /^:?-{2,}:?$/.test(c))) continue;
    rows.push(cells);
  }
  return rows;
}

function renderInline(text: string) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => (
          <p className="text-white/75 text-sm leading-relaxed m-0">{children}</p>
        ),
        strong: ({ children }) => (
          <strong className="text-white/95 font-semibold">{children}</strong>
        ),
        em: ({ children }) => (
          <em className="text-white/80 italic">{children}</em>
        ),
      }}
    >
      {text}
    </ReactMarkdown>
  );
}

function renderDayBody(body: string) {
  const lines = body.split("\n").map((l) => l.trim()).filter(Boolean);
  return lines.map((line, idx) => {
    const clean = line
      .replace(/^#{1,6}\s+/, "")
      .replace(/\*\*/g, "")
      .replace(/^[-*•]\s+/, "")
      .trim();
    const isTimeHeader = /^(morning|afternoon|evening)([.:]|$)/i.test(
      clean
    );

    if (isTimeHeader) {
      return (
        <div
          key={idx}
          className="mt-5 mb-2 first:mt-0 border-b border-violet-400/20 pb-1.5"
        >
          <span className="block text-white font-bold text-base tracking-wide">
            {clean.replace(/[.:]+$/, "")}
          </span>
        </div>
      );
    }

    const text = line
      .replace(/^[-*•]\s+/, "")
      .replace(/^#{1,6}\s+/, "")
      .replace(/\*\*/g, "")
      .trim();
    return (
      <div key={idx} className="flex items-start gap-2.5 py-1">
        <span className="mt-2 w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0" />
        <div className="flex-1">{renderInline(text)}</div>
      </div>
    );
  });
}

function DaySection({
  heading,
  body,
  isLast,
}: {
  heading: string;
  body: string;
  isLast: boolean;
}) {
  const { num, title } = getDayInfo(heading);
  const dayLabel = num ? `${num}` : "•";
  return (
    <div className="relative">
      {/* Timeline node / pointer */}
      <div className="absolute left-[17px] top-5 z-10 flex items-center justify-center w-9 h-9 -translate-x-1/2 rounded-full bg-violet-500/15 border border-violet-400/40 text-violet-200 font-bold text-sm shadow-[0_0_16px_rgba(139,92,246,0.3)] backdrop-blur-sm">
        {dayLabel}
      </div>

      {/* Vertical connector segment */}
      {!isLast && (
        <div className="absolute left-[17px] top-14 bottom-[-1.5rem] w-0.5 -translate-x-1/2 bg-gradient-to-b from-violet-500/35 via-violet-500/15 to-violet-500/10" />
      )}

      <motion.div
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="pl-14 md:pl-16"
      >
        <div className="bg-white/[0.04] border border-white/10 rounded-2xl overflow-hidden hover:border-violet-400/30 transition-colors">
          <div className="px-5 py-4 border-b border-white/[0.08] bg-gradient-to-r from-violet-500/10 via-transparent to-transparent">
            <h3 className="text-white font-semibold text-base tracking-wide">
              {num ? `Day ${num}` : heading}
            </h3>
            {title && (
              <p className="text-white/45 text-xs mt-0.5">{title}</p>
            )}
          </div>
          <div className="px-5 py-4">{renderDayBody(body)}</div>
        </div>
      </motion.div>
    </div>
  );
}

function BudgetSection({ body }: { body: string }) {
  const rows = parseTable(body);
  if (rows.length === 0) {
    return (
      <GlassCard className="p-6">
        <div className="prose prose-invert prose-sm max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
        </div>
      </GlassCard>
    );
  }
  const header = rows[0];
  const data = rows.slice(1);
  const totalRow = data.find((r) => r[0] && /total/i.test(r[0]));
  const dataRows = totalRow ? data.filter((r) => r !== totalRow) : data;

  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 rounded-lg bg-violet-500/10 border border-violet-500/20">
          <Wallet className="w-5 h-5 text-violet-300" />
        </div>
        <div>
          <h3 className="text-white font-semibold">Estimated Daily Budget</h3>
          <p className="text-white/40 text-xs">Daily & total allocation</p>
        </div>
      </div>
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-white/[0.04] text-white/50 text-xs uppercase tracking-wider">
              {header.map((cell, i) => (
                <th
                  key={i}
                  className={`px-3 py-2.5 font-medium ${
                    i === 0 ? "text-left" : "text-right"
                  }`}
                >
                  {cell}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {dataRows.map((row, idx) => (
              <motion.tr
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.08 }}
                className="hover:bg-white/[0.02] transition-colors"
              >
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    className={`px-3 py-2.5 ${
                      ci === 0
                        ? "text-left text-white/80"
                        : "text-right font-mono text-white/70"
                    }`}
                  >
                    {ci === 0 ? (
                      <span className="flex items-center gap-2">
                        <Utensils className="w-3.5 h-3.5 text-amber-300/70" />
                        {cell}
                      </span>
                    ) : (
                      cell
                    )}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
          {totalRow && (
            <tfoot>
              <tr className="bg-violet-500/10 border-t border-white/10">
                {totalRow.map((cell, ci) => (
                  <td
                    key={ci}
                    className={`px-3 py-2.5 font-semibold ${
                      ci === 0
                        ? "text-left text-violet-200"
                        : "text-right text-violet-200 font-mono"
                    }`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </GlassCard>
  );
}

function renderSectionLine(
  line: string,
  kind: "food" | "transport",
  idx: number
) {
  const trimmed = line.trim();
  if (!trimmed) return null;
  if (/^-{3,}$/.test(trimmed) || /^\*{3,}$/.test(trimmed) || /^_{3,}$/.test(trimmed)) {
    return null;
  }

  // Strip leading bullet marker first
  const clean = trimmed.replace(/^[-*•]\s+/, "");
  const labelText = clean.replace(/\*\*/g, "").trim();

  // "**Label:** content" — label + inline list content on the same line
  const boldMatch = clean.match(/^\*\*(.+?)\*\*\s*[:：]\s*(.*)$/);

  if (boldMatch) {
    const label = boldMatch[1].trim();
    const rest = boldMatch[2].trim();
    const dotColor = kind === "food" ? "bg-amber-400" : "bg-fuchsia-400";
    const items = rest
      ? rest
          .split(/,|;| dan /i)
          .map((s) => s.trim().replace(/\*+/g, ""))
          .filter(Boolean)
      : [];
    return (
      <div key={idx} className="mt-4 mb-1 first:mt-0">
        <p className="text-white font-semibold text-[15px] tracking-wide m-0">
          {label.replace(/[:：]$/, "")}
        </p>
        {items.length > 0 && (
          <div className="mt-2 space-y-1.5">
            {items.map((item, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span
                  className={`mt-2 w-1.5 h-1.5 rounded-full ${dotColor} flex-shrink-0`}
                />
                <p className="text-white/75 text-sm leading-relaxed m-0 font-normal">
                  {item}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Label line ending with ":" (e.g. "Dining Areas:")
  if (/[:：]\s*$/.test(clean)) {
    return (
      <div key={idx} className="mt-4 mb-1 first:mt-0">
        <p className="text-white font-semibold text-[15px] tracking-wide m-0">
          {labelText.replace(/[:：]$/, "")}
        </p>
      </div>
    );
  }

  // Item line — pointer dot + plain text (no bold)
  const dotColor = kind === "food" ? "bg-amber-400" : "bg-fuchsia-400";
  return (
    <div key={idx} className="flex items-start gap-2.5 py-1">
      <span className={`mt-2 w-1.5 h-1.5 rounded-full ${dotColor} flex-shrink-0`} />
      <div className="flex-1">
        <p className="text-white/75 text-sm leading-relaxed m-0 font-normal">
          {clean.replace(/\*/g, "")}
        </p>
      </div>
    </div>
  );
}

function TextSection({
  kind,
  heading,
  body,
}: {
  kind: "food" | "transport" | "other";
  heading: string;
  body: string;
}) {
  const icon =
    kind === "food" ? (
      <Soup className="w-5 h-5 text-amber-300" />
    ) : kind === "transport" ? (
      <Bus className="w-5 h-5 text-fuchsia-300" />
    ) : (
      <MapPin className="w-5 h-5 text-violet-300" />
    );
  const accent =
    kind === "food" ? "bg-amber-500/10 border-amber-500/20" : "bg-fuchsia-500/10 border-fuchsia-500/20";

  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg border ${kind === "other" ? "bg-violet-500/10 border-violet-500/20" : accent}`}>
          {icon}
        </div>
        <h3 className="text-white font-semibold">{heading}</h3>
      </div>
      {kind === "other" ? (
        <div className="prose prose-invert prose-sm max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
        </div>
      ) : (
        <div className="space-y-1">
          {body
            .split("\n")
            .filter((l) => l.trim())
            .map((line, idx) => renderSectionLine(line, kind, idx))}
        </div>
      )}
    </GlassCard>
  );
}

interface SubDay {
  num: number;
  title: string;
  body: string;
}

function parseSubDays(body: string): SubDay[] {
  const lines = body.split("\n");
  const days: SubDay[] = [];
  let current: SubDay | null = null;
  for (const lineRaw of lines) {
    const line = lineRaw.trim();
    if (!line) continue;
    const m =
      line.match(/^#{1,6}\s*day\s+(\d+)\s*[:\-–—.]*\s*(.*)$/i) ||
      line.match(/^#{1,6}\s*(\d+)\s*[.:)]\s*(.*)$/);
    if (m) {
      if (current) days.push(current);
      current = { num: parseInt(m[1], 10), title: (m[2] || "").trim(), body: "" };
    } else if (current) {
      current.body += line + "\n";
    }
  }
  if (current) days.push(current);
  return days;
}

function TimelineSection({
  days,
  title,
}: {
  days: SubDay[];
  title?: string;
}) {
  return (
    <div>
      {title && (
        <div className="flex items-center gap-2 mb-5">
          <div className="p-2 rounded-lg bg-violet-500/10 border border-violet-500/20">
            <MapPin className="w-5 h-5 text-violet-300" />
          </div>
          <h3 className="text-white font-semibold text-lg">{title}</h3>
        </div>
      )}
      <div className="space-y-6">
        {days.map((d, idx) => (
          <DaySection
            key={`${d.num}-${d.title}`}
            heading={d.title ? `Day ${d.num}: ${d.title}` : `Day ${d.num}`}
            body={d.body}
            isLast={idx === days.length - 1}
          />
        ))}
      </div>
    </div>
  );
}

export default function ItineraryContent({ markdown }: ItineraryContentProps) {
  const sections = splitSections(markdown);

  return (
    <div className="space-y-6">
      {sections.map((s, key) => {
        const kind = classifySection(s.heading);
        const subDays =
          /itinerary|trip plan|day plan|daily/i.test(s.heading) ||
          /^#{1,6}\s*day\s+\d+/im.test(s.body)
            ? parseSubDays(s.body)
            : [];
        const soloDay = kind === "day"
          ? [
              {
                num: getDayInfo(s.heading).num,
                title: getDayInfo(s.heading).title,
                body: s.body,
              },
            ]
          : [];

        // A heading that contains sub-days (e.g. "Daily Itinerary")
        if (subDays.length > 0) {
          return (
            <TimelineSection
              key={key}
              days={subDays}
              title={/itinerary|trip plan|daily/i.test(s.heading) ? s.heading : undefined}
            />
          );
        }
        // A single "Day N" section
        if (soloDay.length > 0) {
          return <TimelineSection key={key} days={soloDay} />;
        }
        if (kind === "budget") {
          return <BudgetSection key={key} body={s.body} />;
        }
        if (kind === "food") {
          return <TextSection key={key} kind="food" heading={s.heading} body={s.body} />;
        }
        if (kind === "transport") {
          return <TextSection key={key} kind="transport" heading={s.heading} body={s.body} />;
        }
        if (!s.heading) {
          // Intro before any heading
          return (
            <div key={key} className="prose prose-invert prose-md max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {stripTitle(s.body)}
              </ReactMarkdown>
            </div>
          );
        }
        return <TextSection key={key} kind="other" heading={s.heading} body={s.body} />;
      })}
    </div>
  );
}

function stripTitle(body: string): string {
  return body.replace(/^#{1,3}\s+.+\n*/m, "").trim();
}