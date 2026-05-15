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

All persistence goes through `src/lib/api.ts` — components and hooks never import from `src/lib/storage.ts` directly. This is the backend swap boundary: when the REST backend is ready, only `api.ts` function bodies change; all callers are unaffected.

`src/lib/storage.ts` is the only file that touches `localStorage`. Keys:
- `memoreal:memoirs:v1` — `Memoir[]`, full objects including embedded `Message[]`
- `memoreal:activeDraftId:v1` — `string | null`, points to the current in-progress draft

The `:v1` suffix is intentional migration headroom — bump to `:v2` and migrate on read if the schema changes.

`Memoir` embeds its `Message[]` directly (no separate messages collection). This is fine at ideathon scale and lets the UI work with a single object. If the backend normalizes messages, only `api.ts` changes.

**Key behaviors in `api.ts`:**
- `sendChatMessage(memoirId, text)` is the per-turn atomic unit. It appends the user message, invokes the mock AI, appends the AI reply, derives the title, and persists — all in one call. There is no separate save action.
- Title auto-generation: first user message's first 12 chars; fallback `"제목 없는 이야기"`. Title is re-derived on every `appendMessage` / `sendChatMessage` call until explicitly set via `updateMemoirTitle`.
- Chapter numbering: `max(existing.chapter) + 1` at create time. Monotonic, never reused.
- IDs: `crypto.randomUUID()` everywhere.

### `useChatSession` hook

`src/hooks/useChatSession.ts` is the single state owner for `ChatPage`. It accepts `memoirIdFromUrl: string | null` (read from `?memoirId=` via `useSearchParams`).

**Lazy memoir creation**: mounting `/chat` with no `memoirId` does NOT create a `Memoir` record. The hook shows an in-memory greeting placeholder (`displayMessages` falls back to `[GREETING_PLACEHOLDER]`). A real `Memoir` is created on the first `send()` call. Do not change this — creating on mount produces empty drafts whenever a user navigates idly to `/chat`.

**Optimistic update**: `send()` pushes the user's message into state immediately before awaiting `sendChatMessage`, so the bubble appears without the 800 ms mock-AI delay.

Returns: `{ memoir, displayMessages, isLoading, isSending, error, send, complete }`.

### Voice / mode state

`ChatPage` owns a `mode` state: `"idle" | "listening" | "text"`.

- **idle** — shows `<MessageList>` and the floating yellow mic button.
- **listening** — mounts `<ListeningPanel>` (replaces MessageList). `ListeningPanel` owns the `SpeechSession` lifecycle (start on mount, abort on unmount). It calls `onTranscript(text)` exactly once, guarded by a ref. The parent then calls `send(text)` if text is non-empty. Do not add a second submit path from `ChatPage`.
- **text** — renders `<TextInputSheet>` as an overlay. This mode is entered when the mic button is pressed on a browser where `isSpeechSupported()` returns false (Safari iOS). Detection runs once on mount.

`src/lib/speech.ts` wraps `webkitSpeechRecognition`/`SpeechRecognition` with `lang="ko-KR"`, `continuous=true`, `interimResults=true`. Errors are mapped to a tagged union (`unsupported | permission-denied | no-speech | network | other`). `startListening()` returns a `SpeechSession` with `stop()` and `abort()` — `ListeningPanel` calls `abort()` on unmount.

`<Waveform>` (7 yellow bars, CSS `@keyframes wave`) is purely decorative — it is NOT driven by real mic amplitude. We deliberately did NOT use `getUserMedia` + `AnalyserNode` because the Web Speech API already holds the mic; a second `getUserMedia` call would trigger a duplicate permission prompt.

### Mock AI swap point

`src/lib/mockAi.ts` exports `INITIAL_AI_GREETING` and `generateReply(history)`. `generateReply` picks from an 8-line Korean response pool using `history.filter(role=user).length % POOL.length` — deterministic rotation, not random, so React StrictMode double-invoke and QA remain predictable. 800 ms simulated latency.

When the backend LLM endpoint is ready, replace `generateReply`'s body (or swap the import in `api.ts`'s `sendChatMessage`). Do not scatter AI call sites elsewhere — `mockAi.ts` is the single seam.

## Routing

Defined in `src/main.tsx`.

| Path | Component | Notes |
|---|---|---|
| `/chat` | `ChatPage` | `?memoirId=X` resumes memoir X; omitted = new draft flow |
| `/autobiography` | `AutobiographyPage` | Lists all memoirs; drafts first (updatedAt desc), then completed (chapter desc) |
| `/autobiography/:id` | `MemoirReaderPage` | Read-only transcript; shows "이어쓰기" button if status is still `draft` |
| `/`, `/home`, `/help` | redirect → `/chat` | Placeholders; replace with real pages when implemented |

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
