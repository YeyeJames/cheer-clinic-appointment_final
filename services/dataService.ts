import { Therapist, Treatment, Appointment, User } from '../types';
import { INITIAL_THERAPISTS, INITIAL_TREATMENTS, MOCK_APPOINTMENTS, INITIAL_USERS } from '../constants';

const KEYS = {
  THERAPISTS: 'jiale_therapists',
  TREATMENTS: 'jiale_treatments',
  APPOINTMENTS: 'jiale_appointments',
  USERS: 'jiale_users',
};

export const DataService = {
  getTherapists: (): Therapist[] => {
    const data = localStorage.getItem(KEYS.THERAPISTS);
    return data ? JSON.parse(data) : INITIAL_THERAPISTS;
  },
  saveTherapists: (data: Therapist[]) => {
    localStorage.setItem(KEYS.THERAPISTS, JSON.stringify(data));
  },

  getTreatments: (): Treatment[] => {
    const data = localStorage.getItem(KEYS.TREATMENTS);
    return data ? JSON.parse(data) : INITIAL_TREATMENTS;
  },
  saveTreatments: (data: Treatment[]) => {
    localStorage.setItem(KEYS.TREATMENTS, JSON.stringify(data));
  },

  getAppointments: (): Appointment[] => {
    const data = localStorage.getItem(KEYS.APPOINTMENTS);
    return data ? JSON.parse(data) : MOCK_APPOINTMENTS;
  },
  saveAppointments: (data: Appointment[]) => {
    localStorage.setItem(KEYS.APPOINTMENTS, JSON.stringify(data));
  },

  getUsers: (): User[] => {
    const data = localStorage.getItem(KEYS.USERS);
    return data ? JSON.parse(data) : INITIAL_USERS;
  },
  saveUsers: (data: User[]) => {
    localStorage.setItem(KEYS.USERS, JSON.stringify(data));
  },
};