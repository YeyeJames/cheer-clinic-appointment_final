export type ViewState = 'schedule' | 'settings' | 'reports';

export type Category = '心理' | '職能' | 'rTMS';

// 使用者身分定義：管理者、櫃檯人員、治療師
export type UserRole = 'admin' | 'counter' | 'therapist';

export interface Therapist {
  id: string;
  name: string;
  category: Category;
}

export interface Treatment {
  id: string;
  name: string;
  patientPrice: number;
  therapistFee: number;
  durationMinutes: number;
  category: Category;
  isGroupTherapy: boolean; // 是否為團體治療
}

export type AppointmentStatus = 'scheduled' | 'checked-in' | 'completed' | 'cancelled' | 'noshow';

export interface Appointment {
  id: string;
  patientName: string;
  patientPhone: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  therapistId: string;
  treatmentId: string;
  status: AppointmentStatus;
  patientPrice: number;
  therapistFee: number;
  paidAmount: number;
  isPaid: boolean;
  notes?: string;
  treatmentRoom?: string;
  createdAt: number;
}

export interface User {
  id: string;
  username: string;
  password: string;
  name: string;      // 顯示於介面上的名稱（如：王小明）
  role: UserRole;    // 詳細的權限分類
}
