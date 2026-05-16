import type { Message } from "@/types/memoir";

export const INITIAL_AI_GREETING =
  "어르신, 오늘은 어떤 즐거운 기억을 들려주실까요?";

const DELAY_MS = 800;

const SUMMARY_POOL = [
  "어제는 단짝 친구와 함께했던 소풍 이야기를 들려주셨어요. 김밥을 나눠 먹으며 나눴던 대화들이 아주 즐거웠다고 하셨죠.",
  "지난번엔 어린 시절 살던 동네의 풍경을 떠올려 주셨어요. 골목마다 들리던 아이들 웃음소리가 또렷이 기억나신다고 하셨죠.",
  "처음 학교에 가던 날의 설렘을 이야기해 주셨어요. 새 가방을 메고 어머니 손을 꼭 잡고 걸으셨다고요.",
  "가족과 함께 떠난 첫 여행 이야기를 들려주셨어요. 기차 창밖으로 보이던 풍경이 지금도 생생하다고 하셨죠.",
  "어머니께서 해주시던 음식 이야기로 시작하셨어요. 그 맛이 잊히지 않는다며 한참을 회상하셨답니다.",
  "고향 마을의 큰 나무 아래에서 친구들과 놀던 기억을 나눠 주셨어요. 그 시절이 가장 행복했다고 말씀하셨죠.",
  "젊은 시절 처음 시작한 일에 대해 들려주셨어요. 어렵지만 보람찼던 순간들을 천천히 풀어 주셨답니다.",
  "사랑하는 사람과의 첫 만남을 이야기해 주셨어요. 그날의 떨림이 어제 일처럼 또렷하다고 하셨죠.",
];

export async function generateSummary(history: Message[]): Promise<string> {
  await new Promise((res) => setTimeout(res, DELAY_MS));
  const userCount = history.filter((m) => m.role === "user").length;
  return SUMMARY_POOL[userCount % SUMMARY_POOL.length];
}
