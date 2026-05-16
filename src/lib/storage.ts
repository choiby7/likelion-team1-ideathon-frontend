import type { Memoir } from "@/types/memoir";

const MEMOIRS_KEY = "memoreal:memoirs:v2";
const ACTIVE_DRAFT_KEY = "memoreal:activeDraftId:v2";

// One-time cleanup of v1 keys (messages were embedded; now backend-sourced).
const V1_MEMOIRS_KEY = "memoreal:memoirs:v1";
const V1_DRAFT_KEY = "memoreal:activeDraftId:v1";

let migrated = false;
function migrateIfNeeded(): void {
  if (migrated) return;
  migrated = true;
  try {
    localStorage.removeItem(V1_MEMOIRS_KEY);
    localStorage.removeItem(V1_DRAFT_KEY);
  } catch {
    /* ignore */
  }
}

export type MemoirMeta = Omit<Memoir, "messages">;

export function readMemoirs(): MemoirMeta[] {
  migrateIfNeeded();
  try {
    const raw = localStorage.getItem(MEMOIRS_KEY);
    return raw ? (JSON.parse(raw) as MemoirMeta[]) : [];
  } catch {
    return [];
  }
}

export function writeMemoirs(memoirs: MemoirMeta[]): void {
  migrateIfNeeded();
  localStorage.setItem(MEMOIRS_KEY, JSON.stringify(memoirs));
}

export function readActiveDraftId(): string | null {
  migrateIfNeeded();
  return localStorage.getItem(ACTIVE_DRAFT_KEY);
}

export function writeActiveDraftId(id: string | null): void {
  migrateIfNeeded();
  if (id) localStorage.setItem(ACTIVE_DRAFT_KEY, id);
  else localStorage.removeItem(ACTIVE_DRAFT_KEY);
}
