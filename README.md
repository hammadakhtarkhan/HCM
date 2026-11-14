# HCM Lite — AI-Assisted Human Capital Management
### Saylani Hackathon 2026 · Zaitoon Ashraf IT Park, Karachi

> A complete web-based Human Capital Management system built for Admin, HR, and Employees with 9 operational modules, role-based access control (RBAC), web & camera check-in with GPS geofencing, smart natural language leave requests, automated progressive tax payroll, and a Gemini 2.5 AI assistant powered by real-data tool calling.

---

## 🚀 Live Demo & Submission Links
- **Hosted Project (Live App)**: https://ais-dev-vrwtnatm2zsx72mfmmvgye-775246366337.asia-northeast1.run.app
- **Saylani LMS Submission Portal**: https://lms.saylaniit.com/

---

## 🛠️ Tech Stack
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Motion
- **Backend API**: Node.js, Express, tsx
- **AI Engine**: Google GenAI SDK (`@google/genai` v2.4+), Gemini 2.5 Flash with tool calling, Roman Urdu comprehension, and policy guardrails
- **PDF Generation**: `jspdf` for client-side salary payslip export
- **Location & Geofencing**: Browser Geolocation API + Haversine formula calculation (Zaitoon Ashraf IT Park: 24.8607, 67.0011, 150m radius)

---

## 📋 Features Implemented (25/25 Functionalities + Bonus)

### Core Modules (1 to 9):
1. **M1 Auth & Access**: JWT/token auth, temporary password enforcement on first login, role/scope guards.
2. **M2 Organization Setup**: Shift start 09:00, grace 15m (late after 09:15), half day < 5h, weekend Sat-Sun, office GPS coordinates + radius, departments, designations, public holidays.
3. **M3 Employees**: Employee directory with live search/filters, Employee 360 profile drawer, CSV import with dry-run error report, and CSV export.
4. **M4 Attendance**: Server timestamps, 1 check-in/day (duplicate check-in returns HTTP 409 Conflict), late tracking, attendance correction workflow with HR approval.
5. **M5 Leave**: Working days computation (automatically excludes weekends and public holidays), quotas (Annual 14, Sick 8, Casual 10, Unpaid unlimited), overlap and over-balance checks (HTTP 422), HR approval inbox.
6. **M6 Payroll Lite**: Gross = 1.5 × Basic (HRA 40%, Medical 10%). Prorated daily rate, deductions for absent, unpaid leaves, half-days, and late penalties. Pakistan progressive tax slabs on annual gross. Finalized runs locked by Admin. PDF payslip download.
7. **M7 Dashboards & Analytics**: Role-specific dashboards (Admin, HR, Employee) with headcount, attendance rates, department cost breakdowns, and live audit streams.
8. **M8 AI Assistant**: Real-data tool calling (`get_headcount`, `get_attendance_summary`, `get_late_comers`, `get_leave_summary`, `get_my_leave_balance`, `get_payroll_summary`, `search_employees`), dashboard KPI summary button, Smart Leave natural language parser, colleague salary confidentiality guardrail, and Roman Urdu understanding.
9. **M9 Comms & Audit**: Noticeboard announcements, in-app notifications with unread badge, and tamper-proof security audit log with before/after state diff JSON.

### Bonus (+10 Points):
-  **Camera Attendance with Face Detection + GPS Location**: Live webcam stream with face alignment box and Haversine distance validation against the office coordinates ($\le 150\text{m}$).
-  **Attrition Risk Score**: Computed from exits and probation ratio, displayed on the Admin Dashboard.
-  **Absence Anomaly Flags**: Highlights employees with consecutive unexcused absences or missing checkouts on the HR Dashboard.
-  **Late Penalty Rule**: 3 late marks = 0.5 day salary deduction calculated into payroll.
-  **Roman Urdu Understanding**: AI assistant comprehends and answers queries in Roman Urdu (e.g., *"Mera leave balance kitna hai?"*).
-  **Evaluator Bar**: 1-click role toggles (Admin, HR, Employee), 1-click demo data seed, and instant reset to clean fresh install.

---

## 🏃 How to Run Locally

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd <folder-name>
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup environment variables
Copy the example environment file:
```bash
cp .env.example .env
```
Add your Gemini API key (optional; the app includes an intelligent deterministic fallback if no key is set):
```env
PORT=3000
GEMINI_API_KEY="your-gemini-api-key"
```

### 4. Start the development server
```bash
npm run dev
```
Open **http://localhost:3000** in your browser.

---

## 🔑 Demo Accounts & Credentials

Click **"Seed Demo Data"** in the top Evaluator Bar to load the following accounts:

| Role | Email | Password | Scope |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@saylani.org` | `password123` | Company settings, office geofence, create HR logins, finalize monthly payroll, full audit log |
| **HR Lead** | `hr@saylani.org` | `password123` | Register employees, CSV import/export, approve/reject leaves, run monthly payroll drafts |
| **Employee** | `bilal@saylani.org` | `password123` | Web & Camera Check-In, Smart Leave in plain words, download PDF payslips, personal attendance |

---

## ⏱️ 5-Minute Judging Demo Flow
1. **Fresh Install**: Click **"Clean Fresh Install"** in the top bar to verify the pristine First-Run Setup Wizard.
2. **HR & Employees**: In Settings, create an HR login. As HR, register an employee. The employee logs in, changes their temporary password, and checks in with the camera and GPS geofence.
3. **Smart Leave**: As Employee, type *"Need next Monday and Tuesday off for my sister's wedding"* in the Leave tab. Submit the pre-filled form; HR approves it.
4. **Dashboards & AI**: On HR Dashboard, click **"Summarize"** for live KPI bullets. Ask the AI: *"Who is on leave today?"*. Run the payroll draft; Admin finalizes and locks it.
5. **Payslips & Guardrails**: Employee downloads the PDF payslip and asks the AI for a colleague's salary (access refused). Admin displays the tamper-proof Audit Log.
