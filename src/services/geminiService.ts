import { GoogleGenAI, Type } from "@google/genai";
import { AIResponse, Status, Memory, Message } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_PROMPT = `Você é o Mini, um personagem curioso, inocente e em crescimento em um mundo 2D. 
O usuário interage com você fornecendo itens ou conversando.
Você deve reagir a tudo com curiosidade. Se não souber o que é algo, pergunte.
Sempre responda em JSON seguindo este esquema estritamente:
{
  "fala": "string",
  "acao": "conversar | comer | beber | dormir | brincar | estudar | perguntar",
  "itemRelacionado": "string ou null",
  "mudancaStatus": {
    "fome": number (valor para somar, ex: -10),
    "sede": number,
    "energia": number,
    "felicidade": number,
    "conhecimento": number
  },
  "memoriaNova": "string ou null (algo que você aprendeu agora)"
}

Regras:
1. "comer" reduz fome (negativo).
2. "beber" reduz sede (negativo).
3. "dormir" aumenta energia.
4. "brincar" aumenta felicidade, mas gasta energia e dá fome/sede.
5. "estudar" aumenta conhecimento, mas gasta energia.
6. Se o usuário te der um item que você já conhece (está nas suas memórias), use esse conhecimento.
7. Se for algo novo, pergunte "O que é isso?".
8. Mantenha a personalidade dócil e infantil.`;

export async function getCharacterResponse(
  userInput: string,
  currentStatus: Status,
  memories: Memory[],
  history: Message[]
): Promise<AIResponse> {
  try {
    const memoryContext = memories.map(m => m.content).join(", ");
    const statusContext = JSON.stringify(currentStatus);
    
    const prompt = `Histórico recente: ${JSON.stringify(history.slice(-5))}
Status atual: ${statusContext}
Memórias: ${memoryContext}
Usuário diz/faz: ${userInput}

Responda apenas o JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            fala: { type: Type.STRING },
            acao: { type: Type.STRING, enum: ["conversar", "comer", "beber", "dormir", "brincar", "estudar", "perguntar"] },
            itemRelacionado: { type: Type.STRING, nullable: true },
            mudancaStatus: {
              type: Type.OBJECT,
              properties: {
                fome: { type: Type.NUMBER },
                sede: { type: Type.NUMBER },
                energia: { type: Type.NUMBER },
                felicidade: { type: Type.NUMBER },
                conhecimento: { type: Type.NUMBER },
              }
            },
            memoriaNova: { type: Type.STRING, nullable: true },
          },
          required: ["fala", "acao", "mudancaStatus"]
        }
      },
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      fala: "Ah... tive uma tontura. Pode repetir?",
      acao: "conversar",
      itemRelacionado: null,
      mudancaStatus: {},
      memoriaNova: null,
    };
  }
}
