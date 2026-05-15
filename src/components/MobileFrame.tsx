import type { ReactNode } from "react";

export default function MobileFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-full bg-slate-100">
      <div className="relative mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-[#fcfcfc] shadow-xl">
        {children}
      </div>
    </div>
  );
}
