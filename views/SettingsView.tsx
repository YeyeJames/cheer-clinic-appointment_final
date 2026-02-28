
import React, { useState, useCallback } from 'react';
import { Therapist, Treatment, User, Category } from '../types';
import { Button } from '../components/Button';
import { Trash2, Plus, Users, Briefcase, Database, Trash, Info, Edit3 } from 'lucide-react';
import { Modal } from '../components/Modal';

interface SettingsViewProps {
  currentUser: User;
  therapists: Therapist[];
  treatments: Treatment[];
  onUpdateTherapists: (data: Therapist[]) => void;
  onUpdateTreatments: (data: Treatment[]) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentUser,
  therapists,
  treatments,
  onUpdateTherapists,
  onUpdateTreatments,
}) => {
  const [activeTab, setActiveTab] = useState<'therapists' | 'treatments'>('therapists');
  
  // 使用 Modal 取代 window.prompt 以獲得更穩定的跨平台體驗
  const [isAddTherapistOpen, setIsAddTherapistOpen] = useState(false);
  const [isAddTreatmentOpen, setIsAddTreatmentOpen] = useState(false);

  const [tForm, setTForm] = useState({ name: '', category: '心理' as Category });
  const [trForm, setTrForm] = useState({ name: '', category: '心理' as Category, price: '', fee: '', isGroup: false });
  const [editingTreatment, setEditingTreatment] = useState<Treatment | null>(null);

  const categories: Category[] = ['心理', '職能', 'rTMS'];

  // 修復後的按鈕觸發函數：直接呼叫 prompt，並確保事件不被攔截
  const handlePromptAddTherapist = (cat: Category) => {
    // 延遲一小段時間確保觸摸/點擊事件完全釋放
    setTimeout(() => {
      const name = window.prompt(`請輸入新的 [${cat}] 專業人員姓名：`);
      if (name && name.trim()) {
        onUpdateTherapists([...therapists, { id: `t_${Date.now()}`, name: name.trim(), category: cat }]);
      }
    }, 10);
  };

  const handlePromptAddTreatment = (cat: Category) => {
    setEditingTreatment(null);
    setTrForm({ name: '', category: cat, price: '', fee: '', isGroup: false });
    setIsAddTreatmentOpen(true);
  };

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

  const handleAddTherapistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tForm.name.trim()) return;
    onUpdateTherapists([...therapists, { id: `t_${Date.now()}`, name: tForm.name, category: tForm.category }]);
    setIsAddTherapistOpen(false);
    setTForm({ name: '', category: '心理' });
  };

  const handleAddTreatmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trForm.name.trim()) return;

    if (editingTreatment) {
      const updatedTreatments = treatments.map(tr => 
        tr.id === editingTreatment.id ? {
          ...tr,
          name: trForm.name,
          category: trForm.category,
          patientPrice: parseFloat(trForm.price) || 0,
          therapistFee: parseFloat(trForm.fee) || 0,
          isGroupTherapy: trForm.isGroup
        } : tr
      );
      onUpdateTreatments(updatedTreatments);
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
    setTrForm({ name: '', category: '心理', price: '', fee: '', isGroup: false });
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Tab Switcher */}
      <div className="bg-white p-2 rounded-[2rem] shadow-xl border border-stone-100 flex gap-2">
        <button onClick={() => setActiveTab('therapists')} className={`flex-1 py-5 rounded-2xl text-sm font-black transition-all ${activeTab === 'therapists' ? 'bg-stone-900 text-white shadow-xl' : 'text-stone-400 hover:bg-stone-50'}`}>人員名單管理</button>
        <button onClick={() => setActiveTab('treatments')} className={`flex-1 py-5 rounded-2xl text-sm font-black transition-all ${activeTab === 'treatments' ? 'bg-stone-900 text-white shadow-xl' : 'text-stone-400 hover:bg-stone-50'}`}>治療項目管理</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {categories.map(cat => (
          <div key={cat} className="space-y-6">
            <div className={`p-6 rounded-[2.5rem] border-2 flex items-center justify-between shadow-sm ${cat === '心理' ? 'bg-purple-50/50 border-purple-100' : cat === '職能' ? 'bg-blue-50/50 border-blue-100' : 'bg-emerald-50/50 border-emerald-100'}`}>
              <div>
                <h3 className="font-black text-stone-800 uppercase tracking-widest text-xs mb-1">{cat} 領域</h3>
                <p className="text-[10px] font-bold opacity-40">{activeTab === 'therapists' ? '專業人員' : '治療服務'}</p>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if (activeTab === 'therapists') handlePromptAddTherapist(cat);
                  else handlePromptAddTreatment(cat);
                }}
                className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-stone-800 shadow-md hover:scale-110 active:scale-90 transition-all border border-stone-100"
              >
                <Plus size={24} strokeWidth={3} />
              </button>
            </div>

            <div className="space-y-4">
               {activeTab === 'therapists' ? (
                 therapists.filter(t => t.category === cat).map(t => (
                   <div key={t.id} className="p-5 bg-white border border-stone-100 rounded-[2rem] flex justify-between items-center shadow-sm group hover:border-brand-orange transition-all">
                     <span className="font-black text-stone-800">{t.name}</span>
                     <button onClick={() => confirm(`確定移除 ${t.name}？`) && onUpdateTherapists(therapists.filter(x => x.id !== t.id))} className="text-stone-200 hover:text-red-500 transition-all p-2"><Trash size={20}/></button>
                   </div>
                 ))
               ) : (
                 treatments.filter(tr => tr.category === cat).map(tr => (
                   <div key={tr.id} className="p-6 bg-white border border-stone-100 rounded-[2rem] space-y-4 shadow-sm group hover:border-brand-orange transition-all">
                     <div className="flex justify-between items-start">
                       <div>
                         <p className="font-black text-stone-800 leading-tight text-lg">{tr.name}</p>
                         {tr.isGroupTherapy && <span className="text-[10px] font-black text-brand-orange bg-brand-orange/10 px-3 py-1 rounded-full uppercase mt-2 inline-block tracking-wider">團體治療項目</span>}
                       </div>
                       <div className="flex gap-1">
                         <button onClick={() => handleEditTreatment(tr)} className="text-stone-200 hover:text-brand-orange transition-all p-2"><Edit3 size={18}/></button>
                         <button onClick={() => confirm(`確定移除 ${tr.name}？`) && onUpdateTreatments(treatments.filter(x => x.id !== tr.id))} className="text-stone-200 hover:text-red-500 transition-all p-2"><Trash size={18}/></button>
                       </div>
                     </div>
                     <div className="flex gap-2 pt-2 border-t border-stone-50">
                       <span className="flex-1 text-center bg-stone-50 text-stone-400 px-2 py-1.5 rounded-xl font-black text-[10px]">收費 ${tr.patientPrice}</span>
                       <span className="flex-1 text-center bg-amber-50 text-brand-orange px-2 py-1.5 rounded-xl font-black text-[10px]">薪資 ${tr.therapistFee}</span>
                     </div>
                   </div>
                 ))
               )}

               {(activeTab === 'therapists' ? therapists : treatments).filter(x => x.category === cat).length === 0 && (
                 <div className="py-12 text-center text-stone-200 border-2 border-dashed border-stone-100 rounded-[2rem] flex flex-col items-center">
                    <Info size={32} className="mb-2 opacity-20" />
                    <p className="text-[10px] font-black uppercase tracking-widest">尚無資料</p>
                 </div>
               )}
            </div>
          </div>
        ))}
      </div>

      {/* 新增/編輯項目的詳細 Modal */}
      <Modal isOpen={isAddTreatmentOpen} onClose={() => { setIsAddTreatmentOpen(false); setEditingTreatment(null); }} title={editingTreatment ? "編輯治療項目服務" : "新增治療項目服務"}>
         <form onSubmit={handleAddTreatmentSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2.5 ml-2">項目名稱 Treatment Name</label>
              <input required className="w-full h-14 px-6 rounded-2xl bg-stone-50 border-none font-black shadow-inner" placeholder="例如：社交技巧訓練(團體)" value={trForm.name} onChange={e => setTrForm({...trForm, name: e.target.value})} autoFocus />
            </div>
            
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2.5 ml-2">實收金額 (病人)</label>
                <input type="number" required className="w-full h-14 px-6 rounded-2xl bg-stone-50 border-none font-black shadow-inner" placeholder="1600" value={trForm.price} onChange={e => setTrForm({...trForm, price: e.target.value})} />
              </div>
              <div>
                <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2.5 ml-2">薪資金額 (老師)</label>
                <input type="number" required className="w-full h-14 px-6 rounded-2xl bg-amber-50 border-none font-black text-brand-orange shadow-inner" placeholder="800" value={trForm.fee} onChange={e => setTrForm({...trForm, fee: e.target.value})} />
              </div>
            </div>

            <div className="p-6 bg-brand-orange/5 rounded-[2rem] border-2 border-brand-orange/20 flex items-center gap-5 cursor-pointer select-none active:scale-[0.98] transition-all" onClick={() => setTrForm({...trForm, isGroup: !trForm.isGroup})}>
               <input type="checkbox" id="isGroupToggle" className="w-6 h-6 rounded-lg accent-brand-orange cursor-pointer" checked={trForm.isGroup} onChange={(e) => setTrForm({...trForm, isGroup: e.target.checked})} onClick={e => e.stopPropagation()} />
               <div>
                 <label htmlFor="isGroupToggle" className="font-black text-brand-orange block text-lg cursor-pointer">設定為「團體治療」項目</label>
                 <p className="text-[10px] font-bold text-brand-orange opacity-60 mt-0.5 uppercase tracking-wider">開啟後，日視圖將啟用多人合併顯示與快速加入個案功能</p>
               </div>
            </div>

            <Button type="submit" size="lg" className="w-full h-16 shadow-2xl">
               {editingTreatment ? "儲存修改內容" : "確認新增項目"}
            </Button>
         </form>
      </Modal>
    </div>
  );
};
