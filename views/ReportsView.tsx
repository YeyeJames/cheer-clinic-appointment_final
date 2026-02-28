
import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { Appointment, Therapist, Treatment } from '../types';
import { DollarSign, Calendar as CalendarIcon, Briefcase, FileText, Printer, PieChart, Users, ReceiptText, ChevronDown, ChevronUp, UserCheck, TrendingUp, BarChart, Coffee, Sparkles, ClipboardList, Info, FileSpreadsheet } from 'lucide-react';
import { Button } from '../components/Button';
import { JialeLogo } from '../App';

interface ReportsViewProps {
  appointments: Appointment[];
  therapists: Therapist[];
  treatments: Treatment[];
}

type ReportTab = 'summary' | 'therapist' | 'treatment' | 'payroll';

export const ReportsView: React.FC<ReportsViewProps> = ({ appointments, therapists, treatments }) => {
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [activeTab, setActiveTab] = useState<ReportTab>('summary');
  const [expandedTherapist, setExpandedTherapist] = useState<string | null>(null);

  const monthData = useMemo(() => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const start = new Date(year, month - 1, 1, 0, 0, 0);
    const end = new Date(year, month, 0, 23, 59, 59, 999);
    
    const filtered = appointments.filter(apt => {
      try {
        const [aY, aM, aD] = apt.date.split('-').map(Number);
        const aptDate = new Date(aY, aM - 1, aD);
        return aptDate >= start && aptDate <= end;
      } catch (e) { return false; }
    });

    const completedApts = filtered.filter(apt => apt.status === 'completed');
    const totalRevenue = completedApts.reduce((sum, apt) => sum + (apt.isPaid ? apt.paidAmount : 0), 0);
    const completedCount = completedApts.length;
    const cancelledCount = filtered.filter(apt => apt.status === 'cancelled').length;

    const therapistStats = therapists.map(t => {
      const tApts = completedApts.filter(apt => apt.therapistId === t.id)
        .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
      
      const revenue = tApts.reduce((sum, apt) => sum + (apt.isPaid ? apt.paidAmount : 0), 0);
      const totalCommission = tApts.reduce((sum, apt) => sum + apt.therapistFee, 0);
      
      const details = tApts.map(apt => ({
        id: apt.id,
        date: apt.date,
        time: apt.time,
        patientName: apt.patientName,
        treatmentName: treatments.find(tr => tr.id === apt.treatmentId)?.name || '未知項目',
        patientPaid: apt.isPaid ? apt.paidAmount : 0,
        earnedFee: apt.therapistFee,
        notes: apt.notes || ''
      }));

      return { ...t, count: tApts.length, revenue, commission: totalCommission, details };
    }).filter(t => t.count > 0).sort((a, b) => b.revenue - a.revenue);

    const treatmentStats = treatments.map(tr => {
      const trApts = completedApts.filter(apt => apt.treatmentId === tr.id);
      const revenue = trApts.reduce((sum, apt) => sum + (apt.isPaid ? apt.paidAmount : 0), 0);
      return { ...tr, count: trApts.length, revenue };
    }).filter(tr => tr.count > 0).sort((a, b) => b.revenue - a.revenue);

    return { totalRevenue, totalAppointments: filtered.length, completedCount, cancelledCount, therapistStats, treatmentStats };
  }, [appointments, therapists, treatments, selectedMonth]);

  const toggleTherapist = (id: string) => setExpandedTherapist(expandedTherapist === id ? null : id);

  const handlePrint = () => {
    setActiveTab('payroll');
    setTimeout(() => window.print(), 500);
  };

  const handleExportExcel = () => {
    // CSV with BOM for Excel compatibility
    let csvContent = "\uFEFF";
    csvContent += "治療師,專業類別,日期,時間,個案姓名,治療項目,實收金額,薪資,備註\n";

    monthData.therapistStats.forEach(t => {
        t.details.forEach(d => {
            // Escape values to prevent CSV injection
            const safeNotes = d.notes.replace(/,/g, '，').replace(/\n/g, ' ');
            csvContent += `${t.name},${t.category},${d.date},${d.time},${d.patientName},${d.treatmentName},${d.patientPaid},${d.earnedFee},${safeNotes}\n`;
        });
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `佳樂診所_薪資報表_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Group therapists into pairs for A4 landscape printing
  const therapistPairs = useMemo(() => {
    const pairs = [];
    for (let i = 0; i < monthData.therapistStats.length; i += 2) {
        pairs.push(monthData.therapistStats.slice(i, i + 2));
    }
    return pairs;
  }, [monthData.therapistStats]);

  const hasData = monthData.completedCount > 0;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Top Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-white p-6 md:p-8 rounded-3xl md:rounded-[2.5rem] shadow-xl shadow-stone-200/30 border border-stone-100 print:hidden">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-stone-800 tracking-tight">經營統計報表</h2>
          <p className="text-xs md:text-sm text-brand-orange font-bold uppercase tracking-widest mt-1">{selectedMonth} Financial Audit</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 md:gap-4">
          <div className="flex items-center gap-3 md:gap-4 bg-stone-50 p-3 md:p-4 rounded-xl md:rounded-2xl border-2 border-stone-100 shadow-inner w-full sm:w-auto">
            <CalendarIcon size={20} className="text-brand-orange" strokeWidth={2.5} />
            <input 
              type="month" 
              className="bg-transparent border-none outline-none font-black text-stone-700 text-base md:text-lg w-full" 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="secondary" size="md" disabled={!hasData} onClick={handleExportExcel} icon={<FileSpreadsheet size={20} />} className="flex-1 sm:flex-none py-3 text-xs">匯出</Button>
            <Button variant="primary" size="md" disabled={!hasData} onClick={handlePrint} icon={<Printer size={20} />} className="flex-1 sm:flex-none py-3 text-xs">列印</Button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 print:hidden px-1">
        <TabButton active={activeTab === 'summary'} onClick={() => setActiveTab('summary')} icon={<PieChart size={18}/>}>總覽</TabButton>
        <TabButton active={activeTab === 'therapist'} onClick={() => setActiveTab('therapist')} icon={<Users size={18}/>}>業績</TabButton>
        <TabButton active={activeTab === 'treatment'} onClick={() => setActiveTab('treatment')} icon={<Briefcase size={18}/>}>項目</TabButton>
        <TabButton active={activeTab === 'payroll'} onClick={() => setActiveTab('payroll')} icon={<ReceiptText size={18}/>}>薪資</TabButton>
      </div>

      <div className="bg-white rounded-3xl md:rounded-[3rem] shadow-xl md:shadow-2xl shadow-stone-200/40 border border-stone-100 overflow-hidden print:border-none print:shadow-none print:bg-transparent min-h-[300px] md:min-h-[400px]">
        {!hasData ? (
          <div className="py-20 md:py-32 px-6 md:px-10 text-center flex flex-col items-center justify-center space-y-6 md:space-y-8 animate-in fade-in zoom-in-95 duration-700">
             <div className="relative">
                <div className="w-32 h-32 md:w-40 md:h-40 bg-stone-50 rounded-[2.5rem] md:rounded-[3rem] shadow-inner flex items-center justify-center text-stone-300 relative z-10">
                  <BarChart size={60} md:size={80} strokeWidth={1} />
                </div>
                <div className="absolute -top-2 -right-2 md:-top-4 md:-right-4 w-10 h-10 md:w-12 md:h-12 bg-amber-100 rounded-xl md:rounded-2xl flex items-center justify-center text-amber-600 shadow-lg z-20">
                  <Info size={20} md:size={24} />
                </div>
             </div>
             <div className="max-w-md space-y-3 md:space-y-4">
                <h3 className="text-2xl md:text-3xl font-black text-stone-800 tracking-tight">本月尚無完診紀錄</h3>
                <p className="text-stone-400 font-bold text-base md:text-lg leading-relaxed">
                  統計報表僅會計算狀態為「已報到繳費」的預約紀錄。
                </p>
             </div>
          </div>
        ) : (
          <>
            {activeTab === 'summary' && (
              <div className="p-6 md:p-10 space-y-8 md:space-y-10 print:hidden">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                  <SummaryCard title="當月總收入" value={`$${monthData.totalRevenue.toLocaleString()}`} icon={<DollarSign/>} color="amber"/>
                  <SummaryCard title="服務人次" value={`${monthData.completedCount}`} icon={<Users/>} color="stone"/>
                  <SummaryCard title="薪資總支出" value={`$${Math.round(monthData.therapistStats.reduce((s, t) => s + t.commission, 0)).toLocaleString()}`} icon={<UserCheck/>} color="emerald"/>
                  <SummaryCard title="預約取消" value={`${monthData.cancelledCount}`} icon={<FileText/>} color="red"/>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10 mt-6 md:mt-10">
                    <div className="p-6 md:p-10 bg-stone-50/50 rounded-3xl md:rounded-[2.5rem] border border-stone-100">
                        <h4 className="text-lg md:text-xl font-black text-stone-800 mb-6 md:mb-8 flex items-center gap-3">
                            <TrendingUp className="text-brand-orange" size={20} /> 治療師業績排名
                        </h4>
                        <div className="space-y-5 md:space-y-6">
                            {monthData.therapistStats.slice(0, 5).map((t, idx) => (
                                <div key={t.id} className="flex items-center gap-4 md:gap-5">
                                    <span className="w-6 md:w-8 font-black text-stone-300 text-sm">#{idx+1}</span>
                                    <div className="flex-1">
                                        <div className="flex justify-between mb-1.5 md:mb-2">
                                            <span className="font-bold text-stone-700 text-sm md:text-base">{t.name}</span>
                                            <span className="font-black text-stone-800 text-sm md:text-base">${t.revenue.toLocaleString()}</span>
                                        </div>
                                        <div className="w-full bg-white rounded-full h-2.5 md:h-3 overflow-hidden border border-stone-100 shadow-inner">
                                            <div className="bg-brand-orange h-full rounded-full transition-all duration-1000" style={{ width: `${(t.revenue / (monthData.totalRevenue || 1)) * 100}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-6 md:p-10 bg-stone-50/50 rounded-3xl md:rounded-[2.5rem] border border-stone-100">
                        <h4 className="text-lg md:text-xl font-black text-stone-800 mb-6 md:mb-8 flex items-center gap-3">
                            <PieChart className="text-brand-olive" size={20} /> 項目佔比分析
                        </h4>
                        <div className="space-y-5 md:space-y-6">
                            {monthData.treatmentStats.slice(0, 5).map((tr) => (
                                <div key={tr.id}>
                                    <div className="flex justify-between mb-1.5 md:mb-2">
                                        <span className="font-bold text-stone-700 text-sm md:text-base">{tr.name}</span>
                                        <span className="font-black text-stone-800 text-sm md:text-base">{tr.count} 次</span>
                                    </div>
                                    <div className="w-full bg-white rounded-full h-2.5 md:h-3 overflow-hidden border border-stone-100 shadow-inner">
                                        <div className="bg-brand-yellow h-full rounded-full transition-all duration-1000" style={{ width: `${(tr.count / (monthData.completedCount || 1)) * 100}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
              </div>
            )}

            {activeTab === 'therapist' && (
              <div className="p-6 md:p-10 space-y-4 md:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-2 px-2">
                   <h3 className="text-xl md:text-2xl font-black text-stone-800">人員業績明細表</h3>
                   <p className="text-stone-400 font-bold text-xs md:text-sm">點擊人員卡片展開每日明細</p>
                </div>
                {monthData.therapistStats.map(t => (
                  <div key={t.id} className="border-2 border-stone-100 rounded-2xl md:rounded-[2rem] overflow-hidden bg-white hover:border-amber-200 transition-all shadow-sm">
                    <button 
                      onClick={() => toggleTherapist(t.id)}
                      className="w-full p-5 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 text-left"
                    >
                      <div className="flex items-center gap-4 md:gap-6">
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-brand-yellow/20 text-brand-orange rounded-xl md:rounded-2xl flex items-center justify-center font-black text-xl md:text-2xl shadow-inner shrink-0">
                          {t.name[0]}
                        </div>
                        <div>
                          <h4 className="text-xl md:text-2xl font-black text-stone-800">{t.name}</h4>
                          <span className="inline-flex mt-1 px-2.5 py-0.5 bg-stone-100 text-stone-500 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest">{t.category}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 md:gap-16 flex-1">
                        <div className="text-center">
                          <p className="text-[8px] md:text-[10px] font-black text-stone-400 uppercase tracking-widest mb-0.5 md:mb-1">服務人次</p>
                          <p className="text-base md:text-xl font-black text-stone-800">{t.count} 次</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[8px] md:text-[10px] font-black text-stone-400 uppercase tracking-widest mb-0.5 md:mb-1">總收入</p>
                          <p className="text-base md:text-xl font-black text-stone-800">${t.revenue.toLocaleString()}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[8px] md:text-[10px] font-black text-stone-400 uppercase tracking-widest mb-0.5 md:mb-1">應付薪資</p>
                          <p className="text-base md:text-xl font-black text-brand-orange">${t.commission.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex justify-center md:justify-end shrink-0">
                        {expandedTherapist === t.id ? <ChevronUp size={20} className="text-stone-300"/> : <ChevronDown size={20} className="text-stone-300"/>}
                      </div>
                    </button>
                    {expandedTherapist === t.id && (
                      <div className="px-4 md:px-8 pb-4 md:pb-8 animate-in slide-in-from-top-2">
                        <div className="bg-stone-50 rounded-xl md:rounded-2xl overflow-x-auto border border-stone-100 shadow-inner">
                          <table className="w-full text-left min-w-[500px]">
                            <thead className="bg-stone-100/50">
                              <tr>
                                <th className="px-4 md:px-6 py-3 md:py-4 text-[8px] md:text-[10px] font-black text-stone-400 uppercase tracking-widest">日期</th>
                                <th className="px-4 md:px-6 py-3 md:py-4 text-[8px] md:text-[10px] font-black text-stone-400 uppercase tracking-widest">個案</th>
                                <th className="px-4 md:px-6 py-3 md:py-4 text-[8px] md:text-[10px] font-black text-stone-400 uppercase tracking-widest">項目</th>
                                <th className="px-4 md:px-6 py-3 md:py-4 text-right text-[8px] md:text-[10px] font-black text-stone-400 uppercase tracking-widest">實收</th>
                                <th className="px-4 md:px-6 py-3 md:py-4 text-right text-[8px] md:text-[10px] font-black text-amber-600 uppercase tracking-widest">薪資</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                              {t.details.map(d => (
                                <tr key={d.id} className="text-xs md:text-sm font-bold text-stone-600">
                                  <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap">{d.date.split('-').slice(1).join('/')}</td>
                                  <td className="px-4 md:px-6 py-3 md:py-4 text-stone-800">{d.patientName}</td>
                                  <td className="px-4 md:px-6 py-3 md:py-4 truncate max-w-[120px]">{d.treatmentName}</td>
                                  <td className="px-4 md:px-6 py-3 md:py-4 text-right font-black text-stone-400">${d.patientPaid.toLocaleString()}</td>
                                  <td className="px-4 md:px-6 py-3 md:py-4 text-right font-black text-amber-600">${d.earnedFee.toLocaleString()}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'treatment' && (
              <div className="p-6 md:p-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {monthData.treatmentStats.map(tr => (
                    <div key={tr.id} className="p-6 md:p-8 border-2 border-stone-100 rounded-2xl md:rounded-[2rem] bg-stone-50/30 flex flex-col justify-between hover:border-brand-yellow transition-all">
                       <div>
                          <div className="flex justify-between items-start mb-4">
                             <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-lg md:rounded-xl shadow-sm flex items-center justify-center text-brand-olive shrink-0"><Briefcase size={20} md:size={24}/></div>
                             <span className="text-[8px] md:text-[10px] font-black text-stone-400 bg-white px-2 md:px-3 py-1 rounded-full shadow-sm">{tr.category}</span>
                          </div>
                          <h4 className="text-lg md:text-xl font-black text-stone-800 mb-1 md:mb-2">{tr.name}</h4>
                          <p className="text-stone-400 font-bold text-xs md:text-sm">本月共服務 {tr.count} 人次</p>
                       </div>
                       <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-stone-100 flex justify-between items-end">
                          <div>
                             <p className="text-[8px] md:text-[10px] font-black text-stone-300 uppercase tracking-widest">累計營收</p>
                             <p className="text-xl md:text-2xl font-black text-brand-orange">${tr.revenue.toLocaleString()}</p>
                          </div>
                          <div className="text-right">
                             <p className="text-[8px] md:text-[10px] font-black text-stone-300 uppercase tracking-widest">佔比</p>
                             <p className="text-base md:text-lg font-black text-stone-700">{Math.round((tr.revenue / (monthData.totalRevenue || 1)) * 100)}%</p>
                          </div>
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'payroll' && (
                <div className="p-0 bg-transparent">
                    <div className="print-hidden p-6 md:p-12 bg-brand-yellow/10 border-b border-brand-yellow/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h3 className="text-2xl md:text-3xl font-black text-stone-800">薪資單預覽模式</h3>
                            <p className="text-stone-500 font-bold mt-1 md:mt-2 text-sm md:text-base">格式已調整為 A4 橫式雙模，每頁將並排顯示兩位人員的薪資單。</p>
                        </div>
                        <JialeLogo className="w-16 h-16 md:w-20 md:h-20 opacity-30" />
                    </div>
                    
                    <div className="overflow-x-auto p-4 md:p-0">
                      <div className="min-w-[800px] md:min-w-0">
                        {therapistPairs.map((pair, index) => (
                            <div key={index} className="print-page-container">
                                {pair.map(t => (
                                    <div key={t.id} className="salary-slip">
                                        <div className="flex justify-between items-center mb-4 md:mb-6 border-b-[3px] md:border-b-[4px] border-stone-900 pb-3 md:pb-4">
                                            <div className="flex items-center gap-2 md:gap-3">
                                                <JialeLogo className="w-8 h-8 md:w-10 md:h-10" />
                                                <div>
                                                    <h1 className="text-xl md:text-2xl font-black text-stone-900 tracking-tighter mb-0">薪資明細單</h1>
                                                    <p className="text-[10px] md:text-xs font-bold text-brand-orange uppercase tracking-[0.1em]">{selectedMonth}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-between gap-4 mb-4 md:mb-6">
                                            <div>
                                                <p className="text-[8px] md:text-[10px] font-black text-stone-400 uppercase tracking-widest">Therapist</p>
                                                <p className="text-lg md:text-xl font-black text-stone-900">{t.name} <span className="text-brand-orange text-xs md:text-sm ml-1">({t.category})</span></p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[8px] md:text-[10px] font-black text-stone-400 uppercase tracking-widest">Total</p>
                                                <p className="text-xl md:text-2xl font-black text-stone-900 bg-brand-yellow/20 px-2 rounded">${Math.round(t.commission).toLocaleString()}</p>
                                            </div>
                                        </div>

                                        <div className="salary-table-container overflow-hidden">
                                          <table className="w-full text-[10px] md:text-xs">
                                              <thead>
                                                  <tr className="border-y-2 border-stone-900 bg-stone-50">
                                                      <th className="py-1.5 md:py-2 text-left px-1 md:px-2 font-black text-stone-800">日期</th>
                                                      <th className="py-1.5 md:py-2 text-left px-1 md:px-2 font-black text-stone-800">個案</th>
                                                      <th className="py-1.5 md:py-2 text-left px-1 md:px-2 font-black text-stone-800">項目</th>
                                                      <th className="py-1.5 md:py-2 text-right px-1 md:px-2 font-black text-stone-800">金額</th>
                                                  </tr>
                                              </thead>
                                              <tbody className="divide-y divide-stone-200">
                                                  {t.details.map(detail => (
                                                      <tr key={detail.id}>
                                                          <td className="py-1.5 md:py-2 px-1 md:px-2 font-bold text-stone-500 whitespace-nowrap">{detail.date.slice(5)}</td>
                                                          <td className="py-1.5 md:py-2 px-1 md:px-2 font-black text-stone-900">{detail.patientName}</td>
                                                          <td className="py-1.5 md:py-2 px-1 md:px-2 font-bold text-stone-600 truncate max-w-[80px] md:max-w-[100px]">{detail.treatmentName}</td>
                                                          <td className="py-1.5 md:py-2 px-1 md:px-2 text-right font-black text-stone-900">${Math.round(detail.earnedFee).toLocaleString()}</td>
                                                      </tr>
                                                  ))}
                                              </tbody>
                                          </table>
                                        </div>

                                        <div className="grid grid-cols-3 gap-4 md:gap-6 pt-4 md:pt-6 mt-4 md:mt-6 border-t border-stone-100 text-[8px] md:text-[9px]">
                                            <div className="space-y-4 md:space-y-6">
                                                <p className="font-black text-stone-400 uppercase tracking-widest">簽認 Signature</p>
                                                <div className="border-b border-stone-200 h-4 md:h-6 w-full"></div>
                                            </div>
                                            <div className="space-y-4 md:space-y-6">
                                                <p className="font-black text-stone-400 uppercase tracking-widest">主管 Approved</p>
                                                <div className="border-b border-stone-200 h-4 md:h-6 w-full"></div>
                                            </div>
                                            <div className="space-y-1 md:space-y-2 flex flex-col items-center justify-end">
                                                 <div className="text-center font-black text-stone-300 border-2 border-double border-stone-200 p-1 md:p-2 rounded-full w-12 h-12 md:w-16 md:h-16 flex items-center justify-center">佳樂<br/>人事</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                      </div>
                    </div>
                </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, icon, children }: any) => (
  <button 
    onClick={onClick} 
    className={`flex items-center gap-2 md:gap-3 px-4 md:px-8 py-3 md:py-5 rounded-2xl md:rounded-[1.8rem] text-sm md:text-lg font-black transition-all whitespace-nowrap ${active ? 'bg-stone-900 text-white shadow-xl translate-y-[-2px]' : 'bg-white text-stone-400 border-2 border-stone-50 hover:bg-stone-50'}`}
  >
    {React.cloneElement(icon as React.ReactElement<any>, { size: 18, strokeWidth: 3 })} 
    {children}
  </button>
);

const SummaryCard = ({ title, value, icon, color }: any) => {
  const colors: any = { 
    amber: 'bg-brand-orange text-white shadow-brand-orange/20', 
    stone: 'bg-stone-100 text-stone-600 shadow-stone-200/20', 
    emerald: 'bg-emerald-100 text-emerald-700 shadow-emerald-200/20', 
    red: 'bg-red-50 text-red-600 shadow-red-200/20' 
  };
  return (
    <div className="bg-white p-5 md:p-8 rounded-3xl md:rounded-[2.5rem] border border-stone-100 shadow-lg md:shadow-xl flex items-center gap-4 md:gap-6 hover:scale-[1.03] transition-all">
      <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-[1.5rem] flex items-center justify-center ${colors[color]} shadow-lg shrink-0`}>
        {React.cloneElement(icon as React.ReactElement<any>, { size: 24, mdSize: 32, strokeWidth: 2.5 })}
      </div>
      <div>
        <p className="text-[8px] md:text-[10px] font-black text-stone-400 uppercase tracking-widest mb-0.5 md:mb-1">{title}</p>
        <p className="text-xl md:text-2xl font-black text-stone-800 leading-none tracking-tighter">{value}</p>
      </div>
    </div>
  );
};
