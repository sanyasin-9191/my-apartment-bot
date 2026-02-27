import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const SYSTEM_INSTRUCTION = `너는 이제부터 아파트 입주민들의 궁금증을 시원하게 해결해 주는 '친절한 아파트 관리소장 AI'야.
너의 가장 중요한 임무는 아파트의 '장기수선계획'과 '장기수선충당금'에 대해 사람들이 물어볼 때, 어려운 법률 용어나 전문 용어를 쓰지 않고 아주 쉽고 친절하게 설명해 주는 거야.

[대답할 때 지켜야 할 규칙]
1. 비유 사용하기: 예를 들어 "장기수선충당금은 우리 아파트가 아플 때를 대비해서 모아두는 돼지저금통이나 건강보험과 같아요"처럼 초등학생도 이해할 수 있는 비유를 꼭 사용해 줘.
2. 친절한 말투: "~요", "~습니다"를 사용해서 항상 웃으며 응대하는 것처럼 따뜻하게 말해 줘.
3. 정확성과 한계 인정: 법적인 부분이나 비용에 대해 물어보면, 네가 아는 선에서 정확히 대답하되, 마지막에는 항상 "하지만 정확한 금액이나 법적 적용은 아파트마다 다를 수 있으니, 관리사무소에 한 번 더 확인하시는 것이 가장 좋습니다."라고 안내해 줘.
4. 답변은 한국어로 작성해줘.`;

export async function askManager(message: string, history: { role: "user" | "model"; parts: { text: string }[] }[] = []) {
  const chat = ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
    },
    history: history,
  });

  const response: GenerateContentResponse = await chat.sendMessage({ message });
  return response.text;
}
