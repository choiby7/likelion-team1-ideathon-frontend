import { useState } from "react";

interface Props {
  onCancel: () => void;
  onSubmit: (text: string) => void;
}

export default function TextInputSheet({ onCancel, onSubmit }: Props) {
  const [text, setText] = useState("");

  const submit = () => {
    const value = text.trim();
    if (!value) return;
    onSubmit(value);
  };

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/40">
      <div className="mx-auto w-full max-w-[430px] rounded-t-3xl bg-white p-5">
        <p className="mb-3 text-sm text-slate-500">
          이 브라우저는 음성 입력을 지원하지 않아요. 텍스트로 입력해 주세요.
        </p>
        <textarea
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="이야기를 들려주세요."
          rows={3}
          className="w-full resize-none rounded-xl border border-slate-200 p-3 text-base outline-none focus:border-[#ffcc00]"
        />
        <div className="mt-3 flex items-center justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-lg px-4 py-2 text-base text-slate-500"
          >
            취소
          </button>
          <button
            onClick={submit}
            disabled={!text.trim()}
            className="rounded-lg px-5 py-2 text-base font-semibold text-slate-900 disabled:opacity-40"
            style={{ backgroundColor: "#ffcc00" }}
          >
            보내기
          </button>
        </div>
      </div>
    </div>
  );
}
