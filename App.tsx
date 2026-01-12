
import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message, Role, ChatSession, GeminiModel } from './types';
import { gemini } from './services/geminiService';
import ChatInput from './components/ChatInput';
import MessageBubble from './components/MessageBubble';
import AuthModal from './components/AuthModal';
import SettingsModal from './components/SettingsModal';
import ProfileModal from './components/ProfileModal';
import CreativeStudioModal from './components/CreativeStudioModal';
import { MessageSquare, Plus, Settings, History, Menu, X, Sparkles, Search, User as UserIcon, Edit3, Image as ImageIcon, Wand2, ArrowRight } from 'lucide-react';

interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
}

const App: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [model, setModel] = useState<GeminiModel>('gemini-3-flash-preview');
  const [useSearch, setUseSearch] = useState(false);
  
  // Modal states
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  
  const [studioPrompt, setStudioPrompt] = useState('');
  const [studioImage, setStudioImage] = useState<{ mimeType: string, data: string } | undefined>(undefined);
  const [user, setUser] = useState<UserProfile | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedSessions = localStorage.getItem('gemini_nexus_sessions');
    if (savedSessions) {
      const parsed = JSON.parse(savedSessions);
      setSessions(parsed);
      if (parsed.length > 0) setCurrentSessionId(parsed[0].id);
    } else {
      createNewSession();
    }
    const savedUser = localStorage.getItem('nexus_user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [sessions, currentSessionId, isTyping]);

  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('gemini_nexus_sessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  const handleLogin = (provider: 'google' | 'facebook' | 'manual', data?: any) => {
    let loggedUser: UserProfile;
    if (provider === 'manual') {
      loggedUser = { name: data.name, email: data.email, avatar: undefined };
    } else {
      loggedUser = {
        name: provider === 'google' ? 'Google User' : 'Facebook User',
        email: `${provider}@example.com`,
        avatar: provider === 'google' ? 'https://lh3.googleusercontent.com/a/ACg8ocL_...' : undefined
      };
    }
    setUser(loggedUser);
    localStorage.setItem('nexus_user', JSON.stringify(loggedUser));
    setIsAuthOpen(false);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('nexus_user');
    setIsAuthOpen(false);
  };

  const handleSaveProfile = (updatedUser: UserProfile) => {
    setUser(updatedUser);
    localStorage.setItem('nexus_user', JSON.stringify(updatedUser));
  };

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: uuidv4(),
      title: 'New Conversation',
      messages: [],
      createdAt: Date.now(),
      model: model,
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setIsSidebarOpen(false);
  };

  const handleGenerateImage = async (text: string, image?: { mimeType: string, data: string }, aspectRatio: any = "1:1") => {
    if (!currentSessionId) return;

    const userMessage: Message = {
      id: uuidv4(),
      role: Role.USER,
      content: [
        ...(image ? [{ inlineData: image }] : []),
        { text: `AI Generate (${aspectRatio}): ${text || (image ? "Refine this image" : "Creative masterpiece")}` }
      ],
      timestamp: Date.now()
    };

    setSessions(prev => prev.map(s => {
      if (s.id === currentSessionId) {
        return { ...s, messages: [...s.messages, userMessage], title: s.messages.length === 0 ? 'AI Studio' : s.title };
      }
      return s;
    }));

    setIsTyping(true);
    const modelMessageId = uuidv4();
    const modelMessage: Message = {
      id: modelMessageId,
      role: Role.MODEL,
      content: [{ text: 'Architecting your visual imagination...' }],
      timestamp: Date.now(),
      isStreaming: true
    };

    setSessions(prev => prev.map(s => {
      if (s.id === currentSessionId) {
        return { ...s, messages: [...s.messages, modelMessage] };
      }
      return s;
    }));

    try {
      const generatedImage = await gemini.generateImage(text || "creative high resolution design", image, aspectRatio);
      if (generatedImage) {
        setSessions(prev => prev.map(s => {
          if (s.id === currentSessionId) {
            return {
              ...s,
              messages: s.messages.map(m => 
                m.id === modelMessageId 
                  ? { ...m, content: [{ text: `Generated in ${aspectRatio} ratio.`, inlineData: generatedImage }], isStreaming: false } 
                  : m
              )
            };
          }
          return s;
        }));
      }
    } catch (error) {
      console.error("Generation error:", error);
      setSessions(prev => prev.map(s => {
        if (s.id === currentSessionId) {
          return {
            ...s,
            messages: s.messages.map(m => 
              m.id === modelMessageId ? { ...m, content: [{ text: "Generation failed." }], isStreaming: false } : m
            )
          };
        }
        return s;
      }));
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = async (text: string, image?: { mimeType: string, data: string }) => {
    if (!currentSessionId) return;

    const isExplicitGen = text.toLowerCase().startsWith('generate') || (text.toLowerCase().includes('create') && text.toLowerCase().includes('image'));
    if (isExplicitGen) {
      return handleGenerateImage(text.replace('generate', '').trim(), image);
    }

    const userMessage: Message = {
      id: uuidv4(),
      role: Role.USER,
      content: [
        ...(image ? [{ inlineData: image }] : []),
        ...(text ? [{ text }] : [])
      ],
      timestamp: Date.now()
    };

    setSessions(prev => prev.map(s => {
      if (s.id === currentSessionId) {
        return { ...s, messages: [...s.messages, userMessage], title: s.messages.length === 0 ? text.slice(0, 30) || 'Image Query' : s.title };
      }
      return s;
    }));

    setIsTyping(true);
    const modelMessageId = uuidv4();
    const modelMessage: Message = {
      id: modelMessageId,
      role: Role.MODEL,
      content: [{ text: '' }],
      timestamp: Date.now(),
      isStreaming: true
    };

    setSessions(prev => prev.map(s => {
      if (s.id === currentSessionId) {
        return { ...s, messages: [...s.messages, modelMessage] };
      }
      return s;
    }));

    try {
      const session = sessions.find(s => s.id === currentSessionId);
      const history = [...(session?.messages || []), userMessage];
      let fullResponseText = '';
      let groundingSources: any[] = [];

      const stream = gemini.streamChat(model, history, "You are AI chat artificial anime, founded by kiyotaka Ayanako ji 🧠 and created by NST RAFI 😎.", useSearch);

      for await (const chunk of stream) {
        fullResponseText += chunk.text || '';
        const chunks = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (chunks) {
          groundingSources = chunks.map((c: any) => ({ title: c.web?.title || 'Source', uri: c.web?.uri || '' })).filter((c: any) => c.uri);
        }

        setSessions(prev => prev.map(s => {
          if (s.id === currentSessionId) {
            return {
              ...s,
              messages: s.messages.map(m => 
                m.id === modelMessageId 
                  ? { ...m, content: [{ text: fullResponseText }], sources: groundingSources.length > 0 ? groundingSources : m.sources } 
                  : m
              )
            };
          }
          return s;
        }));
      }

      setSessions(prev => prev.map(s => {
        if (s.id === currentSessionId) {
          return {
            ...s,
            messages: s.messages.map(m => m.id === modelMessageId ? { ...m, isStreaming: false } : m)
          };
        }
        return s;
      }));
    } catch (error) {
      console.error("Chat error:", error);
      setSessions(prev => prev.map(s => {
        if (s.id === currentSessionId) {
          return {
            ...s,
            messages: s.messages.map(m => m.id === modelMessageId ? { ...m, content: [{ text: "Error encountered." }], isStreaming: false } : m)
          };
        }
        return s;
      }));
    } finally {
      setIsTyping(false);
    }
  };

  const currentSession = sessions.find(s => s.id === currentSessionId);

  return (
    <div className="flex h-screen overflow-hidden bg-[#020617] text-slate-100 selection:bg-blue-500/30">
      
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} user={user} onLogin={handleLogin} onLogout={handleLogout} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} model={model} setModel={setModel} useSearch={useSearch} setUseSearch={setUseSearch} />
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} user={user} onSave={handleSaveProfile} />
      <CreativeStudioModal 
        isOpen={isStudioOpen} 
        onClose={() => { setIsStudioOpen(false); setStudioPrompt(''); setStudioImage(undefined); }} 
        onGenerate={handleGenerateImage} 
        isGenerating={isTyping} 
        initialPrompt={studioPrompt}
        initialImage={studioImage}
      />

      <aside className={`fixed inset-y-0 left-0 z-50 w-72 glass border-r border-slate-800 flex flex-col transition-transform duration-300 transform lg:translate-x-0 lg:static lg:inset-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 flex items-center justify-between border-b border-slate-800 bg-[#020617]/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600/10 flex items-center justify-center border-2 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)] overflow-hidden">
               <img src="https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/www/public/og.png" className="w-full h-full object-cover hidden" alt="Logo" />
               <Sparkles className="text-blue-400" size={20} />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-sm tracking-tight leading-none text-white">AI CHAT</span>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">ANIME SYSTEM</span>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-slate-400"><X size={20} /></button>
        </div>

        <div className="p-4">
          <button onClick={createNewSession} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl transition-all font-bold shadow-lg shadow-blue-600/20 active:scale-95">
            <Plus size={18} /> New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 space-y-1 custom-scrollbar">
          <div className="px-2 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <History size={14} /> History
          </div>
          {sessions.map(s => (
            <button
              key={s.id}
              onClick={() => { setCurrentSessionId(s.id); setIsSidebarOpen(false); }}
              className={`w-full text-left px-3 py-2.5 rounded-lg transition-all flex items-center gap-3 ${
                s.id === currentSessionId ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-inner' : 'text-slate-400 hover:bg-slate-900 border border-transparent'
              }`}
            >
              <MessageSquare size={16} />
              <span className="truncate text-sm font-medium">{s.title}</span>
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-slate-800 bg-[#020617]/50 space-y-2">
           <button onClick={() => setIsStudioOpen(true)} className="w-full flex items-center justify-between p-3 rounded-xl bg-purple-600/10 hover:bg-purple-600/20 border border-purple-500/10 transition-all text-sm text-purple-400 font-bold group mb-2">
             <div className="flex items-center gap-3"><Wand2 size={18} /> Creative Studio</div>
           </button>
           <button onClick={() => user ? setIsProfileOpen(true) : setIsAuthOpen(true)} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800/50 transition-all text-left">
             <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden border border-slate-700">
               {user?.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <UserIcon size={16} className="text-slate-400" />}
             </div>
             <div className="flex-1 min-w-0">
               <p className="text-sm font-bold text-slate-200 truncate">{user ? user.name : 'Sign In'}</p>
             </div>
           </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative">
        <header className="h-14 bg-[#020617]/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-4 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-400 lg:hidden"><Menu size={20} /></button>
            <div className="flex flex-col">
              <h2 className="font-semibold text-sm truncate max-w-[200px] leading-tight text-white">{currentSession?.title}</h2>
              <span className="text-[9px] text-blue-400 font-black tracking-widest uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_5px_#3b82f6]"></span> {model.replace('-preview', '')}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsSettingsOpen(true)} className="p-2 text-slate-500 hover:text-slate-200 transition-colors"><Settings size={18} /></button>
            <button onClick={() => user ? setIsProfileOpen(true) : setIsAuthOpen(true)} className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 hover:border-blue-500 transition-all overflow-hidden">
              {user?.avatar ? <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" /> : <UserIcon size={16} className="text-slate-400" />}
            </button>
          </div>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 custom-scrollbar">
          <div className="max-w-4xl mx-auto w-full">
            {currentSession?.messages.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-center p-8 animate-in fade-in duration-700 translate-y-[-5%]">
                  <div className="relative mb-10">
                    {/* Hero Logo Representation */}
                    <div className="absolute inset-0 bg-blue-500/20 blur-[60px] rounded-full" />
                    <div className="relative w-48 h-48 sm:w-64 sm:h-64 rounded-full p-1 bg-gradient-to-tr from-blue-600 via-blue-400 to-white shadow-[0_0_40px_rgba(59,130,246,0.4)] animate-pulse">
                      <div className="w-full h-full rounded-full bg-[#020617] p-4 flex items-center justify-center overflow-hidden border-2 border-white/10">
                        {/* Circle pattern */}
                        <div className="absolute inset-0 opacity-20 pointer-events-none">
                          <svg className="w-full h-full" viewBox="0 0 100 100">
                             <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 2" />
                             <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="0.5" />
                          </svg>
                        </div>
                        <img 
                          src="https://images.unsplash.com/photo-1578632292335-df3abbb0d586?q=80&w=800&auto=format&fit=crop" 
                          className="w-full h-full object-cover rounded-full mix-blend-lighten opacity-80" 
                          alt="AI Avatar" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-12">
                    <h1 className="text-5xl sm:text-7xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white via-blue-200 to-blue-500 italic">
                      AI CHAT
                    </h1>
                    <p className="text-xs sm:text-sm font-black text-white uppercase tracking-[0.4em] opacity-80">
                      ARTIFICIAL INTELLIGENCE
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-center gap-6 max-w-lg mx-auto">
                    <p className="text-slate-500 text-sm leading-relaxed font-medium">
                      Advanced Multimodal Intelligence System.<br/>
                      Founded by <span className="text-blue-400 font-bold">kiyotaka Ayanako ji 🧠</span> • Developed by <span className="text-blue-400 font-bold">NST RAFI 😎</span>
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                       <button onClick={() => setIsStudioOpen(true)} className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 hover:border-blue-500/50 rounded-2xl transition-all group">
                          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-all">
                            <ImageIcon size={20} />
                          </div>
                          <div className="text-left">
                            <p className="text-xs font-black text-white uppercase tracking-widest">Image Studio</p>
                            <p className="text-[10px] text-slate-500">Generate anime-style art</p>
                          </div>
                       </button>
                       <button onClick={() => handleSendMessage("Tell me about the Median Japan project in Bangladesh")} className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 hover:border-blue-500/50 rounded-2xl transition-all group">
                          <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-all">
                            <Search size={20} />
                          </div>
                          <div className="text-left">
                            <p className="text-xs font-black text-white uppercase tracking-widest">Web Grounding</p>
                            <p className="text-[10px] text-slate-500">Live search enabled</p>
                          </div>
                       </button>
                    </div>
                  </div>
               </div>
            ) : (
              currentSession?.messages.map((m) => (
                <MessageBubble key={m.id} message={m} />
              ))
            )}
            {isTyping && !currentSession?.messages.find(m => m.isStreaming) && (
              <div className="flex justify-start mb-6">
                <div className="w-8 h-8 rounded-full bg-blue-600/10 flex items-center justify-center border border-blue-500/20 text-blue-400 mr-3 shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                  <Sparkles size={14} className="animate-pulse" />
                </div>
                <div className="glass px-4 py-2 rounded-2xl rounded-tl-none border-slate-800 flex gap-1 items-center shadow-lg">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 bg-gradient-to-t from-[#020617] via-[#020617] to-transparent">
          <ChatInput onSendMessage={handleSendMessage} onGenerateImage={(p, img) => { setStudioPrompt(p); setStudioImage(img); setIsStudioOpen(true); }} disabled={isTyping} />
        </div>
      </main>
    </div>
  );
};

export default App;
