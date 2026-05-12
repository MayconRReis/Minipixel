/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { MiniStatus, MiniResponse, EmotionType, MiniAction, Message } from "./types/character";
import { MiniMemory } from "./types/memory";
import { getCharacterResponse } from "./services/geminiService";
import { updateNeeds } from "./systems/needsSystem";
import { calculateEmotion } from "./systems/emotionSystem";
import { generateSpontaneousThought } from "./systems/thoughtSystem";
import WorldView from "./components/WorldView";
import StatusPanel from "./components/StatusPanel";
import ActionButtons from "./components/ActionButtons";
import ChatPanel from "./components/ChatPanel";
import { Sparkles, Brain, AlertCircle } from "lucide-react";

const INITIAL_STATUS: MiniStatus = {
  fome: 20,
  sede: 20,
  energia: 100,
  felicidade: 80,
  conhecimento: 10,
};

export default function App() {
  const [status, setStatus] = useState<MiniStatus>(() => {
    const saved = localStorage.getItem("minivida_status");
    return saved ? JSON.parse(saved) : INITIAL_STATUS;
  });
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [memories, setMemories] = useState<MiniMemory[]>(() => {
    const saved = localStorage.getItem("minivida_memories");
    return saved ? JSON.parse(saved) : [];
  });

  const [currentAction, setCurrentAction] = useState<MiniAction>("conversar");
  const [emotion, setEmotion] = useState<EmotionType>("feliz");
  const [itemInHand, setItemInHand] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [timeOfDay, setTimeOfDay] = useState<'day' | 'night'>('day');
  const [error, setError] = useState<string | null>(null);

  const lastInteractionRef = useRef<number>(Date.now());

  // Persistence
  useEffect(() => {
    localStorage.setItem("minivida_status", JSON.stringify(status));
  }, [status]);

  useEffect(() => {
    localStorage.setItem("minivida_memories", JSON.stringify(memories));
  }, [memories]);

  // Needs System loop
  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(prev => updateNeeds(prev));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Emotion System
  useEffect(() => {
    setEmotion(calculateEmotion(status, currentAction));
  }, [status, currentAction]);

  // Thought System loop
  useEffect(() => {
    const interval = setInterval(async () => {
      const timeSinceLastInteraction = Date.now() - lastInteractionRef.current;
      
      // If user inactive for 30 seconds
      if (timeSinceLastInteraction > 30000 && !isLoading) {
        setIsLoading(true);
        const thought = await generateSpontaneousThought(status, memories, messages);
        if (thought) {
          processResponse(thought);
        }
        setIsLoading(false);
        lastInteractionRef.current = Date.now();
      }
    }, 15000); // Check every 15s

    return () => clearInterval(interval);
  }, [status, memories, messages, isLoading]);

  // Cycle time of day
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeOfDay(prev => prev === 'day' ? 'night' : 'day');
    }, 120000); // 2 minutes per cycle
    return () => clearInterval(interval);
  }, []);

  const processResponse = useCallback((response: MiniResponse) => {
    setMessages(prev => [...prev, { role: "assistant", content: response.fala, timestamp: Date.now() }]);
    setCurrentAction(response.acao);
    setEmotion(response.emotion);
    setError(null);
    
    setStatus(prev => {
      const newStatus = { ...prev };
      if (response.mudancaStatus) {
        Object.entries(response.mudancaStatus).forEach(([key, val]) => {
          const k = key as keyof MiniStatus;
          if (newStatus[k] !== undefined) {
             newStatus[k] = Math.min(100, Math.max(0, newStatus[k] + (val || 0)));
          }
        });
      }
      return newStatus;
    });

    if (response.memoriaNova) {
      const newMem: MiniMemory = {
        id: crypto.randomUUID(),
        ...response.memoriaNova,
        timestamp: Date.now()
      };
      setMemories(prev => [...prev.slice(-19), newMem]); // Keep last 20 memories
    }

    if (response.acao !== 'conversar' && response.acao !== 'pensar') {
      setTimeout(() => setCurrentAction('conversar'), 4000);
    }
  }, []);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;
    lastInteractionRef.current = Date.now();
    
    const userMessage: Message = { role: "user", content: text, timestamp: Date.now() };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await getCharacterResponse(text, status, memories, [...messages, userMessage]);
      processResponse(response);
    } catch (e) {
      setError("O Mini parece estar distraído (erro na conexão).");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddItem = async (itemName: string) => {
    setItemInHand(itemName);
    lastInteractionRef.current = Date.now();
    setIsLoading(true);
    setError(null);

    try {
      const context = `RECEBI O ITEM: ${itemName}`;
      const response = await getCharacterResponse(context, status, memories, messages);
      processResponse(response);
    } catch (e) {
      setError("O Mini não conseguiu ver o item (erro na conexão).");
    } finally {
      setIsLoading(false);
      setTimeout(() => setItemInHand(null), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a14] p-4 md:p-8 font-pixel transition-all selection:bg-[#3498db] selection:text-white">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        
        <header className="flex flex-col md:flex-row items-center justify-between gap-6 border-b-4 border-white/5 pb-8">
          <div className="flex items-center gap-6">
            <div className="bg-[#3498db] p-5 rounded-lg border-b-8 border-[#2980b9] shadow-inner floating">
              <Sparkles className="text-white w-10 h-10" />
            </div>
            <div>
              <h1 className="text-4xl md:text-6xl font-retro text-white tracking-widest leading-none drop-shadow-2xl">MINIVIDA_OS</h1>
              <div className="flex items-center gap-3 mt-3">
                 <div className={`w-3 h-3 rounded-full animate-pulse bg-green-400`} />
                 <p className="text-[12px] font-retro text-gray-400 uppercase tracking-widest opacity-80">EMPATHY_CORE: ACTIVE | CYCLE: {timeOfDay.toUpperCase()}</p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-8 items-center bg-white/5 px-8 py-4 rounded-lg border-2 border-white/5 backdrop-blur-md">
             <div className="text-center group cursor-help">
                <div className="text-[10px] text-gray-500 font-retro mb-1 group-hover:text-yellow-400 transition-colors">KNOWLEDGE</div>
                <div className="text-2xl text-yellow-500 font-retro">{Math.round(status.conhecimento)}</div>
             </div>
             <div className="h-10 w-[2px] bg-white/10" />
             <div className="text-center">
                <div className="text-[10px] text-gray-500 font-retro mb-1">MEMORIES</div>
                <div className="text-2xl text-indigo-400 font-retro">{memories.length}</div>
             </div>
          </div>
        </header>

        {error && (
          <div className="bg-red-900/40 border-2 border-red-500/50 p-4 rounded-lg flex items-center gap-4 text-red-100 font-pixel">
            <AlertCircle className="text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-8 space-y-8">
            <WorldView currentAction={currentAction} itemInHand={itemInHand} timeOfDay={timeOfDay} emotion={emotion} />
            
            <section className="bg-[#1a1a2e]/60 backdrop-blur-md rounded-lg p-8 border-4 border-[#34495e] shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                   <Brain className="text-[#3498db] w-5 h-5" />
                   <h2 className="font-retro text-[12px] text-white tracking-widest">INTERACTION_LAYER.SYS</h2>
                </div>
                <div className="h-[2px] flex-1 mx-6 bg-white/5" />
              </div>
              <ActionButtons onAddItem={handleAddItem} isLoading={isLoading} />
            </section>

            <ChatPanel 
              messages={messages} 
              onSendMessage={handleSendMessage} 
              isLoading={isLoading} 
            />
          </div>

          <div className="lg:flex flex-col lg:col-span-4 space-y-8 h-full">
            <StatusPanel status={status} />
            
            <div className="bg-[#2c3e50]/40 p-8 rounded-lg border-4 border-[#34495e] flex-1">
              <h4 className="text-[#3498db] font-retro text-[14px] mb-8 flex items-center gap-4 border-b-2 border-white/5 pb-4">
                RECENT_LOGS
              </h4>
              <div className="space-y-6 overflow-y-auto max-h-[300px] scrollbar-hide">
                {memories.length === 0 ? (
                  <p className="text-gray-600 font-pixel italic">Nenhum evento registrado...</p>
                ) : (
                  memories.slice().reverse().map(mem => (
                    <div key={mem.id} className="relative pl-6 border-l-2 border-indigo-500/30">
                       <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-indigo-500" />
                       <div className="text-[10px] text-indigo-400/60 font-retro mb-1">
                         {new Date(mem.timestamp).toLocaleTimeString()} | {mem.tipo.toUpperCase()}
                       </div>
                       <p className="text-sm text-gray-300 font-pixel leading-tight">{mem.conteudo}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <button 
              onClick={() => {
                const confirmed = confirm("DESEJA REINICIALIZAR O NÚCLEO?");
                if (confirmed) {
                  localStorage.clear();
                  window.location.reload();
                }
              }}
              className="w-full py-4 text-red-500/40 hover:text-red-500 transition-all font-retro text-[10px] tracking-widest border-2 border-red-500/20 hover:bg-red-500/5"
            >
              [ PURGE_OS ]
            </button>
          </div>
        </main>

        <footer className="mt-12 py-12 text-center border-t-2 border-white/5">
           <div className="text-gray-600 text-[10px] font-retro tracking-[0.4em] uppercase">
             MiniVida_Autonomous_Entity_Simulation_v1.0.4
           </div>
        </footer>
      </div>
    </div>
  );
}


