export type BrainEmotion = 
  | 'curious' | 'happy' | 'sad' | 'tired' 
  | 'hungry' | 'thirsty' | 'confused' 
  | 'scared' | 'excited' | 'neutral';

export type BrainIntent = 
  | 'chat' | 'ask' | 'eat' | 'drink' 
  | 'sleep' | 'play' | 'study' | 'remember' 
  | 'explore' | 'idle';

export interface BrainStatus {
  hunger: number;
  thirst: number;
  energy: number;
  mood: number;
  core: number;
}

export interface BrainMemory {
  type: 'learning' | 'preference' | 'event' | 'relationship';
  content: string | null;
  importance: number;
}

export interface BrainResponse {
  speech: string;
  thought: string;
  emotion: BrainEmotion;
  intent: BrainIntent;
  statusDelta: {
    hunger: number;
    thirst: number;
    energy: number;
    mood: number;
    core: number;
  };
  memoryToSave: BrainMemory | null;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}
