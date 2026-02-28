
import React, { useEffect, useState, useCallback } from 'react';
import { ViewState, Therapist, Treatment, Appointment, User } from './types.ts';
import { DataService } from './services/dataService.ts';
import { ScheduleView } from './views/ScheduleView.tsx';
import { SettingsView } from './views/SettingsView.tsx';
import { ReportsView } from './views/ReportsView.tsx';
import { LoginView } from './views/LoginView.tsx';
import { Calendar, Settings, Menu, LogOut, User as UserIcon, BarChart3 } from 'lucide-react';

// 根據廣告公司設計圖繪製的品牌 Logo
export const JialeLogo = ({ className = "w-10 h-10", color = "#ffb85f" }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* 黃色月牙/懷抱部分 (Pantone 106U) */}
    <path d="M45 15C30 15 18 27 18 42C18 65 40 85 82 85C70 85 58 75 58 60C58 45 65 35 75 25C65 18 55 15 45 15Z" fill="#f9e076" />
    {/* 橘色圓心部分 (Pantone 136U) */}
    <circle cx="70" cy="45" r="12" fill={color} />
    {/* 小手臂細節 */}
    <path d="M62 48C58 45 58 40 62 37" stroke={color} strokeWidth="4" strokeLinecap="round" />
    <path d="M78 48C82 45 82 40 78 37" stroke={color} strokeWidth="4" strokeLinecap="round" />
  </svg>
);

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>('schedule');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // App Data State
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    setTherapists(DataService.getTherapists());
    setTreatments(DataService.getTreatments());
    setAppointments(DataService.getAppointments());
    setUsers(DataService.getUsers());
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (!isInitialized) return;
    DataService.saveTherapists(therapists);
  }, [therapists, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    DataService.saveTreatments(treatments);
  }, [treatments, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    DataService.saveAppointments(appointments);
  }, [appointments, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    DataService.saveUsers(users);
  }, [users, isInitialized]);

  const handleUpdateTherapists = useCallback((data: Therapist[]) => {
    setTherapists(data);
  }, []);

  const handleUpdateTreatments = useCallback((data: Treatment[]) => {
    setTreatments(data);
  }, []);

  const handleUpdateUsers = useCallback((data: User[]) => {
    setUsers(data);
  }, []);

  const handleAddAppointment = useCallback((newApt: Omit<Appointment, 'id' | 'createdAt'>) => {
    const apt: Appointment = {
        ...newApt,
        id: `apt_${Date.now()}`,
        createdAt: Date.now()
    };
    setAppointments(prev => [...prev, apt]);
  }, []);

  const handleUpdateAppointment = useCallback((id: string, updates: Partial<Appointment>) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  }, []);

  const handleDeleteAppointment = useCallback((id: string) => {
    setAppointments(prev => prev.filter(a => a.id !== id));
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentView('schedule');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsSidebarOpen(false);
  };

  if (!currentUser) {
    return <LoginView users={users} onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-[#fffef5] flex flex-col md:flex-row font-medium relative">
      {/* Optimized Mobile Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-stone-100 px-4 py-3 md:hidden flex justify-between items-center sticky top-0 z-30 shadow-sm">
         <div className="flex items-center gap-2 text-brand-orange font-black text-lg">
             <JialeLogo className="w-7 h-7" /> 佳樂身心診所
         </div>
         <div className="flex items-center gap-2">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-stone-600 p-2 bg-stone-50 rounded-xl active:scale-95 transition-transform">
               <Menu size={20} />
            </button>
         </div>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-[280px] bg-stone-900 text-white transform transition-transform duration-300 ease-out md:translate-x-0 md:sticky md:top-0 md:h-screen flex flex-col shadow-2xl md:shadow-none
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-8 flex items-center gap-4 border-b border-stone-800/50">
            <div className="bg-white p-2 rounded-xl shadow-lg">
                <JialeLogo className="w-8 h-8" />
            </div>
            <div>
                <h1 className="font-black text-xl tracking-tight leading-tight">佳樂身心診所</h1>
                <p className="text-[9px] text-brand-orange font-bold uppercase tracking-[0.2em]">Cheer Clinic</p>
            </div>
        </div>

        <nav className="p-4 space-y-2 mt-4 flex-1 overflow-y-auto custom-scrollbar">
            <NavItem 
                active={currentView === 'schedule'} 
                onClick={() => { setCurrentView('schedule'); setIsSidebarOpen(false); }}
                icon={<Calendar size={22} />}
                label="預約排程"
            />
            
            {currentUser.role === 'admin' && (
              <NavItem 
                  active={currentView === 'reports'} 
                  onClick={() => { setCurrentView('reports'); setIsSidebarOpen(false); }}
                  icon={<BarChart3 size={22} />}
                  label="統計月報表"
              />
            )}

            <NavItem 
                active={currentView === 'settings'} 
                onClick={() => { setCurrentView('settings'); setIsSidebarOpen(false); }}
                icon={<Settings size={22} />}
                label={currentUser.role === 'admin' ? '基本資料設定' : '備份 / 資料管理'}
            />
        </nav>

        <div className="p-6 border-t border-stone-800 space-y-4">
             <div className="flex items-center gap-3 px-2">
                 <div className="w-10 h-10 rounded-lg bg-stone-800 border border-stone-700 flex items-center justify-center text-brand-yellow">
                    <UserIcon size={20} strokeWidth={2.5} />
                 </div>
                 <div className="overflow-hidden">
                     <p className="text-sm font-black truncate">{currentUser.name}</p>
                     <p className="text-[9px] text-stone-500 font-bold uppercase tracking-wider">{currentUser.role === 'admin' ? '管理員' : '櫃檯人員'}</p>
                 </div>
             </div>
             
             <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-stone-800/50 text-stone-400 text-xs font-bold hover:bg-red-500/10 hover:text-red-400 transition-all border border-stone-700/50"
             >
                <LogOut size={16} />
                登出系統
             </button>
        </div>
      </aside>

      {isSidebarOpen && (
        <div 
            className="fixed inset-0 bg-stone-900/40 backdrop-blur-[2px] z-40 md:hidden animate-in fade-in duration-300"
            onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-3 md:p-8 lg:p-12 overflow-y-auto min-h-screen">
        <div className="max-w-7xl mx-auto space-y-4 md:space-y-8 lg:space-y-10">
            {currentView === 'schedule' && (
                <ScheduleView 
                    appointments={appointments}
                    therapists={therapists}
                    treatments={treatments}
                    onAddAppointment={handleAddAppointment}
                    onUpdateAppointment={handleUpdateAppointment}
                    onDeleteAppointment={handleDeleteAppointment}
                />
            )}
            {currentView === 'reports' && (
                <ReportsView 
                    appointments={appointments}
                    therapists={therapists}
                    treatments={treatments}
                />
            )}
            {currentView === 'settings' && (
                <SettingsView 
                    currentUser={currentUser}
                    therapists={therapists}
                    treatments={treatments}
                    users={users}
                    onUpdateTherapists={handleUpdateTherapists}
                    onUpdateTreatments={handleUpdateTreatments}
                    onUpdateUsers={handleUpdateUsers}
                />
            )}
        </div>
      </main>
    </div>
  );
};

const NavItem = ({ active, onClick, icon, label }: any) => (
    <button 
        onClick={onClick}
        className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl text-base font-bold transition-all ${active ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/20 translate-x-1' : 'text-stone-400 hover:bg-stone-800/50 hover:text-brand-yellow'}`}
    >
        {React.cloneElement(icon, { strokeWidth: active ? 3 : 2 })}
        {label}
    </button>
);

export default App;
