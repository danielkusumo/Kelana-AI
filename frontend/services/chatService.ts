import { getToken } from "@/services/authService";
import type {
  Conversation,
  ConversationDetail,
  SendMessageResult,
} from "@/types/chat";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

function authHeaders(extra?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = { ...(extra || {}) };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, init);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.detail || "Request failed");
  }
  return data as T;
}

export function createConversation(): Promise<Conversation> {
  return request("/conversations", { method: "POST", headers: authHeaders() });
}

export function listConversations(): Promise<Conversation[]> {
  return request("/conversations", { method: "GET", headers: authHeaders() });
}

export function getConversation(id: number): Promise<ConversationDetail> {
  return request(`/conversations/${id}`, { method: "GET", headers: authHeaders() });
}

export function sendMessage(id: number, content: string): Promise<SendMessageResult> {
  return request(`/conversations/${id}/messages`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ content }),
  });
}

export function updateConversation(id: number, title: string): Promise<Conversation> {
  return request(`/conversations/${id}`, {
    method: "PATCH",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ title }),
  });
}

export function deleteConversation(id: number): Promise<{ message: string }> {
  return request(`/conversations/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
}