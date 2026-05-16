import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MobileFrame from "../components/MobileFrame";

type Speed = "normal" | "slow" | "verySlow";

function NarratorSettingsPage() {
  const navigate = useNavigate();
  const [speed, setSpeed] = useState<Speed>("normal");
  const [tone, setTone] = useState("친근함");

  return (
    <MobileFrame>
      <main className="min-h-screen bg-[#fcfcfc] px-5 pb-28">
        {/* 상단 헤더 */}
        <header className="relative flex h-[62px] items-center justify-center border-b border-[#e5e5e5]">
          <button
            onClick={() => navigate(-1)}
            aria-label="닫기"
            className="absolute left-0 text-[30px] text-[#222]"
          >
            ×
          </button>

          <h1 className="text-[23px] font-medium text-[#222]">
            AI 내레이터 설정
          </h1>
        </header>

        {/* 프로필 */}
        <section className="mt-10 flex flex-col items-center">
          <h2 className="text-[20px] font-semibold text-[#222]">준영님</h2>

          <div className="relative mt-7">
            <div className="h-[92px] w-[92px] overflow-hidden rounded-full border-4 border-white bg-[#d9e1dc] shadow">
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-b from-[#d8e2dd] to-[#aebbb5] text-[38px]">
                👩
              </div>
            </div>

            <button className="absolute bottom-1 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-[#ffcc00] text-[12px] text-[#222]">
              ▼
            </button>
          </div>
        </section>

        {/* 말하기 속도 */}
        <section className="mt-12">
          <h3 className="text-[22px] font-medium text-[#222]">말하기 속도</h3>

          <div className="mt-5 grid grid-cols-3 gap-4">
            <button
              onClick={() => setSpeed("normal")}
              className={`h-[72px] rounded-[10px] border text-[17px] transition ${
                speed === "normal"
                  ? "border-[#ffcc00] bg-white text-[#222]"
                  : "border-[#dddddd] bg-white text-[#555]"
              }`}
            >
              정상
              {speed === "normal" && (
                <span className="mt-1 block text-[#6f5f18]">✓</span>
              )}
            </button>

            <button
              onClick={() => setSpeed("slow")}
              className={`h-[72px] rounded-[10px] border text-[17px] transition ${
                speed === "slow"
                  ? "border-[#ffcc00] bg-white text-[#222]"
                  : "border-[#dddddd] bg-white text-[#555]"
              }`}
            >
              느린
              {speed === "slow" && (
                <span className="mt-1 block text-[#6f5f18]">✓</span>
              )}
            </button>

            <button
              onClick={() => setSpeed("verySlow")}
              className={`h-[72px] rounded-[10px] border text-[17px] transition ${
                speed === "verySlow"
                  ? "border-[#ffcc00] bg-white text-[#222]"
                  : "border-[#dddddd] bg-white text-[#555]"
              }`}
            >
              매우 느림
              {speed === "verySlow" && (
                <span className="mt-1 block text-[#6f5f18]">✓</span>
              )}
            </button>
          </div>
        </section>

        {/* 말투 설정 */}
        <section className="mt-12">
          <h3 className="text-[22px] font-medium text-[#222]">
            AI 내레이터 말투
          </h3>

          <div className="relative mt-5">
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="h-[64px] w-full appearance-none rounded-[10px] border border-[#dddddd] bg-white px-4 text-[17px] text-[#222] outline-none"
            >
              <option>친근함</option>
              <option>차분함</option>
              <option>다정함</option>
              <option>격식 있음</option>
            </select>

            <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-[#555]">
              ▾
            </span>
          </div>
        </section>

        {/* 적용 버튼 */}
        <button
          onClick={() => {
            alert("설정이 적용되었습니다.");
            navigate("/settings");
          }}
          className="absolute bottom-4 left-5 right-5 h-[64px] rounded-[10px] bg-[#ffcc00] text-[17px] font-medium text-[#222] transition hover:-translate-y-1 hover:shadow-lg"
        >
          설정 적용
        </button>
      </main>
    </MobileFrame>
  );
}

export default NarratorSettingsPage;