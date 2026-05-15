import type { Memoir } from "@/types/memoir";

const MEMOIRS_KEY = "memoreal:memoirs:v1";
const ACTIVE_DRAFT_KEY = "memoreal:activeDraftId:v1";

export function readMemoirs(): Memoir[] {
  try {
    const raw = localStorage.getItem(MEMOIRS_KEY);
    return raw ? (JSON.parse(raw) as Memoir[]) : [];
  } catch {
    return [];
  }
}

export function writeMemoirs(memoirs: Memoir[]): void {
  localStorage.setItem(MEMOIRS_KEY, JSON.stringify(memoirs));
}

export function readActiveDraftId(): string | null {
  return localStorage.getItem(ACTIVE_DRAFT_KEY);
}

export function writeActiveDraftId(id: string | null): void {
  if (id) localStorage.setItem(ACTIVE_DRAFT_KEY, id);
  else localStorage.removeItem(ACTIVE_DRAFT_KEY);
}
