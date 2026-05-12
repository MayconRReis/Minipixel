import { GoogleGenAI, Type } from "@google/genai";
import { brainConfig } from "../brainConfig";

const ai = new GoogleGenAI({ apiKey: brainConfig.geminiApiKey || "" });

export async function geminiBrain(prompt: string, systemInstruction: string) {
  if (!brainConfig.geminiApiKey) {
    throw new Error("GEMINI_API_KEY not configured");
  }

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          speech: { type: Type.STRING },
          thought: { type: Type.STRING },
          emotion: { type: Type.STRING, enum: ["curious", "happy", "sad", "tired", "hungry", "thirsty", "confused", "scared", "excited", "neutral"] },
          intent: { type: Type.STRING, enum: ["chat", "ask", "eat", "drink", "sleep", "play", "study", "remember", "explore", "idle"] },
          statusDelta: {
            type: Type.OBJECT,
            properties: {
              hunger: { type: Type.NUMBER },
              thirst: { type: Type.NUMBER },
              energy: { type: Type.NUMBER },
              mood: { type: Type.NUMBER },
              core: { type: Type.NUMBER },
            }
          },
          memoryToSave: {
            type: Type.OBJECT,
            nullable: true,
            properties: {
              type: { type: Type.STRING, enum: ["learning", "preference", "event", "relationship"] },
              content: { type: Type.STRING },
              importance: { type: Type.NUMBER },
            }
          },
        },
        required: ["speech", "thought", "emotion", "intent", "statusDelta"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}
