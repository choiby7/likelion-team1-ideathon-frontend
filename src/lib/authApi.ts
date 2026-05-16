import { apiRequest } from "./apiClient";
import { clearAuth, writeAuth, writeUser } from "./auth";
import type {
  LoginResponse,
  RefreshResponse,
  User,
} from "@/types/auth";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

export function kakaoLoginUrl(): string {
  return `${BASE_URL}/oauth2/authorization/kakao`;
}

export async function fetchMe(): Promise<User> {
  return apiRequest<User>("/api/auth/me", { method: "GET" });
}

export async function refreshAccessToken(): Promise<RefreshResponse> {
  const data = await apiRequest<RefreshResponse>("/api/auth/refresh", {
    method: "POST",
    skipAuthRetry: true,
  });
  writeAuth(data);
  return data;
}

export async function logoutRequest(): Promise<void> {
  try {
    await apiRequest<null>("/api/auth/logout", {
      method: "POST",
      skipAuthRetry: true,
    });
  } finally {
    clearAuth();
  }
}

export function persistLogin(payload: LoginResponse): void {
  writeAuth({
    accessToken: payload.accessToken,
    tokenType: payload.tokenType,
    expiresIn: payload.expiresIn,
  });
  writeUser(payload.user);
}
