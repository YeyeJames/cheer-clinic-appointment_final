
import React, { useState, useMemo } from 'react';
import { Plus, ChevronLeft, ChevronRight, Calendar, CheckCircle, Banknote, Trash2, RotateCcw, Coffee, Users as UsersIcon, UserPlus, Clock, MapPin } from 'lucide-react';
import { format, addDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';
import { Appointment, Therapist, Treatment, Category } from '../types';
import { Button } from '../components/Button';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';

interface ScheduleViewProps {
  appointments: Appointment[];
  therapists: Therapist[];
  treatments: Treatment[];
  onAddAppointment: (apt: Omit<Appointment, 'id' | 'createdAt'>) => void;
  onUpdateAppointment: (id: string, updates: Partial<Appointment>) => void;
  onDeleteAppointment: (id: string) => void;
}

const parseLocal = (dateStr: string) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
};

const WEEKDAYS = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  appointments,
  therapists,
  treatments,
  onAddAppointment,
  onUpdateAppointment,
  onDeleteAppointment,
}) => {
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingApt, setEditingApt] = useState<Appointment | null>(null);

  const [formCategory, setFormCategory] = useState<Category>('心理');
  const [formData, setFormData] = useState({
    patientName: '',
    patientPhone: '',
    time: '09:00',
    therapistId: '',
    treatmentId: '',
    notes: '',
    treatmentRoom: '二診',
  });

  const dailyAppointments = useMemo(() => {
    return appointments
      .filter(apt => apt.date === selectedDate)
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [appointments, selectedDate]);

  // 混合排版邏輯：僅對標記為 isGroupTherapy 的項目進行合併
  const dailyDisplayGroups = useMemo(() => {
    const items: any[] = [];
    const groupCache: Record<string, any> = {};

    dailyAppointments.forEach(apt => {
      const treatment = treatments.find(t => t.id === apt.treatmentId);
      if (treatment?.isGroupTherapy) {
        const key = `${apt.time}-${apt.therapistId}-${apt.treatmentId}-${apt.treatmentRoom}`;
        if (!groupCache[key]) {
          groupCache[key] = {
            type: 'group',
            time: apt.time,
            therapistId: apt.therapistId,
            treatmentId: apt.treatmentId,
            treatmentRoom: apt.treatmentRoom,
            patients: []
          };
          items.push(groupCache[key]);
        }
        groupCache[key].patients.push(apt);
      } else {
        items.push({ type: 'individual', data: apt });
      }
    });
    return items;
  }, [dailyAppointments, treatments]);

  const handleDateNav = (days: number) => {
    const nextDate = addDays(parseLocal(selectedDate), days);
    setSelectedDate(format(nextDate, 'yyyy-MM-dd'));
  };

  const handleOpenAdd = (defaults?: Partial<typeof formData>) => {
    setEditingApt(null);
    setFormData({
      patientName: '',
      patientPhone: '',
      time: defaults?.time || '09:00',
      therapistId: defaults?.therapistId || '',
      treatmentId: defaults?.treatmentId || '',
      notes: '',
      treatmentRoom: defaults?.treatmentRoom || '二診',
    });
    const therapist = therapists.find(t => t.id === (defaults?.therapistId || ''));
    if (therapist) setFormCategory(therapist.category);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (apt: Appointment) => {
    setEditingApt(apt);
    const therapist = therapists.find(t => t.id === apt.therapistId);
    if (therapist) setFormCategory(therapist.category);
    setFormData({
      patientName: apt.patientName,
      patientPhone: apt.patientPhone,
      time: apt.time,
      therapistId: apt.therapistId,
      treatmentId: apt.treatmentId,
      notes: apt.notes || '',
      treatmentRoom: apt.treatmentRoom || '二診',
    });
    setIsAddModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const treatment = treatments.find(t => t.id === formData.treatmentId);
    if (!treatment) return;

    const payload = {
      ...formData,
      date: selectedDate,
      patientPrice: treatment.patientPrice,
      therapistFee: treatment.therapistFee,
      status: editingApt ? editingApt.status : 'scheduled' as const,
      paidAmount: editingApt ? editingApt.paidAmount : 0,
      isPaid: editingApt ? editingApt.isPaid : false,
    };

    if (editingApt) {
      onUpdateAppointment(editingApt.id, payload);
    } else {
      onAddAppointment(payload);
    }
    setIsAddModalOpen(false);
  };

  // 週末顯色邏輯
  const getDayClass = (date: Date) => {
    const d = date.getDay();
    if (isToday(date)) return 'border-brand-orange ring-4 ring-brand-orange/20';
    if (d === 0) return 'bg-red-50/60 border-red-200 text-red-600'; // 週日紅
    if (d === 6) return 'bg-blue-50/60 border-blue-200 text-blue-600'; // 週六藍
    return 'bg-white border-stone-100';
  };

  const currentMonthDays = useMemo(() => {
    const current = parseLocal(selectedDate);
    const start = startOfWeek(startOfMonth(current));
    const end = endOfWeek(endOfMonth(current));
    return eachDayOfInterval({ start, end });
  }, [selectedDate]);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 bg-white p-4 md:p-6 rounded-3xl md:rounded-[2.5rem] shadow-lg border border-stone-100">
        <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-start">
          <button onClick={() => handleDateNav(-1)} className="p-2.5 bg-stone-50 rounded-xl hover:bg-stone-100 transition-all active:scale-90"><ChevronLeft size={20}/></button>
          <div className="text-center min-w-[100px] md:min-w-[140px]">
            <p className="text-xl md:text-2xl font-black text-stone-800 tracking-tighter">{format(parseLocal(selectedDate), 'MM/dd')}</p>
            <p className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest ${parseLocal(selectedDate).getDay() === 0 ? 'text-red-500' : parseLocal(selectedDate).getDay() === 6 ? 'text-blue-500' : 'text-brand-orange'}`}>
              {WEEKDAYS[parseLocal(selectedDate).getDay()]}
            </p>
          </div>
          <button onClick={() => handleDateNav(1)} className="p-2.5 bg-stone-50 rounded-xl hover:bg-stone-100 transition-all active:scale-90"><ChevronRight size={20}/></button>
        </div>

        <div className="flex items-center bg-stone-100 p-1 rounded-xl md:rounded-2xl shadow-inner w-full lg:w-auto overflow-x-auto no-scrollbar">
          {(['day', 'week', 'month'] as const).map(m => (
            <button
              key={m}
              onClick={() => setViewMode(m)}
              className={`flex-1 lg:flex-none px-4 md:px-8 py-2 rounded-lg md:rounded-xl text-xs md:text-sm font-black transition-all whitespace-nowrap ${viewMode === m ? 'bg-white shadow-md text-stone-800' : 'text-stone-400 hover:text-stone-600'}`}
            >
              {m === 'day' ? '日視圖' : m === 'week' ? '週曆' : '月曆'}
            </button>
          ))}
        </div>

        <div className="w-full lg:w-auto">
          <Button onClick={() => handleOpenAdd()} icon={<Plus size={20}/>} className="w-full lg:w-auto py-3 md:py-4">新增預約</Button>
        </div>
      </div>

      {/* Day View */}
      {viewMode === 'day' && (
        <div className="space-y-4 md:space-y-6">
          {dailyDisplayGroups.length === 0 ? (
            <div className="py-20 md:py-40 text-center bg-white rounded-3xl md:rounded-[3rem] border border-stone-100 border-dashed">
              <Coffee size={48} className="mx-auto text-stone-100 mb-4 md:mb-6" />
              <p className="text-lg md:text-xl font-black text-stone-300">今日尚無排程</p>
            </div>
          ) : (
            dailyDisplayGroups.map((group, idx) => {
              if (group.type === 'group') {
                const treatment = treatments.find(t => t.id === group.treatmentId);
                const therapist = therapists.find(t => t.id === group.therapistId);
                return (
                  <div key={`group-${idx}`} className="p-4 md:p-8 bg-brand-orange/[0.03] border-l-4 md:border-l-8 border-brand-orange rounded-2xl md:rounded-[2.5rem] shadow-sm space-y-4 md:space-y-6 hover:shadow-md transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-stone-100 pb-4 md:pb-6 gap-4">
                      <div className="flex items-center gap-4 md:gap-6">
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-brand-orange text-white rounded-xl md:rounded-2xl flex flex-col items-center justify-center font-black shadow-lg shrink-0">
                          <Clock size={14} className="mb-0.5 md:mb-1" />
                          <span className="text-xs md:text-sm">{group.time}</span>
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2 md:gap-3">
                            <h4 className="text-lg md:text-xl font-black text-stone-800 tracking-tight">{treatment?.name}</h4>
                            <span className="px-2 py-0.5 bg-brand-orange/10 text-brand-orange text-[8px] md:text-[10px] font-black rounded-full uppercase tracking-wider">團體治療</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 md:gap-6 mt-1 text-stone-400 text-xs font-bold">
                             <span className="flex items-center gap-1.5"><UsersIcon size={14} className="text-stone-300"/> {therapist?.name}</span>
                             <span className="flex items-center gap-1.5"><MapPin size={14} className="text-stone-300"/> {group.treatmentRoom}</span>
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleOpenAdd({ 
                          time: group.time, 
                          therapistId: group.therapistId, 
                          treatmentId: group.treatmentId, 
                          treatmentRoom: group.treatmentRoom 
                        })} 
                        className="flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 md:py-3 bg-brand-orange text-white rounded-xl md:rounded-2xl text-[10px] md:text-xs font-black hover:scale-105 active:scale-95 transition-all shadow-lg shadow-brand-orange/20 w-full sm:w-auto"
                      >
                        <UserPlus size={16} /> 快速加入個案
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
                      {group.patients.map((apt: Appointment) => (
                        <div key={apt.id} className="bg-white p-4 md:p-5 rounded-2xl md:rounded-3xl border border-stone-100 shadow-sm flex items-center justify-between group/apt hover:border-brand-orange transition-all">
                          <div className="flex-1 cursor-pointer" onClick={() => handleOpenEdit(apt)}>
                            <p className="font-black text-stone-800 text-base md:text-lg">{apt.patientName}</p>
                            <StatusBadge status={apt.status} />
                          </div>
                          <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover/apt:opacity-100 transition-opacity">
                            {apt.status === 'scheduled' && (
                              <button onClick={() => onUpdateAppointment(apt.id, { status: 'completed', isPaid: true, paidAmount: apt.patientPrice })} className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg"><CheckCircle size={18}/></button>
                            )}
                            <button onClick={() => confirm('確定刪除？') && onDeleteAppointment(apt.id)} className="p-2 text-stone-200 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={18}/></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              } else {
                const apt = group.data;
                const tr = treatments.find(t => t.id === apt.treatmentId);
                const th = therapists.find(t => t.id === apt.therapistId);
                return (
                  <div key={apt.id} className="p-4 md:p-6 bg-white rounded-2xl md:rounded-[2.5rem] border border-stone-100 shadow-sm hover:shadow-lg transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                    <div className="flex items-center gap-4 md:gap-6 cursor-pointer flex-1" onClick={() => handleOpenEdit(apt)}>
                      <div className="w-12 h-12 md:w-14 md:h-14 bg-stone-50 text-stone-400 rounded-xl md:rounded-2xl flex items-center justify-center font-black shadow-inner border border-stone-100 shrink-0">
                        {apt.time}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 md:gap-3">
                          <h4 className="text-lg md:text-xl font-black text-stone-800 tracking-tight truncate">{apt.patientName}</h4>
                          <StatusBadge status={apt.status} />
                        </div>
                        <p className="text-stone-400 font-bold text-xs md:text-sm mt-0.5 truncate">{tr?.name} <span className="text-stone-200 mx-1 md:mx-2">/</span> {th?.name} <span className="text-stone-200 mx-1 md:mx-2">/</span> {apt.treatmentRoom}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 justify-end">
                       {apt.status === 'scheduled' ? (
                          <Button variant="success" size="sm" onClick={() => onUpdateAppointment(apt.id, { status: 'completed', isPaid: true, paidAmount: apt.patientPrice })} className="px-4 py-2 text-xs">報到繳費</Button>
                       ) : (
                          <button onClick={() => onUpdateAppointment(apt.id, { status: 'scheduled', isPaid: false })} className="p-2.5 text-stone-300 hover:text-stone-800 hover:bg-stone-100 rounded-xl transition-all"><RotateCcw size={18}/></button>
                       )}
                       <button onClick={() => confirm('確定刪除？') && onDeleteAppointment(apt.id)} className="p-2.5 text-stone-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={20}/></button>
                    </div>
                  </div>
                );
              }
            })
          )}
        </div>
      )}

      {/* Week View */}
      {viewMode === 'week' && (
        <div className="grid grid-cols-1 sm:grid-cols-7 gap-3 md:gap-4">
          {eachDayOfInterval({ start: startOfWeek(parseLocal(selectedDate)), end: endOfWeek(parseLocal(selectedDate)) }).map((day, i) => {
            const ds = format(day, 'yyyy-MM-dd');
            const dayApts = appointments.filter(a => a.date === ds);
            return (
              <div key={i} className={`min-h-[150px] md:min-h-[300px] p-3 md:p-4 rounded-2xl md:rounded-[2rem] border transition-all flex flex-col ${getDayClass(day)}`}>
                 <div className="text-center mb-2 md:mb-4 pb-2 md:pb-4 border-b border-stone-100/30">
                    <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest opacity-60 mb-0.5 md:mb-1">{WEEKDAYS[day.getDay()]}</p>
                    <p className={`text-lg md:text-2xl font-black ${isToday(day) ? 'text-white bg-brand-orange w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full mx-auto shadow-lg' : ''}`}>{format(day, 'd')}</p>
                 </div>
                 <div className="flex-1 space-y-1.5 md:space-y-2 overflow-y-auto no-scrollbar max-h-[200px] md:max-h-none">
                    {dayApts.map(a => (
                      <div key={a.id} onClick={() => handleOpenEdit(a)} className="p-2 bg-white/80 rounded-lg text-[9px] md:text-[10px] font-black shadow-sm border border-stone-100/50 cursor-pointer hover:bg-white transition-all">
                        <span className="text-brand-orange mr-0.5 md:mr-1">{a.time}</span> {a.patientName}
                      </div>
                    ))}
                 </div>
                 <button onClick={() => { setSelectedDate(ds); handleOpenAdd(); }} className="mt-2 md:mt-4 w-full py-1.5 md:py-2 border-2 border-dashed border-stone-200 rounded-lg md:rounded-xl text-stone-300 hover:text-brand-orange hover:border-brand-orange transition-all flex items-center justify-center"><Plus size={14}/></button>
              </div>
            );
          })}
        </div>
      )}

      {/* Month View */}
      {viewMode === 'month' && (
        <div className="bg-white p-4 md:p-8 rounded-3xl md:rounded-[3rem] shadow-xl border border-stone-100 overflow-x-auto">
           <div className="min-w-[600px]">
             <div className="grid grid-cols-7 gap-2 md:gap-3 mb-4 md:mb-6">
                {['日', '一', '二', '三', '四', '五', '六'].map((d, i) => (
                  <div key={d} className={`text-center text-[10px] md:text-xs font-black uppercase tracking-widest ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-stone-300'}`}>{d}</div>
                ))}
             </div>
             <div className="grid grid-cols-7 gap-2 md:gap-3">
                {currentMonthDays.map((day, i) => {
                  const dayStr = format(day, 'yyyy-MM-dd');
                  const count = appointments.filter(a => a.date === dayStr).length;
                  return (
                    <div 
                      key={i} 
                      onClick={() => { setSelectedDate(dayStr); setViewMode('day'); }}
                      className={`min-h-[80px] md:min-h-[110px] p-2 md:p-3 rounded-2xl md:rounded-3xl border transition-all cursor-pointer relative flex flex-col items-center justify-center ${getDayClass(day)} ${!isSameMonth(day, parseLocal(selectedDate)) ? 'opacity-10' : 'hover:scale-105 hover:shadow-2xl hover:z-10'}`}
                    >
                      <span className="text-xs md:text-sm font-black mb-1 md:mb-2">{format(day, 'd')}</span>
                      {count > 0 && <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-brand-orange shadow-sm mb-0.5 md:mb-1"></div>}
                      {count > 0 && <span className="text-[8px] md:text-[10px] font-black opacity-60">{count} 診</span>}
                    </div>
                  );
                })}
             </div>
           </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title={editingApt ? "編輯預約排程" : "建立新預約"}>
         <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
              <div>
                <label className="block text-[9px] md:text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1.5 md:mb-2.5 ml-1 md:ml-2">個案姓名 Patient Name</label>
                <input required className="w-full h-12 md:h-14 px-4 md:px-6 rounded-xl md:rounded-2xl bg-stone-50 border-none font-black text-base md:text-lg outline-none focus:ring-4 focus:ring-brand-yellow/30 shadow-inner" value={formData.patientName} onChange={e => setFormData({...formData, patientName: e.target.value})} autoFocus />
              </div>
              <div>
                <label className="block text-[9px] md:text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1.5 md:mb-2.5 ml-1 md:ml-2">預約時間 Time</label>
                <input type="time" required className="w-full h-12 md:h-14 px-4 md:px-6 rounded-xl md:rounded-2xl bg-stone-50 border-none font-black text-base md:text-lg outline-none focus:ring-4 focus:ring-brand-yellow/30 shadow-inner" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
               <div>
                  <label className="block text-[9px] md:text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1.5 md:mb-2.5 ml-1 md:ml-2">專業領域 Category</label>
                  <div className="flex gap-1.5 md:gap-2 bg-stone-50 p-1 md:p-1.5 rounded-xl md:rounded-2xl shadow-inner">
                    {(['心理', '職能', 'rTMS'] as Category[]).map(c => (
                      <button 
                        key={c} 
                        type="button" 
                        onClick={() => { setFormCategory(c); setFormData({...formData, therapistId: '', treatmentId: ''}); }}
                        className={`flex-1 py-2.5 md:py-3 rounded-lg md:rounded-xl text-[10px] md:text-xs font-black transition-all ${formCategory === c ? 'bg-white shadow-md text-stone-800' : 'text-stone-400 hover:text-stone-600'}`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
               </div>
               <div>
                  <label className="block text-[9px] md:text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1.5 md:mb-2.5 ml-1 md:ml-2">治療室 Room</label>
                  <select className="w-full h-12 md:h-14 px-3 md:px-4 rounded-xl md:rounded-2xl bg-stone-50 border-none font-black text-sm md:text-base focus:ring-4 focus:ring-brand-yellow/30 shadow-inner" value={formData.treatmentRoom} onChange={e => setFormData({...formData, treatmentRoom: e.target.value})}>
                    {['二診', '3-1', '3-2', '3-3'].map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
               </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
              <div>
                <label className="block text-[9px] md:text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1.5 md:mb-2.5 ml-1 md:ml-2">負責人員 Therapist</label>
                <select required className="w-full h-12 md:h-14 px-3 md:px-4 rounded-xl md:rounded-2xl bg-stone-50 border-none font-black text-sm md:text-base focus:ring-4 focus:ring-brand-yellow/30 shadow-inner" value={formData.therapistId} onChange={e => setFormData({...formData, therapistId: e.target.value})}>
                  <option value="">選擇人員</option>
                  {therapists.filter(t => t.category === formCategory).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[9px] md:text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1.5 md:mb-2.5 ml-1 md:ml-2">治療項目 Treatment</label>
                <select required className="w-full h-12 md:h-14 px-3 md:px-4 rounded-xl md:rounded-2xl bg-stone-50 border-none font-black text-sm md:text-base focus:ring-4 focus:ring-brand-yellow/30 shadow-inner" value={formData.treatmentId} onChange={e => setFormData({...formData, treatmentId: e.target.value})} disabled={!formData.therapistId}>
                  <option value="">選擇項目</option>
                  {treatments.filter(tr => tr.category === formCategory).map(tr => <option key={tr.id} value={tr.id}>{tr.name} (${tr.patientPrice})</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[9px] md:text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1.5 md:mb-2.5 ml-1 md:ml-2">備註事項 Notes</label>
              <textarea className="w-full h-20 md:h-24 p-4 md:p-6 rounded-xl md:rounded-2xl bg-stone-50 border-none font-bold text-sm md:text-base outline-none resize-none focus:ring-4 focus:ring-brand-yellow/30 shadow-inner" placeholder="如有特殊需求請在此註記..." value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
            </div>

            <Button type="submit" size="lg" className="w-full h-14 md:h-16 shadow-xl">{editingApt ? "儲存更新排程" : "完成預約登記"}</Button>
         </form>
      </Modal>
    </div>
  );
};
