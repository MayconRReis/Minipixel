import { useState, useRef, useEffect, FormEvent } from "react";
import { Message } from "../types";
import { Send, Loader2 } from "lucide-react";

interface ChatPanelProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
}

export default function ChatPanel({ messages, onSendMessage, isLoading }: ChatPanelProps) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput("");
    }
  };

  return (
    <div className="flex flex-col h-[350px] w-full bg-[#2c3e50]/80 backdrop-blur-md rounded-lg border-4 border-[#34495e] shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)] overflow-hidden">
      <div className="bg-[#34495e] px-4 py-2 border-b-2 border-white/10 flex justify-between items-center">
        <span className="text-[10px] font-retro text-white tracking-widest">COM_LOG</span>
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-red-400" />
          <div className="w-2 h-2 bg-yellow-400" />
          <div className="w-2 h-2 bg-green-400" />
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide bg-[#1a1a2e]/50"
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] px-4 py-3 rounded-sm text-[14px] leading-relaxed relative ${
                msg.role === 'user'
                  ? 'bg-[#3498db] text-white border-b-4 border-[#2980b9]'
                  : 'bg-[#ecf0f1] text-[#2c3e50] border-b-4 border-[#bdc3c7]'
              }`}
            >
              <div className="absolute top-0 left-0 w-full h-[1px] bg-white/20" />
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[#95a5a6] px-4 py-3 rounded-sm border-b-4 border-[#7f8c8d] flex items-center gap-2 text-white italic text-[12px]">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>MINI_THINKING...</span>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-3 bg-[#34495e] border-t-2 border-white/10 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="TYPE MESSAGE..."
          className="flex-1 px-4 py-2 bg-black/20 border-2 border-transparent focus:border-[#3498db] rounded-sm text-white text-sm outline-none transition-all font-pixel placeholder:text-white/20 uppercase"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="p-2 bg-[#3498db] text-white rounded-sm hover:bg-[#2980b9] border-b-4 border-[#2980b9] disabled:opacity-50 disabled:cursor-not-allowed transition-all active:translate-y-1 active:border-b-0 cursor-pixel shadow-md"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
