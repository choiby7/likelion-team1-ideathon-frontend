import { apiRequest } from "./apiClient";
import { getAccessToken } from "./auth";
import type { Message } from "@/types/memoir";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

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

interface SttResponse {
  sessionId: string;
  sttText: string;
  aiResponse: string;
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

export async function sendVoiceMessage(
  sessionId: string,
  audio: Blob,
  filename: string,
): Promise<{ sttText: string; aiText: string }> {
  const form = new FormData();
  form.append("sessionId", sessionId);
  form.append("audio", audio, filename);

  const token = getAccessToken();
  const res = await fetch(`${BASE_URL}/api/chat/voice`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });

  const text = await res.text();
  let payload: unknown = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  if (!res.ok) {
    const msg =
      (payload as { message?: string })?.message ?? `HTTP ${res.status}`;
    throw new Error(msg);
  }

  const envelope = payload as {
    success: boolean;
    message?: string;
    data: SttResponse;
  };
  if (!envelope?.success) {
    throw new Error(envelope?.message ?? "음성 처리 실패");
  }

  return {
    sttText: envelope.data.sttText,
    aiText: envelope.data.aiResponse,
  };
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
