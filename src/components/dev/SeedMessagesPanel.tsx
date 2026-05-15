const SEEDS = [
  "어릴 때 동네 뒷산에서 친구들이랑 썰매 타던 기억이 나네. 그때 참 눈이 많이 왔었는데 말이야.",
  "할머니가 만들어주신 김치찌개가 정말 맛있었어. 지금도 그 냄새가 떠올라.",
  "결혼식 날 비가 왔었는데, 그래도 정말 행복한 하루였어.",
  "첫 손주가 태어났을 때, 그 작은 손을 잡고 한참을 울었단다.",
  "친구들과 시골 장날에 가서 호떡이랑 어묵을 사 먹던 게 떠올라.",
  "기차 타고 처음 서울 올라가던 날, 창밖 풍경이 아직도 생생해.",
];

interface Props {
  onSeed: (text: string) => void;
  disabled?: boolean;
}

export default function SeedMessagesPanel({ onSeed, disabled }: Props) {
  return (
    <aside className="pointer-events-auto fixed right-6 top-1/2 z-40 hidden w-[280px] -translate-y-1/2 flex-col gap-2 lg:flex">
      <div className="flex items-center gap-2">
        <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">
          dev
        </span>
        <h3 className="text-xs font-semibold text-slate-500">예시 발화 입력</h3>
      </div>
      <p className="text-xs leading-5 text-slate-400">
        클릭하면 마이크 입력처럼 사용자 메시지로 전송됩니다.
      </p>
      <ul className="flex flex-col gap-2">
        {SEEDS.map((text, i) => (
          <li key={i}>
            <button
              onClick={() => onSeed(text)}
              disabled={disabled}
              className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-[13px] leading-5 text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="mr-1 text-slate-400">{i + 1}.</span>
              {text}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
