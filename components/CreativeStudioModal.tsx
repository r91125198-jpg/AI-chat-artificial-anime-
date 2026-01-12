
import React, { useState, useRef } from 'react';
import { X, Sparkles, Image as ImageIcon, Layout, Box, Download, RefreshCw, Wand2 } from 'lucide-react';

interface CreativeStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Prop updated to match handleGenerateImage signature: (text, image, aspectRatio)
  onGenerate: (prompt: string, image?: { data: string, mimeType: string }, aspectRatio?: any) => void;
  isGenerating: boolean;
  initialPrompt?: string;
  initialImage?: { data: string; mimeType: string };
}

const CreativeStudioModal: React.FC<CreativeStudioModalProps> = ({ 
  isOpen, 
  onClose, 
  onGenerate, 
  isGenerating, 
  initialPrompt = '', 
  initialImage 
}) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "16:9" | "9:16" | "4:3" | "3:4">("1:1");
  const [selectedImage, setSelectedImage] = useState<{ url: string; data: string; mimeType: string } | null>(
    initialImage ? { 
      url: `data:${initialImage.mimeType};base64,${initialImage.data}`, 
      data: initialImage.data, 
      mimeType: initialImage.mimeType 
    } : null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleAction = () => {
    if (prompt || selectedImage) {
      // Fix: Ensure correct argument order matching App.tsx handleGenerateImage
      onGenerate(prompt, selectedImage ? { data: selectedImage.data, mimeType: selectedImage.mimeType } : undefined, aspectRatio);
      onClose();
    }
  };

  const aspectRatios = [
    { label: 'Square', value: '1:1', icon: <Box size={14} /> },
    { label: 'Cinematic', value: '16:9', icon: <div className="w-4 h-2.5 border border-current rounded-sm" /> },
    { label: 'Portrait', value: '9:16', icon: <div className="w-2.5 h-4 border border-current rounded-sm" /> },
    { label: 'Photo', value: '4:3', icon: <div className="w-4 h-3 border border-current rounded-sm" /> }
  ];

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" onClick={onClose} />
      <div className="relative w-full max-w-2xl glass rounded-[2.5rem] border-slate-800 shadow-[0_0_50px_rgba(59,130,246,0.15)] overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-gradient-to-r from-blue-600/5 to-purple-600/5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Sparkles className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Creative Studio</h2>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">AI Image Generation System</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 text-slate-500 hover:text-white hover:bg-slate-800 rounded-2xl transition-all">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 space-y-8">
          {/* Prompt Input */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
              <Wand2 size={14} className="text-purple-400" /> Prompt your vision
            </label>
            <div className="relative group">
              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe what you want to create in vivid detail..."
                rows={4}
                className="w-full bg-slate-900/50 border border-slate-800 rounded-3xl p-5 text-white outline-none focus:ring-2 focus:ring-blue-500/30 transition-all resize-none placeholder-slate-700"
              />
              <div className="absolute top-4 right-4 text-[10px] font-bold text-slate-700 uppercase tracking-widest">
                Gemini 2.5 Flash
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Aspect Ratio */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Layout size={14} className="text-blue-400" /> Frame Shape
              </label>
              <div className="grid grid-cols-2 gap-2">
                {aspectRatios.map((ratio) => (
                  <button
                    key={ratio.value}
                    onClick={() => setAspectRatio(ratio.value as any)}
                    className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                      aspectRatio === ratio.value 
                        ? 'bg-blue-600/10 border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)]' 
                        : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'
                    }`}
                  >
                    {ratio.icon}
                    <span className="text-xs font-bold uppercase tracking-wide">{ratio.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Reference Image */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <ImageIcon size={14} className="text-emerald-400" /> Reference Source
              </label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`h-[94px] border-2 border-dashed rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden ${
                  selectedImage ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-slate-800 hover:border-slate-700 bg-slate-900/30'
                }`}
              >
                {selectedImage ? (
                  <div className="relative w-full h-full">
                    <img src={selectedImage.url} alt="Reference" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <RefreshCw size={24} className="text-white" />
                    </div>
                  </div>
                ) : (
                  <>
                    <ImageIcon size={20} className="text-slate-600 mb-1" />
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Add Base Image</span>
                  </>
                )}
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            </div>
          </div>

          <div className="pt-4">
            <button 
              onClick={handleAction}
              disabled={isGenerating || (!prompt && !selectedImage)}
              className="w-full flex items-center justify-center gap-3 py-5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-[2rem] font-black uppercase tracking-[0.15em] transition-all shadow-xl shadow-blue-500/20 active:scale-95 disabled:opacity-50 disabled:grayscale"
            >
              {isGenerating ? <RefreshCw className="animate-spin" /> : <Sparkles />}
              Generate Masterpiece
            </button>
          </div>
        </div>

        {/* Footer Ad/Info */}
        <div className="px-8 py-4 bg-slate-900/50 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">System Online</span>
          </div>
          <div className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">
            High Fidelity Visual Generation Suite
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreativeStudioModal;
