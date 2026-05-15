import { NavLink } from "react-router-dom";

type Item = {
  to: string;
  label: string;
  icon: (active: boolean) => JSX.Element;
};

const items: Item[] = [
  {
    to: "/home",
    label: "홈",
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
        <path
          d="M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"
          stroke={active ? "#ffcc00" : "#94a3b8"}
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    to: "/chat",
    label: "대화",
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
        <rect
          x="9"
          y="3"
          width="6"
          height="12"
          rx="3"
          fill={active ? "#ffcc00" : "none"}
          stroke={active ? "#ffcc00" : "#94a3b8"}
          strokeWidth="2"
        />
        <path
          d="M5 11a7 7 0 0 0 14 0M12 18v3"
          stroke={active ? "#ffcc00" : "#94a3b8"}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    to: "/autobiography",
    label: "자서전",
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
        <path
          d="M4 5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-2zM8 3v18"
          stroke={active ? "#ffcc00" : "#94a3b8"}
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    to: "/help",
    label: "도움말",
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
        <circle
          cx="12"
          cy="12"
          r="9"
          stroke={active ? "#ffcc00" : "#94a3b8"}
          strokeWidth="2"
        />
        <path
          d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .8-1 1.7M12 17h.01"
          stroke={active ? "#ffcc00" : "#94a3b8"}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

export default function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 mx-auto flex max-w-[430px] items-center justify-around border-t border-slate-200 bg-white px-6 pb-8 pt-3">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className="flex w-16 flex-col items-center gap-1.5"
        >
          {({ isActive }) => (
            <>
              {item.icon(isActive)}
              <span
                className="text-sm leading-5"
                style={{ color: isActive ? "#ffcc00" : "#94a3b8" }}
              >
                {item.label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
