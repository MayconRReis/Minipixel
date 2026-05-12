import { brainConfig } from "../brainConfig";

export async function ollamaBrain(prompt: string, systemInstruction: string) {
  try {
    const response = await fetch(`${brainConfig.ollamaBaseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: brainConfig.ollamaModel,
        prompt: `System: ${systemInstruction}\nUser: ${prompt}\nOutput only valid JSON.`,
        stream: false,
        format: 'json'
      }),
    });

    if (!response.ok) {
      if (response.status === 404 || response.status === 502) {
        throw new Error("Ollama não está ativo. Rode: ollama serve");
      }
      throw new Error(`Ollama Error: ${response.statusText}`);
    }

    const data = await response.json();
    return JSON.parse(data.response);
  } catch (error: any) {
    if (error.message.includes('fetch failed')) {
      throw new Error("Ollama não está ativo. Rode: ollama serve");
    }
    throw error;
  }
}
