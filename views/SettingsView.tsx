import React, { useState } from 'react';
import { Therapist, Treatment, User, Category } from '../types';
import { Button } from '../components/Button';
import { Trash, Plus, Users, Edit3, Shield, Key, UserCircle, Database, Info } from 'lucide-react';
import { Modal } from '../components/Modal';

interface SettingsViewProps {
  currentUser: User;
  therapists: Therapist[];
  treatments: Treatment[];
  users: User[]; // 新增：傳入使用者清單
  onUpdateTherapists: (data: Therapist[]) => void;
  onUpdateTreatments: (data: Treatment[]) => void;
  onUpdateUsers: (data: User[]) => void; // 新增：更新使用者回傳
}

type TabType = 'therapists' | 'treatments' | 'accounts';

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentUser,
  therapists,
  treatments,
  users,
  onUpdateTherapists,
  onUpdateTreatments,
  onUpdateUsers,
}) => {
  const isAdmin = currentUser.role === 'admin';
  const [activeTab, setActiveTab] = useState<TabType>(isAdmin ? 'therapists' : 'accounts');
  
  // Modals 控制
  const [isAddTreatmentOpen, setIsAddTreatmentOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  // 表單狀態
  const [trForm, setTrForm] = useState({ name: '', category: '心理' as Category, price: '', fee: '', isGroup: false });
  const [editingTreatment, setEditingTreatment] = useState<Treatment | null>(null);
  
  // 帳號表單狀態
  const [accForm, setAccForm] = useState({ name: '', username: '', password: '', role: 'counter' as 'admin' | 'counter' | 'therapist' });
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const categories: Category[] = ['心理', '職能', 'rTMS'];

  // --- 人員名單處理 ---
  const handlePromptAddTherapist = (cat: Category) => {
    setTimeout(() => {
      const name = window.prompt(`請輸入新的 [${cat}] 專業人員姓名：`);
      if (name && name.trim()) {
        onUpdateTherapists([...therapists, { id: `t_${Date.now()}`, name: name.trim(), category: cat }]);
      }
    }, 10);
  };

  // --- 治療項目處理 ---
  const handleEditTreatment = (tr: Treatment) => {
    setEditingTreatment(tr);
    setTrForm({ 
      name: tr.name, 
      category: tr.category, 
      price: tr.patientPrice.toString(), 
      fee: tr.therapistFee.toString(), 
      isGroup: tr.isGroupTherapy 
    });
    setIsAddTreatmentOpen(true);
  };

  const handleAddTreatmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTreatment) {
      onUpdateTreatments(treatments.map(tr => tr.id === editingTreatment.id ? {
        ...tr,
        name: trForm.name,
        category: trForm.category,
        patientPrice: parseFloat(trForm.price) || 0,
        therapistFee: parseFloat(trForm.fee) || 0,
        isGroupTherapy: trForm.isGroup
      } : tr));
    } else {
      onUpdateTreatments([...treatments, { 
        id: `tr_${Date.now()}`, 
        name: trForm.name, 
        category: trForm.category, 
        patientPrice: parseFloat(trForm.price) || 0, 
        therapistFee: parseFloat(trForm.fee) || 0,
        durationMinutes: 30,
        isGroupTherapy: trForm.isGroup
      }]);
    }
    setIsAddTreatmentOpen(false);
    setEditingTreatment(null);
  };

  // --- 帳號管理處理 ---
  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setAccForm({ name: user.name, username: user.username, password: user.password, role: user.role || 'counter' });
    setIsAccountModalOpen(true);
  };

  const handleAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      onUpdateUsers(users.map(u => u.username === editingUser.username ? { ...u, ...accForm } : u));
    } else {
      if (users.some(u => u.username === accForm.username)) return alert("帳號已存在");
      onUpdateUsers([...users, { ...accForm, id: `u_${Date.now()}` }]);
    }
    setIsAccountModalOpen(false);
    setEditingUser(null);
    setAccForm({ name: '', username: '', password: '', role: 'counter' });
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Tab 切換器 */}
      <div className="bg-white p-2 rounded-[2rem] shadow-xl border border-stone-100 flex gap-2">
        {isAdmin && (
          <>
            <button onClick={() => setActiveTab('therapists')} className={`flex-1 py-5 rounded-2xl text-sm font-black transition-all ${activeTab === 'therapists' ? 'bg-stone-900 text-white shadow-xl' : 'text-stone-400 hover:bg-stone-50'}`}>人員名單</button>
            <button onClick={() => setActiveTab('treatments')} className={`flex-1 py-5 rounded-2xl text-sm font-black transition-all ${activeTab === 'treatments' ? 'bg-stone-900 text-white shadow-xl' : 'text-stone-400 hover:bg-stone-50'}`}>治療項目</button>
          </>
        )}
        <button onClick={() => setActiveTab('accounts')} className={`flex-1 py-5 rounded-2xl text-sm font-black transition-all ${activeTab === 'accounts' ? 'bg-stone-900 text-white shadow-xl' : 'text-stone-400 hover:bg-stone-50'}`}>
          {isAdmin ? '帳號權限管理' : '資料備份中心'}
        </button>
      </div>

      {activeTab === 'accounts' ? (
        <div className="max-w-4xl mx-auto space-y-6">
          {isAdmin ? (
            <>
              <div className="flex justify-between items-center px-4">
                <h2 className="text-2xl font-black text-stone-800">系統帳號管理</h2>
                <Button onClick={() => { setEditingUser(null); setAccForm({name:'', username:'', password:'', role:'counter'}); setIsAccountModalOpen(true); }} className="rounded-2xl gap-2">
                  <Plus size={20} /> 新增員工帳號
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {users.map(u => (
                  <div key={u.username} className="bg-white p-6 rounded-[2.5rem] border border-stone-100 shadow-sm flex items-center justify-between group hover:border-brand-orange transition-all">
                    <div className="flex items-center gap-5">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${u.role === 'admin' ? 'bg-stone-900 text-brand-yellow' : 'bg-stone-50 text-stone-400'}`}>
                        {u.role === 'admin' ? <Shield size={28} /> : <UserCircle size={28} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-xl text-stone-800">{u.name}</span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${u.role === 'admin' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-500'}`}>
                            {u.role === 'admin' ? '管理者' : u.role === 'counter' ? '櫃檯人員' : '治療師'}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-stone-400 mt-1">帳號：{u.username} • 密碼：{u.password.replace(/./g, '*')}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleEditUser(u)} className="p-3 text-stone-300 hover:text-brand-orange hover:bg-brand-orange/10 rounded-xl transition-all"><Edit3 size={22}/></button>
                      {u.username !== 'chin' && (
                        <button onClick={() => confirm(`確定刪除 ${u.name} 的存取權限？`) && onUpdateUsers(users.filter(x => x.username !== u.username))} className="p-3 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash size={22}/></button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="bg-white p-12 rounded-[3rem] border-2 border-dashed border-stone-100 text-center space-y-4">
              <Database size={48} className="mx-auto text-stone-200" />
              <p className="font-black text-stone-400 uppercase tracking-[0.2em]">雲端同步與備份功能已啟用</p>
              <p className="text-sm text-stone-300 max-w-xs mx-auto font-bold">目前登入為一般人員，如需調整系統設定或新增項目，請聯繫管理者 chin。</p>
            </div>
          )}
        </div>
      ) : (
        /* 原本的人員與治療項目管理 UI */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map(cat => (
            <div key={cat} className="space-y-6">
              <div className={`p-6 rounded-[2.5rem] border-2 flex items-center justify-between shadow-sm ${cat === '心理' ? 'bg-purple-50/50 border-purple-100' : cat === '職能' ? 'bg-blue-50/50 border-blue-100' : 'bg-emerald-50/50 border-emerald-100'}`}>
                <h3 className="font-black text-stone-800 uppercase tracking-widest text-xs">{cat} 領域</h3>
                <button onClick={() => activeTab === 'therapists' ? handlePromptAddTherapist(cat) : setTrForm({name:'', category:cat, price:'', fee:'', isGroup:false}) || setIsAddTreatmentOpen(true)} className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-stone-800 shadow-md hover:scale-110 transition-all border border-stone-100"><Plus size={24} strokeWidth={3} /></button>
              </div>
              <div className="space-y-4">
                {activeTab === 'therapists' ? (
                  therapists.filter(t => t.category === cat).map(t => (
                    <div key={t.id} className="p-5 bg-white border border-stone-100 rounded-[2rem] flex justify-between items-center shadow-sm"><span className="font-black text-stone-800">{t.name}</span><button onClick={() => confirm(`確定移除 ${t.name}？`) && onUpdateTherapists(therapists.filter(x => x.id !== t.id))} className="text-stone-200 hover:text-red-500 p-2"><Trash size={20}/></button></div>
                  ))
                ) : (
                  treatments.filter(tr => tr.category === cat).map(tr => (
                    <div key={tr.id} className="p-6 bg-white border border-stone-100 rounded-[2rem] space-y-4 shadow-sm group hover:border-brand-orange transition-all">
                      <div className="flex justify-between items-start">
                        <div><p className="font-black text-stone-800 leading-tight text-lg">{tr.name}</p></div>
                        <div className="flex gap-1">
                          <button onClick={() => handleEditTreatment(tr)} className="text-stone-200 hover:text-brand-orange p-2"><Edit3 size={18}/></button>
                          <button onClick={() => confirm(`確定移除 ${tr.name}？`) && onUpdateTreatments(treatments.filter(x => x.id !== tr.id))} className="text-stone-200 hover:text-red-500 p-2"><Trash size={18}/></button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 帳號編輯 Modal */}
      <Modal isOpen={isAccountModalOpen} onClose={() => setIsAccountModalOpen(false)} title={editingUser ? "修改帳號權限" : "新增系統帳號"}>
        <form onSubmit={handleAccountSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 ml-2">顯示名稱 (名稱需與專業人員名單一致才可同步)</label>
              <div className="relative"><UserCircle className="absolute left-5 top-4 text-stone-300" size={20}/><input required className="w-full h-14 pl-14 pr-6 rounded-2xl bg-stone-50 border-none font-black" placeholder="例如：王小明" value={accForm.name} onChange={e => setAccForm({...accForm, name: e.target.value})}/></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 ml-2">登入帳號</label>
                <div className="relative"><Users className="absolute left-5 top-4 text-stone-300" size={20}/><input required disabled={editingUser?.username === 'chin'} className="w-full h-14 pl-14 pr-6 rounded-2xl bg-stone-50 border-none font-black disabled:opacity-50" value={accForm.username} onChange={e => setAccForm({...accForm, username: e.target.value})}/></div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 ml-2">登入密碼</label>
                <div className="relative"><Key className="absolute left-5 top-4 text-stone-300" size={20}/><input required className="w-full h-14 pl-14 pr-6 rounded-2xl bg-stone-50 border-none font-black" value={accForm.password} onChange={e => setAccForm({...accForm, password: e.target.value})}/></div>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 ml-2">身分別 Role</label>
              <select 
                disabled={editingUser?.username === 'chin'}
                className="w-full h-14 px-6 rounded-2xl bg-stone-50 border-none font-black appearance-none cursor-pointer disabled:opacity-50"
                value={accForm.role}
                onChange={e => setAccForm({...accForm, role: e.target.value as any})}
              >
                <option value="counter">櫃檯人員</option>
                <option value="therapist">治療師</option>
                <option value="admin">系統管理者</option>
              </select>
            </div>
          </div>
          <Button type="submit" size="lg" className="w-full h-16 shadow-2xl">{editingUser ? "儲存帳號更動" : "確認新增帳號"}</Button>
        </form>
      </Modal>

      {/* 原本的治療項目 Modal (略，與您原本代碼一致) */}
      <Modal isOpen={isAddTreatmentOpen} onClose={() => setIsAddTreatmentOpen(false)} title="治療項目設定">
         <form onSubmit={handleAddTreatmentSubmit} className="space-y-6">
            <input required className="w-full h-14 px-6 rounded-2xl bg-stone-50 font-black" placeholder="項目名稱" value={trForm.name} onChange={e => setTrForm({...trForm, name: e.target.value})} />
            <div className="grid grid-cols-2 gap-5">
              <input type="number" required className="w-full h-14 px-6 rounded-2xl bg-stone-50 font-black" placeholder="實收金額" value={trForm.price} onChange={e => setTrForm({...trForm, price: e.target.value})} />
              <input type="number" required className="w-full h-14 px-6 rounded-2xl bg-amber-50 font-black" placeholder="薪資金額" value={trForm.fee} onChange={e => setTrForm({...trForm, fee: e.target.value})} />
            </div>
            <Button type="submit" size="lg" className="w-full h-16">確認儲存</Button>
         </form>
      </Modal>
    </div>
  );
};
