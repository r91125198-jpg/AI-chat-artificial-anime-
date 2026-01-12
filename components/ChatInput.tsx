
import React, { useState, useRef, ChangeEvent } from 'react';
import { Send, X, Image as ImageIcon, Sparkles } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (text: string, image?: { mimeType: string, data: string }) => void;
  onGenerateImage: (text: string, image?: { mimeType: string, data: string }) => void;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, onGenerateImage, disabled }) => {
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<{ url: string; data: string; mimeType: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = (event.target?.result as string).split(',')[1];
        setSelectedImage({
          url: URL.createObjectURL(file),
          data: base64,
          mimeType: file.type
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = () => {
    if (input.trim() || selectedImage) {
      onSendMessage(input, selectedImage ? { data: selectedImage.data, mimeType: selectedImage.mimeType } : undefined);
      setInput('');
      setSelectedImage(null);
    }
  };

  const handleGenerate = () => {
    if (input.trim() || selectedImage) {
      onGenerateImage(input, selectedImage ? { data: selectedImage.data, mimeType: selectedImage.mimeType } : undefined);
      setInput('');
      setSelectedImage(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-2">
      <div className="relative glass rounded-2xl border-slate-800 shadow-xl overflow-hidden bg-slate-900/40">
        
        {selectedImage && (
          <div className="px-4 pt-4 flex">
            <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-700 bg-slate-900 shadow-2xl group animate-in zoom-in-95">
              <img src={selectedImage.url} alt="Preview" className="w-full h-full object-cover" />
              <button 
                onClick={() => setSelectedImage(null)}
                className="absolute top-0.5 right-0.5 p-1 bg-black/60 rounded-full hover:bg-red-500 transition-colors"
              >
                <X size={10} className="text-white" />
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center gap-1 p-1">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-3 text-slate-500 hover:text-slate-200 transition-colors"
            disabled={disabled}
            title="Attach image"
          >
            <ImageIcon size={20} />
          </button>
          
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={selectedImage ? "Describe changes to this image..." : "Ask Nexus or describe an image..."}
            className="flex-1 bg-transparent border-none focus:ring-0 text-slate-200 text-sm py-4 placeholder-slate-600"
            disabled={disabled}
          />

          <div className="flex items-center gap-1 pr-1">
            <button
              onClick={handleGenerate}
              disabled={disabled || (!input.trim() && !selectedImage)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all font-bold text-[11px] uppercase tracking-widest ${
                (input.trim() || selectedImage) && !disabled 
                  ? 'bg-purple-600/20 text-purple-400 hover:bg-purple-600/30' 
                  : 'text-slate-700'
              }`}
              title="AI Image Generation"
            >
              <Sparkles size={16} />
              <span className="hidden sm:inline">AI Gen</span>
            </button>

            <button
              onClick={handleSend}
              disabled={disabled || (!input.trim() && !selectedImage)}
              className={`p-2.5 rounded-xl transition-all ${
                (input.trim() || selectedImage) && !disabled 
                  ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30' 
                  : 'text-slate-700'
              }`}
              title="Send Message"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
      
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
      <div className="mt-3 text-center flex items-center justify-center gap-4">
        <span className="text-[9px] text-slate-600 font-bold uppercase tracking-[0.2em]">
          Powered by Gemini 3 Flash & 2.5 Flash Image
        </span>
      </div>
    </div>
  );
};

export default ChatInput;
