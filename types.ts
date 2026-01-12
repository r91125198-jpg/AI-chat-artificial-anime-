
export enum Role {
  USER = 'user',
  MODEL = 'model',
  SYSTEM = 'system'
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface MessagePart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}

export interface Message {
  id: string;
  role: Role;
  content: MessagePart[];
  timestamp: number;
  isStreaming?: boolean;
  sources?: GroundingSource[];
  audioData?: string; // Base64 PCM data
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  model: string;
}

export type GeminiModel = 
  | 'gemini-3-flash-preview' 
  | 'gemini-3-pro-preview' 
  | 'gemini-2.5-flash-native-audio-preview-12-2025'
  | 'gemini-2.5-flash-preview-tts';
