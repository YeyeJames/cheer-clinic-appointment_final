import { Therapist, Treatment, Appointment, User } from '../types';

// 改為你的 Render 網址 (注意：WebSocket 使用 wss://)
const WS_URL = "wss://cheer-clinic-appointment-final.onrender.com";

let socket: WebSocket | null = null;
let onSyncCallback: ((data: any) => void) | null = null;

export const DataService = {
  // 初始化連線
  init(onSync: (data: any) => void) {
    onSyncCallback = onSync;
    this.connect();
  },

  connect() {
    socket = new WebSocket(WS_URL);

    socket.onopen = () => console.log("Connected to Server");
    
    socket.onmessage = (event) => {
      const payload = JSON.parse(event.data);
      if ((payload.type === "INIT" || payload.type === "SYNC") && onSyncCallback) {
        onSyncCallback(payload.data);
      }
    };

    socket.onclose = () => {
      console.log("Disconnected. Retrying...");
      setTimeout(() => this.connect(), 3000); // 斷線自動重連
    };
  },

  // 當前端資料變動時，呼叫此函數傳送給後端
  sendUpdate(allData: any) {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: "UPDATE", data: allData }));
    }
  },

  // 以下保留 localStorage 作為備份，但主要邏輯將改由 init 驅動
  getTherapists: () => JSON.parse(localStorage.getItem('jiale_therapists') || '[]'),
  getTreatments: () => JSON.parse(localStorage.getItem('jiale_treatments') || '[]'),
  getAppointments: () => JSON.parse(localStorage.getItem('jiale_appointments') || '[]'),
  getUsers: () => JSON.parse(localStorage.getItem('jiale_users') || '[]'),
};
