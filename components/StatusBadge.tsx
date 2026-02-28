
import React from 'react';
import { AppointmentStatus } from '../types';

interface StatusBadgeProps {
  status: AppointmentStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const styles = {
    'scheduled': 'bg-amber-50 text-amber-700 ring-amber-200/50',
    'checked-in': 'bg-yellow-50 text-yellow-800 ring-yellow-200/50',
    'completed': 'bg-emerald-50 text-emerald-700 ring-emerald-200/50',
    'cancelled': 'bg-stone-100 text-stone-500 ring-stone-200/50',
    'noshow': 'bg-red-50 text-red-700 ring-red-200/50',
  };

  const labels = {
    'scheduled': '預約中',
    'checked-in': '已報到',
    'completed': '已報到繳費',
    'cancelled': '已取消',
    'noshow': '缺席',
  };

  return (
    <span className={`inline-flex items-center rounded-2xl px-4 py-1.5 text-xs font-black uppercase tracking-widest ring-1 ring-inset ${styles[status]}`}>
      {labels[status]}
    </span>
  );
};
