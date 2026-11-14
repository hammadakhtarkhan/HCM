/**
 * API Client for Saylani HCM Lite
 * Communicates with /api endpoints
 */

export class ApiClient {
  private static getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('hcm_token');
    }
    return null;
  }

  public static async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {})
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(endpoint, {
      ...options,
      headers
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || `HTTP error ${response.status}`);
    }

    return data;
  }

  // Auth & System
  static getSystemStatus() {
    return this.request('/api/system/status');
  }

  static setupFirstRun(data: any) {
    return this.request('/api/auth/setup', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  static login(email: string) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  }

  static faceLogin(targetEmail?: string) {
    return this.request('/api/auth/face-login', {
      method: 'POST',
      body: JSON.stringify({ faceDetected: true, targetEmail })
    });
  }

  static changePassword(newPassword: string) {
    return this.request('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ newPassword })
    });
  }

  static getMe() {
    return this.request('/api/auth/me');
  }

  static resetFreshInstall() {
    return this.request('/api/system/reset', { method: 'POST' });
  }

  static seedDemoData() {
    return this.request('/api/system/seed', { method: 'POST' });
  }

  // Setup
  static getSetupData() {
    return this.request('/api/setup/data');
  }

  static updateSettings(settings: any) {
    return this.request('/api/setup/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
  }

  static addDepartment(dept: { name: string; code: string }) {
    return this.request('/api/setup/departments', {
      method: 'POST',
      body: JSON.stringify(dept)
    });
  }

  static addDesignation(desig: { name: string; departmentId: string }) {
    return this.request('/api/setup/designations', {
      method: 'POST',
      body: JSON.stringify(desig)
    });
  }

  static addHoliday(holiday: { name: string; date: string }) {
    return this.request('/api/setup/holidays', {
      method: 'POST',
      body: JSON.stringify(holiday)
    });
  }

  // Users
  static getUsers() {
    return this.request('/api/users');
  }

  static createHrUser(data: { email: string; name: string }) {
    return this.request('/api/users/hr', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  static toggleUserStatus(userId: string) {
    return this.request(`/api/users/${userId}/toggle-status`, {
      method: 'PUT'
    });
  }

  // Employees
  static getEmployees(params?: { query?: string; departmentId?: string; status?: string; scoped?: boolean }) {
    const query = new URLSearchParams();
    if (params?.query) query.set('query', params.query);
    if (params?.departmentId) query.set('departmentId', params.departmentId);
    if (params?.status) query.set('status', params.status);
    if (params?.scoped) query.set('scoped', 'true');
    return this.request(`/api/employees?${query.toString()}`);
  }

  static registerEmployee(data: any) {
    return this.request('/api/employees', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  static updateEmployee(id: string, data: any) {
    return this.request(`/api/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  static getEmployee360(id: string) {
    return this.request(`/api/employees/${id}/360`);
  }

  static importEmployeesCsv(csvText: string, dryRun: boolean = true) {
    return this.request('/api/employees/import-csv', {
      method: 'POST',
      body: JSON.stringify({ csvText, dryRun })
    });
  }

  // Attendance
  static checkIn(payload: {
    employeeId?: string;
    source?: 'web' | 'camera';
    lat?: number;
    lng?: number;
    faceDetected?: boolean;
    faceCount?: number;
  }) {
    return this.request('/api/attendance/check-in', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  static checkOut(employeeId?: string) {
    return this.request('/api/attendance/check-out', {
      method: 'POST',
      body: JSON.stringify({ employeeId })
    });
  }

  static getAttendance(params?: { date?: string; month?: string; employeeId?: string }) {
    const query = new URLSearchParams();
    if (params?.date) query.set('date', params.date);
    if (params?.month) query.set('month', params.month);
    if (params?.employeeId) query.set('employeeId', params.employeeId);
    return this.request(`/api/attendance?${query.toString()}`);
  }

  static requestAttendanceCorrection(data: {
    recordId: string;
    requestedCheckIn?: string;
    requestedCheckOut?: string;
    reason: string;
  }) {
    return this.request('/api/attendance/correction/request', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  static reviewAttendanceCorrection(data: {
    recordId: string;
    approve: boolean;
    hrComment?: string;
  }) {
    return this.request('/api/attendance/correction/review', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // Leave
  static getLeaves() {
    return this.request('/api/leave');
  }

  static getLeaveBalances(employeeId?: string) {
    return this.request(`/api/leave/balances/${employeeId || ''}`);
  }

  static applyLeave(data: {
    employeeId?: string;
    leaveTypeId: string;
    startDate: string;
    endDate: string;
    reason: string;
  }) {
    return this.request('/api/leave/apply', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  static cancelLeave(id: string) {
    return this.request(`/api/leave/${id}/cancel`, {
      method: 'POST'
    });
  }

  static reviewLeave(id: string, data: { approve: boolean; hrComment?: string }) {
    return this.request(`/api/leave/${id}/review`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // Payroll
  static getPayrollRuns() {
    return this.request('/api/payroll');
  }

  static runPayrollDraft(month: string) {
    return this.request('/api/payroll/run', {
      method: 'POST',
      body: JSON.stringify({ month })
    });
  }

  static finalizePayroll(month: string) {
    return this.request('/api/payroll/finalize', {
      method: 'POST',
      body: JSON.stringify({ month })
    });
  }

  // Analytics
  static getAnalytics(params?: { departmentId?: string; month?: string }) {
    const query = new URLSearchParams();
    if (params?.departmentId) query.set('departmentId', params.departmentId);
    if (params?.month) query.set('month', params.month);
    return this.request(`/api/analytics?${query.toString()}`);
  }

  // AI
  static chatAI(message: string) {
    return this.request('/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message })
    });
  }

  static summarizeDashboard(payload: any) {
    return this.request('/api/ai/summarize', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  static smartLeave(prompt: string) {
    return this.request('/api/ai/smart-leave', {
      method: 'POST',
      body: JSON.stringify({ prompt })
    });
  }

  // Comms & Audit
  static getAnnouncements() {
    return this.request('/api/announcements');
  }

  static postAnnouncement(data: { title: string; content: string; priority?: 'normal' | 'important' }) {
    return this.request('/api/announcements', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  static getNotifications() {
    return this.request('/api/notifications');
  }

  static markNotificationRead(id: string) {
    return this.request(`/api/notifications/${id}/read`, {
      method: 'PUT'
    });
  }

  static getAuditLogs() {
    return this.request('/api/audit');
  }
}
