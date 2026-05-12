# MiniVida IA - Decoupled Brain OS

This project is a simulation of an autonomous entity named **Mini**. Its architecture is designed to be provider-agnostic, meaning you can swap its "brain" between different AI models.

## Architecture

- **Simulation Engine**: React-based world and status manager.
- **Brain OS Interface**: A unified API endpoint (`/api/brain/talk`) that handles cognitive requests.
- **Providers**: Specialized modules for different AI backends.

## How to Run

### 1. Mock Mode (Default)
Ideal for testing UI and mechanics without internet or API keys.
1. Ensure `BRAIN_PROVIDER=mock` is set in your environment or `.env` file.
2. Run `npm run dev`.

### 2. Gemini Mode (Cloud)
Uses Google's Gemini Flash for advanced reasoning and personality.
1. Set `BRAIN_PROVIDER=gemini`.
2. Add your `GEMINI_API_KEY` to the environment variables.
3. Run `npm run dev`.

### 3. Ollama Mode (Local)
Run Mini fully locally using your own hardware.
1. Install [Ollama](https://ollama.com/).
2. Run `ollama serve`.
3. Pull a model: `ollama pull phi3`.
4. Set `BRAIN_PROVIDER=ollama`.
5. Set `OLLAMA_MODEL=phi3` (or your preferred model).
6. Run `npm run dev`.

## Changing the Brain

To change which brain Mini uses, simply update the `BRAIN_PROVIDER` environment variable. The system will automatically route all cognitive requests through the chosen provider.

## Brain Response Schema

Every provider must output a consistent JSON format:
- `speech`: What Mini says.
- `thought`: Internal reasoning (hidden or used for logs).
- `emotion`: Visual state.
- `intent`: Action to perform in the world.
- `statusDelta`: Impact on Mini's needs.
- `memoryToSave`: New long-term memories.
