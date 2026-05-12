/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { BrainStatus, BrainResponse, BrainEmotion, BrainIntent, Message } from "./brain/brainTypes";
import { brainTalk } from "./services/brainService";
import WorldView from "./components/WorldView";
import StatusPanel from "./components/StatusPanel";
import ActionButtons from "./components/ActionButtons";
import ChatPanel from "./components/ChatPanel";
import { Sparkles, Brain as BrainIcon, AlertCircle } from "lucide-react";

const INITIAL_STATUS: BrainStatus = {
  hunger: 20,
  thirst: 20,
  energy: 100,
  mood: 80,
  core: 10,
};

export default function App() {
  const [status, setStatus] = useState<BrainStatus>(() => {
    const saved = localStorage.getItem("minivida_status");
    return saved ? JSON.parse(saved) : INITIAL_STATUS;
  });
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [memories, setMemories] = useState<any[]>(() => {
    const saved = localStorage.getItem("minivida_memories");
    return saved ? JSON.parse(saved) : [];
  });

  const [currentAction, setCurrentAction] = useState<BrainIntent | 'idle'>("idle");
  const [emotion, setEmotion] = useState<BrainEmotion>("happy");
  const [itemInHand, setItemInHand] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [timeOfDay, setTimeOfDay] = useState<'day' | 'night'>('day');
  const [error, setError] = useState<string | null>(null);

  const lastInteractionRef = useRef<number>(Date.now());
  const lastErrorTimeRef = useRef<number>(0);

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
      setStatus(prev => ({
        hunger: Math.min(100, prev.hunger + 0.3),
        thirst: Math.min(100, prev.thirst + 0.4),
        energy: Math.max(0, prev.energy - 0.2),
        mood: Math.max(0, prev.mood - 0.1),
        core: prev.core
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Thought System loop
  useEffect(() => {
    const interval = setInterval(async () => {
      const timeSinceLastInteraction = Date.now() - lastInteractionRef.current;
      const timeSinceLastError = Date.now() - lastErrorTimeRef.current;
      
      // If user inactive for 30 seconds AND no errors in last 60 seconds
      if (timeSinceLastInteraction > 30000 && timeSinceLastError > 60000 && !isLoading) {
        console.log("[ThoughtSystem] Generating spontaneous thought...");
        setIsLoading(true);
        try {
          const response = await brainTalk("Internal thought", status, memories, messages);
          processResponse(response);
        } catch (e) {
          console.error("[ThoughtSystem] Error:", e);
          lastErrorTimeRef.current = Date.now();
        } finally {
          setIsLoading(false);
          lastInteractionRef.current = Date.now();
        }
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

  const processResponse = useCallback((response: BrainResponse) => {
    setMessages(prev => [...prev, { role: "assistant", content: response.speech }]);
    setCurrentAction(response.intent);
    setEmotion(response.emotion);
    setError(null);
    
    setStatus(prev => {
      const newStatus = { ...prev };
      if (response.statusDelta) {
        Object.entries(response.statusDelta).forEach(([key, val]) => {
          const k = key as keyof BrainStatus;
          if (newStatus[k] !== undefined) {
             newStatus[k] = Math.min(100, Math.max(0, newStatus[k] + (val || 0)));
          }
        });
      }
      return newStatus;
    });

    if (response.memoryToSave && response.memoryToSave.content) {
      setMemories(prev => [...prev.slice(-19), { 
        ...response.memoryToSave, 
        id: crypto.randomUUID(), 
        timestamp: Date.now() 
      }]);
    }

    if (response.intent !== 'chat') {
      setTimeout(() => setCurrentAction('idle'), 4000);
    }
  }, []);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;
    lastInteractionRef.current = Date.now();
    
    const userMessage: Message = { role: "user", content: text };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await brainTalk(text, status, memories, [...messages, userMessage]);
      processResponse(response);
    } catch (e: any) {
      setError(`MiniBrain [${e.message}]`);
      lastErrorTimeRef.current = Date.now();
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
      const response = await brainTalk(`Item given: ${itemName}`, status, memories, messages);
      processResponse(response);
    } catch (e: any) {
      setError(`MiniBrain [${e.message}]`);
      lastErrorTimeRef.current = Date.now();
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
                 <p className="text-[12px] font-retro text-gray-400 uppercase tracking-widest opacity-80">BRAIN_OS: ACTIVE | CYCLE: {timeOfDay.toUpperCase()}</p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-8 items-center bg-white/5 px-8 py-4 rounded-lg border-2 border-white/5 backdrop-blur-md">
             <div className="text-center group cursor-help">
                <div className="text-[10px] text-gray-500 font-retro mb-1 group-hover:text-yellow-400 transition-colors">ADAPTABILITY</div>
                <div className="text-2xl text-yellow-500 font-retro">{Math.round(status.core)}</div>
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
                   <BrainIcon className="text-[#3498db] w-5 h-5" />
                   <h2 className="font-retro text-[12px] text-white tracking-widest">COGNITIVE_LAYER.SYS</h2>
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
                         {new Date(mem.timestamp).toLocaleTimeString()} | {mem.type.toUpperCase()}
                       </div>
                       <p className="text-sm text-gray-300 font-pixel leading-tight">{mem.content}</p>
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


