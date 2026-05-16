import { apiRequest } from "./apiClient";
import type { Message } from "@/types/memoir";

interface SessionResponse {
  sessionId: string;
}

interface ChatResponse {
  sessionId: string;
  role: string;
  content: string;
  isEnd: boolean;
  createdAt?: string;
}

interface HistoryItem {
  id: number;
  role: string;
  content: string;
  createdAt: string;
}

export async function createSession(): Promise<string> {
  const data = await apiRequest<SessionResponse>("/api/chat/session", {
    method: "GET",
  });
  return data.sessionId;
}

export async function sendTextMessage(
  sessionId: string,
  message: string,
): Promise<{ aiText: string }> {
  const data = await apiRequest<ChatResponse>("/api/chat/message", {
    method: "POST",
    body: { sessionId, message },
  });
  return { aiText: data.content };
}

export async function fetchHistory(sessionId: string): Promise<Message[]> {
  const items = await apiRequest<HistoryItem[]>(
    `/api/chat/history/${encodeURIComponent(sessionId)}`,
    { method: "GET" },
  );
  return items.map(mapHistoryToMessage);
}

function mapHistoryToMessage(item: HistoryItem): Message {
  return {
    id: String(item.id),
    role: item.role.toLowerCase() === "user" ? "user" : "ai",
    text: item.content,
    createdAt: new Date(item.createdAt).getTime(),
  };
}

export function mapServerRoleToMessage(
  id: string,
  role: string,
  content: string,
  createdAt: number,
): Message {
  return {
    id,
    role: role.toLowerCase() === "user" ? "user" : "ai",
    text: content,
    createdAt,
  };
}
