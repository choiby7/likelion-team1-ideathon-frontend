import { useState } from "react";
import BottomNav from "../components/BottomNav";
import { useNavigate } from "react-router-dom";

function HomePage() {
  const navigate = useNavigate();
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeakClick = () => {
    setIsSpeaking((prev) => !prev);
  };

  return (
    <main className="min-h-screen bg-[#f1f4f8] flex justify-center">
      <section className="w-full max-w-[430px] min-h-screen bg-[#fafafa] px-6 pt-28 pb-32">
        {/* 제목 영역 */}
        <section className="text-center">
          <h1 className="text-[38px] font-extrabold text-[#15192a]">
            오늘의 이야기
          </h1>

          <p className="mt-4 text-[20px] font-semibold text-[#6f7a91]">
            마이크 버튼을 누르면 시작됩니다.
          </p>
        </section>

        {/* 마이크 버튼 */}
        <section className="mt-16 flex justify-center">
          <button
            onClick={handleSpeakClick}
            className={`w-[270px] h-[270px] rounded-full flex flex-col items-center justify-center shadow-xl transition duration-300 ${
              isSpeaking
                ? "scale-105 bg-[#efc62f] shadow-[0_0_38px_rgba(239,198,47,0.9)]"
                : "bg-[#f7d23b] hover:scale-105 hover:bg-[#efc62f]"
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="w-16 h-16 text-[#111827]"
            >
              <rect
                x="9"
                y="3"
                width="6"
                height="12"
                rx="3"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M5 11a7 7 0 0 0 14 0M12 18v3"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>

            <span className="mt-5 text-[28px] font-extrabold text-[#111827]">
              {isSpeaking ? "듣는 중..." : "이야기 말하기"}
            </span>
          </button>
        </section>

        {/* 듣는 중 애니메이션 */}
        <section className="mt-20 flex h-12 items-center justify-center gap-2">
          {[0, 1, 2, 3, 4].map((bar) => (
            <span
              key={bar}
              className={`w-3 rounded-full bg-[#a8b1c2] ${
                isSpeaking ? "listening-wave" : "h-4"
              }`}
              style={{
                animationDelay: `${bar * 0.12}s`,
              }}
            />
          ))}
        </section>

        {/* 진행 바 */}
        <section className="mt-28">
          <div className="h-2 w-full rounded-full bg-[#eef1f6] overflow-hidden">
            <div
              className={`h-full rounded-full bg-[#7c8496] ${
                isSpeaking ? "progress-fill" : "w-1/3"
              }`}
            />
          </div>
        </section>

        {/* 자서전 보기 버튼 */}
        <button
          onClick={() => navigate("/autobiography")}
          className="mt-8 w-full h-[72px] rounded-[16px] bg-[#7c8496] text-white flex items-center justify-between px-7 text-[24px] font-bold transition hover:bg-[#6b7280] hover:scale-[1.01] active:scale-[0.98]"
        >
          자서전 보기
          <span className="text-[36px]">→</span>
        </button>

        <BottomNav />
      </section>
    </main>
  );
}

export default HomePage;