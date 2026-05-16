import { useState } from "react";
import { kakaoLoginUrl } from "@/lib/authApi";
import onboardingImage from "../assets/onboarding-image.png";

function OnboardingPage() {
  const [isStarting, setIsStarting] = useState(false);

  const handleKakaoStart = () => {
    setIsStarting(true);
    window.location.href = kakaoLoginUrl();
  };

  const handleComingSoon = () => {
    alert("개발 예정이에요");
  };

  return (
    <main className="min-h-screen bg-[#f1f4f8] flex justify-center">
      <section className="w-full max-w-[430px] min-h-screen bg-[#fafafa] px-6 pt-8 pb-8 relative">
        {/* 로고 */}
        <h1 className="text-center text-[28px] font-bold text-[#6f5f18]">
          Memoreal
        </h1>

        {/* 메인 문구 */}
        <section className="mt-16 text-center">
          <h2 className="text-[34px] font-black leading-tight text-[#222]">
            말씀만 하세요,
            <br />
            책이 됩니다.
          </h2>

          <p className="mt-9 text-[17px] leading-8 text-[#666]">
            당신의 소중한 인생 이야기를
            <br />
            따뜻한 한 권의 자서전으로 담아드립니다.
          </p>
        </section>

        {/* 이미지 영역 */}
        <section className="mt-10 relative">
        {/* 뒤쪽 노란 배경 박스 */}
        <div className="absolute inset-0 rounded-[34px] bg-[#eee7ad] rotate-[0deg] translate-x-1 translate-y-1" />

        {/* 앞쪽 이미지 박스 */}
        <div className="relative h-[340px] rounded-[34px] border-[2.5px] border-[#222] bg-[#fffef8] flex items-center justify-center overflow-hidden">
            <img
            src={onboardingImage}
            alt="자서전 온보딩 이미지"
            className="w-full h-full object-cover"
            />
        </div>
        </section>

        {/* 버튼 영역 */}
        <section className="mt-36 space-y-4">
          <button
            onClick={handleKakaoStart}
            disabled={isStarting}
            className="w-full h-[62px] rounded-[12px] bg-[#FEE500] border-[1.5px] border-[#222] shadow-[4px_5px_0_#222] flex items-center justify-center gap-3 text-[18px] font-medium text-[#222] transition duration-200 hover:-translate-y-1 hover:shadow-[6px_7px_0_#222] disabled:opacity-50"
          >
            <span className="text-[22px]">💬</span>
            {isStarting ? "이동 중..." : "카카오로 1초 만에 시작하기"}
          </button>

          <button
            onClick={handleComingSoon}
            className="w-full h-[56px] rounded-[10px] bg-white border-[1.5px] border-[#222] text-[18px] text-[#333] transition duration-200 hover:bg-gray-100"
          >
            전화번호로 시작하기
          </button>
        </section>

        {/* 약관 문구 */}
        <p className="mt-8 text-center text-[12px] leading-6 text-[#8f8f8f]">
          계속 진행함으로써 타임트립의 이용약관 및 개인정보
          <br />
          처리방침에 동의하게 됩니다.
        </p>
      </section>
    </main>
  );
}

export default OnboardingPage;