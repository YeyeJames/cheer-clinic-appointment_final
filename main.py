import sqlite3
import customtkinter as ctk
from tkinter import messagebox
from datetime import datetime, timedelta

# --- 資料庫邏輯 ---
class Database:
    def __init__(self, db_name="jiale_clinic.db"):
        self.conn = sqlite3.connect(db_name)
        self.cursor = self.conn.cursor()
        self.create_tables()
        self.init_default_data()

    def create_tables(self):
        # 使用者
        self.cursor.execute('''CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT,
            name TEXT,
            role TEXT)''')
        # 治療師
        self.cursor.execute('''CREATE TABLE IF NOT EXISTS therapists (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            commission_rate REAL)''')
        # 治療項目
        self.cursor.execute('''CREATE TABLE IF NOT EXISTS treatments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            price REAL,
            duration INTEGER)''')
        # 預約排程
        self.cursor.execute('''CREATE TABLE IF NOT EXISTS appointments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_name TEXT,
            patient_phone TEXT,
            date TEXT,
            time TEXT,
            therapist_id INTEGER,
            treatment_id INTEGER,
            status TEXT,
            price REAL,
            paid_amount REAL,
            is_paid INTEGER)''')
        self.conn.commit()

    def init_default_data(self):
        # 初始帳號
        users = [
            ('jiale', 'jiale', '管理員', 'admin'),
            ('staff', 'staff', '櫃檯人員', 'staff')
        ]
        self.cursor.executemany('INSERT OR IGNORE INTO users (username, password, name, role) VALUES (?, ?, ?, ?)', users)
        
        # 初始治療項目
        if not self.cursor.execute('SELECT id FROM treatments').fetchone():
            treatments = [('徒手治療', 1200, 30), ('震波治療', 2000, 20), ('一般復健', 200, 60)]
            self.cursor.executemany('INSERT INTO treatments (name, price, duration) VALUES (?, ?, ?)', treatments)
        
        self.conn.commit()

# --- UI 元件與主程式 ---
class JialeApp(ctk.CTk):
    def __init__(self):
        super().__init__()
        self.title("佳樂診所治療排程預約系統")
        self.geometry("1100x700")
        ctk.set_appearance_mode("light")
        ctk.set_default_color_theme("blue")
        
        self.db = Database()
        self.current_user = None
        self.selected_date = datetime.now().strftime("%Y-%m-%d")
        
        self.show_login()

    def clear_screen(self):
        for widget in self.winfo_children():
            widget.destroy()

    # --- 登入介面 ---
    def show_login(self):
        self.clear_screen()
        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(0, weight=1)

        login_frame = ctk.CTkFrame(self, width=400, height=500, corner_radius=20)
        login_frame.grid(row=0, column=0, padx=20, pady=20)

        ctk.CTkLabel(login_frame, text="佳樂診所", font=("Inter", 32, "bold"), text_color="#0D9488").pack(pady=(40, 5))
        ctk.CTkLabel(login_frame, text="系統登入", font=("Inter", 16)).pack(pady=(0, 30))

        self.username_entry = ctk.CTkEntry(login_frame, width=300, placeholder_text="帳號", height=45)
        self.username_entry.pack(pady=10)

        self.password_entry = ctk.CTkEntry(login_frame, width=300, placeholder_text="密碼", show="*", height=45)
        self.password_entry.pack(pady=10)

        self.login_btn = ctk.CTkButton(login_frame, text="登入", width=300, height=45, corner_radius=8, 
                                      fg_color="#0D9488", hover_color="#0F766E", command=self.login_logic)
        self.login_btn.pack(pady=30)

    def login_logic(self):
        u = self.username_entry.get()
        p = self.password_entry.get()
        user = self.db.cursor.execute('SELECT * FROM users WHERE username=? AND password=?', (u, p)).fetchone()
        if user:
            self.current_user = {"id": user[0], "username": user[1], "name": user[3], "role": user[4]}
            self.show_dashboard()
        else:
            messagebox.showerror("登入失敗", "帳號或密碼錯誤")

    # --- 主面板 ---
    def show_dashboard(self):
        self.clear_screen()
        self.grid_columnconfigure(1, weight=1)
        self.grid_rowconfigure(0, weight=1)

        # 側邊欄
        sidebar = ctk.CTkFrame(self, width=220, corner_radius=0, fg_color="#1E293B")
        sidebar.grid(row=0, column=0, sticky="nsew")
        
        ctk.CTkLabel(sidebar, text="Jiale Clinic", font=("Inter", 20, "bold"), text_color="white").pack(pady=30)

        nav_btns = [("預約排程", self.show_schedule)]
        if self.current_user["role"] == "admin":
            nav_btns.append(("基本資料設定", self.show_settings))

        for text, cmd in nav_btns:
            btn = ctk.CTkButton(sidebar, text=text, fg_color="transparent", text_color="#94A3B8", 
                               hover_color="#334155", anchor="w", height=40, font=("Inter", 14), command=cmd)
            btn.pack(fill="x", padx=10, pady=5)

        # 底部登出
        ctk.CTkLabel(sidebar, text=f"Hi, {self.current_user['name']}", text_color="#94A3B8", font=("Inter", 12)).pack(side="bottom", pady=(10, 5))
        ctk.CTkButton(sidebar, text="登出", fg_color="#334155", height=30, command=self.show_login).pack(side="bottom", padx=20, pady=20)

        # 內容區容器
        self.content_frame = ctk.CTkFrame(self, fg_color="#F8FAFC", corner_radius=0)
        self.content_frame.grid(row=0, column=1, sticky="nsew")
        self.show_schedule()

    # --- 預約排程頁面 ---
    def show_schedule(self):
        for w in self.content_frame.winfo_children(): w.destroy()
        
        # Header
        header = ctk.CTkFrame(self.content_frame, fg_color="white", height=70, corner_radius=0)
        header.pack(fill="x", pady=(0, 20))
        
        date_label = ctk.CTkLabel(header, text=f"📅 {self.selected_date}", font=("Inter", 18, "bold"))
        date_label.pack(side="left", padx=20)

        ctk.CTkButton(header, text="+ 新增預約", fg_color="#0D9488", width=120, command=self.add_apt_dialog).pack(side="right", padx=20)

        # 統計資訊
        stats_box = ctk.CTkFrame(self.content_frame, fg_color="transparent")
        stats_box.pack(fill="x", padx=20)
        
        # 撈取當日統計
        apts = self.db.cursor.execute('SELECT count(*), sum(paid_amount) FROM appointments WHERE date=?', (self.selected_date,)).fetchone()
        count = apts[0] if apts else 0
        revenue = apts[1] if apts[1] else 0

        self.create_stat_card(stats_box, "今日預約", f"{count} 位", 0)
        self.create_stat_card(stats_box, "今日營收", f"${int(revenue)}", 1)

        # 預約列表 (Scrollable)
        self.apt_list = ctk.CTkScrollableFrame(self.content_frame, fg_color="white", corner_radius=10)
        self.apt_list.pack(fill="both", expand=True, padx=20, pady=20)
        self.refresh_apt_list()

    def create_stat_card(self, master, title, val, col):
        card = ctk.CTkFrame(master, fg_color="white", width=250, height=80, corner_radius=12)
        card.grid(row=0, column=col, padx=10, pady=10)
        ctk.CTkLabel(card, text=title, font=("Inter", 12), text_color="#64748B").place(x=15, y=15)
        ctk.CTkLabel(card, text=val, font=("Inter", 24, "bold")).place(x=15, y=35)

    def refresh_apt_list(self):
        for w in self.apt_list.winfo_children(): w.destroy()
        
        query = '''SELECT a.id, a.time, a.patient_name, t.name, tr.name, a.price, a.status, a.is_paid 
                   FROM appointments a
                   JOIN therapists t ON a.therapist_id = t.id
                   JOIN treatments tr ON a.treatment_id = tr.id
                   WHERE a.date=? ORDER BY a.time ASC'''
        rows = self.db.cursor.execute(query, (self.selected_date,)).fetchall()

        for r in rows:
            item = ctk.CTkFrame(self.apt_list, fg_color="#F1F5F9", height=60, corner_radius=8)
            item.pack(fill="x", pady=5, padx=5)
            
            ctk.CTkLabel(item, text=r[1], font=("Inter", 14, "bold"), width=60).pack(side="left", padx=10)
            ctk.CTkLabel(item, text=f"{r[2]} | {r[4]}", anchor="w").pack(side="left", padx=10, expand=True, fill="x")
            
            status_color = "#EAB308" if r[6] == "scheduled" else "#22C55E"
            ctk.CTkLabel(item, text=r[6].upper(), text_color=status_color, font=("Inter", 10, "bold")).pack(side="left", padx=10)
            
            # Action Buttons Container
            btn_frame = ctk.CTkFrame(item, fg_color="transparent")
            btn_frame.pack(side="right", padx=10)

            if r[6] == "scheduled":
                ctk.CTkButton(btn_frame, text="報到繳費", width=80, height=28, fg_color="#0D9488", 
                             command=lambda id=r[0], p=r[5]: self.check_in_pay(id, p)).pack(side="left", padx=2)
            else:
                # Add Reset Button for non-scheduled items
                ctk.CTkButton(btn_frame, text="重設", width=60, height=28, fg_color="#64748B",
                             command=lambda id=r[0], name=r[2]: self.reset_apt(id, name)).pack(side="left", padx=2)
            
            # Delete Button
            ctk.CTkButton(btn_frame, text="刪除", width=50, height=28, fg_color="#EF4444", hover_color="#DC2626",
                         command=lambda id=r[0]: self.delete_apt(id)).pack(side="left", padx=2)

    def check_in_pay(self, apt_id, price):
        if messagebox.askyesno("確認繳費", f"確認收費 ${int(price)} 並辦理報到？"):
            self.db.cursor.execute('UPDATE appointments SET status="checked-in", is_paid=1, paid_amount=? WHERE id=?', (price, apt_id))
            self.db.conn.commit()
            self.show_schedule()

    def reset_apt(self, apt_id, name):
        if messagebox.askyesno("確認重設", f"確定將 {name} 的狀態重設回預約中？"):
            self.db.cursor.execute('UPDATE appointments SET status="scheduled", is_paid=0, paid_amount=0 WHERE id=?', (apt_id,))
            self.db.conn.commit()
            self.show_schedule()

    def delete_apt(self, apt_id):
        if messagebox.askyesno("確定刪除", "確定要永久刪除此筆預約資料嗎？"):
            self.db.cursor.execute('DELETE FROM appointments WHERE id=?', (apt_id,))
            self.db.conn.commit()
            self.show_schedule()

    # --- 新增預約彈窗 ---
    def add_apt_dialog(self):
        dialog = ctk.CTkToplevel(self)
        dialog.title("新增預約")
        dialog.geometry("400x500")
        dialog.attributes("-topmost", True)

        ctk.CTkLabel(dialog, text="病人姓名").pack(pady=(20, 0))
        name_entry = ctk.CTkEntry(dialog, width=300)
        name_entry.pack()

        ctk.CTkLabel(dialog, text="時間 (HH:MM)").pack(pady=(10, 0))
        time_entry = ctk.CTkEntry(dialog, width=300)
        time_entry.insert(0, "09:00")
        time_entry.pack()

        # 治療師選單
        therapists = self.db.cursor.execute('SELECT id, name FROM therapists').fetchall()
        t_names = [f"{x[1]} ({x[0]})" for x in therapists]
        ctk.CTkLabel(dialog, text="治療師").pack(pady=(10, 0))
        t_combo = ctk.CTkComboBox(dialog, values=t_names, width=300)
        t_combo.pack()

        # 治療項目選單
        treatments = self.db.cursor.execute('SELECT id, name, price FROM treatments').fetchall()
        tr_names = [f"{x[1]} - ${int(x[2])} ({x[0]})" for x in treatments]
        ctk.CTkLabel(dialog, text="治療項目").pack(pady=(10, 0))
        tr_combo = ctk.CTkComboBox(dialog, values=tr_names, width=300)
        tr_combo.pack()

        def save():
            t_val = t_combo.get()
            tr_val = tr_combo.get()
            if not t_val or not tr_val:
                messagebox.showwarning("欄位缺失", "請選擇治療師與項目")
                return

            t_id = t_val.split('(')[-1].replace(')', '')
            tr_id = tr_val.split('(')[-1].replace(')', '')
            
            price_row = self.db.cursor.execute('SELECT price FROM treatments WHERE id=?', (tr_id,)).fetchone()
            price = price_row[0] if price_row else 0
            
            self.db.cursor.execute('''INSERT INTO appointments 
                (patient_name, patient_phone, date, time, therapist_id, treatment_id, status, price, paid_amount, is_paid)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
                (name_entry.get(), "", self.selected_date, time_entry.get(), t_id, tr_id, "scheduled", price, 0, 0))
            self.db.conn.commit()
            dialog.destroy()
            self.show_schedule()

        ctk.CTkButton(dialog, text="確認建立", command=save, fg_color="#0D9488").pack(pady=30)

    # --- 設定頁面 (Admin Only) ---
    def show_settings(self):
        for w in self.content_frame.winfo_children(): w.destroy()
        ctk.CTkLabel(self.content_frame, text="系統管理設定", font=("Inter", 24, "bold")).pack(pady=20)
        
        tabview = ctk.CTkTabview(self.content_frame, width=800)
        tabview.pack(padx=20, pady=10, fill="both", expand=True)
        tabview.add("治療師管理")
        tabview.add("帳號管理")

        # 治療師管理簡化版
        t_frame = tabview.tab("治療師管理")
        ctk.CTkLabel(t_frame, text="目前治療師列表:").pack(anchor="w", padx=20)
        t_list = self.db.cursor.execute('SELECT name, commission_rate FROM therapists').fetchall()
        for t in t_list:
            ctk.CTkLabel(t_frame, text=f"• {t[0]} (抽成: {int(t[1])}%)").pack(anchor="w", padx=40)
            
        def add_t():
            n = ctk.CTkInputDialog(text="輸入治療師姓名:", title="新增").get_input()
            if n:
                self.db.cursor.execute('INSERT INTO therapists (name, commission_rate) VALUES (?, ?)', (n, 30))
                self.db.conn.commit()
                self.show_settings()
        
        ctk.CTkButton(t_frame, text="新增治療師", command=add_t).pack(pady=20)

if __name__ == "__main__":
    app = JialeApp()
    app.mainloop()