import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav";
import MobileFrame from "../components/MobileFrame";

function SettingsPage() {
  const navigate = useNavigate();
  const [dailyAlarm, setDailyAlarm] = useState(true);

  return (
    <MobileFrame>
      <main className="min-h-screen bg-[#fcfcfc] px-5 pb-32 pt-12">
        {/* 뒤로가기 */}
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

        {/* 제목 */}
        <section className="mt-10">
          <h1 className="text-[30px] font-medium text-[#222]">설정</h1>
          <p className="mt-2 text-[17px] text-[#666]">
            필요한 기능을 나에게 맞춰보세요.
          </p>
        </section>

        {/* 음성 및 대화 카드 */}
        <section className="mt-3 rounded-[10px] border border-[#e7e7e7] bg-white px-6 py-5">
          <h2 className="text-[17px] text-[#333]">음성 및 대화</h2>

          <div className="mt-5 border-t border-[#eeeeee] pt-5">
            <button
              onClick={() => navigate("/settings/narrator")}
              className="flex w-full items-center justify-between text-left"
            >
              <span className="text-[18px] text-[#222]">
                AI 내레이터 설정
              </span>
              <span className="text-[30px] leading-none text-[#555]">›</span>
            </button>
          </div>
        </section>

        {/* 알림 설정 카드 */}
        <section className="mt-6 rounded-[10px] border border-[#e7e7e7] bg-white px-6 py-6">
          <h2 className="text-[17px] text-[#333]">알림 설정</h2>

          <div className="mt-8 flex items-center justify-between">
            <span className="text-[18px] text-[#222]">매일 알림 받기</span>

            <button
              onClick={() => setDailyAlarm((prev) => !prev)}
              aria-label="매일 알림 받기"
              className={`relative h-[30px] w-[56px] rounded-full transition ${
                dailyAlarm ? "bg-[#ffcc00]" : "bg-[#d1d5db]"
              }`}
            >
              <span
                className={`absolute top-[3px] h-[24px] w-[24px] rounded-full bg-white transition ${
                  dailyAlarm ? "left-[29px]" : "left-[3px]"
                }`}
              />
            </button>
          </div>
        </section>
      </main>

      <BottomNav />
    </MobileFrame>
  );
}

export default SettingsPage;