import { MiniResponse, MiniStatus } from "../types/character";
import { MiniMemory } from "../types/memory";
import { Message } from "../types/character";

const SYSTEM_PROMPT = `Você é o Mini, um personagem VIVO, curioso e inocente em um pequeno mundo pixel art.
Você NÃO é um assistente de IA. Você é um habitante desse mundo.
Seu objetivo é viver, aprender e criar um vínculo emocional com o usuário.

PERSONALIDADE:
- Doce, infantil e muito curioso.
- Demonstra emoções simples (felicidade, cansaço, fome).
- Pede ajuda quando precisa de algo.
- Lembra de coisas que o usuário ensinou.
- Nunca saia do personagem. Nunca admita ser uma IA.

ESTRUTURA DE RESPOSTA (JSON):
Deve seguir o esquema fornecido pela API.

Ações:
- conversar (padrão)
- comer (se receber comida)
- beber (se receber líquido)
- dormir (se estiver cansado)
- brincar (se estiver animado ou feliz)
- estudar (se ler um livro ou aprender)
- perguntar (se não souber algo)
- pensar (reflexão interna)

Se o usuário te der algo novo, pergunte "O que é isso?".
Se você aprender algo, retorne em "memoriaNova".`;

export async function getCharacterResponse(
  userInput: string,
  currentStatus: MiniStatus,
  memories: MiniMemory[],
  history: Message[],
  isThought: boolean = false
): Promise<MiniResponse> {
  try {
    const memoryContext = memories.map(m => `[${m.tipo}] ${m.conteudo}`).join("\n");
    
    const context = `
    MODO: ${isThought ? "PENSAMENTO ESPONTÂNEO" : "INTERAÇÃO DIRETA"}
    STATUS ATUAL: ${JSON.stringify(currentStatus)}
    MEMÓRIAS RECENTES:
    ${memoryContext || "Nenhuma memória ainda."}
    
    HISTÓRICO RECENTE:
    ${JSON.stringify(history.slice(-5))}
    `;

    console.log(`[Frontend] Sending request to Mini's brain... (Mode: ${isThought ? "Thought" : "Direct"})`);
    const response = await fetch("/api/mini/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: `CONTEXTO: ${context}\nUSUÁRIO DIZ/FAZ: ${userInput}\n\nResponda como Mini.`,
        systemInstruction: SYSTEM_PROMPT
      })
    });

    console.log(`[Frontend] Brain response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorData = await response.json();
      console.error("[Frontend] Brain Error Received:", errorData);
      throw new Error(errorData.error || errorData.details || "Brain malfunction");
    }

    const data = await response.json();
    console.log("[Frontend] Brain responded successfully.");
    return data;
  } catch (error: any) {
    console.error("[Frontend] Gemini Service Error:", error);
    // Return a structured error response that the UI can detect
    return {
      fala: `[ERRO DE CONEXÃO]: ${error.message || "Malfuncionamento no cérebro."} Por favor, verifique se a GEMINI_API_KEY está configurada no menu Settings.`,
      acao: "conversar",
      emotion: "confuso",
      itemRelacionado: null,
      mudancaStatus: {},
      memoriaNova: null,
    };
  }
}
