/**
 * Saylani Hackathon HCM Lite
 * Types & Data Models across 9 Modules
 */

export type UserRole = 'admin' | 'hr' | 'employee';

export interface User {
  id: string;
  email: string;
  passwordHash?: string; // in a real app or simulated
  role: UserRole;
  employeeId?: string; // associated employee record if role is employee
  name: string;
  mustChangePassword: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface OrgSettings {
  companyName: string;
  officeStartTime: string; // e.g. "09:00"
  gracePeriodMinutes: number; // e.g. 15 -> late after 09:15
  halfDayHours: number; // e.g. 5
  weekendDays: number[]; // e.g. [0, 6] for Sun, Sat
  officeLocation: {
    lat: number;
    lng: number;
    radiusMeters: number; // e.g. 150
    addressName: string;
  };
  latePenaltyEnabled: boolean; // bonus: 3 lates = 0.5 day deduction
  isSetupCompleted: boolean;
}

export interface Department {
  id: string;
  name: string;
  code: string;
}

export interface Designation {
  id: string;
  name: string;
  departmentId: string;
}

export interface LeaveType {
  id: string;
  code: string; // 'annual', 'sick', 'casual', 'unpaid'
  name: string;
  yearlyQuota: number; // 14 for annual, 8 for sick, 10 for casual, -1 or 999 for unpaid
  isUnpaid: boolean;
}

export interface PublicHoliday {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
}

export interface Employee {
  id: string;
  employeeCode: string; // unique
  firstName: string;
  lastName: string;
  fullName: string;
  email: string; // unique
  phone: string;
  address: string;
  departmentId: string;
  designationId: string;
  gender: 'male' | 'female' | 'other';
  joiningDate: string; // YYYY-MM-DD
  exitDate?: string | null;
  status: 'active' | 'probation' | 'resigned' | 'terminated';
  basicSalary: number;
  hra: number; // 40% of basic
  medical: number; // 10% of basic
  grossSalary: number; // 1.5 * basic
  enrolledFace?: boolean;
}

export type AttendanceStatus =
  | 'present'
  | 'late'
  | 'half_day'
  | 'absent'
  | 'missing_checkout'
  | 'on_leave';

export interface AttendanceCorrection {
  requestedCheckIn?: string;
  requestedCheckOut?: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  hrComment?: string;
  requestedAt: string;
  reviewedAt?: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  checkInTime?: string; // HH:mm:ss
  checkOutTime?: string; // HH:mm:ss
  status: AttendanceStatus;
  hoursWorked: number;
  source: 'web' | 'camera';
  locationCheck?: {
    lat: number;
    lng: number;
    distanceMeters: number;
    withinRadius: boolean;
  };
  faceDetected?: boolean;
  correction?: AttendanceCorrection;
}

export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  leaveTypeId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  workingDays: number;
  reason: string;
  status: LeaveStatus;
  hrComment?: string;
  appliedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface PayrollItem {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  departmentName: string;
  designationName: string;
  basicSalary: number;
  hra: number;
  medical: number;
  grossSalary: number;
  workingDaysInMonth: number;
  absentDays: number;
  unpaidLeaveDays: number;
  halfDays: number;
  lateCount: number;
  penaltyDays: number; // e.g. 3 lates = 0.5 day
  deductionAmount: number;
  annualGross: number;
  annualTax: number;
  monthlyTax: number;
  netSalary: number;
}

export interface PayrollRun {
  id: string;
  month: string; // YYYY-MM
  status: 'draft' | 'finalized';
  finalizedBy?: string;
  finalizedAt?: string;
  totalEmployees: number;
  totalGross: number;
  totalDeductions: number;
  totalTax: number;
  totalNet: number;
  items: PayrollItem[];
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  authorName: string;
  authorRole: UserRole;
  createdAt: string;
  priority: 'normal' | 'important';
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  type: 'leave' | 'attendance' | 'payroll' | 'system';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorEmail: string;
  actorRole: UserRole;
  action: 'create' | 'update' | 'approve' | 'reject' | 'finalize' | 'delete' | 'login';
  entity: 'company' | 'user' | 'employee' | 'attendance' | 'leave' | 'payroll' | 'settings';
  entityId?: string;
  details: string;
  beforeJSON?: string;
  afterJSON?: string;
}

export interface AILog {
  id: string;
  timestamp: string;
  actorEmail: string;
  actorRole: UserRole;
  query: string;
  toolsUsed: string[];
  response: string;
}

export interface AuthSession {
  token: string;
  user: User;
}
