import { Router } from "express";
import { brainConfig } from "./brainConfig";
import { geminiBrain } from "./providers/gemini";
import { ollamaBrain } from "./providers/ollama";
import { mockBrain } from "./providers/mock";

const router = Router();

router.post("/talk", async (req, res) => {
  const { prompt, systemInstruction } = req.body;
  console.log(`[BrainRouter] Request using provider: ${brainConfig.provider}`);

  try {
    let response;
    switch (brainConfig.provider) {
      case 'gemini':
        response = await geminiBrain(prompt, systemInstruction);
        break;
      case 'ollama':
        response = await ollamaBrain(prompt, systemInstruction);
        break;
      case 'mock':
      default:
        response = await mockBrain(prompt);
        break;
    }
    res.json(response);
  } catch (error: any) {
    console.error(`[BrainRouter] Error with ${brainConfig.provider}:`, error.message);
    res.status(500).json({ 
      error: error.message,
      provider: brainConfig.provider 
    });
  }
});

export default router;
