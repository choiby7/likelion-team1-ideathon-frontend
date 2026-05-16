import { clearAuth, readAuth, writeAuth } from "./auth";
import type { ApiEnvelope, RefreshResponse } from "@/types/auth";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

export const AUTH_LOGOUT_EVENT = "memoreal:auth:logout";

function authHeader(): Record<string, string> {
  const auth = readAuth();
  if (!auth) return {};
  return { Authorization: `${auth.tokenType} ${auth.accessToken}` };
}

async function rawFetch(
  path: string,
  init: RequestInit,
): Promise<Response> {
  return fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...authHeader(),
      ...(init.headers ?? {}),
    },
  });
}

let refreshInFlight: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight;
  refreshInFlight = (async () => {
    const auth = readAuth();
    if (!auth) return false;
    try {
      const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${auth.tokenType} ${auth.accessToken}`,
        },
      });
      if (!res.ok) return false;
      const envelope = (await res.json()) as ApiEnvelope<RefreshResponse>;
      if (!envelope.success || !envelope.data) return false;
      writeAuth(envelope.data);
      return true;
    } catch {
      return false;
    }
  })();
  try {
    return await refreshInFlight;
  } finally {
    refreshInFlight = null;
  }
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public payload?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  skipAuthRetry?: boolean;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, skipAuthRetry, ...rest } = options;
  const init: RequestInit = {
    ...rest,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  };

  let res = await rawFetch(path, init);

  if (res.status === 401 && !skipAuthRetry) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      res = await rawFetch(path, init);
    } else {
      clearAuth();
      window.dispatchEvent(new Event(AUTH_LOGOUT_EVENT));
      throw new ApiError("Unauthorized", 401);
    }
  }

  let payload: unknown = null;
  const text = await res.text();
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
    throw new ApiError(msg, res.status, payload);
  }

  const envelope = payload as ApiEnvelope<T>;
  if (envelope && typeof envelope === "object" && "success" in envelope) {
    if (!envelope.success) {
      throw new ApiError(envelope.message ?? "API error", res.status, payload);
    }
    return envelope.data;
  }

  return payload as T;
}
