import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/mini/chat", async (req, res) => {
    try {
      const { prompt, systemInstruction } = req.body;

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "GEMINI_API_KEY not configured" });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              fala: { type: Type.STRING },
              acao: { type: Type.STRING, enum: ["conversar", "comer", "beber", "dormir", "brincar", "estudar", "perguntar", "pensar"] },
              emotion: { type: Type.STRING, enum: ["curioso", "feliz", "triste", "cansado", "com fome", "com sede", "confuso", "assustado", "animado", "pensativo"] },
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
              memoriaNova: {
                type: Type.OBJECT,
                nullable: true,
                properties: {
                  tipo: { type: Type.STRING, enum: ["aprendizado", "preferencia", "evento", "relacao"] },
                  conteudo: { type: Type.STRING },
                  importancia: { type: Type.NUMBER },
                }
              },
            },
            required: ["fala", "acao", "emotion", "mudancaStatus"]
          }
        }
      });

      res.json(JSON.parse(response.text || "{}"));
    } catch (error) {
      console.error("Backend Gemini Error:", error);
      res.status(500).json({ error: "Failed to communicate with Mini's brain" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
