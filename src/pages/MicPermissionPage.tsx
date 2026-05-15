import { useState } from "react";
import { useNavigate } from "react-router-dom";

type SpeechError = {
  kind:
    | "permission-denied"
    | "no-speech"
    | "network"
    | "unsupported"
    | "unknown";
};

function errorMessage(err: SpeechError): string {
  switch (err.kind) {
    case "permission-denied":
      return "마이크 권한이 필요합니다. 브라우저 설정에서 허용해 주세요.";
    case "no-speech":
      return "음성이 들리지 않았어요. 다시 시도해 주세요.";
    case "network":
      return "네트워크 문제로 음성 인식이 어려워요.";
    case "unsupported":
      return "이 브라우저는 음성 입력을 지원하지 않습니다.";
    default:
      return "음성 인식 중 문제가 발생했어요.";
  }
}

function MicPermissionPage() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");

  const requestMicrophonePermission = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setMessage(errorMessage({ kind: "unsupported" }));
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      stream.getTracks().forEach((track) => track.stop());
      navigate("/chat");
    } catch {
      setMessage(errorMessage({ kind: "permission-denied" }));
    }
  };

  return (
    <main className="min-h-screen bg-[#f1f4f8] flex justify-center">
      <section className="w-full max-w-[430px] min-h-screen bg-[#9b9b9b] relative overflow-hidden flex items-center justify-center px-6">
        {/* 배경 화면 */}
        <div className="text-center">
          <h1 className="text-[38px] font-medium text-[#4b3d07]">
            타임트립
          </h1>

          <p className="mt-6 text-[21px] text-[#333]">
            오늘도 즐거운 이야기 나누어볼까요?
          </p>

          <button className="mt-10 w-full max-w-[350px] h-[58px] rounded-[14px] bg-[#a38b13] text-[#3b3000] text-[24px] flex items-center justify-center gap-2 mx-auto">
            <span>🎙</span>
            오늘의 대화 시작하기
          </button>
        </div>

        {/* iOS 스타일 권한 요청 모달 */}
        <div className="absolute inset-0 flex items-center justify-center px-8">
          <div className="w-[315px] rounded-[14px] bg-[#f8f8f8] overflow-hidden shadow-xl">
            <div className="px-6 pt-6 pb-5 text-center">
              <h2 className="text-[18px] font-medium text-[#222] leading-7">
                “타임트립”에서 마이크에
                <br />
                접근하려고 합니다
              </h2>

              <p className="mt-3 text-[13px] leading-5 text-[#555]">
                목소리로 대화하시려면 마이크 권한이
                <br />
                필요합니다. 허용하지 않으셔도 글자로
                <br />
                대화하실 수 있습니다.
              </p>
            </div>

            <div className="grid grid-cols-2 border-t border-[#d8d8d8]">
              <button
                onClick={() => navigate("/chat")}
                className="h-[50px] text-[17px] text-[#2f80ff] border-r border-[#d8d8d8] hover:bg-gray-100"
              >
                허용 안 함
              </button>

              <button
                onClick={requestMicrophonePermission}
                className="h-[50px] text-[17px] text-[#2f80ff] hover:bg-gray-100"
              >
                허용
              </button>
            </div>
          </div>
        </div>

        {message && (
          <p className="absolute bottom-16 px-6 text-center text-sm text-white leading-6">
            {message}
          </p>
        )}
      </section>
    </main>
  );
}

export default MicPermissionPage;