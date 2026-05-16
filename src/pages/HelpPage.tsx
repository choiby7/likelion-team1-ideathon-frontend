import { useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav";
import MobileFrame from "../components/MobileFrame";

type HelpItem = {
  title: string;
  icon: JSX.Element;
  url: string;
};

const helpItems: HelpItem[] = [
  {
    title: "서비스는 어떻게\n이용하나요?",
    url: "https://www.notion.so/",
    icon: (
      <path
        d="M9 9h6v6H9zM12 17h.01M12 7h.01"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    ),
  },
  {
    title: "내 목소리가 어떻게\n책이 되나요?",
    url: "https://www.notion.so/",
    icon: (
      <path
        d="M8 4h8v16H8zM11 7h2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    ),
  },
  {
    title: "가족과 어떻게\n공유하나요?",
    url: "https://www.notion.so/",
    icon: (
      <>
        <circle cx="9" cy="9" r="2" fill="currentColor" />
        <circle cx="15" cy="9" r="2" fill="currentColor" />
        <path
          d="M5 18c.4-2.5 2-4 4-4s3.6 1.5 4 4M11 18c.4-2.5 2-4 4-4s3.6 1.5 4 4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </>
    ),
  },
  {
    title: "상담원과 직접\n통화하고 싶어요",
    url: "https://www.notion.so/",
    icon: (
      <path
        d="M7 12a5 5 0 0 1 10 0v3a2 2 0 0 1-2 2h-1M7 12v4M17 12v4M9 17h3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
];

function HelpPage() {
  const navigate = useNavigate();

  const openNotion = (url: string) => {
    window.open(url, "_blank");
  };

  return (
    <MobileFrame>
      <main className="min-h-screen bg-[#fcfcfc] px-4 pb-32">
        {/* 상단 헤더 */}
        <header className="flex items-center justify-between py-4">
          <button onClick={() => navigate(-1)} aria-label="뒤로가기">
            <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
              <path
                d="M15 6l-6 6 6 6"
                stroke="#6f5f18"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <h1 className="text-[26px] font-bold text-[#6f5f18]">
            Memoreal
          </h1>

          <button aria-label="설정">
            <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
              <circle cx="12" cy="12" r="3" stroke="#64748b" strokeWidth="2" />
              <path
                d="M19 12a7 7 0 0 0-.1-1.2l2-1.6-2-3.4-2.4.8a7 7 0 0 0-2-1.2l-.4-2.5h-4l-.4 2.5a7 7 0 0 0-2 1.2l-2.4-.8-2 3.4 2 1.6a7 7 0 0 0 0 2.4l-2 1.6 2 3.4 2.4-.8c.6.5 1.3.9 2 1.2l.4 2.5h4l.4-2.5c.7-.3 1.4-.7 2-1.2l2.4.8 2-3.4-2-1.6c.06-.4.1-.8.1-1.2z"
                stroke="#64748b"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </header>

        {/* 제목 */}
        <section className="mt-10">
          <h2 className="text-[24px] font-medium text-[#222]">
            무엇을 도와드릴까요?
          </h2>

          <p className="mt-4 text-[16px] leading-7 text-[#555]">
            자주 묻는 질문을 확인하거나 상담원에게
            <br />
            직접 문의하세요.
          </p>
        </section>

        {/* 질문 카드 */}
        <section className="mt-10 overflow-hidden rounded-[10px] bg-white">
          {helpItems.map((item, index) => (
            <button
              key={item.title}
              onClick={() => openNotion(item.url)}
              className={`flex w-full items-center gap-5 px-5 py-6 text-left transition hover:bg-[#fff9db] ${
                index !== helpItems.length - 1
                  ? "border-b border-[#eee7dc]"
                  : ""
              }`}
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e8dfcf] text-[#7a6715]">
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                  {item.icon}
                </svg>
              </div>

              <p className="flex-1 whitespace-pre-line text-[17px] leading-7 text-[#333]">
                {item.title}
              </p>

              <span className="text-[28px] text-[#444]">›</span>
            </button>
          ))}
        </section>

        {/* 상담원 연결 */}
        <button
          onClick={() => openNotion("https://www.notion.so/")}
          className="mt-20 flex h-[60px] w-full items-center justify-center gap-3 rounded-[10px] bg-[#ffcc00] text-[19px] font-medium text-[#222] transition hover:-translate-y-1 hover:shadow-lg"
        >
          <span>📞</span>
          상담원 연결하기
        </button>

        <p className="mt-4 text-center text-[14px] text-[#666]">
          평일 오전 9시 - 오후 6시
        </p>
      </main>

      <BottomNav />
    </MobileFrame>
  );
}

export default HelpPage;