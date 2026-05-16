import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MobileFrame from "../components/MobileFrame";
import profileImage from "../assets/profile.png";

type Speed = "normal" | "slow" | "verySlow";

function NarratorSettingsPage() {
  const navigate = useNavigate();
  const [speed, setSpeed] = useState<Speed>("normal");
  const [tone, setTone] = useState("친근함");
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  return (
    <MobileFrame>
      <main className="relative min-h-screen bg-[#fcfcfc] px-5 pb-32">
        {/* 상단 헤더 */}
        <header className="relative -mx-5 flex h-[62px] items-center justify-center border-b border-[#e5e5e5] bg-[#fcfcfc]">
          <button
            onClick={() => navigate(-1)}
            aria-label="닫기"
            className="absolute left-5 text-[32px] text-[#222] transition hover:scale-110 active:scale-95"
          >
            ×
          </button>

          <h1 className="text-[25px] font-medium text-[#222]">
            AI 내레이터 설정
          </h1>
        </header>

        {/* 프로필 */}
        <section className="mt-10 flex flex-col items-center">
          <h2 className="text-[20px] font-semibold text-[#222]">준영님</h2>

          <div className="relative mt-7">
            {/* 프로필 이미지 */}
            <div className="flex h-[108px] w-[108px] items-center justify-center rounded-full bg-white shadow-md">
              <img
                src={profileImage}
                alt="AI 내레이터 프로필"
                className="h-[104px] w-[104px] rounded-full object-cover"
              />
            </div>

            {/* 프로필 선택 버튼 */}
            <button
              type="button"
              onClick={() => setIsProfileMenuOpen((prev) => !prev)}
              aria-label="프로필 선택"
              className="absolute bottom-1 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-[#ffcc00] text-[14px] text-[#222] shadow-md transition hover:scale-110 active:scale-95"
            >
              ▼
            </button>

            {/* 프로필 선택 메뉴 */}
            {isProfileMenuOpen && (
              <div className="absolute left-1/2 top-[118px] z-10 w-[150px] -translate-x-1/2 rounded-[10px] border border-[#e5e5e5] bg-white py-2 text-center shadow-lg">
                <button
                  type="button"
                  onClick={() => {
                    alert("프로필 변경 기능은 개발 예정이에요.");
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-[14px] text-[#222] hover:bg-[#fff8d9]"
                >
                  프로필 변경
                </button>

                <button
                  type="button"
                  onClick={() => setIsProfileMenuOpen(false)}
                  className="w-full px-3 py-2 text-[14px] text-[#666] hover:bg-gray-100"
                >
                  닫기
                </button>
              </div>
            )}
          </div>
        </section>

        {/* 말하기 속도 */}
        <section className="mt-12">
          <h3 className="text-[22px] font-medium text-[#222]">말하기 속도</h3>

          <div className="mt-5 grid grid-cols-3 gap-4">
            {[
              { key: "normal", label: "정상" },
              { key: "slow", label: "느린" },
              { key: "verySlow", label: "매우 느림" },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setSpeed(item.key as Speed)}
                className={`h-[72px] rounded-[10px] border text-[17px] transition hover:scale-[1.02] active:scale-[0.98] ${
                  speed === item.key
                    ? "border-[#ffcc00] bg-white text-[#222]"
                    : "border-[#dddddd] bg-white text-[#555]"
                }`}
              >
                {item.label}
                {speed === item.key && (
                  <span className="mt-1 block text-[#6f5f18]">✓</span>
                )}
              </button>
            ))}
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

        {/* 하단 버튼 흰색 영역 */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-[#e5e5e5] bg-white px-5 py-4">
          <button
            onClick={() => {
              alert("설정이 적용되었습니다.");
              navigate("/settings");
            }}
            className="h-[64px] w-full rounded-[10px] bg-[#ffcc00] text-[17px] font-medium text-[#222] transition hover:-translate-y-1 hover:shadow-lg active:scale-[0.98]"
          >
            설정 적용
          </button>
        </div>
      </main>
    </MobileFrame>
  );
}

export default NarratorSettingsPage;