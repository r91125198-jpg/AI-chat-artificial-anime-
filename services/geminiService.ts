
import { GoogleGenAI, GenerateContentResponse, Modality } from "@google/genai";
import { Message, Role, GeminiModel } from "../types";

// API key is handled via process.env.API_KEY directly in the constructor

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    // Always use process.env.API_KEY directly for initialization
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async *streamChat(
    modelName: GeminiModel,
    messages: Message[],
    systemInstruction?: string,
    useSearch: boolean = false
  ) {
    const history = messages.map(msg => ({
      role: msg.role === Role.USER ? 'user' : 'model',
      parts: msg.content.map(part => {
        if (part.text) return { text: part.text };
        if (part.inlineData) return { inlineData: part.inlineData };
        return { text: '' };
      })
    }));

    const lastMessage = history.pop();
    if (!lastMessage) return;

    const config: any = {
      systemInstruction,
      temperature: 0.7,
      topP: 0.95,
      topK: 64,
    };

    if (useSearch) {
      config.tools = [{ googleSearch: {} }];
    }

    try {
      const responseStream = await this.ai.models.generateContentStream({
        model: modelName,
        contents: [...history, lastMessage],
        config
      });

      for await (const chunk of responseStream) {
        // Yielding the chunk as response object
        yield chunk as GenerateContentResponse;
      }
    } catch (error) {
      console.error("Gemini stream error:", error);
      throw error;
    }
  }

  async generateImage(
    prompt: string, 
    baseImage?: { data: string, mimeType: string }, 
    aspectRatio: "1:1" | "16:9" | "9:16" | "4:3" | "3:4" = "1:1"
  ) {
    try {
      const parts: any[] = [{ text: prompt }];
      
      if (baseImage) {
        parts.unshift({
          inlineData: {
            data: baseImage.data,
            mimeType: baseImage.mimeType
          }
        });
      }

      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts },
        config: {
          imageConfig: {
            aspectRatio
          }
        }
      });

      // Find the image part from the response
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return {
            data: part.inlineData.data,
            mimeType: part.inlineData.mimeType
          };
        }
      }
    } catch (error) {
      console.error("Image generation error:", error);
      throw error;
    }
    return null;
  }

  async generateSpeech(text: string, voiceName: 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr' = 'Kore'): Promise<string | undefined> {
    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Speak clearly: ${text}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName },
            },
          },
        },
      });

      return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    } catch (error) {
      console.error("Speech generation error:", error);
      return undefined;
    }
  }
}

export const gemini = new GeminiService();
