import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import MobileFrame from "@/components/MobileFrame";
import { getMemoir, getMemoirSummary } from "@/lib/api";
import { INITIAL_AI_GREETING } from "@/lib/mockAi";
import type { Memoir } from "@/types/memoir";

export default function MemoirContinuePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [memoir, setMemoir] = useState<Memoir | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
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
      if (!found || found.status === "completed") {
        navigate("/autobiography", { replace: true });
        return;
      }
      setMemoir(found);
      const s = await getMemoirSummary(id);
      if (cancelled) return;
      setSummary(s);
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

  const lastAiQuestion =
    [...memoir.messages].reverse().find((m) => m.role === "ai")?.text ??
    INITIAL_AI_GREETING;

  return (
    <MobileFrame>
      <div className="min-h-screen bg-slate-100 pb-44">
        <header className="sticky top-0 z-10 grid grid-cols-[auto_1fr_auto] items-center bg-slate-100 px-4 py-4">
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
          <h1 className="text-center text-[22px] font-bold text-[#212529]">
            자서전 이어쓰기
          </h1>
          <span aria-hidden className="h-7 w-7" />
        </header>

        <section className="px-5 pt-2">
          <p className="text-base font-medium text-slate-700">
            현재 작성 상황
          </p>
          <div className="mt-3 rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-400">진행 중인 챕터</p>
            <p className="mt-2 text-xl font-bold text-slate-900">
              제 {memoir.chapter}장: {memoir.title}
            </p>
          </div>
        </section>

        <section className="mt-8 px-5">
          <div className="flex items-start gap-3">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white shadow-sm"
              style={{ backgroundColor: "#7c3aed" }}
            >
              J
            </div>
            <div className="flex max-w-[265px] flex-col gap-1">
              <span className="text-[16px] leading-7 text-slate-600">
                이전 대화 요약
              </span>
              <div className="rounded-2xl rounded-tl-sm bg-white px-5 py-4 shadow-sm">
                <p className="whitespace-pre-line text-[16px] leading-7 text-slate-700">
                  {summary}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 px-5">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-slate-200 shadow-sm">
              <svg viewBox="0 0 48 48" className="h-full w-full">
                <rect width="48" height="48" fill="#e2e8f0" />
                <circle cx="24" cy="19" r="8" fill="#64748b" />
                <path
                  d="M8 44c2-8 10-12 16-12s14 4 16 12"
                  fill="#64748b"
                />
              </svg>
            </div>
            <div className="flex max-w-[265px] flex-col gap-1">
              <span className="text-[16px] leading-7 text-slate-600">작가</span>
              <div
                className="rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm"
                style={{ backgroundColor: "#e3edff" }}
              >
                <p className="whitespace-pre-line text-[17px] leading-7 text-slate-800">
                  {lastAiQuestion}
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-12 flex flex-col items-center gap-3">
          <button
            aria-label="이야기 이어가기"
            onClick={() => navigate(`/chat?memoirId=${memoir.id}`)}
            className="flex h-16 w-16 items-center justify-center rounded-full transition-transform active:scale-95"
            style={{
              backgroundColor: "#ffcc00",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8">
              <rect x="9" y="3" width="6" height="12" rx="3" fill="#1f2937" />
              <path
                d="M5 11a7 7 0 0 0 14 0M12 18v3"
                stroke="#1f2937"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <p className="text-sm text-slate-500">이야기 이어가기</p>
        </div>

        <BottomNav />
      </div>
    </MobileFrame>
  );
}
