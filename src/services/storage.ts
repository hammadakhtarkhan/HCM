/**
 * Local & Server In-Memory Storage Manager for HCM Lite
 * Starts empty by default as required by Saylani Hackathon brief.
 */

import {
  User,
  OrgSettings,
  Department,
  Designation,
  LeaveType,
  PublicHoliday,
  Employee,
  AttendanceRecord,
  LeaveRequest,
  PayrollRun,
  Announcement,
  Notification,
  AuditLog,
  AILog
} from '../types/hcm';

export interface HCMDatabaseState {
  settings: OrgSettings;
  users: User[];
  departments: Department[];
  designations: Designation[];
  leaveTypes: LeaveType[];
  holidays: PublicHoliday[];
  employees: Employee[];
  attendance: AttendanceRecord[];
  leaveRequests: LeaveRequest[];
  payrollRuns: PayrollRun[];
  announcements: Announcement[];
  notifications: Notification[];
  auditLogs: AuditLog[];
  aiLogs: AILog[];
}

const STORAGE_KEY = 'saylani_hcm_lite_db_v1';

export const DEFAULT_EMPTY_STATE: HCMDatabaseState = {
  settings: {
    companyName: '',
    officeStartTime: '09:00',
    gracePeriodMinutes: 15,
    halfDayHours: 5,
    weekendDays: [0, 6], // Sunday = 0, Saturday = 6
    officeLocation: {
      lat: 24.8607,
      lng: 67.0011,
      radiusMeters: 150,
      addressName: 'Zaitoon Ashraf IT Park, Karachi'
    },
    latePenaltyEnabled: true,
    isSetupCompleted: false
  },
  users: [],
  departments: [],
  designations: [],
  leaveTypes: [],
  holidays: [],
  employees: [],
  attendance: [],
  leaveRequests: [],
  payrollRuns: [],
  announcements: [],
  notifications: [],
  auditLogs: [],
  aiLogs: []
};

// Check if running in browser
const isBrowser = typeof window !== 'undefined';

export class StorageService {
  private static memoryState: HCMDatabaseState = DEFAULT_EMPTY_STATE;

  public static getState(): HCMDatabaseState {
    if (isBrowser) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          return JSON.parse(stored);
        }
      } catch (err) {
        console.error('Failed to read from localStorage:', err);
      }
    }
    return this.memoryState;
  }

  public static saveState(state: HCMDatabaseState): void {
    this.memoryState = state;
    if (isBrowser) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (err) {
        console.error('Failed to save to localStorage:', err);
      }
    }
  }

  public static resetToFreshInstall(): HCMDatabaseState {
    const empty = JSON.parse(JSON.stringify(DEFAULT_EMPTY_STATE));
    this.saveState(empty);
    return empty;
  }

  public static seedSaylaniDemoData(): HCMDatabaseState {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = `${currentYear}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const today = `${currentYear}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    const seeded: HCMDatabaseState = {
      settings: {
        companyName: 'Saylani IT Systems',
        officeStartTime: '09:00',
        gracePeriodMinutes: 15,
        halfDayHours: 5,
        weekendDays: [0, 6],
        officeLocation: {
          lat: 24.8607,
          lng: 67.0011,
          radiusMeters: 150,
          addressName: 'Zaitoon Ashraf IT Park, Karachi'
        },
        latePenaltyEnabled: true,
        isSetupCompleted: true
      },
      users: [
        {
          id: 'user-admin',
          email: 'admin@saylani.org',
          name: 'Zia Khan (Admin)',
          role: 'admin',
          mustChangePassword: false,
          isActive: true,
          createdAt: '2026-01-01T08:00:00Z'
        },
        {
          id: 'user-hr',
          email: 'hr@saylani.org',
          name: 'Ayesha Siddiqua (HR Lead)',
          role: 'hr',
          mustChangePassword: false,
          isActive: true,
          createdAt: '2026-01-02T09:00:00Z'
        },
        {
          id: 'user-emp-1',
          email: 'bilal@saylani.org',
          name: 'Bilal Ahmed',
          role: 'employee',
          employeeId: 'emp-1',
          mustChangePassword: false,
          isActive: true,
          createdAt: '2026-01-05T09:00:00Z'
        },
        {
          id: 'user-emp-2',
          email: 'fatima@saylani.org',
          name: 'Fatima Noor',
          role: 'employee',
          employeeId: 'emp-2',
          mustChangePassword: false,
          isActive: true,
          createdAt: '2026-01-05T09:00:00Z'
        },
        {
          id: 'user-emp-3',
          email: 'hamza@saylani.org',
          name: 'Hamza Tariq',
          role: 'employee',
          employeeId: 'emp-3',
          mustChangePassword: false,
          isActive: true,
          createdAt: '2026-01-10T09:00:00Z'
        }
      ],
      departments: [
        { id: 'dept-eng', name: 'Software Engineering', code: 'ENG' },
        { id: 'dept-hr', name: 'People Operations & HR', code: 'HR' },
        { id: 'dept-cloud', name: 'Cloud & DevOps', code: 'CLOUD' },
        { id: 'dept-qa', name: 'Quality Assurance', code: 'QA' }
      ],
      designations: [
        { id: 'desig-1', name: 'Senior Full Stack Engineer', departmentId: 'dept-eng' },
        { id: 'desig-2', name: 'Frontend Developer', departmentId: 'dept-eng' },
        { id: 'desig-3', name: 'HR Operations Specialist', departmentId: 'dept-hr' },
        { id: 'desig-4', name: 'DevOps Architect', departmentId: 'dept-cloud' },
        { id: 'desig-5', name: 'QA Automation Engineer', departmentId: 'dept-qa' }
      ],
      leaveTypes: [
        { id: 'lt-annual', code: 'annual', name: 'Annual Leave', yearlyQuota: 14, isUnpaid: false },
        { id: 'lt-sick', code: 'sick', name: 'Sick Leave', yearlyQuota: 8, isUnpaid: false },
        { id: 'lt-casual', code: 'casual', name: 'Casual Leave', yearlyQuota: 10, isUnpaid: false },
        { id: 'lt-unpaid', code: 'unpaid', name: 'Unpaid Leave', yearlyQuota: 999, isUnpaid: true }
      ],
      holidays: [
        { id: 'h-1', name: 'Pakistan Day', date: `${currentYear}-03-23` },
        { id: 'h-2', name: 'Labor Day', date: `${currentYear}-05-01` },
        { id: 'h-3', name: 'Independence Day', date: `${currentYear}-08-14` },
        { id: 'h-4', name: 'Iqbal Day', date: `${currentYear}-11-09` },
        { id: 'h-5', name: 'Quaid-e-Azam Day', date: `${currentYear}-12-25` }
      ],
      employees: [
        {
          id: 'emp-1',
          employeeCode: 'SIT-101',
          firstName: 'Bilal',
          lastName: 'Ahmed',
          fullName: 'Bilal Ahmed',
          email: 'bilal@saylani.org',
          phone: '+92 300 1234567',
          address: 'Gulshan-e-Iqbal Block 13-D, Karachi',
          departmentId: 'dept-eng',
          designationId: 'desig-1',
          gender: 'male',
          joiningDate: '2025-02-15',
          status: 'active',
          basicSalary: 120000,
          hra: 48000,
          medical: 12000,
          grossSalary: 180000,
          enrolledFace: true
        },
        {
          id: 'emp-2',
          employeeCode: 'SIT-102',
          firstName: 'Fatima',
          lastName: 'Noor',
          fullName: 'Fatima Noor',
          email: 'fatima@saylani.org',
          phone: '+92 321 9876543',
          address: 'North Nazimabad Block H, Karachi',
          departmentId: 'dept-eng',
          designationId: 'desig-2',
          gender: 'female',
          joiningDate: '2025-06-01',
          status: 'active',
          basicSalary: 80000,
          hra: 32000,
          medical: 8000,
          grossSalary: 120000,
          enrolledFace: true
        },
        {
          id: 'emp-3',
          employeeCode: 'SIT-103',
          firstName: 'Hamza',
          lastName: 'Tariq',
          fullName: 'Hamza Tariq',
          email: 'hamza@saylani.org',
          phone: '+92 333 4567890',
          address: 'DHA Phase 6, Karachi',
          departmentId: 'dept-cloud',
          designationId: 'desig-4',
          gender: 'male',
          joiningDate: '2025-09-10',
          status: 'active',
          basicSalary: 150000,
          hra: 60000,
          medical: 15000,
          grossSalary: 225000,
          enrolledFace: false
        }
      ],
      attendance: [
        {
          id: 'att-1',
          employeeId: 'emp-1',
          date: today,
          checkInTime: '08:55:00',
          checkOutTime: '17:30:00',
          status: 'present',
          hoursWorked: 8.5,
          source: 'camera',
          locationCheck: { lat: 24.8607, lng: 67.0011, distanceMeters: 12, withinRadius: true },
          faceDetected: true
        },
        {
          id: 'att-2',
          employeeId: 'emp-2',
          date: today,
          checkInTime: '09:25:00',
          checkOutTime: '17:40:00',
          status: 'late',
          hoursWorked: 8.2,
          source: 'web'
        },
        {
          id: 'att-3',
          employeeId: 'emp-3',
          date: today,
          status: 'on_leave',
          hoursWorked: 0,
          source: 'web'
        }
      ],
      leaveRequests: [
        {
          id: 'leave-1',
          employeeId: 'emp-3',
          leaveTypeId: 'lt-casual',
          startDate: today,
          endDate: today,
          workingDays: 1,
          reason: 'Family urgent errand',
          status: 'approved',
          hrComment: 'Approved by HR Lead',
          appliedAt: '2026-10-23T10:00:00Z',
          reviewedAt: '2026-10-23T14:00:00Z',
          reviewedBy: 'user-hr'
        },
        {
          id: 'leave-2',
          employeeId: 'emp-1',
          leaveTypeId: 'lt-sick',
          startDate: '2026-09-15',
          endDate: '2026-09-16',
          workingDays: 2,
          reason: 'Viral fever rest',
          status: 'approved',
          hrComment: 'Approved with medical slip',
          appliedAt: '2026-09-15T08:00:00Z',
          reviewedAt: '2026-09-15T09:00:00Z',
          reviewedBy: 'user-hr'
        }
      ],
      payrollRuns: [],
      announcements: [
        {
          id: 'ann-1',
          title: 'Welcome to Saylani Hackathon 2026',
          content: 'HCM Lite is live! Please ensure daily check-in before 09:15 to avoid late marks.',
          authorName: 'Ayesha Siddiqua',
          authorRole: 'hr',
          createdAt: new Date().toISOString(),
          priority: 'important'
        }
      ],
      notifications: [
        {
          id: 'notif-1',
          userId: 'user-emp-3',
          title: 'Leave Approved',
          message: 'Your casual leave request for today has been approved by HR.',
          createdAt: new Date().toISOString(),
          read: false,
          type: 'leave'
        }
      ],
      auditLogs: [
        {
          id: 'audit-1',
          timestamp: new Date().toISOString(),
          actorEmail: 'admin@saylani.org',
          actorRole: 'admin',
          action: 'create',
          entity: 'company',
          details: 'Initialized company profile and office coordinates'
        }
      ],
      aiLogs: []
    };

    this.saveState(seeded);
    return seeded;
  }
}
