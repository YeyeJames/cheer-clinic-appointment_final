
import { Therapist, Treatment, Appointment, User } from './types';

export const INITIAL_THERAPISTS: Therapist[] = [
  { id: 't1', name: '陳心理師', category: '心理' },
  { id: 't2', name: '林物理治療師', category: '職能' },
  { id: 't3', name: '王職能治療師', category: '職能' },
  { id: 't_rtms', name: '執行醫師', category: 'rTMS' },
];

export const INITIAL_TREATMENTS: Treatment[] = [
  { id: 'tr1', name: '個別心理治療', patientPrice: 1600, therapistFee: 800, durationMinutes: 50, category: '心理', isGroupTherapy: false },
  { id: 'tr_group_psy', name: '社交技巧訓練(團體)', patientPrice: 800, therapistFee: 400, durationMinutes: 60, category: '心理', isGroupTherapy: true },
  { id: 'tr2', name: '精細動作訓練', patientPrice: 800, therapistFee: 400, durationMinutes: 30, category: '職能', isGroupTherapy: false },
  { id: 'tr_group_ot', name: '專注力訓練團體', patientPrice: 600, therapistFee: 300, durationMinutes: 45, category: '職能', isGroupTherapy: true },
  { id: 'tr_rtms', name: 'rTMS 療程', patientPrice: 3500, therapistFee: 0, durationMinutes: 30, category: 'rTMS', isGroupTherapy: false },
];

export const INITIAL_USERS: User[] = [
  { id: 'u1', username: 'jiale', password: 'jiale', name: '管理員', role: 'admin' },
  { id: 'u2', username: 'staff', password: 'staff', name: '櫃檯人員', role: 'staff' },
];

const today = new Date().toISOString().split('T')[0];

export const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: 'a1',
    patientName: '測試個案',
    patientPhone: '',
    date: today,
    time: '09:00',
    therapistId: 't1',
    treatmentId: 'tr1',
    status: 'scheduled',
    patientPrice: 1600,
    therapistFee: 800,
    paidAmount: 0,
    isPaid: false,
    createdAt: Date.now(),
  }
];
