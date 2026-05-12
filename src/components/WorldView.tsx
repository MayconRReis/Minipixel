import { motion } from "motion/react";
import { ActionType } from "../types";
import { Coffee, Apple, Bed, ToyBrick, Book, Droplets, Sun, Moon } from "lucide-react";

interface WorldViewProps {
  currentAction: ActionType;
  itemInHand: string | null;
  timeOfDay: 'day' | 'night';
}

export default function WorldView({ currentAction, itemInHand, timeOfDay }: WorldViewProps) {
  const isNight = timeOfDay === 'night';

  const getActionIcon = () => {
    switch (currentAction) {
      case 'comer': return <Apple className="w-8 h-8 text-red-500 pixelated floating" />;
      case 'beber': return <Droplets className="w-8 h-8 text-blue-400 pixelated floating" />;
      case 'dormir': return <div className="text-white text-xl animate-bounce font-retro">Zzz...</div>;
      case 'brincar': return <ToyBrick className="w-8 h-8 text-yellow-400 pixelated animate-spin" />;
      case 'estudar': return <Book className="w-8 h-8 text-indigo-400 pixelated animate-pulse" />;
      default: return null;
    }
  };

  return (
    <div 
      className={`relative w-full h-80 rounded-xl overflow-hidden shadow-2xl border-4 border-[#3a2e39] transition-colors duration-[5000ms] ${
        isNight ? 'bg-[#1a1a2e]' : 'bg-[#7eb6e0]'
      }`}
    >
      {/* Background Decor */}
      <div className={`absolute top-10 right-10 transition-all duration-[3000ms] ${isNight ? 'opacity-100' : 'opacity-0'}`}>
        <Moon className="text-yellow-100 w-12 h-12 fill-yellow-100/20" />
      </div>
      <div className={`absolute top-10 right-10 transition-all duration-[3000ms] ${isNight ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}`}>
        <Sun className="text-yellow-400 w-16 h-16 fill-yellow-400/20" />
      </div>

      {/* Ground */}
      <div className={`absolute bottom-0 w-full h-24 transition-colors duration-[5000ms] ${isNight ? 'bg-[#1e4a2e]' : 'bg-[#4da64d]'}`}>
        <div className="absolute top-0 w-full h-1 bg-black/10" />
        
        {/* Grass elements */}
        {Array.from({ length: 12 }).map((_, i) => (
          <div 
            key={i} 
            className="absolute bottom-20 grass"
            style={{ 
              left: `${i * 10}%`, 
              color: isNight ? '#0d2b1a' : '#2e7d32',
              animationDelay: `${i * 0.2}s`
            }}
          >
            <div className="w-1 h-3 bg-current" />
            <div className="w-1 h-2 bg-current -ml-1 mt-1 transform rotate-45" />
          </div>
        ))}
      </div>
      
      {/* Character */}
      <motion.div
        animate={{
          y: currentAction === 'dormir' ? 40 : [0, -5, 0],
          x: currentAction === 'brincar' ? [-10, 10, -10] : 0
        }}
        transition={{
          y: { repeat: Infinity, duration: 1.5, ease: "easeInOut" },
          x: { repeat: currentAction === 'brincar' ? Infinity : 0, duration: 0.8 }
        }}
        className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center"
      >
        {/* Pixel Sprite Representing Mini */}
        <div className="relative group">
          {/* Action indicator above head */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2">
            {getActionIcon()}
          </div>

          {/* Body Boxy/Pixel Style */}
          <div className={`w-14 h-16 border-b-4 border-black/20 rounded-sm relative transition-colors duration-500 ${
            currentAction === 'dormir' ? 'bg-indigo-300' : 'bg-[#ffcc33]'
          }`}>
            {/* Texture details */}
            <div className="absolute top-1 left-1 w-2 h-2 bg-white/30" />
            
            {/* Eyes */}
            <div className="flex justify-around mt-4 px-2">
              {currentAction === 'dormir' ? (
                <>
                  <div className="w-3 h-1 bg-[#3a2e39]" />
                  <div className="w-3 h-1 bg-[#3a2e39]" />
                </>
              ) : (
                <>
                  <div className="w-3 h-3 bg-[#3a2e39] rounded-sm relative">
                    <div className="absolute top-0 left-0 w-1 h-1 bg-white" />
                  </div>
                  <div className="w-3 h-3 bg-[#3a2e39] rounded-sm relative">
                    <div className="absolute top-0 left-0 w-1 h-1 bg-white" />
                  </div>
                </>
              )}
            </div>

            {/* Mouth */}
            <div className={`mx-auto mt-2 h-1 bg-[#3a2e39] transition-all ${
              currentAction === 'comer' ? 'w-4 h-2' : 'w-2'
            }`} />

            {/* Blush */}
            {(currentAction === 'brincar' || currentAction === 'comer') && (
              <div className="flex justify-between px-1 mt-1">
                <div className="w-2 h-1 bg-pink-400 opacity-50" />
                <div className="w-2 h-1 bg-pink-400 opacity-50" />
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-2 font-retro text-[8px] tracking-widest text-[#3a2e39] bg-white/80 px-2 py-1 rounded-sm border-2 border-[#3a2e39]">
          MINI
        </div>
      </motion.div>

      {/* Item Display in World */}
      {itemInHand && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute right-1/4 bottom-24 z-10"
        >
          <div className="bg-white/90 p-2 border-2 border-[#3a2e39] rounded shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">
             <span className="text-[10px] font-retro text-[#3a2e39]">{itemInHand.toUpperCase()}</span>
          </div>
        </motion.div>
      )}

      {/* Overlay for Night */}
      <div className={`absolute inset-0 pointer-events-none transition-colors duration-[5000ms] ${
        isNight ? 'bg-blue-900/40 mix-blend-multiply' : 'bg-transparent'
      }`} />
    </div>
  );
}
