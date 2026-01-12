
import React, { useState } from 'react';
import { Role, Message } from '../types';
import { User, Sparkles, Volume2, VolumeX, Search, Copy, Check } from 'lucide-react';
import { audioPlayer } from '../audio';
import { gemini } from '../services/geminiService';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isModel = message.role === Role.MODEL;
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [localAudioData, setLocalAudioData] = useState<string | undefined>(message.audioData);

  const handleSpeak = async () => {
    if (isSpeaking) {
      audioPlayer.stop();
      setIsSpeaking(false);
      return;
    }

    let pcm = localAudioData;
    const textContent = message.content.find(p => p.text)?.text;
    
    if (!pcm && textContent) {
      setIsSpeaking(true);
      const generated = await gemini.generateSpeech(textContent);
      if (generated) {
        pcm = generated;
        setLocalAudioData(generated);
      }
    }

    if (pcm) {
      setIsSpeaking(true);
      audioPlayer.play(pcm);
    }
  };

  const handleCopy = () => {
    const textToCopy = message.content.map(p => p.text).filter(Boolean).join('\n');
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={`flex w-full mb-6 group ${isModel ? 'justify-start' : 'justify-end animate-in slide-in-from-right-2'}`}>
      <div className={`flex max-w-[90%] md:max-w-[80%] gap-3 ${isModel ? 'flex-row' : 'flex-row-reverse'}`}>
        
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isModel 
            ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.1)]' 
            : 'bg-slate-800 text-slate-400 border border-slate-700'
        }`}>
          {isModel ? <Sparkles size={16} /> : <User size={16} />}
        </div>

        <div className={`flex flex-col gap-1 ${isModel ? 'items-start' : 'items-end'}`}>
          <div className={`relative overflow-hidden ${
            isModel 
              ? 'glass text-slate-200 rounded-2xl rounded-tl-none border-slate-800 p-4' 
              : 'bg-blue-600 text-white rounded-2xl rounded-tr-none border-blue-500 shadow-lg px-4 py-2.5'
          }`}>
            {message.content.map((part, idx) => (
              <div key={idx} className="space-y-3">
                {part.inlineData && (
                  <div className={`mb-2 rounded-xl overflow-hidden border ${isModel ? 'border-slate-800' : 'border-blue-400/30'}`}>
                    <img 
                      src={`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`} 
                      alt="Content" 
                      className="max-h-96 w-full object-cover rounded-lg"
                    />
                    {!isModel && part.text && (
                       <div className="bg-blue-700/50 p-2 text-xs font-medium text-center border-t border-blue-400/20">
                         {part.text}
                       </div>
                    )}
                  </div>
                )}
                {part.text && (!part.inlineData || isModel) && (
                  <div className="whitespace-pre-wrap text-[15px] leading-relaxed">
                    {part.text.split('**').map((chunk, i) => (
                      i % 2 === 1 ? <strong key={i} className="text-white font-bold">{chunk}</strong> : chunk
                    ))}
                    {message.isStreaming && <span className="inline-block w-1.5 h-4 ml-1 bg-blue-400 animate-pulse align-middle" />}
                  </div>
                )}
              </div>
            ))}
          </div>

          {message.sources && message.sources.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2 px-1">
              {message.sources.map((source, idx) => (
                <a 
                  key={idx} 
                  href={source.uri} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-2 py-1 glass text-[11px] text-blue-400 hover:bg-blue-500/10 rounded-md border border-slate-800 transition-all"
                >
                  <Search size={10} />
                  <span className="truncate max-w-[120px]">{source.title}</span>
                </a>
              ))}
            </div>
          )}

          <div className={`flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isModel ? 'ml-1' : 'mr-1 flex-row-reverse'}`}>
            <span className="text-[10px] text-slate-600 font-medium">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            
            <div className="flex items-center gap-1">
              <button 
                onClick={handleCopy}
                className={`p-1.5 rounded-md transition-all ${copied ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'}`}
                title="Copy to clipboard"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>

              {isModel && (
                <button 
                  onClick={handleSpeak}
                  className={`p-1.5 rounded-md transition-all ${isSpeaking ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'}`}
                  title="Speak message"
                >
                  {isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
