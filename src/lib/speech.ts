export interface SpeechSession {
  stop: () => void;
  abort: () => void;
}

export type SpeechError =
  | { kind: "unsupported" }
  | { kind: "permission-denied" }
  | { kind: "no-speech" }
  | { kind: "network" }
  | { kind: "other"; message: string };

export interface StartListeningOptions {
  onPartial: (text: string) => void;
  onFinal: (text: string) => void;
  onError: (err: SpeechError) => void;
  onEnd: () => void;
}

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: SpeechRecognitionEventLike) => void) | null;
  onerror: ((e: { error?: string; message?: string }) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: ArrayLike<{
    isFinal: boolean;
    0: { transcript: string };
  }>;
}

function getCtor(): SpeechRecognitionCtor | null {
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function isSpeechSupported(): boolean {
  return getCtor() !== null;
}

export function startListening(opts: StartListeningOptions): SpeechSession {
  const Ctor = getCtor();
  if (!Ctor) {
    queueMicrotask(() => {
      opts.onError({ kind: "unsupported" });
      opts.onEnd();
    });
    return { stop() {}, abort() {} };
  }

  const rec = new Ctor();
  rec.lang = "ko-KR";
  rec.continuous = true;
  rec.interimResults = true;

  let ended = false;
  const safeEnd = () => {
    if (ended) return;
    ended = true;
    opts.onEnd();
  };

  rec.onresult = (e) => {
    let interim = "";
    let final = "";
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const r = e.results[i];
      const text = r[0].transcript;
      if (r.isFinal) final += text;
      else interim += text;
    }
    if (final.trim()) opts.onFinal(final.trim());
    if (interim.trim()) opts.onPartial(interim.trim());
  };

  rec.onerror = (e) => {
    const code = e.error ?? "";
    if (code === "not-allowed" || code === "service-not-allowed") {
      opts.onError({ kind: "permission-denied" });
    } else if (code === "no-speech") {
      opts.onError({ kind: "no-speech" });
    } else if (code === "network") {
      opts.onError({ kind: "network" });
    } else {
      opts.onError({ kind: "other", message: e.message ?? code });
    }
  };

  rec.onend = () => safeEnd();

  try {
    rec.start();
  } catch (err) {
    opts.onError({
      kind: "other",
      message: err instanceof Error ? err.message : String(err),
    });
    safeEnd();
  }

  return {
    stop: () => {
      try {
        rec.stop();
      } catch {
        safeEnd();
      }
    },
    abort: () => {
      try {
        rec.abort();
      } catch {
        safeEnd();
      }
    },
  };
}
