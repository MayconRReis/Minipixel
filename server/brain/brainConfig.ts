export const brainConfig = {
  provider: process.env.BRAIN_PROVIDER || 'mock',
  geminiApiKey: process.env.GEMINI_API_KEY,
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  ollamaModel: process.env.OLLAMA_MODEL || 'phi3',
};
