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

    // 防呆：轉小寫並去空格
    const u = username.trim().toLowerCase();
    const p = password.trim();

    // 1. 唯一管理者 chin / 520
    if (u === 'chin' && p === '520') {
      onLogin({
        id: 'admin-001',
        name: '管理員 chin',
        username: 'chin',
        password: '520',
        role: 'admin'
      } as User);
      return;
    }

    // 2. 一般帳號比對
    const user = users.find(userObj => userObj.username === u && userObj.password === p);
    
    if (user) {
      onLogin(user);
    } else {
      setError('帳號或密碼錯誤');
    }
  };

  return (
    <div className="h-screen w-screen bg-[#fffef9] flex items-center justify-center p-4 fixed inset-0 z-[100]">
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-yellow/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-[3rem] shadow-2xl p-10 border-2 border-stone-50 relative z-10">
        <div className="text-center mb-10">
          <JialeLogo className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-3xl font-black text-stone-800 tracking-tighter">佳樂身心診所</h1>
          <p className="text-brand-orange font-bold text-[10px] tracking-[0.3em] uppercase mt-2">Management Platform</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input 
            type="text" 
            required 
            className="w-full h-14 px-6 rounded-2xl bg-stone-50 border-none font-black text-lg outline-none focus:ring-4 focus:ring-brand-yellow/30 transition-all" 
            placeholder="帳號 Username" 
            value={username} 
            onChange={e => setUsername(e.target.value)} 
          />
          <input 
            type="password" 
            required 
            className="w-full h-14 px-6 rounded-2xl bg-stone-50 border-none font-black text-lg outline-none focus:ring-4 focus:ring-brand-yellow/30 transition-all" 
            placeholder="密碼 Password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
          />
          {error && <p className="text-red-500 text-center font-bold text-sm animate-bounce">{error}</p>}
          <Button type="submit" size="xl" className="w-full rounded-2xl shadow-lg shadow-brand-orange/20 mt-4">進入系統</Button>
        </form>
      </div>
    </div>
  );
};
