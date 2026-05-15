import { useCallback, useEffect, useRef, useState } from "react";
import {
  createMemoir,
  completeMemoir,
  getActiveDraft,
  getMemoir,
  sendChatMessage,
} from "@/lib/api";
import { INITIAL_AI_GREETING } from "@/lib/mockAi";
import type { Memoir, Message } from "@/types/memoir";

export interface ChatSessionApi {
  memoir: Memoir | null;
  // The list of messages to render. When no memoir exists yet, this is just the
  // in-memory greeting so the chat screen is never blank.
  displayMessages: Message[];
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  send: (text: string) => Promise<void>;
  complete: () => Promise<void>;
}

const GREETING_PLACEHOLDER: Message = {
  id: "greeting-placeholder",
  role: "ai",
  text: INITIAL_AI_GREETING,
  createdAt: 0,
};

export function useChatSession(
  memoirIdFromUrl: string | null,
): ChatSessionApi {
  const [memoir, setMemoir] = useState<Memoir | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Held during a send to coalesce createMemoir + sendChatMessage.
  const sendingLockRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      try {
        if (memoirIdFromUrl) {
          const found = await getMemoir(memoirIdFromUrl);
          if (!cancelled) setMemoir(found ?? null);
        } else {
          const draft = await getActiveDraft();
          if (!cancelled) setMemoir(draft);
        }
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "불러오기 실패");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [memoirIdFromUrl]);

  const send = useCallback(
    async (text: string) => {
      const value = text.trim();
      if (!value) return;
      if (sendingLockRef.current) return;
      sendingLockRef.current = true;
      setIsSending(true);
      setError(null);
      try {
        let target = memoir;
        if (!target) {
          target = await createMemoir(INITIAL_AI_GREETING);
        }

        // Optimistic user message — show immediately so the UI doesn't pause
        // for 800ms before the user sees their own message land.
        const optimisticUser: Message = {
          id: "optimistic-" + Date.now(),
          role: "user",
          text: value,
          createdAt: Date.now(),
        };
        setMemoir({
          ...target,
          messages: [...target.messages, optimisticUser],
          updatedAt: Date.now(),
        });

        const result = await sendChatMessage(target.id, value);
        setMemoir(result.memoir);
      } catch (e) {
        setError(e instanceof Error ? e.message : "전송 실패");
      } finally {
        sendingLockRef.current = false;
        setIsSending(false);
      }
    },
    [memoir],
  );

  const complete = useCallback(async () => {
    if (!memoir) return;
    try {
      const updated = await completeMemoir(memoir.id);
      setMemoir(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : "마무리 실패");
    }
  }, [memoir]);

  const displayMessages = memoir ? memoir.messages : [GREETING_PLACEHOLDER];

  return {
    memoir,
    displayMessages,
    isLoading,
    isSending,
    error,
    send,
    complete,
  };
}
