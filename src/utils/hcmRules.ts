/**
 * HCM Lite Business Logic & Computation Engine
 * Enforces rules from Section 3 of Saylani Hackathon brief.
 */

import {
  Employee,
  AttendanceRecord,
  LeaveRequest,
  LeaveType,
  PublicHoliday,
  OrgSettings,
  PayrollItem
} from '../types/hcm';

/**
 * Calculates distance in meters between two coordinates via Haversine formula
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Check if a given date string (YYYY-MM-DD) is a weekend day
 */
export function isWeekend(dateStr: string, weekendDays: number[] = [0, 6]): boolean {
  const d = new Date(dateStr + 'T00:00:00');
  const day = d.getDay();
  return weekendDays.includes(day);
}

/**
 * Check if date string is a public holiday
 */
export function isPublicHoliday(dateStr: string, holidays: PublicHoliday[]): boolean {
  return holidays.some(h => h.date === dateStr);
}

/**
 * Calculates working days between start and end date (inclusive)
 * Skips weekends (Sat-Sun) and registered public holidays.
 */
export function calculateWorkingDays(
  startDateStr: string,
  endDateStr: string,
  weekendDays: number[] = [0, 6],
  holidays: PublicHoliday[] = []
): number {
  const start = new Date(startDateStr + 'T00:00:00');
  const end = new Date(endDateStr + 'T00:00:00');

  if (start > end) return 0;

  let count = 0;
  const current = new Date(start);

  while (current <= end) {
    const yyyy = current.getFullYear();
    const mm = String(current.getMonth() + 1).padStart(2, '0');
    const dd = String(current.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;

    const isWk = weekendDays.includes(current.getDay());
    const isHol = holidays.some(h => h.date === dateStr);

    if (!isWk && !isHol) {
      count++;
    }

    current.setDate(current.getDate() + 1);
  }

  return count;
}

/**
 * Get total working days in a month (YYYY-MM)
 */
export function getWorkingDaysInMonth(
  monthStr: string, // "YYYY-MM"
  weekendDays: number[] = [0, 6],
  holidays: PublicHoliday[] = []
): number {
  const [yearStr, mStr] = monthStr.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(mStr, 10); // 1-indexed

  const firstDay = `${yearStr}-${mStr}-01`;
  const lastDateNum = new Date(year, month, 0).getDate();
  const lastDay = `${yearStr}-${mStr}-${String(lastDateNum).padStart(2, '0')}`;

  return calculateWorkingDays(firstDay, lastDay, weekendDays, holidays);
}

/**
 * Attendance evaluation: decides status based on check-in time and hours worked
 */
export function evaluateAttendanceStatus(
  checkInTimeStr: string, // "HH:mm" or "HH:mm:ss"
  checkOutTimeStr?: string,
  settings?: { officeStartTime: string; gracePeriodMinutes: number; halfDayHours: number }
): { status: 'present' | 'late' | 'half_day' | 'missing_checkout'; hoursWorked: number } {
  const officeStart = settings?.officeStartTime || '09:00';
  const graceMinutes = settings?.gracePeriodMinutes ?? 15;
  const halfDayHoursThreshold = settings?.halfDayHours ?? 5;

  const [officeHour, officeMin] = officeStart.split(':').map(Number);
  const graceThresholdMinutes = officeHour * 60 + officeMin + graceMinutes;

  const [ciH, ciM] = checkInTimeStr.split(':').map(Number);
  const checkInMinutes = ciH * 60 + ciM;
  const isLate = checkInMinutes > graceThresholdMinutes;

  if (!checkOutTimeStr) {
    return {
      status: isLate ? 'late' : 'present', // during workday before checkout
      hoursWorked: 0
    };
  }

  const [coH, coM] = checkOutTimeStr.split(':').map(Number);
  const checkOutMinutes = coH * 60 + coM;
  const diffMinutes = Math.max(0, checkOutMinutes - checkInMinutes);
  const hoursWorked = Math.round((diffMinutes / 60) * 10) / 10;

  if (hoursWorked < halfDayHoursThreshold) {
    return { status: 'half_day', hoursWorked };
  }

  return {
    status: isLate ? 'late' : 'present',
    hoursWorked
  };
}

/**
 * Calculates remaining leave balance for an employee for a specific leave type
 */
export function calculateLeaveBalance(
  employeeId: string,
  leaveType: LeaveType,
  allLeaves: LeaveRequest[],
  year: number = new Date().getFullYear()
): { quota: number; used: number; remaining: number } {
  if (leaveType.isUnpaid || leaveType.yearlyQuota < 0) {
    return { quota: 999, used: 0, remaining: 999 };
  }

  // Sum approved leaves for this employee and leave type in this year
  const approvedLeaves = allLeaves.filter(l => {
    if (l.employeeId !== employeeId || l.leaveTypeId !== leaveType.id || l.status !== 'approved') {
      return false;
    }
    const leaveYear = new Date(l.startDate + 'T00:00:00').getFullYear();
    return leaveYear === year;
  });

  const used = approvedLeaves.reduce((acc, cur) => acc + cur.workingDays, 0);
  const remaining = Math.max(0, leaveType.yearlyQuota - used);

  return {
    quota: leaveType.yearlyQuota,
    used,
    remaining
  };
}

/**
 * Checks for date overlap with existing approved or pending leaves
 */
export function hasLeaveOverlap(
  employeeId: string,
  startDateStr: string,
  endDateStr: string,
  existingLeaves: LeaveRequest[],
  excludeLeaveId?: string
): boolean {
  const reqStart = new Date(startDateStr + 'T00:00:00');
  const reqEnd = new Date(endDateStr + 'T00:00:00');

  return existingLeaves.some(l => {
    if (l.employeeId !== employeeId) return false;
    if (excludeLeaveId && l.id === excludeLeaveId) return false;
    if (l.status === 'rejected' || l.status === 'cancelled') return false;

    const existStart = new Date(l.startDate + 'T00:00:00');
    const existEnd = new Date(l.endDate + 'T00:00:00');

    // Check overlap: start <= existEnd && end >= existStart
    return reqStart <= existEnd && reqEnd >= existStart;
  });
}

/**
 * Progressive Annual Tax calculation on Gross * 12
 * Tax slabs from Section 3:
 * 0 to 600,000: 0%
 * 600,001 to 1,200,000: 5% of amount > 600k
 * 1,200,001 to 2,400,000: 30,000 + 15% of amount > 1.2M
 * 2,400,001 to 3,600,000: 210,000 + 25% of amount > 2.4M
 * > 3,600,000: 510,000 + 35% of amount > 3.6M
 */
export function calculateAnnualIncomeTax(annualGross: number): number {
  if (annualGross <= 600000) {
    return 0;
  }
  if (annualGross <= 1200000) {
    return (annualGross - 600000) * 0.05;
  }
  if (annualGross <= 2400000) {
    return 30000 + (annualGross - 1200000) * 0.15;
  }
  if (annualGross <= 3600000) {
    return 210000 + (annualGross - 2400000) * 0.25;
  }
  return 510000 + (annualGross - 3600000) * 0.35;
}

/**
 * Compute Payroll Item for an employee for a specific month
 */
export function computeEmployeePayrollItem(
  employee: Employee,
  departmentName: string,
  designationName: string,
  monthStr: string, // "YYYY-MM"
  records: AttendanceRecord[],
  leaves: LeaveRequest[],
  leaveTypes: LeaveType[],
  settings: OrgSettings,
  holidays: PublicHoliday[]
): PayrollItem {
  const basicSalary = employee.basicSalary;
  const hra = Math.round(basicSalary * 0.4);
  const medical = Math.round(basicSalary * 0.1);
  const grossSalary = basicSalary + hra + medical; // 1.5 * basic

  const totalWorkingDays = getWorkingDaysInMonth(monthStr, settings.weekendDays, holidays) || 22;
  const perDayRate = grossSalary / totalWorkingDays;

  // Filter attendance in month
  const empRecords = records.filter(
    r => r.employeeId === employee.id && r.date.startsWith(monthStr)
  );

  let absentDays = 0;
  let halfDays = 0;
  let lateCount = 0;

  empRecords.forEach(r => {
    if (r.status === 'absent') absentDays++;
    if (r.status === 'half_day') halfDays++;
    if (r.status === 'late') lateCount++;
  });

  // Check unpaid leaves in month
  const unpaidType = leaveTypes.find(t => t.isUnpaid || t.code === 'unpaid');
  let unpaidLeaveDays = 0;
  if (unpaidType) {
    const empUnpaidLeaves = leaves.filter(
      l =>
        l.employeeId === employee.id &&
        l.leaveTypeId === unpaidType.id &&
        l.status === 'approved' &&
        (l.startDate.startsWith(monthStr) || l.endDate.startsWith(monthStr))
    );
    unpaidLeaveDays = empUnpaidLeaves.reduce((sum, l) => sum + l.workingDays, 0);
  }

  // Bonus rule: 3 lates = 0.5 day deduction
  let penaltyDays = 0;
  if (settings.latePenaltyEnabled) {
    penaltyDays = Math.floor(lateCount / 3) * 0.5;
  }

  const totalDeductedDays = absentDays + unpaidLeaveDays + 0.5 * halfDays + penaltyDays;
  const deductionAmount = Math.round(totalDeductedDays * perDayRate);

  const annualGross = grossSalary * 12;
  const annualTax = Math.round(calculateAnnualIncomeTax(annualGross));
  const monthlyTax = Math.round(annualTax / 12);

  const netSalary = Math.max(0, grossSalary - deductionAmount - monthlyTax);

  return {
    employeeId: employee.id,
    employeeCode: employee.employeeCode,
    employeeName: employee.fullName || `${employee.firstName} ${employee.lastName}`,
    departmentName,
    designationName,
    basicSalary,
    hra,
    medical,
    grossSalary,
    workingDaysInMonth: totalWorkingDays,
    absentDays,
    unpaidLeaveDays,
    halfDays,
    lateCount,
    penaltyDays,
    deductionAmount,
    annualGross,
    annualTax,
    monthlyTax,
    netSalary
  };
}
