
import React, { useState } from 'react';
import { X, Chrome, Facebook, LogOut, User, Mail, Lock, UserPlus, ArrowRight } from 'lucide-react';

interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onLogin: (provider: 'google' | 'facebook' | 'manual', data?: any) => void;
  onLogout: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, user, onLogin, onLogout }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin('manual', { email, name: mode === 'register' ? name : email.split('@')[0] });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-sm glass rounded-3xl border-slate-800 shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-[#020617]/50">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            {user ? 'Account' : mode === 'login' ? 'Welcome Back' : 'Join Nexus'}
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {user ? (
            <div className="flex flex-col items-center text-center space-y-6 py-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-blue-600/20 border-2 border-blue-500 flex items-center justify-center overflow-hidden">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <User size={48} className="text-blue-400" />
                  )}
                </div>
                <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-2 border-[#020617] rounded-full" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{user.name}</h3>
                <p className="text-sm text-slate-400">{user.email}</p>
                {user.bio && <p className="text-xs text-slate-500 mt-2 max-w-[200px] line-clamp-2">{user.bio}</p>}
              </div>
              <button 
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all border border-red-500/20 font-semibold"
              >
                <LogOut size={18} /> Sign Out
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex p-1 bg-slate-900 rounded-xl border border-slate-800">
                <button 
                  onClick={() => setMode('login')}
                  className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${mode === 'login' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  Login
                </button>
                <button 
                  onClick={() => setMode('register')}
                  className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${mode === 'register' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  Sign Up
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                {mode === 'register' && (
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input 
                      type="text" 
                      placeholder="Full Name" 
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:ring-2 focus:ring-blue-500/50 transition-all outline-none"
                    />
                  </div>
                )}
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input 
                    type="email" 
                    placeholder="Email Address" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:ring-2 focus:ring-blue-500/50 transition-all outline-none"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input 
                    type="password" 
                    placeholder="Password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:ring-2 focus:ring-blue-500/50 transition-all outline-none"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95 mt-2"
                >
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                  <ArrowRight size={16} />
                </button>
              </form>

              <div className="relative flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-800" />
                <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Or social login</span>
                <div className="flex-1 h-px bg-slate-800" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => onLogin('google')}
                  className="flex items-center justify-center gap-2 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white rounded-xl transition-all"
                >
                  <Chrome size={16} className="text-blue-500" />
                  <span className="text-xs font-bold">Google</span>
                </button>
                <button 
                  onClick={() => onLogin('facebook')}
                  className="flex items-center justify-center gap-2 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white rounded-xl transition-all"
                >
                  <Facebook size={16} className="text-[#1877F2]" />
                  <span className="text-xs font-bold">Facebook</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
