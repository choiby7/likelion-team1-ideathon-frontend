import { apiRequest } from "./apiClient";
import { clearAuth, writeAuth, writeUser } from "./auth";
import type {
  LoginResponse,
  RefreshResponse,
  User,
} from "@/types/auth";

export async function fetchKakaoLoginUrl(): Promise<string> {
  const data = await apiRequest<{ url: string }>("/api/auth/kakao/url", {
    method: "GET",
    skipAuthRetry: true,
  });
  return data.url;
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
