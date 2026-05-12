import { MiniStatus, MiniResponse } from "../types/character";
import { MiniMemory } from "../types/memory";
import { Message } from "../types/character";
import { getCharacterResponse } from "../services/geminiService";

export async function generateSpontaneousThought(
  status: MiniStatus,
  memories: MiniMemory[],
  history: Message[]
): Promise<MiniResponse | null> {
  // Logic to decide if a thought should occur
  // Highest need usually triggers a thought
  let prompt = "";
  
  if (status.fome > 60) prompt = "Estou sentindo um buraquinho na barriga... será que tem comida?";
  else if (status.sede > 60) prompt = "Minha garganta está seca. Queria um pouco de água.";
  else if (status.energia < 40) prompt = "Meus olhinhos estão pesando... que soninho.";
  else if (status.felicidade < 40) prompt = "Estou um pouco sozinho... o que será que meu amigo está fazendo?";
  else if (memories.length > 0 && Math.random() > 0.7) {
    const randomMemory = memories[Math.floor(Math.random() * memories.length)];
    prompt = `Lembrei de uma coisa: ${randomMemory.conteudo}. Isso é legal!`;
  } else {
    prompt = "Estou aqui observando o mundo. É tão bonito!";
  }

  try {
    return await getCharacterResponse(prompt, status, memories, history, true);
  } catch (e) {
    return null;
  }
}
