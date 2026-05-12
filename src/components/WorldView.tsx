import { motion, AnimatePresence } from "motion/react";
import { BrainEmotion, BrainIntent } from "../brain/brainTypes";
import { Coffee, Apple, Bed, ToyBrick, Book, Droplets, Sun, Moon, Zap, Heart } from "lucide-react";

interface WorldViewProps {
  currentAction: BrainIntent | 'idle';
  itemInHand: string | null;
  timeOfDay: 'day' | 'night';
  emotion: BrainEmotion;
}

export default function WorldView({ currentAction, itemInHand, timeOfDay, emotion }: WorldViewProps) {
  const isNight = timeOfDay === 'night';

  const getActionIcon = () => {
    switch (currentAction) {
      case 'eat': return <Apple className="w-10 h-10 text-red-500 pixelated floating" />;
      case 'drink': return <Droplets className="w-10 h-10 text-blue-400 pixelated floating" />;
      case 'sleep': return <div className="text-white text-2xl animate-bounce font-retro">Zzz...</div>;
      case 'play': return <ToyBrick className="w-10 h-10 text-yellow-400 pixelated animate-spin" />;
      case 'study': return <Book className="w-10 h-10 text-indigo-400 pixelated animate-pulse" />;
      default: return null;
    }
  };

  const getEmotionDetails = () => {
    switch (emotion) {
      case 'happy': return { color: '#ffcc33', particle: <Heart className="text-pink-400 w-4 h-4 animate-ping" /> };
      case 'sad': return { color: '#a29bfe', particle: <div className="w-1 h-2 bg-blue-300 rounded-full animate-bounce" /> };
      case 'hungry': return { color: '#fab1a0' };
      case 'tired': return { color: '#dfe6e9' };
      case 'excited': return { color: '#fdcb6e', glow: 'shadow-[0_0_20px_rgba(253,203,110,0.5)]' };
      case 'confused': return { color: '#ffeaa7' };
      default: return { color: '#ffcc33' };
    }
  };

  const details = getEmotionDetails();

  return (
    <div 
      className={`relative w-full h-[400px] rounded-xl overflow-hidden shadow-2xl border-8 border-[#3a2e39] transition-colors duration-[5000ms] ${
        isNight ? 'bg-[#0f0f1b]' : 'bg-[#5da2d5]'
      }`}
    >
      {/* Background Decor */}
      <div className={`absolute top-10 right-10 transition-all duration-[3000ms] ${isNight ? 'opacity-100' : 'opacity-0'}`}>
        <Moon className="text-yellow-100 w-16 h-16 fill-yellow-100/20" />
      </div>
      <div className={`absolute top-10 right-10 transition-all duration-[3000ms] ${isNight ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}`}>
        <Sun className="text-yellow-400 w-20 h-20 fill-yellow-400/20" />
      </div>

      {/* Floating clouds/particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div
            key={i}
            animate={{ x: [ -200, 1000 ] }}
            transition={{ duration: 20 + i * 5, repeat: Infinity, ease: "linear" }}
            className="absolute top-20 opacity-20"
            style={{ top: `${15 + i * 10}%` }}
          >
            <div className="w-32 h-8 bg-white rounded-full blur-xl" />
          </motion.div>
        ))}
      </div>

      {/* Ground */}
      <div className={`absolute bottom-0 w-full h-32 transition-colors duration-[5000ms] ${isNight ? 'bg-[#142e1d]' : 'bg-[#3d8c40]'}`}>
        <div className="absolute top-0 w-full h-2 bg-black/10" />
        
        {/* Animated Grass */}
        {Array.from({ length: 20 }).map((_, i) => (
          <div 
            key={i} 
            className="absolute bottom-28 grass"
            style={{ 
              left: `${i * 5}%`, 
              color: isNight ? '#0a1d12' : '#235e25',
              animationDelay: `${i * 0.1}s`
            }}
          >
            <div className="w-1.5 h-4 bg-current" />
          </div>
        ))}
      </div>
      
      {/* Mini Character */}
      <motion.div
        animate={{
          y: currentAction === 'sleep' ? 60 : [0, -8, 0],
          rotate: emotion === 'excited' ? [-2, 2, -2] : 0,
        }}
        transition={{
          y: { repeat: Infinity, duration: 1.2, ease: "easeInOut" },
          rotate: { repeat: Infinity, duration: 0.5 }
        }}
        className="absolute bottom-32 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center"
      >
        <div className="relative group">
          <AnimatePresence>
            {currentAction !== 'chat' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute -top-16 left-1/2 -translate-x-1/2"
              >
                {getActionIcon()}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Body */}
          <div 
            className={`w-20 h-24 border-b-8 border-black/20 rounded-md relative transition-all duration-700 shadow-xl ${details.glow || ''}`}
            style={{ backgroundColor: details.color || '#ffcc33' }}
          >
            <div className="absolute top-2 left-2 w-4 h-4 bg-white/20" />
            
            {/* Eyes based on emotion */}
            <div className="flex justify-around mt-8 px-4">
              <div className="space-y-1">
                {emotion === 'tired' || currentAction === 'sleep' ? (
                  <div className="w-5 h-1 bg-[#3a2e39]" />
                ) : emotion === 'sad' ? (
                  <div className="w-5 h-1 bg-[#3a2e39] opacity-80" />
                ) : (
                  <div className="w-5 h-5 bg-[#3a2e39] rounded-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-2 h-2 bg-white" />
                  </div>
                )}
              </div>
              <div className="space-y-1">
                {emotion === 'tired' || currentAction === 'sleep' ? (
                  <div className="w-5 h-1 bg-[#3a2e39]" />
                ) : emotion === 'sad' ? (
                  <div className="w-5 h-1 bg-[#3a2e39] opacity-80" />
                ) : (
                  <div className="w-5 h-5 bg-[#3a2e39] rounded-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-2 h-2 bg-white" />
                  </div>
                )}
              </div>
            </div>

            {/* Mouth */}
            <motion.div 
              animate={{ height: emotion === 'excited' ? 8 : 2 }}
              className={`mx-auto mt-4 w-6 bg-[#3a2e39] rounded-full`}
            />

            {/* Blush */}
            {(emotion === 'happy' || emotion === 'excited') && (
              <div className="flex justify-between px-2 mt-2">
                <div className="w-3 h-2 bg-pink-400 opacity-40 rounded-full" />
                <div className="w-3 h-2 bg-pink-400 opacity-40 rounded-full" />
              </div>
            )}
          </div>
          
          {/* Particles */}
          <AnimatePresence>
            {details.particle && (
              <motion.div 
                initial={{ opacity: 0, y: 0 }}
                animate={{ opacity: 1, y: -40 }}
                exit={{ opacity: 0 }}
                className="absolute -right-4 top-0"
              >
                {details.particle}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="mt-4 font-retro text-[10px] tracking-widest text-white bg-[#3a2e39] px-4 py-2 border-2 border-white/20 shadow-lg">
          {emotion.toUpperCase()}
        </div>
      </motion.div>

      {/* Item Display */}
      <AnimatePresence>
        {itemInHand && (
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0 }}
            className="absolute right-20 bottom-40 z-30"
          >
            <div className="bg-white p-4 border-4 border-[#3a2e39] shadow-[10px_10px_0px_0px_rgba(0,0,0,0.2)]">
               <span className="text-[12px] font-retro text-[#3a2e39] flex items-center gap-2">
                 {itemInHand.toUpperCase()}
               </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Night Overlay */}
      <div className={`absolute inset-0 pointer-events-none transition-colors duration-[5000ms] ${
        isNight ? 'bg-indigo-900/40 mix-blend-multiply' : 'bg-transparent'
      }`} />
    </div>
  );
}

