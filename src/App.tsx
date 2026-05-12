/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from "react";
import { Status, AIResponse, Memory, Message, ActionType } from "./types";
import { getCharacterResponse } from "./services/geminiService";
import WorldView from "./components/WorldView";
import StatusPanel from "./components/StatusPanel";
import ActionButtons from "./components/ActionButtons";
import ChatPanel from "./components/ChatPanel";
import { Sparkles } from "lucide-react";

const INITIAL_STATUS: Status = {
  fome: 50,
  sede: 50,
  energia: 100,
  felicidade: 80,
  conhecimento: 0,
};

export default function App() {
  const [status, setStatus] = useState<Status>(() => {
    const saved = localStorage.getItem("minivida_status");
    return saved ? JSON.parse(saved) : INITIAL_STATUS;
  });
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [memories, setMemories] = useState<Memory[]>(() => {
    const saved = localStorage.getItem("minivida_memories");
    return saved ? JSON.parse(saved) : [];
  });

  const [currentAction, setCurrentAction] = useState<ActionType>("conversar");
  const [itemInHand, setItemInHand] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [timeOfDay, setTimeOfDay] = useState<'day' | 'night'>('day');

  // Persistence
  useEffect(() => {
    localStorage.setItem("minivida_status", JSON.stringify(status));
  }, [status]);

  useEffect(() => {
    localStorage.setItem("minivida_memories", JSON.stringify(memories));
  }, [memories]);

  // Status decay loop & Time of Day
  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(prev => ({
        ...prev,
        fome: Math.min(100, prev.fome + 0.3),
        sede: Math.min(100, prev.sede + 0.4),
        energia: Math.max(0, prev.energia - 0.2),
        felicidade: Math.max(0, prev.felicidade - 0.1),
      }));
    }, 5000);

    const timeInterval = setInterval(() => {
      setTimeOfDay(prev => prev === 'day' ? 'night' : 'day');
    }, 60000); // 1 minute per cycle for demo

    return () => {
      clearInterval(interval);
      clearInterval(timeInterval);
    };
  }, []);

  const processResponse = useCallback((response: AIResponse) => {
    setMessages(prev => [...prev, { role: "assistant", content: response.fala, timestamp: Date.now() }]);
    setCurrentAction(response.acao);
    
    setStatus(prev => {
      const newStatus = { ...prev };
      if (response.mudancaStatus) {
        Object.entries(response.mudancaStatus).forEach(([key, val]) => {
          const k = key as keyof Status;
          newStatus[k] = Math.min(100, Math.max(0, (newStatus[k] || 0) + (val || 0)));
        });
      }
      return newStatus;
    });

    if (response.memoriaNova) {
      const newMemory: Memory = {
        id: crypto.randomUUID(),
        content: response.memoriaNova,
        timestamp: Date.now()
      };
      setMemories(prev => [...prev, newMemory]);
    }

    if (response.acao !== 'conversar') {
      setTimeout(() => setCurrentAction('conversar'), 4000);
    }
  }, []);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMessage: Message = { role: "user", content: text, timestamp: Date.now() };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    const response = await getCharacterResponse(text, status, memories, [...messages, userMessage]);
    processResponse(response);
    setIsLoading(false);
  };

  const handleAddItem = async (itemName: string) => {
    setItemInHand(itemName);
    setIsLoading(true);
    const context = `O usuário me deu o item: ${itemName}`;
    const response = await getCharacterResponse(context, status, memories, messages);
    processResponse(response);
    setIsLoading(false);
    setTimeout(() => setItemInHand(null), 3000);
  };

  return (
    <div className="min-h-screen bg-[#1a1a2e] p-4 md:p-8 font-pixel transition-all selection:bg-[#3498db] selection:text-white">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-4 border-b-4 border-[#34495e] pb-6">
          <div className="flex items-center gap-5">
            <div className="bg-[#3498db] p-4 rounded-sm border-b-8 border-[#2980b9] shadow-inner">
              <Sparkles className="text-white w-8 h-8 floating" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-retro text-white tracking-widest leading-none">MINIVIDA_IA</h1>
              <div className="flex items-center gap-2 mt-2">
                 <div className={`w-3 h-3 rounded-full animate-pulse ${timeOfDay === 'day' ? 'bg-yellow-400' : 'bg-blue-400'}`} />
                 <p className="text-[10px] font-retro text-gray-400 uppercase tracking-widest">SYSTEM_VERSION: 1.0.4 | MODE: {timeOfDay}</p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-6 items-center bg-black/30 px-6 py-3 rounded-sm border-2 border-white/5">
             <div className="text-center">
                <div className="text-[10px] text-gray-500 font-retro">CORE.MEMORIES</div>
                <div className="text-xl text-yellow-400">{memories.length}</div>
             </div>
             <div className="h-8 w-[2px] bg-white/10" />
             <div className="text-center">
                <div className="text-[10px] text-gray-500 font-retro">USER_AUTH</div>
                <div className="text-xs text-green-400 font-retro uppercase">ONLINE</div>
             </div>
          </div>
        </header>

        {/* Main Layout */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Column */}
          <div className="lg:col-span-8 space-y-8">
            <WorldView currentAction={currentAction} itemInHand={itemInHand} timeOfDay={timeOfDay} />
            
            <section className="bg-[#2c3e50]/40 backdrop-blur-sm rounded-lg p-6 border-4 border-[#34495e] shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-retro text-[10px] text-white/60 tracking-widest">ITEM_DEPOT.EXE</h2>
                <div className="h-[2px] flex-1 mx-4 bg-white/5" />
              </div>
              <ActionButtons onAddItem={handleAddItem} isLoading={isLoading} />
            </section>

            <div className="lg:hidden">
              <StatusPanel status={status} />
            </div>

            <ChatPanel 
              messages={messages} 
              onSendMessage={handleSendMessage} 
              isLoading={isLoading} 
            />
          </div>

          {/* Side Column */}
          <div className="hidden lg:flex flex-col lg:col-span-4 sticky top-8 space-y-8">
            <StatusPanel status={status} />
            
            <div className="bg-[#3498db]/10 p-6 rounded-lg border-2 border-[#3498db]/30 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-2 opacity-5">
                <Sparkles size={100} />
              </div>
              <h4 className="text-[#3498db] font-retro text-[12px] mb-6 flex items-center gap-3">
                <div className="w-2 h-2 bg-[#3498db] animate-ping" />
                GUIDE.TXT
              </h4>
              <ul className="text-sm text-gray-300 space-y-4 font-pixel leading-tight">
                <li className="flex gap-3">
                  <span className="text-[#3498db] mt-1">▶</span>
                  <span>ENVIE ITENS PARA MANTER O MINI SAUDÁVEL.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[#3498db] mt-1">▶</span>
                  <span>EXPLIQUE COISAS NOVAS PARA AUMENTAR O CONHECIMENTO.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-[#3498db] mt-1">▶</span>
                  <span>O MINI REAGE EM TEMPO REAL ÀS SUAS AÇÕES.</span>
                </li>
              </ul>
            </div>

            {memories.length > 0 && (
              <div className="p-6 bg-black/20 rounded-lg border-2 border-white/5">
                <h4 className="text-[10px] font-retro text-gray-500 uppercase mb-4">LATEST_MEMORY.LOG</h4>
                <div className="bg-[#1a1a2e] p-4 rounded border-l-4 border-yellow-400">
                   <p className="text-sm text-gray-400 font-pixel leading-relaxed">"{memories[memories.length - 1].content}"</p>
                </div>
              </div>
            )}
          </div>
        </main>

        <footer className="mt-12 py-8 text-center border-t-2 border-white/5 flex flex-col items-center gap-6">
          <div className="flex gap-8 items-center opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
             <div className="w-8 h-8 bg-white/20 rounded-full" />
             <div className="w-12 h-1 bg-white/20" />
             <div className="w-8 h-8 bg-white/20 rounded-full" />
          </div>
          <div className="flex flex-col gap-4">
            <p className="text-gray-500 text-[10px] font-retro tracking-widest uppercase">END_OF_LINE | GENERATED_BY_GEMINI_AI</p>
            <button 
              onClick={() => {
                const confirmed = confirm("DESEJA APAGAR TODOS OS DADOS DO SISTEMA?");
                if (confirmed) {
                  localStorage.clear();
                  window.location.reload();
                }
              }}
              className="text-red-400/60 hover:text-red-400 transition-colors uppercase text-[10px] font-retro tracking-tighter"
            >
              [ PURGE_SYSTEM_DATA ]
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

