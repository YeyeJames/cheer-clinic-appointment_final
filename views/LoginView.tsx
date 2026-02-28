
import React, { useState } from 'react';
import { User } from '../types';
import { Button } from '../components/Button';
import { JialeLogo } from '../App';

interface LoginViewProps {
  users: User[];
  onLogin: (user: User) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ users, onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const user = users.find(u => u.username === username && u.password === password);
    if (user) onLogin(user);
    else setError('帳號或密碼錯誤');
  };

  return (
    <div className="h-screen w-screen bg-[#fffef9] flex items-center justify-center p-4 md:p-8 relative overflow-hidden fixed inset-0 z-[100]">
      {/* Background Orbs with Brand Colors */}
      <div className="fixed top-[-15%] left-[-10%] w-[50%] h-[50%] bg-brand-yellow/30 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="fixed bottom-[-15%] right-[-10%] w-[50%] h-[50%] bg-brand-orange/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-xl bg-white/80 backdrop-blur-2xl rounded-[4rem] shadow-[0_40px_100px_-20px_rgba(255,184,95,0.2)] border border-white/60 overflow-hidden relative z-10 flex flex-col scale-95 md:scale-100 transition-all duration-700 border-2">
        {/* Header Section */}
        <div className="pt-12 pb-8 text-center bg-white/40">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-[2.5rem] mb-8 shadow-xl shadow-brand-orange/10 border border-brand-yellow/20">
            <JialeLogo className="w-16 h-16" />
          </div>
          <h1 className="text-5xl font-black text-stone-800 tracking-tighter leading-none mb-4">佳樂身心診所</h1>
          <p className="text-brand-orange font-black uppercase text-xs tracking-[0.5em]">Cheer Clinic Management</p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="p-10 md:p-14 space-y-8">
          <div className="space-y-3">
            <label className="block text-xs font-black text-brand-olive uppercase tracking-[0.2em] ml-2">帳號 Username</label>
            <input 
              type="text" 
              required 
              autoFocus
              className="w-full rounded-[1.8rem] border-stone-100 border-2 p-5 focus:ring-4 focus:ring-brand-yellow/30 focus:border-brand-orange outline-none transition-all font-bold bg-white text-xl shadow-inner" 
              placeholder="請輸入帳號" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
            />
          </div>
          
          <div className="space-y-3">
            <label className="block text-xs font-black text-brand-olive uppercase tracking-[0.2em] ml-2">密碼 Password</label>
            <input 
              type="password" 
              required 
              className="w-full rounded-[1.8rem] border-stone-100 border-2 p-5 focus:ring-4 focus:ring-brand-yellow/30 focus:border-brand-orange outline-none transition-all font-bold bg-white text-xl shadow-inner" 
              placeholder="請輸入密碼" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
            />
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-500 text-lg rounded-[1.5rem] text-center font-bold border-2 border-red-100/50 animate-bounce">
              {error}
            </div>
          )}

          <Button type="submit" size="xl" className="w-full rounded-[1.8rem] shadow-xl shadow-brand-orange/20 mt-4 transition-transform hover:scale-[1.02]">
            開啟管理平台
          </Button>
        </form>
        
        {/* Footer info */}
        <div className="bg-stone-50/50 px-8 py-6 text-center text-[10px] text-stone-400 font-bold tracking-[0.3em] uppercase border-t border-stone-50">
           Professional Edition • Soft Modern Interface
        </div>
      </div>
    </div>
  );
};
