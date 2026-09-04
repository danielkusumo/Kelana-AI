import { getToken } from "@/services/authService";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export interface AskResponse {
  question: string;
  answer: string;
}

export interface AskSource {
  score: number;
  title: string;
  uri?: string | null;
  snippet?: string;
}

export interface AskKBResponse extends AskResponse {
  accepted: boolean;
  sources: AskSource[];
}

function authHeaders(extra?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = { ...(extra || {}) };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

async function postAsk<T extends AskResponse = AskResponse>(
  path: string,
  question: string
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ question }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.detail || "Request failed");
  }
  return data as T;
}

/** Ask the Bedrock Knowledge Base (RAG). Returns grounded answer + sources. */
export function askKnowledgeBase(question: string): Promise<AskKBResponse> {
  return postAsk<AskKBResponse>("/ask", question);
}

/** Ask the base foundation model directly */
export function askBaseModel(question: string): Promise<AskResponse> {
  return postAsk<AskResponse>("/ask/base", question);
}