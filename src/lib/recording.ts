// Audio recording wrapper around MediaRecorder.
//
// Strategy: let MediaRecorder use its preferred format (webm/opus on Chrome,
// mp4/aac on Safari, ogg/opus on Firefox), then decode + re-encode to WAV
// 16-bit PCM mono using Web Audio API before upload. Clova STT accepts WAV
// reliably; the alternative of trying to coerce MediaRecorder into mp4/ogg
// produces files that don't match their declared MIME on Chrome.

export function isRecordingSupported(): boolean {
  if (typeof navigator === "undefined" || !navigator.mediaDevices) return false;
  if (typeof MediaRecorder === "undefined") return false;
  if (typeof AudioContext === "undefined" && typeof (window as any).webkitAudioContext === "undefined") return false;
  return true;
}

function pickRecordMime(): string | undefined {
  // Prefer browsers' native codecs that Web Audio can decode.
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
    "audio/ogg",
  ];
  for (const m of candidates) {
    if (MediaRecorder.isTypeSupported(m)) return m;
  }
  return undefined;
}

export interface RecordingResult {
  blob: Blob;
  filename: string;
}

export interface RecordingSession {
  stop: () => Promise<RecordingResult>;
  abort: () => void;
}

export async function startRecording(): Promise<RecordingSession> {
  const mimeType = pickRecordMime();
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

  const recorder = mimeType
    ? new MediaRecorder(stream, { mimeType })
    : new MediaRecorder(stream);
  const chunks: BlobPart[] = [];

  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };

  recorder.start();

  let aborted = false;

  const cleanup = () => {
    stream.getTracks().forEach((t) => t.stop());
  };

  const stop = (): Promise<RecordingResult> =>
    new Promise((resolve, reject) => {
      if (aborted) {
        reject(new Error("녹음이 취소되었습니다."));
        return;
      }
      recorder.onstop = async () => {
        cleanup();
        try {
          const recordedType = recorder.mimeType || mimeType || "audio/webm";
          const raw = new Blob(chunks, { type: recordedType });
          const wav = await convertToWav(raw);
          resolve({ blob: wav, filename: "recording.wav" });
        } catch (err) {
          reject(
            err instanceof Error
              ? err
              : new Error("녹음 파일을 변환할 수 없습니다."),
          );
        }
      };
      recorder.onerror = (e) => {
        cleanup();
        reject(e instanceof Error ? e : new Error("녹음 오류"));
      };
      if (recorder.state !== "inactive") recorder.stop();
    });

  const abort = () => {
    aborted = true;
    if (recorder.state !== "inactive") recorder.stop();
    cleanup();
  };

  return { stop, abort };
}

// ── WAV (16kHz / 16-bit PCM / mono) encoder ──────────────────────────────
// Clova STT requires 16kHz mono PCM. Decode with AudioContext, then resample
// via OfflineAudioContext before writing the WAV header.

const TARGET_SAMPLE_RATE = 16000;

async function convertToWav(input: Blob): Promise<Blob> {
  const Ctx =
    typeof AudioContext !== "undefined"
      ? AudioContext
      : ((window as any).webkitAudioContext as typeof AudioContext);
  const ctx = new Ctx();
  let decoded: AudioBuffer;
  try {
    const arrayBuffer = await input.arrayBuffer();
    decoded = await ctx.decodeAudioData(arrayBuffer.slice(0));
  } finally {
    void ctx.close();
  }

  const resampled = await resampleTo16k(decoded);
  return encodeWav(resampled);
}

async function resampleTo16k(audioBuffer: AudioBuffer): Promise<AudioBuffer> {
  if (audioBuffer.sampleRate === TARGET_SAMPLE_RATE) return audioBuffer;
  const OfflineCtx =
    typeof OfflineAudioContext !== "undefined"
      ? OfflineAudioContext
      : ((window as any).webkitOfflineAudioContext as typeof OfflineAudioContext);
  const frameCount = Math.ceil(audioBuffer.duration * TARGET_SAMPLE_RATE);
  const offline = new OfflineCtx(1, frameCount, TARGET_SAMPLE_RATE);
  const source = offline.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(offline.destination);
  source.start();
  return offline.startRendering();
}

function encodeWav(audioBuffer: AudioBuffer): Blob {
  // Downmix to mono by averaging channels.
  const numFrames = audioBuffer.length;
  const sampleRate = audioBuffer.sampleRate;
  const channels = audioBuffer.numberOfChannels;
  const mono = new Float32Array(numFrames);
  if (channels === 1) {
    mono.set(audioBuffer.getChannelData(0));
  } else {
    for (let c = 0; c < channels; c++) {
      const data = audioBuffer.getChannelData(c);
      for (let i = 0; i < numFrames; i++) mono[i] += data[i];
    }
    for (let i = 0; i < numFrames; i++) mono[i] /= channels;
  }

  const bytesPerSample = 2; // 16-bit
  const blockAlign = bytesPerSample; // mono
  const byteRate = sampleRate * blockAlign;
  const dataSize = numFrames * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  writeAscii(view, 0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeAscii(view, 8, "WAVE");
  writeAscii(view, 12, "fmt ");
  view.setUint32(16, 16, true); // PCM fmt chunk size
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true); // bits per sample
  writeAscii(view, 36, "data");
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (let i = 0; i < numFrames; i++) {
    const s = Math.max(-1, Math.min(1, mono[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }

  return new Blob([buffer], { type: "audio/wav" });
}

function writeAscii(view: DataView, offset: number, text: string): void {
  for (let i = 0; i < text.length; i++) {
    view.setUint8(offset + i, text.charCodeAt(i));
  }
}
