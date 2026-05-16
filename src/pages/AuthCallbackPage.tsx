import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { writeAuth } from "@/lib/auth";
import { fetchMe } from "@/lib/authApi";

export default function AuthCallbackPage() {
  const [search] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = search.get("token");
    const isNewUser = search.get("isNewUser") === "true";
    const errorParam = search.get("error");

    if (errorParam) {
      setError(`로그인 실패: ${errorParam}`);
      return;
    }
    if (!token) {
      setError("토큰이 전달되지 않았습니다.");
      return;
    }

    writeAuth({
      accessToken: token,
      tokenType: "Bearer",
      expiresIn: 86_400_000,
    });

    (async () => {
      try {
        const me = await fetchMe();
        setUser(me);
        navigate(isNewUser ? "/mic-permission" : "/home", { replace: true });
      } catch (e) {
        setError(
          e instanceof Error
            ? `사용자 정보를 불러올 수 없습니다: ${e.message}`
            : "사용자 정보를 불러올 수 없습니다.",
        );
      }
    })();
  }, [search, navigate, setUser]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#fafafa] px-6">
      {error ? (
        <div className="max-w-[400px] text-center">
          <p className="text-base text-red-600">{error}</p>
          <button
            onClick={() => navigate("/login", { replace: true })}
            className="mt-6 rounded-lg bg-[#FEE500] px-6 py-3 font-medium text-[#222]"
          >
            로그인으로 돌아가기
          </button>
        </div>
      ) : (
        <p className="text-base text-slate-500">로그인 처리 중...</p>
      )}
    </main>
  );
}
