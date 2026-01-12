
import React from 'react';
import { X, Sliders, Search, Volume2, Shield, Zap, Info, User, Globe, Calendar } from 'lucide-react';
import { GeminiModel } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  model: GeminiModel;
  setModel: (model: GeminiModel) => void;
  useSearch: boolean;
  setUseSearch: (val: boolean) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, onClose, model, setModel, useSearch, setUseSearch 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-md glass rounded-3xl border-slate-800 shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/40">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sliders size={20} className="text-blue-500" /> Settings
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* Model Selection */}
          <section>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
              <Zap size={14} /> AI Model
            </div>
            <div className="grid grid-cols-1 gap-2">
              {[
                { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash', desc: 'Fastest for everyday tasks' },
                { id: 'gemini-3-pro-preview', name: 'Gemini 3 Pro', desc: 'Superior reasoning & complex code' },
                { id: 'gemini-2.5-flash-native-audio-preview-12-2025', name: 'Gemini 2.5 Audio', desc: 'Native audio processing' }
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setModel(m.id as GeminiModel)}
                  className={`flex flex-col text-left p-4 rounded-2xl border transition-all ${
                    model === m.id 
                      ? 'bg-blue-600/10 border-blue-500/50 text-white' 
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="font-bold text-sm">{m.name}</span>
                  <span className="text-[11px] opacity-70">{m.desc}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Capabilities */}
          <section>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
              <Shield size={14} /> Intelligence Features
            </div>
            <div className="space-y-2">
              <button 
                onClick={() => setUseSearch(!useSearch)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                  useSearch 
                    ? 'bg-blue-600/10 border-blue-500/50 text-white' 
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${useSearch ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-600'}`}>
                    <Search size={16} />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm">Google Search Grounding</span>
                    <span className="text-[11px] opacity-70">Real-time web access for queries</span>
                  </div>
                </div>
                <div className={`w-10 h-6 rounded-full relative transition-colors ${useSearch ? 'bg-blue-600' : 'bg-slate-700'}`}>
                  <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${useSearch ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
              </button>
            </div>
          </section>

          {/* App Info Section */}
          <section className="bg-slate-900/50 rounded-2xl border border-slate-800 p-5 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">
              <Info size={14} /> App Information
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 flex items-center gap-2"><User size={14} /> Creator</span>
                <span className="text-slate-200 font-semibold">NST RAFI 😎</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 flex items-center gap-2"><Zap size={14} /> Founder</span>
                <span className="text-slate-200 font-semibold">kiyotaka Ayanako ji 🧠</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 flex items-center gap-2"><Globe size={14} /> Origin</span>
                <span className="text-slate-200 font-semibold text-right">Median Japan in Bangladesh 🎌</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 flex items-center gap-2"><Calendar size={14} /> Develop Date</span>
                <span className="text-slate-200 font-semibold">12/01/2026 💯</span>
              </div>
            </div>
          </section>

          <div className="pt-4 flex items-center justify-between text-[10px] text-slate-600 font-bold uppercase tracking-widest">
            <span>AI chat artificial anime v2.0.0</span>
            <button className="hover:text-blue-500 transition-colors">System Clear</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;