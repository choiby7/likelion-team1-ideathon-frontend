import type { Memoir, MemoirSummary, Message } from "@/types/memoir";
import {
  readActiveDraftId,
  readMemoirs,
  writeActiveDraftId,
  writeMemoirs,
  type MemoirMeta,
} from "./storage";
import { createSession, fetchHistory, sendTextMessage } from "./chatApi";
import { generateSummary } from "./mockAi";

const FALLBACK_TITLE = "제목 없는 이야기";

function toSummary(m: MemoirMeta): MemoirSummary {
  return {
    id: m.id,
    chapter: m.chapter,
    title: m.title,
    status: m.status,
    updatedAt: m.updatedAt,
    completedAt: m.completedAt,
  };
}

function nextChapter(memoirs: MemoirMeta[]): number {
  return memoirs.reduce((max, m) => Math.max(max, m.chapter), 0) + 1;
}

function deriveTitle(meta: MemoirMeta, messages: Message[]): string {
  if (meta.title && meta.title !== FALLBACK_TITLE) return meta.title;
  const firstUser = messages.find((m) => m.role === "user");
  if (!firstUser) return FALLBACK_TITLE;
  const trimmed = firstUser.text.trim().replace(/\s+/g, " ");
  if (!trimmed) return FALLBACK_TITLE;
  return trimmed.length > 12 ? trimmed.slice(0, 12) + "…" : trimmed;
}

function upsert(memoirs: MemoirMeta[], meta: MemoirMeta): MemoirMeta[] {
  const idx = memoirs.findIndex((m) => m.id === meta.id);
  if (idx === -1) return [meta, ...memoirs];
  const copy = memoirs.slice();
  copy[idx] = meta;
  return copy;
}

function metaToMemoir(meta: MemoirMeta, messages: Message[]): Memoir {
  return { ...meta, messages };
}

export async function listMemoirs(): Promise<MemoirSummary[]> {
  return readMemoirs().map(toSummary);
}

export async function getMemoir(id: string): Promise<Memoir | null> {
  const meta = readMemoirs().find((m) => m.id === id);
  if (!meta) return null;
  let messages: Message[] = [];
  try {
    messages = await fetchHistory(id);
  } catch {
    messages = [];
  }
  return metaToMemoir(meta, messages);
}

export async function getActiveDraft(): Promise<Memoir | null> {
  const id = readActiveDraftId();
  if (!id) return null;
  const meta = readMemoirs().find((m) => m.id === id);
  if (!meta || meta.status !== "draft") {
    writeActiveDraftId(null);
    return null;
  }
  let messages: Message[] = [];
  try {
    messages = await fetchHistory(id);
  } catch {
    messages = [];
  }
  return metaToMemoir(meta, messages);
}

// Parks the current draft pointer so the next /chat visit starts a fresh
// session (existing draft remains in the memoirs list, just no longer "active").
export async function clearActiveDraft(): Promise<void> {
  writeActiveDraftId(null);
}

export async function createMemoir(_initialAiPrompt?: string): Promise<Memoir> {
  void _initialAiPrompt; // backend doesn't persist an initial greeting; UI handles placeholder
  const memoirs = readMemoirs();
  const sessionId = await createSession();
  const now = Date.now();
  const meta: MemoirMeta = {
    id: sessionId,
    chapter: nextChapter(memoirs),
    title: FALLBACK_TITLE,
    status: "draft",
    createdAt: now,
    updatedAt: now,
  };
  writeMemoirs(upsert(memoirs, meta));
  writeActiveDraftId(meta.id);
  return metaToMemoir(meta, []);
}

export async function completeMemoir(memoirId: string): Promise<Memoir> {
  const memoirs = readMemoirs();
  const current = memoirs.find((m) => m.id === memoirId);
  if (!current) throw new Error(`Memoir not found: ${memoirId}`);
  const now = Date.now();
  const next: MemoirMeta = {
    ...current,
    status: "completed",
    completedAt: now,
    updatedAt: now,
  };
  writeMemoirs(upsert(memoirs, next));
  if (readActiveDraftId() === memoirId) writeActiveDraftId(null);
  let messages: Message[] = [];
  try {
    messages = await fetchHistory(memoirId);
  } catch {
    /* keep empty */
  }
  return metaToMemoir(next, messages);
}

function newMessageId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

async function appendAndPersist(
  memoirId: string,
  user: Message,
  ai: Message,
): Promise<{ userMessage: Message; aiMessage: Message; memoir: Memoir }> {
  const memoirs = readMemoirs();
  const current = memoirs.find((m) => m.id === memoirId);
  if (!current) throw new Error(`Memoir not found: ${memoirId}`);

  // Fetch authoritative history so display reflects what backend actually stored.
  // Backend persists both user + assistant messages during /message and /voice calls.
  let messages: Message[];
  try {
    messages = await fetchHistory(memoirId);
  } catch {
    // Fall back to optimistic append if history fetch fails.
    messages = [user, ai];
  }

  const nextMeta: MemoirMeta = {
    ...current,
    title: deriveTitle(current, messages),
    updatedAt: Date.now(),
  };
  writeMemoirs(upsert(memoirs, nextMeta));

  return {
    userMessage: user,
    aiMessage: ai,
    memoir: metaToMemoir(nextMeta, messages),
  };
}

export async function sendChatMessage(
  memoirId: string,
  userText: string,
): Promise<{ userMessage: Message; aiMessage: Message; memoir: Memoir }> {
  const now = Date.now();
  const userMessage: Message = {
    id: newMessageId(),
    role: "user",
    text: userText,
    createdAt: now,
  };
  const { aiText } = await sendTextMessage(memoirId, userText);
  const aiMessage: Message = {
    id: newMessageId(),
    role: "ai",
    text: aiText,
    createdAt: Date.now(),
  };
  return appendAndPersist(memoirId, userMessage, aiMessage);
}

export async function getMemoirSummary(memoirId: string): Promise<string> {
  let messages: Message[] = [];
  try {
    messages = await fetchHistory(memoirId);
  } catch {
    /* fall through with empty */
  }
  return generateSummary(messages);
}
