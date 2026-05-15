# Memoreal — likelion-team1-ideathon-frontend

어르신을 위한 AI 자서전 작성 모바일 웹앱. 사용자가 말하면 AI가 후속 질문을 던지며 대화를 이어가고, 그 대화가 자동으로 자서전 챕터로 저장됩니다.

LikeLion Team 1 아이디어톤 프로젝트의 프론트엔드.

## 빠른 시작

```bash
npm install
npm run dev    # http://localhost:5173
```

브라우저 권장: **Chrome / Edge 데스크톱**. Safari iOS는 Web Speech API 미지원이라 음성 입력 자리에 텍스트 입력 시트로 자동 폴백됩니다.

## 주요 명령어

| 명령어 | 동작 |
|---|---|
| `npm run dev` | Vite dev 서버 (HMR) |
| `npm run build` | `tsc -b && vite build` — 타입 체크 + 프로덕션 빌드 |
| `npm run preview` | 프로덕션 빌드 미리보기 |

## 기술 스택

- **Vite 6 + React 18 + TypeScript**
- **Tailwind CSS v4** (`@tailwindcss/vite` 플러그인, config 파일 없음)
- **React Router v6**
- **Web Speech API** — 한국어 STT (`webkitSpeechRecognition`, `lang="ko-KR"`)
- **데이터**: 백엔드 연결 전까지 localStorage. `src/lib/api.ts`가 모든 호출 진입점이며 본문만 교체하면 백엔드로 전환.

별도의 상태 관리/HTTP 라이브러리를 추가하지 않고 React 기본 hook과 브라우저 내장 API만 사용합니다.

## 구현된 화면

### `/chat` — AI 챗 (메인)
- AI greeting으로 시작
- 마이크 버튼 토글로 음성 입력 (한국어 STT)
- 듣는중 상태: 마이크 버튼이 빨간 펄스로 빛나고, 버튼 위 인디케이터에 실시간 자막 + 작은 waveform
- 마이크 재탭 → 인식된 텍스트가 즉시 사용자 메시지로 전송 → ~800ms 후 AI 응답
- **매 턴(사용자 + AI) 자동 저장** to localStorage
- 미지원 브라우저: 텍스트 입력 시트 폴백

### `/autobiography` — 자서전 목록
- 저장된 자서전(memoir) 카드 리스트
- **작성 중(draft)**: 노란 "이어쓰기" 버튼 → 해당 챕터 이어쓰기
- **완료(completed)**: 회색 "다시 읽기" 버튼 → 읽기 전용 뷰

### `/autobiography/:id` — 자서전 읽기 전용
- 완료된 자서전의 전체 대화 transcript

> 온보딩 / 로그인 / 설정 / 도움말 / 홈 화면은 Figma 디자인은 있으나 미구현. 현재 `/`, `/home`, `/help`는 `/chat`으로 리다이렉트.

## 디렉토리 구조

```
src/
├── components/
│   ├── BottomNav.tsx          # 4탭 하단 네비
│   ├── MobileFrame.tsx        # max-w-430 모바일 래퍼
│   └── chat/
│       ├── MessageList.tsx    # 메시지 + 타이핑 인디케이터
│       ├── Waveform.tsx       # CSS 키프레임 음파 (default/compact)
│       ├── ListeningIndicator.tsx
│       └── TextInputSheet.tsx # 음성 미지원 폴백
├── hooks/
│   └── useChatSession.ts      # 챗 상태 + 지연 memoir 생성
├── lib/
│   ├── api.ts                 # ★ 백엔드 스왑 경계
│   ├── storage.ts             # localStorage 전용 (api.ts에서만 import)
│   ├── mockAi.ts              # AI 응답 풀 (백엔드 LLM 자리)
│   ├── speech.ts              # Web Speech API 래퍼
│   └── date.ts                # 날짜 포맷 헬퍼
├── pages/
│   ├── ChatPage.tsx
│   ├── AutobiographyPage.tsx
│   └── MemoirReaderPage.tsx
├── types/
│   └── memoir.ts
├── main.tsx                   # 라우트 정의
└── index.css                  # Tailwind import + keyframes
```

## 백엔드 연결 시 작업

1. `src/lib/api.ts` 함수 본문을 `fetch('/api/...')` 호출로 교체
2. `src/lib/mockAi.ts`의 `generateReply()` 본문을 실제 LLM 엔드포인트 호출로 교체
3. 인증이 필요하면 fetch wrapper 추가

UI 코드(컴포넌트, 페이지, 훅)는 변경 없이 그대로 동작.

## 로컬 데이터 확인 / 초기화

브라우저 콘솔에서:
```js
// 저장된 자서전 보기
JSON.parse(localStorage.getItem('memoreal:memoirs:v1') || '[]')

// 모두 초기화
localStorage.clear()
```

## 디자인

Figma 파일 키: `3ZuDtzuCAtlKWHu9DnZvge` (LikeLion Team 1 자체 디자인)

주요 디자인 토큰:
- Primary accent: `#ffcc00` (노란색)
- AI 메시지 배경: `#e3edff`
- 페이지 배경: `#fcfcfc`
- 녹음 중 강조: `#ef4444`

더 자세한 아키텍처 결정과 함정은 `CLAUDE.md`를 참고하세요.
