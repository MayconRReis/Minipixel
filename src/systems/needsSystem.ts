import { MiniStatus } from "../types/character";

export const STATUS_DECAY = {
  fome: 0.15,
  sede: 0.2,
  energia: -0.1,
  felicidade: -0.05,
};

export function updateNeeds(current: MiniStatus): MiniStatus {
  return {
    fome: Math.min(100, Math.max(0, current.fome + STATUS_DECAY.fome)),
    sede: Math.min(100, Math.max(0, current.sede + STATUS_DECAY.sede)),
    energia: Math.min(100, Math.max(0, current.energia + STATUS_DECAY.energia)),
    felicidade: Math.min(100, Math.max(0, current.felicidade + STATUS_DECAY.felicidade)),
    conhecimento: current.conhecimento,
  };
}
