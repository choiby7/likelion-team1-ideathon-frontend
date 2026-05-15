import type { Message } from "@/types/memoir";

export const INITIAL_AI_GREETING =
  "어르신, 오늘은 어떤 즐거운 기억을 들려주실까요?";

const POOL = [
  "정말 즐거우셨겠군요. 그때 어떤 기분이셨어요?",
  "이야기를 더 듣고 싶어요. 그 다음엔 무슨 일이 있었나요?",
  "그 시절 가장 가까웠던 분은 누구셨나요?",
  "그 장면을 떠올리시면 어떤 냄새나 소리가 함께 떠오르세요?",
  "정말 소중한 기억이네요. 가족분들도 그 이야기를 아시나요?",
  "그때 어르신은 몇 살쯤이셨어요?",
  "그날의 날씨도 기억나세요?",
  "다시 그날로 돌아간다면 어떤 말을 건네고 싶으세요?",
];

const DELAY_MS = 800;

export async function generateReply(history: Message[]): Promise<string> {
  await new Promise((res) => setTimeout(res, DELAY_MS));
  const userCount = history.filter((m) => m.role === "user").length;
  return POOL[userCount % POOL.length];
}
