import type { User } from "@/types/auth";

const TOKEN_KEY = "memoreal:auth:v1";
const USER_KEY = "memoreal:user:v1";

interface StoredAuth {
  accessToken: string;
  tokenType: string;
  expiresAt: number;
}

export function readAuth(): StoredAuth | null {
  try {
    const raw = localStorage.getItem(TOKEN_KEY);
    return raw ? (JSON.parse(raw) as StoredAuth) : null;
  } catch {
    return null;
  }
}

export function writeAuth(token: {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}): void {
  const payload: StoredAuth = {
    accessToken: token.accessToken,
    tokenType: token.tokenType,
    expiresAt: Date.now() + token.expiresIn,
  };
  localStorage.setItem(TOKEN_KEY, JSON.stringify(payload));
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getAccessToken(): string | null {
  return readAuth()?.accessToken ?? null;
}

export function isTokenExpired(): boolean {
  const auth = readAuth();
  if (!auth) return true;
  return Date.now() >= auth.expiresAt;
}

export function readUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function writeUser(user: User): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}
