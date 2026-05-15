type Size = "default" | "compact";

const VARIANTS: Record<
  Size,
  { bars: number; heights: number[]; barWidth: number; gap: number; container: number }
> = {
  default: {
    bars: 7,
    heights: [40, 64, 88, 96, 88, 64, 40],
    barWidth: 12,
    gap: 8,
    container: 112,
  },
  compact: {
    bars: 5,
    heights: [10, 16, 22, 16, 10],
    barWidth: 4,
    gap: 4,
    container: 28,
  },
};

export default function Waveform({
  active = true,
  size = "default",
  color = "#ffcc00",
}: {
  active?: boolean;
  size?: Size;
  color?: string;
}) {
  const v = VARIANTS[size];
  return (
    <div
      className="flex items-center justify-center"
      style={{ height: v.container, gap: v.gap }}
      aria-hidden
    >
      {Array.from({ length: v.bars }).map((_, i) => (
        <span
          key={i}
          className="block origin-center rounded-full"
          style={{
            width: v.barWidth,
            backgroundColor: color,
            height: v.heights[i],
            animation: active ? "wave 900ms ease-in-out infinite" : "none",
            animationDelay: `${i * 90}ms`,
          }}
        />
      ))}
    </div>
  );
}
