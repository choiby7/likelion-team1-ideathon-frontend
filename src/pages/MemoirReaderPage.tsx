import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import MobileFrame from "@/components/MobileFrame";
import MessageList from "@/components/chat/MessageList";
import { getMemoir } from "@/lib/api";
import { formatDate } from "@/lib/date";
import type { Memoir } from "@/types/memoir";

export default function MemoirReaderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [memoir, setMemoir] = useState<Memoir | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      navigate("/autobiography", { replace: true });
      return;
    }
    let cancelled = false;
    (async () => {
      const found = await getMemoir(id);
      if (cancelled) return;
      if (!found) {
        navigate("/autobiography", { replace: true });
        return;
      }
      setMemoir(found);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [id, navigate]);

  if (loading || !memoir) {
    return (
      <MobileFrame>
        <div className="flex h-full items-center justify-center pt-40 text-slate-400">
          불러오는 중...
        </div>
        <BottomNav />
      </MobileFrame>
    );
  }

  const subtitle =
    memoir.status === "completed" && memoir.completedAt
      ? `작성 완료 · ${formatDate(memoir.completedAt)}`
      : `제 ${memoir.chapter}장`;

  return (
    <MobileFrame>
      <header className="sticky top-0 z-10 flex items-center gap-3 bg-[#fcfcfc] px-4 py-4">
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
        <div className="flex flex-col">
          <span className="text-xs text-slate-400">{subtitle}</span>
          <h1 className="text-[20px] font-bold tracking-tight text-[#212529]">
            {memoir.title}
          </h1>
        </div>
      </header>

      <MessageList messages={memoir.messages} bottomPadding="pb-44" />

      {memoir.status === "draft" && (
        <button
          onClick={() => navigate(`/autobiography/${memoir.id}/continue`)}
          className="fixed bottom-32 left-1/2 z-20 -translate-x-1/2 rounded-full px-6 py-3 text-base font-semibold shadow-lg"
          style={{ backgroundColor: "#ffcc00", color: "#1f2937" }}
        >
          이어쓰기
        </button>
      )}

      <BottomNav />
    </MobileFrame>
  );
}
