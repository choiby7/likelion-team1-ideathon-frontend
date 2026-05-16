import { useState } from "react";
import { fetchKakaoLoginUrl } from "@/lib/authApi";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleKakaoLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const url = await fetchKakaoLoginUrl();
      window.location.href = url;
    } catch (e) {
      setError(
        e instanceof Error
          ? `로그인 주소를 불러올 수 없습니다: ${e.message}`
          : "로그인 주소를 불러올 수 없습니다.",
      );
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f1f4f8] flex justify-center">
      <section className="w-full max-w-[430px] min-h-screen bg-[#fafafa] px-6 pt-16 pb-8 flex flex-col">
        <h1 className="text-center text-[28px] font-bold text-[#6f5f18]">
          Memoreal
        </h1>

        <section className="mt-20 text-center">
          <h2 className="text-[28px] font-bold leading-tight text-[#222]">
            로그인하고
            <br />
            나의 이야기를 이어가세요.
          </h2>
          <p className="mt-6 text-[16px] leading-7 text-[#666]">
            카카오 계정으로 빠르게
            <br />
            시작할 수 있습니다.
          </p>
        </section>

        <div className="flex-1" />

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          onClick={handleKakaoLogin}
          disabled={isLoading}
          className="w-full h-[62px] rounded-[12px] bg-[#FEE500] border-[1.5px] border-[#222] shadow-[4px_5px_0_#222] flex items-center justify-center gap-3 text-[18px] font-medium text-[#222] transition duration-200 hover:-translate-y-1 hover:shadow-[6px_7px_0_#222] disabled:opacity-50"
        >
          <span className="text-[22px]">💬</span>
          {isLoading ? "이동 중..." : "카카오로 시작하기"}
        </button>
      </section>
    </main>
  );
}
