import type { Memoir, MemoirSummary, Message } from "@/types/memoir";
import {
  readActiveDraftId,
  readMemoirs,
  writeActiveDraftId,
  writeMemoirs,
} from "./storage";
import { generateReply } from "./mockAi";

const FALLBACK_TITLE = "제목 없는 이야기";

function toSummary(m: Memoir): MemoirSummary {
  return {
    id: m.id,
    chapter: m.chapter,
    title: m.title,
    status: m.status,
    updatedAt: m.updatedAt,
    completedAt: m.completedAt,
  };
}

function newId(): string {
  return crypto.randomUUID();
}

function makeMessage(
  partial: Omit<Message, "id" | "createdAt">,
  now = Date.now(),
): Message {
  return { id: newId(), createdAt: now, ...partial };
}

function nextChapter(memoirs: Memoir[]): number {
  return memoirs.reduce((max, m) => Math.max(max, m.chapter), 0) + 1;
}

function deriveTitle(memoir: Memoir): string {
  if (memoir.title && memoir.title !== FALLBACK_TITLE) return memoir.title;
  const firstUser = memoir.messages.find((m) => m.role === "user");
  if (!firstUser) return FALLBACK_TITLE;
  const trimmed = firstUser.text.trim().replace(/\s+/g, " ");
  if (!trimmed) return FALLBACK_TITLE;
  return trimmed.length > 12 ? trimmed.slice(0, 12) + "…" : trimmed;
}

function upsert(memoirs: Memoir[], memoir: Memoir): Memoir[] {
  const idx = memoirs.findIndex((m) => m.id === memoir.id);
  if (idx === -1) return [memoir, ...memoirs];
  const copy = memoirs.slice();
  copy[idx] = memoir;
  return copy;
}

export async function listMemoirs(): Promise<MemoirSummary[]> {
  return readMemoirs().map(toSummary);
}

export async function getMemoir(id: string): Promise<Memoir | null> {
  return readMemoirs().find((m) => m.id === id) ?? null;
}

export async function getActiveDraft(): Promise<Memoir | null> {
  const id = readActiveDraftId();
  if (!id) return null;
  const memoir = readMemoirs().find((m) => m.id === id);
  if (!memoir || memoir.status !== "draft") {
    writeActiveDraftId(null);
    return null;
  }
  return memoir;
}

export async function createMemoir(initialAiPrompt: string): Promise<Memoir> {
  const memoirs = readMemoirs();
  const now = Date.now();
  const greeting: Message = makeMessage(
    { role: "ai", text: initialAiPrompt },
    now,
  );
  const memoir: Memoir = {
    id: newId(),
    chapter: nextChapter(memoirs),
    title: FALLBACK_TITLE,
    status: "draft",
    messages: [greeting],
    createdAt: now,
    updatedAt: now,
  };
  writeMemoirs(upsert(memoirs, memoir));
  writeActiveDraftId(memoir.id);
  return memoir;
}

export async function appendMessage(
  memoirId: string,
  msg: Omit<Message, "id" | "createdAt">,
): Promise<Memoir> {
  const memoirs = readMemoirs();
  const current = memoirs.find((m) => m.id === memoirId);
  if (!current) throw new Error(`Memoir not found: ${memoirId}`);
  const now = Date.now();
  const next: Memoir = {
    ...current,
    messages: [...current.messages, makeMessage(msg, now)],
    updatedAt: now,
  };
  next.title = deriveTitle(next);
  writeMemoirs(upsert(memoirs, next));
  return next;
}

export async function updateMemoirTitle(
  memoirId: string,
  title: string,
): Promise<Memoir> {
  const memoirs = readMemoirs();
  const current = memoirs.find((m) => m.id === memoirId);
  if (!current) throw new Error(`Memoir not found: ${memoirId}`);
  const next: Memoir = { ...current, title, updatedAt: Date.now() };
  writeMemoirs(upsert(memoirs, next));
  return next;
}

export async function completeMemoir(memoirId: string): Promise<Memoir> {
  const memoirs = readMemoirs();
  const current = memoirs.find((m) => m.id === memoirId);
  if (!current) throw new Error(`Memoir not found: ${memoirId}`);
  const now = Date.now();
  const next: Memoir = {
    ...current,
    status: "completed",
    completedAt: now,
    updatedAt: now,
  };
  writeMemoirs(upsert(memoirs, next));
  if (readActiveDraftId() === memoirId) writeActiveDraftId(null);
  return next;
}

export async function deleteMemoir(memoirId: string): Promise<void> {
  const memoirs = readMemoirs().filter((m) => m.id !== memoirId);
  writeMemoirs(memoirs);
  if (readActiveDraftId() === memoirId) writeActiveDraftId(null);
}

export async function sendChatMessage(
  memoirId: string,
  userText: string,
): Promise<{ userMessage: Message; aiMessage: Message; memoir: Memoir }> {
  const memoirs = readMemoirs();
  const current = memoirs.find((m) => m.id === memoirId);
  if (!current) throw new Error(`Memoir not found: ${memoirId}`);

  const now = Date.now();
  const userMessage: Message = makeMessage(
    { role: "user", text: userText },
    now,
  );
  const historyWithUser = [...current.messages, userMessage];

  const replyText = await generateReply(historyWithUser);
  const aiMessage: Message = makeMessage(
    { role: "ai", text: replyText },
    Date.now(),
  );

  const next: Memoir = {
    ...current,
    messages: [...historyWithUser, aiMessage],
    updatedAt: Date.now(),
  };
  next.title = deriveTitle(next);

  // Re-read in case of concurrent writes from other tabs (best effort, last-write-wins).
  writeMemoirs(upsert(readMemoirs(), next));
  return { userMessage, aiMessage, memoir: next };
}
