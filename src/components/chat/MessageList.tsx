import { useEffect, useRef } from "react";
import type { Message } from "@/types/memoir";

function AiAvatar() {
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-slate-200 shadow-sm">
      <svg viewBox="0 0 48 48" className="h-full w-full">
        <rect width="48" height="48" fill="#e2e8f0" />
        <circle cx="24" cy="19" r="8" fill="#64748b" />
        <path d="M8 44c2-8 10-12 16-12s14 4 16 12" fill="#64748b" />
      </svg>
    </div>
  );
}

function AiMessage({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3">
      <AiAvatar />
      <div className="flex max-w-[265px] flex-col gap-1">
        <span className="text-[18px] leading-7 text-slate-600">작가</span>
        <div
          className="rounded-2xl rounded-tl-sm px-6 py-5 shadow-sm"
          style={{ backgroundColor: "#e3edff" }}
        >
          <p className="whitespace-pre-line text-[20px] leading-[32px] text-slate-800">
            {text}
          </p>
        </div>
      </div>
    </div>
  );
}

function UserMessage({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <div
        className="max-w-[280px] rounded-2xl rounded-tr-sm px-6 py-5 shadow-sm"
        style={{ backgroundColor: "#ffcc00" }}
      >
        <p className="whitespace-pre-line text-[20px] leading-[32px] text-slate-900">
          {text}
        </p>
      </div>
    </div>
  );
}

function TypingBubble() {
  return (
    <div className="flex items-start gap-3">
      <AiAvatar />
      <div
        className="flex gap-1.5 rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm"
        style={{ backgroundColor: "#e3edff" }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="block h-2 w-2 rounded-full bg-slate-400"
            style={{
              animation: "typing 1.2s ease-in-out infinite",
              animationDelay: `${i * 150}ms`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function MessageList({
  messages,
  isSending,
  bottomPadding = "pb-44",
}: {
  messages: Message[];
  isSending?: boolean;
  bottomPadding?: string;
}) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, isSending]);

  return (
    <main className={`flex flex-col gap-7 px-5 pt-2 ${bottomPadding}`}>
      {messages.map((m) =>
        m.role === "ai" ? (
          <AiMessage key={m.id} text={m.text} />
        ) : (
          <UserMessage key={m.id} text={m.text} />
        ),
      )}
      {isSending && <TypingBubble />}
      <div ref={endRef} />
    </main>
  );
}
