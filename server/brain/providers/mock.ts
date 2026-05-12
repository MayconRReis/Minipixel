import { BrainResponse } from "../../../src/brain/brainTypes";

export async function mockBrain(prompt: string): Promise<BrainResponse> {
  const isEating = prompt.toLowerCase().includes('maçã');
  const isDrinking = prompt.toLowerCase().includes('água');
  const isChatting = !isEating && !isDrinking;

  return {
    speech: isEating ? "Nham! Maçã é minha favorita!" : isDrinking ? "Gulp gulp! Refrescante." : "Olá! Eu sou o Mini. Vamos aprender algo?",
    thought: "O usuário interagiu comigo. Me sinto bem.",
    emotion: isChatting ? "happy" : "excited",
    intent: isEating ? "eat" : isDrinking ? "drink" : "chat",
    statusDelta: {
      hunger: isEating ? -20 : 2,
      thirst: isDrinking ? -20 : 2,
      energy: isChatting ? -2 : 5,
      mood: 10,
      core: isChatting ? 1 : 0
    },
    memoryToSave: isChatting ? {
      type: "relationship",
      content: "Conversei com meu amigo humano.",
      importance: 2
    } : null
  };
}
