import { BrainStatus } from "../brain/brainTypes";
import { Utensils, Droplet, Zap, Heart, Brain } from "lucide-react";

interface StatusPanelProps {
  status: BrainStatus;
}

export default function StatusPanel({ status }: StatusPanelProps) {
  const bars = [
    { label: "HUNGER", value: status.hunger, icon: <Utensils size={14} />, color: "bg-[#e74c3c]" },
    { label: "THIRST", value: status.thirst, icon: <Droplet size={14} />, color: "bg-[#3498db]" },
    { label: "ENERGY", value: status.energy, icon: <Zap size={14} />, color: "bg-[#f1c40f]" },
    { label: "MOOD", value: status.mood, icon: <Heart size={14} />, color: "bg-[#e84393]" },
    { label: "CORE", value: status.core, icon: <Brain size={14} />, color: "bg-[#9b59b6]" },
  ];

  return (
    <div className="bg-[#2c3e50]/90 backdrop-blur-md p-5 rounded-lg border-4 border-[#34495e] shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)] w-full md:w-72">
      <h3 className="text-[10px] font-retro text-white tracking-widest mb-6 border-b-2 border-white/10 pb-2">BRAIN_SYSTEM.DATA</h3>
      <div className="space-y-4">
        {bars.map((bar) => (
          <div key={bar.label} className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-retro text-gray-300">
              <div className="flex items-center gap-2">
                <span className="text-white opacity-80">{bar.icon}</span>
                <span className="uppercase tracking-tighter">{bar.label}</span>
              </div>
              <span className="text-white">{Math.round(bar.value)}%</span>
            </div>
            
            <div className="w-full h-4 bg-black/40 border-2 border-[#34495e] flex items-center p-[2px]">
              <div
                className={`h-full ${bar.color} transition-all duration-700 relative`}
                style={{ width: `${Math.min(100, Math.max(0, bar.value))}%` }}
              >
                <div className="absolute top-0 left-0 w-full h-[1px] bg-white/20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
