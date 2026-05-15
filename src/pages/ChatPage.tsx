import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import MobileFrame from "@/components/MobileFrame";
import ListeningIndicator from "@/components/chat/ListeningIndicator";
import MessageList from "@/components/chat/MessageList";
import TextInputSheet from "@/components/chat/TextInputSheet";
import SeedMessagesPanel from "@/components/dev/SeedMessagesPanel";
import { useChatSession } from "@/hooks/useChatSession";
import {
  isSpeechSupported,
  startListening,
  type SpeechError,
  type SpeechSession,
} from "@/lib/speech";

type Mode = "idle" | "listening" | "text";

function errorMessage(err: SpeechError): string {
  switch (err.kind) {
    case "permission-denied":
      return "마이크 권한이 필요합니다. 브라우저 설정에서 허용해 주세요.";
    case "no-speech":
      return "음성이 들리지 않았어요. 다시 시도해 주세요.";
    case "network":
      return "네트워크 문제로 음성 인식이 어려워요.";
    case "unsupported":
      return "이 브라우저는 음성 입력을 지원하지 않습니다.";
    default:
      return "음성 인식 중 문제가 발생했어요.";
  }
}

export default function ChatPage() {
  const [search] = useSearchParams();
  const memoirId = search.get("memoirId");
  const navigate = useNavigate();
  const chat = useChatSession(memoirId);

  const [mode, setMode] = useState<Mode>("idle");
  const [speechSupported, setSpeechSupported] = useState(true);
  const [partial, setPartial] = useState("");
  const [voiceError, setVoiceError] = useState<SpeechError | null>(null);

  const sessionRef = useRef<SpeechSession | null>(null);
  const finalRef = useRef("");
  const partialRef = useRef("");
  const submittedRef = useRef(false);

  useEffect(() => {
    setSpeechSupported(isSpeechSupported());
  }, []);

  useEffect(() => {
    if (chat.memoir && chat.memoir.status === "completed") {
      navigate(`/autobiography/${chat.memoir.id}`, { replace: true });
    }
  }, [chat.memoir, navigate]);

  // Clean up any in-flight speech session if the page unmounts mid-listen.
  useEffect(() => {
    return () => {
      submittedRef.current = true;
      sessionRef.current?.abort();
    };
  }, []);

  const startVoice = () => {
    setMode("listening");
    setPartial("");
    setVoiceError(null);
    finalRef.current = "";
    partialRef.current = "";
    submittedRef.current = false;

    sessionRef.current = startListening({
      onPartial: (text) => {
        partialRef.current = text;
        setPartial(text);
      },
      onFinal: (text) => {
        finalRef.current = (finalRef.current + " " + text).trim();
        partialRef.current = "";
        setPartial("");
      },
      onError: (err) => setVoiceError(err),
      onEnd: () => {
        if (submittedRef.current) return;
        submittedRef.current = true;
        setMode("idle");
        const text = (finalRef.current || partialRef.current).trim();
        if (text) void chat.send(text);
      },
    });
  };

  const stopVoice = () => {
    sessionRef.current?.stop();
  };

  const handleMicClick = () => {
    if (chat.isSending || chat.isLoading) return;
    if (mode === "listening") {
      stopVoice();
      return;
    }
    if (!speechSupported) {
      setMode("text");
      return;
    }
    startVoice();
  };

  const isListening = mode === "listening";

  return (
    <>
    <MobileFrame>
      <header className="sticky top-0 z-10 flex items-center justify-between bg-[#fcfcfc] px-6 py-4">
        <button
          aria-label="뒤로가기"
          className="p-2"
          onClick={() => navigate(-1)}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-7 w-7 text-slate-800"
          >
            <path
              d="M15 6l-6 6 6 6"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <h1 className="text-[24px] font-bold tracking-tight text-[#212529]">
          Memoreal
        </h1>
        <button aria-label="설정" className="p-2">
          <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
            <circle cx="12" cy="12" r="3" stroke="#1f2937" strokeWidth="2" />
            <path
              d="M19 12a7 7 0 0 0-.1-1.2l2-1.6-2-3.4-2.4.8a7 7 0 0 0-2-1.2l-.4-2.5h-4l-.4 2.5a7 7 0 0 0-2 1.2l-2.4-.8-2 3.4 2 1.6a7 7 0 0 0 0 2.4l-2 1.6 2 3.4 2.4-.8c.6.5 1.3.9 2 1.2l.4 2.5h4l.4-2.5c.7-.3 1.4-.7 2-1.2l2.4.8 2-3.4-2-1.6c.06-.4.1-.8.1-1.2z"
              stroke="#1f2937"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </header>

      {(chat.error || voiceError) && (
        <div className="mx-5 mt-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {voiceError ? errorMessage(voiceError) : chat.error}
        </div>
      )}

      <MessageList
        messages={chat.displayMessages}
        isSending={chat.isSending}
      />

      {isListening && <ListeningIndicator partial={partial} />}

      <button
        aria-label={isListening ? "녹음 종료" : "음성 입력"}
        onClick={handleMicClick}
        disabled={chat.isSending || chat.isLoading}
        className="fixed bottom-32 left-1/2 z-20 flex h-16 w-16 -translate-x-1/2 items-center justify-center rounded-full transition-colors disabled:opacity-50"
        style={{
          backgroundColor: isListening ? "#ef4444" : "#ffcc00",
          boxShadow: isListening ? undefined : "0 4px 12px rgba(0, 0, 0, 0.15)",
          animation: isListening
            ? "recording-pulse 1.4s ease-in-out infinite"
            : "none",
        }}
      >
        {isListening ? (
          <span className="block h-5 w-5 rounded-sm bg-white" />
        ) : (
          <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8">
            <rect x="9" y="3" width="6" height="12" rx="3" fill="#1f2937" />
            <path
              d="M5 11a7 7 0 0 0 14 0M12 18v3"
              stroke="#1f2937"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        )}
      </button>

      {mode === "text" && (
        <TextInputSheet
          onCancel={() => setMode("idle")}
          onSubmit={async (text) => {
            setMode("idle");
            await chat.send(text);
          }}
        />
      )}

      <BottomNav />
    </MobileFrame>

    {import.meta.env.DEV && (
      <SeedMessagesPanel
        onSeed={(text) => void chat.send(text)}
        disabled={chat.isSending || chat.isLoading || mode !== "idle"}
      />
    )}
    </>
  );
}
