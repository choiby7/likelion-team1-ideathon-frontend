# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Memoreal** — a Korean mobile-first web app that lets elderly users record their life story (자서전 / memoir) by talking to an AI. Built for the LikeLion Team 1 아이디어톤. The Figma source of truth lives at file key `3ZuDtzuCAtlKWHu9DnZvge`.

## Commands

```bash
npm run dev      # Vite dev server on http://localhost:5173
npm run build    # tsc -b && vite build (typecheck is part of build)
npm run preview  # serve the production build
npm run lint     # eslint . (no config yet — currently a no-op stub in package.json)
```

There is no test runner configured. Verify changes by running `npm run build` (catches type errors) and by viewing the affected route in the dev server.

## Stack

- **Vite 6 + React 18 + TypeScript** — scaffolded manually (not via `npm create vite`) because the repo already had `.git` and `README.md`. Keep that in mind if regenerating config files.
- **Tailwind CSS v4** via the `@tailwindcss/vite` plugin (NOT the PostCSS approach). The only Tailwind setup is `@import "tailwindcss";` at the top of `src/index.css` — there is no `tailwind.config.js` and v4 does not need one. Custom colors are written as arbitrary values (`bg-[#ffcc00]`) or inline `style={{ ... }}`, not as theme tokens.
- **React Router v6** with routes declared in `src/main.tsx`.
- **Path alias**: `@/*` → `src/*` (configured in both `vite.config.ts` and `tsconfig.app.json` — must be kept in sync).
- **No new npm packages were added for the data/voice layer.** Speech uses the native Web Speech API (`webkitSpeechRecognition`/`SpeechRecognition`). IDs use `crypto.randomUUID()`. Date formatting uses the built-in `Date`.
- **Backend**: Spring Boot REST API at `VITE_API_BASE_URL` (set in `.env.local`). All HTTP goes through `src/lib/apiClient.ts` (`apiRequest<T>()`) which attaches `Authorization: Bearer <JWT>` and auto-retries once on 401 via `/api/auth/refresh`. The server wraps responses in `{ success, data, message }` — `apiRequest` unwraps `data` for callers.
- **Auth**: Kakao OAuth via `${VITE_API_BASE_URL}/oauth2/authorization/kakao` (direct browser navigation, NOT an API call). Backend redirects to `{frontend}/auth/callback?token=<JWT>&isNewUser=<bool>`. `AuthContext` (`src/contexts/AuthContext.tsx`) holds user state; `ProtectedRoute` gates non-public routes.
- **Deployment**: Vercel serves frontend; SPA fallback is in `vercel.json` (`/(.*)` → `/index.html`) — required so the OAuth callback URL doesn't 404.

## Architecture

Every screen is a mobile-only layout capped at `max-w-[430px]` and centered on the page. The layering convention is:

```
MobileFrame  ─ outer page wrapper (slate-100 backdrop + centered 430px column)
  └── <page header>
  └── <main content>
  └── <floating action> (optional, e.g. mic button — uses fixed positioning)
  └── BottomNav  ─ 4-tab nav (홈 / 대화 / 자서전 / 도움말), `fixed inset-x-0 bottom-0`
```

Because `BottomNav` is `fixed`, every page must add bottom padding (≥ `pb-32`) to its scrolling area so content isn't hidden behind it. The floating mic button on `/chat` uses `bottom-32` so it sits above the nav.

`BottomNav` uses `NavLink` from react-router and switches icon/label color via the `isActive` render prop. Adding a new tab means editing the `items` array in `src/components/BottomNav.tsx` AND adding the route in `src/main.tsx`.

### Data layer

There are two persistence sources, glued together inside `src/lib/api.ts`:

1. **Backend** owns `ChatMessage { sessionId, role, content, ... }` — accessed via `src/lib/chatApi.ts` (`createSession`, `sendTextMessage`, `fetchHistory`). The backend has **no Memoir/title/chapter/status concept**.
2. **localStorage** (`src/lib/storage.ts`) owns memoir metadata (`title`, `chapter`, `status`, `createdAt`, `completedAt`). Keys are versioned:
   - `memoreal:memoirs:v2` — `MemoirMeta[]` = `Omit<Memoir, "messages">` (metadata only; messages live on backend)
   - `memoreal:activeDraftId:v2` — `string | null`
   - On first load, `storage.ts` removes any leftover `v1` keys.

`Memoir.id` **is** the backend `sessionId` (UUID). This mapping is the entire bridge between the two sources.

`api.ts` is the swap-seam — components/hooks never import from `chatApi.ts` or `storage.ts` directly. When backend adds a Memoir domain, only `api.ts` changes.

**Key behaviors in `api.ts`:**
- `getMemoir(id)` / `getActiveDraft()` / `completeMemoir(id)` merge localStorage meta with `fetchHistory(id)` from the backend.
- `createMemoir()` calls `createSession()` first, then stores meta under the returned sessionId.
- `sendChatMessage(memoirId, text)` is the per-turn atomic unit: calls backend `/api/chat/message`, then `fetchHistory` to get the authoritative state, derives title, persists meta.
- Title auto-generation: first user message's first 12 chars; fallback `"제목 없는 이야기"`. Re-derived on every send until a manual title-set is added.
- Chapter numbering: `max(existing.chapter) + 1` at create time. Monotonic, never reused.
- Backend has no summary endpoint — `MemoirContinuePage` shows the last user message verbatim instead of an LLM summary.

### `useChatSession` hook

`src/hooks/useChatSession.ts` is the single state owner for `ChatPage`. It accepts `memoirIdFromUrl: string | null` (read from `?memoirId=` via `useSearchParams`).

**Lazy memoir creation**: mounting `/chat` with no `memoirId` does NOT create a `Memoir` record. The hook shows an in-memory greeting placeholder (`displayMessages` falls back to `[GREETING_PLACEHOLDER]`). A real `Memoir` is created on the first `send()` call. Do not change this — creating on mount produces empty drafts whenever a user navigates idly to `/chat`.

**Optimistic update**: `send()` pushes the user's message into state immediately before awaiting `sendChatMessage`, so the bubble appears without the 800 ms mock-AI delay.

Returns: `{ memoir, displayMessages, isLoading, isSending, error, send, complete }`.

### Voice / mode state

`ChatPage` owns a `mode` state: `"idle" | "listening" | "text"`. Voice transcription runs entirely in the browser via the native Web Speech API — backend `/api/chat/voice` (Clova STT) was removed from the frontend in favor of this approach.

- **idle** — shows `<MessageList>` and the floating yellow mic button.
- **listening** — `ChatPage` calls `startListening(...)` directly (no separate `ListeningPanel`). Callbacks: `onPartial` updates a `partial` state for live preview, `onFinal` accumulates final transcript, `onEnd` triggers `chat.send(text)` once. `<ListeningIndicator>` shows the partial text and a decorative waveform.
- **text** — renders `<TextInputSheet>` as an overlay. Entered when the mic button is pressed on a browser where `isSpeechSupported()` returns false (Safari iOS). Detection runs once on mount.

`?autoStart=1` query param triggers automatic mic start on mount (used from `HomePage`'s "이야기 말하기" button). Param is stripped after first run so refresh doesn't re-trigger.

`src/lib/speech.ts` wraps `webkitSpeechRecognition`/`SpeechRecognition` with `lang="ko-KR"`, `continuous=true`, `interimResults=true`. Errors are mapped to a tagged union (`unsupported | permission-denied | no-speech | network | other`). `startListening()` returns a `SpeechSession` with `stop()` and `abort()` — `ChatPage` calls `abort()` on unmount.

The waveform (7 yellow bars, CSS `@keyframes wave`) is purely decorative — it is NOT driven by real mic amplitude. We deliberately did NOT use `getUserMedia` + `AnalyserNode` because the Web Speech API already holds the mic; a second `getUserMedia` call would trigger a duplicate permission prompt.

### AI

AI responses come from the backend (`POST /api/chat/message` → `{ content }`). `src/lib/mockAi.ts` now only exports `INITIAL_AI_GREETING` (used as the in-memory placeholder when `/chat` is opened with no memoir yet). The old `generateReply` and `generateSummary` mocks were removed when backend integration landed.

## Routing

Defined in `src/main.tsx`. Routes wrapped in `<ProtectedRoute>` redirect to `/login` if no user is loaded.

| Path | Component | Protected? | Notes |
|---|---|---|---|
| `/` | redirect → `/onboarding` | — | |
| `/onboarding` | `OnboardingPage` | no | Kakao "시작하기" button → `${BASE}/oauth2/authorization/kakao` |
| `/login` | `LoginPage` | no | Same Kakao redirect flow |
| `/auth/callback` | `AuthCallbackPage` | no | Reads `?token=&isNewUser=`, calls `/api/auth/me`, routes to `/mic-permission` (new) or `/home` (returning) |
| `/mic-permission` | `MicPermissionPage` | yes | One-time onboarding step |
| `/home` | `HomePage` | yes | "이야기 말하기" button clears active draft + navigates `/chat?autoStart=1` |
| `/chat` | `ChatPage` | yes | `?memoirId=X` resumes memoir; omitted = new draft flow. `?autoStart=1` auto-triggers mic |
| `/autobiography` | `AutobiographyPage` | yes | Lists all memoirs; drafts first (updatedAt desc), then completed (chapter desc) |
| `/autobiography/:id` | `MemoirReaderPage` | yes | Read-only transcript |
| `/autobiography/:id/continue` | `MemoirContinuePage` | yes | Pre-resume screen for draft memoirs; redirects to `/autobiography` if memoir is completed |
| `/help` | `HelpPage` | yes | |
| `/settings` | `SettingsPage` | yes | Includes account + logout |
| `/settings/narrator` | `NarratorSettingsPage` | yes | |

## Design tokens (from Figma)

There is no token system yet — values are hard-coded inline. If/when you extract tokens, these are the recurring ones:

| Purpose | Value |
|---|---|
| Primary accent (yellow) | `#ffcc00` |
| AI message bubble bg | `#e3edff` |
| Page bg | `#fcfcfc` |
| Header text | `#212529` |
| Inactive nav | `#94a3b8` (slate-400) |

Font stack defined in `src/index.css` falls back through Pretendard → system fonts. The Figma file references Noto Sans KR Bold (headers) and WenQuanYi Zen Hei Medium (body), but those are NOT loaded in the app — we rely on the system fallback.

## Working with the Figma source

- File key: `3ZuDtzuCAtlKWHu9DnZvge`. Top-level screen frames (canvas-level) include: `10:182` 홈화면, `10:222` AI 상담 대화, `14:4545` 자서전 목록, `16:4222` 온보딩, `17:4203` AI 대화 (메인), `21:4497` 설정, `23:4588` AI대화(듣는중), `34:4234` API 상세 설정, `37:4203` 이전 이야기 계속하기, `37:4274` 로그인, `10:3` 도움말.
- The Figma MCP plan is on the **Starter tier**, so `get_design_context` / `get_screenshot` calls are rate-limited and will start returning quota errors after a few requests. Plan inspection batches accordingly; prefer one `get_metadata` call followed by targeted screenshots.
- When implementing a new screen, prefer `get_design_context` (returns code-ready React + asset URLs) over hand-translating screenshots. Asset URLs from Figma expire after ~7 days — re-fetch if needed.
- The listening screen `23:4588` was not fetched due to MCP rate limit; `<ListeningPanel>` and `<Waveform>` were approximated from frame metadata.
