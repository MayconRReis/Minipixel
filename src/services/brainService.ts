import { BrainResponse, Message } from "../brain/brainTypes";
import { BRAIN_SYSTEM_PROMPT } from "../brain/brainPrompt";
import { BrainStatus, BrainMemory } from "../brain/brainTypes";

export async function brainTalk(
  userInput: string,
  currentStatus: BrainStatus,
  memories: any[], // Simple array of strings or previous memory objects
  history: Message[]
): Promise<BrainResponse> {
  const memoryContext = memories.map(m => typeof m === 'string' ? m : `[${m.type}] ${m.content}`).join("\n");
  
  const context = `
  CURRENT STATUS: ${JSON.stringify(currentStatus)}
  RECENT MEMORIES:
  ${memoryContext || "None yet."}
  RECENT HISTORY:
  ${JSON.stringify(history.slice(-5))}
  `;

  const response = await fetch("/api/brain/talk", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt: `CONTEXT: ${context}\nUSER ACTION/WORDS: ${userInput}\n\nRespond as Mini.`,
      systemInstruction: BRAIN_SYSTEM_PROMPT
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Brain error");
  }

  return await response.json();
}
