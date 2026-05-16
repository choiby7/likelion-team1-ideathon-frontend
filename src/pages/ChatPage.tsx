import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import MobileFrame from "@/components/MobileFrame";
import ListeningIndicator from "@/components/chat/ListeningIndicator";
import MessageList from "@/components/chat/MessageList";
import TextInputSheet from "@/components/chat/TextInputSheet";
import { useChatSession } from "@/hooks/useChatSession";
import {
  isRecordingSupported,
  startRecording,
  type RecordingSession,
} from "@/lib/recording";

type Mode = "idle" | "listening" | "text";

export default function ChatPage() {
  const [search] = useSearchParams();
  const memoirId = search.get("memoirId");
  const navigate = useNavigate();
  const chat = useChatSession(memoirId);

  const [mode, setMode] = useState<Mode>("idle");
  const [recordingSupported, setRecordingSupported] = useState(true);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  const sessionRef = useRef<RecordingSession | null>(null);
  const stoppingRef = useRef(false);
  const autoStartedRef = useRef(false);

  useEffect(() => {
    setRecordingSupported(isRecordingSupported());
  }, []);

  useEffect(() => {
    if (chat.memoir && chat.memoir.status === "completed") {
      navigate(`/autobiography/${chat.memoir.id}`, { replace: true });
    }
  }, [chat.memoir, navigate]);

  // Abort any in-flight recording if the page unmounts mid-record.
  useEffect(() => {
    return () => {
      sessionRef.current?.abort();
    };
  }, []);

  const startVoice = async () => {
    setVoiceError(null);
    try {
      const session = await startRecording();
      sessionRef.current = session;
      setMode("listening");
    } catch (e) {
      const msg =
        e instanceof Error && e.name === "NotAllowedError"
          ? "마이크 권한이 필요합니다. 브라우저 설정에서 허용해 주세요."
          : e instanceof Error
            ? e.message
            : "녹음을 시작할 수 없습니다.";
      setVoiceError(msg);
    }
  };

  // Auto-start recording when navigated in with ?autoStart=1 (e.g. from HomePage).
  useEffect(() => {
    if (autoStartedRef.current) return;
    if (search.get("autoStart") !== "1") return;
    if (chat.isLoading || chat.isSending) return;
    if (!recordingSupported) return;
    if (mode !== "idle") return;

    autoStartedRef.current = true;
    void startVoice();

    // Strip the autoStart param so a manual refresh doesn't re-trigger.
    const next = new URLSearchParams(search);
    next.delete("autoStart");
    const qs = next.toString();
    navigate(qs ? `/chat?${qs}` : "/chat", { replace: true });
  }, [
    search,
    chat.isLoading,
    chat.isSending,
    recordingSupported,
    mode,
    navigate,
  ]);

  const stopVoice = async () => {
    if (stoppingRef.current) return;
    stoppingRef.current = true;
    const session = sessionRef.current;
    sessionRef.current = null;
    setMode("idle");
    if (!session) {
      stoppingRef.current = false;
      return;
    }
    try {
      const { blob, filename } = await session.stop();
      if (blob.size === 0) {
        setVoiceError("녹음이 비어있어요. 다시 시도해 주세요.");
        return;
      }
      await chat.sendVoice(blob, filename);
    } catch (e) {
      setVoiceError(e instanceof Error ? e.message : "녹음 처리 실패");
    } finally {
      stoppingRef.current = false;
    }
  };

  const handleMicClick = () => {
    if (chat.isSending || chat.isLoading) return;
    if (mode === "listening") {
      void stopVoice();
      return;
    }
    if (!recordingSupported) {
      setMode("text");
      return;
    }
    void startVoice();
  };

  const isListening = mode === "listening";

  return (
    <MobileFrame>
      <header className="sticky top-0 z-10 flex items-center justify-between bg-[#fcfcfc] px-4 py-4">
        <button onClick={() => navigate(-1)} aria-label="뒤로가기">
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

        <h1 className="text-[26px] font-bold text-[#212529]">Memoreal</h1>

        <button
          onClick={() => navigate("/settings")}
          aria-label="설정"
          className="rounded-full p-2 transition duration-200 hover:bg-slate-100 hover:scale-110 active:scale-95"
        >
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
          {voiceError ?? chat.error}
        </div>
      )}

      <MessageList
        messages={chat.displayMessages}
        isSending={chat.isSending}
      />

      {isListening && <ListeningIndicator partial="" />}

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
  );
}
