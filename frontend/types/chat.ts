export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: number;
  conversation_id: number;
  role: ChatRole;
  content: string;
  created_at: string | null;
}

export interface Conversation {
  id: number;
  user_id: number;
  title?: string | null;
  created_at: string | null;
  message_count: number;
  last_message?: string | null;
  last_message_role?: ChatRole | null;
}

export interface ConversationDetail extends Conversation {
  messages: ChatMessage[];
}

export interface ConversationSource {
  score: number;
  title: string;
  uri?: string | null;
  snippet?: string;
}

export interface SendMessageResult {
  conversation: ConversationDetail;
  user_message: ChatMessage;
  assistant_message: ChatMessage;
  sources: ConversationSource[];
  accepted: boolean;
}