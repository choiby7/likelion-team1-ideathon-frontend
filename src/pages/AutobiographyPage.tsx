import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import MobileFrame from "@/components/MobileFrame";
import { listMemoirs } from "@/lib/api";
import { formatDate, formatRelative } from "@/lib/date";
import type { ChapterStatus, MemoirSummary } from "@/types/memoir";

function StatusBadge({ status }: { status: ChapterStatus }) {
  if (status === "draft") {
    return (
      <span
        className="inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold text-slate-900"
        style={{ backgroundColor: "#ffcc00" }}
      >
        작성 중
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-500">
      완료
    </span>
  );
}

function MemoirCard({
  memoir,
  onAction,
}: {
  memoir: MemoirSummary;
  onAction: () => void;
}) {
  const isDraft = memoir.status === "draft";
  const metaLabel = isDraft ? "마지막 수정" : "작성 완료";
  const metaValue = isDraft
    ? formatRelative(memoir.updatedAt)
    : memoir.completedAt
      ? formatDate(memoir.completedAt)
      : "—";

  return (
    <article className="rounded-2xl bg-white p-5 shadow-sm">
      <header className="flex items-start justify-between">
        <StatusBadge status={memoir.status} />
        <span className="text-sm text-slate-400">제 {memoir.chapter}장</span>
      </header>

      <h3 className="mt-3 text-xl font-bold text-slate-900">{memoir.title}</h3>
      <p className="mt-1 text-sm text-slate-400">
        {metaLabel}: {metaValue}
      </p>

      <button
        onClick={onAction}
        className="mt-4 w-full rounded-xl py-3 text-base font-semibold transition-colors"
        style={{
          backgroundColor: isDraft ? "#ffcc00" : "#f1f5f9",
          color: isDraft ? "#1f2937" : "#475569",
        }}
      >
        {isDraft ? "이어쓰기" : "다시 읽기"}
      </button>
    </article>
  );
}

function compareMemoirs(a: MemoirSummary, b: MemoirSummary): number {
  if (a.status !== b.status) return a.status === "draft" ? -1 : 1;
  if (a.status === "draft") {
    if (a.updatedAt !== b.updatedAt) return b.updatedAt - a.updatedAt;
  }
  return b.chapter - a.chapter;
}

export default function AutobiographyPage() {
  const [memoirs, setMemoirs] = useState<MemoirSummary[] | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const list = await listMemoirs();
      if (!cancelled) setMemoirs(list.slice().sort(compareMemoirs));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleAction = (m: MemoirSummary) => {
    if (m.status === "draft") {
      navigate(`/autobiography/${m.id}/continue`);
    } else {
      navigate(`/autobiography/${m.id}`);
    }
  };

  return (
    <MobileFrame>
      <div className="min-h-screen bg-slate-100 pb-44">
        <header className="sticky top-0 z-10 flex items-center justify-center bg-slate-100 px-4 py-4">
          <h1 className="text-[26px] font-bold text-[#212529]">자서전</h1>
        </header>

        <section className="px-6 pt-8">
          <h1 className="text-3xl font-bold text-slate-900">나의 회고록</h1>
          <p className="mt-2 text-base leading-6 text-slate-500">
            그동안 기록하신 소중한
            <br />
            기억들입니다.
          </p>
        </section>

        <section className="mt-8 flex flex-col gap-4 px-5">
          {memoirs === null && (
            <div className="rounded-2xl bg-white p-6 text-center text-sm text-slate-400">
              불러오는 중...
            </div>
          )}
          {memoirs !== null && memoirs.length === 0 && (
            <div className="rounded-2xl bg-white p-6 text-center text-base text-slate-500">
              아직 작성한 자서전이 없습니다.
              <br />
              대화 탭에서 시작해 보세요.
            </div>
          )}
          {memoirs?.map((m) => (
            <MemoirCard
              key={m.id}
              memoir={m}
              onAction={() => handleAction(m)}
            />
          ))}
        </section>

        <BottomNav />
      </div>
    </MobileFrame>
  );
}
