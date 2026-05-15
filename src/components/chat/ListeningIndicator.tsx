import Waveform from "./Waveform";

export default function ListeningIndicator({ partial }: { partial: string }) {
  return (
    <div className="pointer-events-none fixed bottom-52 left-1/2 z-20 -translate-x-1/2">
      <div className="flex max-w-[300px] items-center gap-3 rounded-full bg-white px-4 py-2 shadow-lg ring-1 ring-slate-100">
        <Waveform size="compact" color="#ef4444" />
        <span className="truncate text-sm font-medium text-slate-600">
          {partial ? `${partial}...` : "듣고 있어요..."}
        </span>
      </div>
    </div>
  );
}
