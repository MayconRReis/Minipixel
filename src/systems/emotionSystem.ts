import { MiniStatus, EmotionType } from "./character";

export function calculateEmotion(status: MiniStatus, lastAction?: string): EmotionType {
  if (status.fome > 70) return 'com fome';
  if (status.sede > 70) return 'com sede';
  if (status.energia < 30) return 'cansado';
  if (status.felicidade < 30) return 'triste';
  
  if (lastAction === 'perguntar') return 'curioso';
  if (lastAction === 'estudar') return 'pensativo';
  if (lastAction === 'brincar') return 'animado';
  
  if (status.felicidade > 80 && status.energia > 50) return 'animado';
  if (status.felicidade > 60) return 'feliz';
  
  return 'feliz';
}
