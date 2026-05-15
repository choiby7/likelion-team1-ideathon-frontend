export type ChapterStatus = "draft" | "completed";
export type Role = "ai" | "user";

export interface Message {
  id: string;
  role: Role;
  text: string;
  createdAt: number;
}

export interface Memoir {
  id: string;
  chapter: number;
  title: string;
  status: ChapterStatus;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
}

export interface MemoirSummary {
  id: string;
  chapter: number;
  title: string;
  status: ChapterStatus;
  updatedAt: number;
  completedAt?: number;
}
