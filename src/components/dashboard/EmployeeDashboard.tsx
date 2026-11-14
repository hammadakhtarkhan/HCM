import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ApiClient } from '../../services/api';
import {
  Clock,
  Calendar,
  DollarSign,
  CalendarCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface EmployeeDashboardProps {
  onNavigate: (tab: string) => void;
  onOpenAIChat: () => void;
}

export const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({ onNavigate, onOpenAIChat }) => {
  const { user, employee } = useAuth();
  const [attendanceToday, setAttendanceToday] = useState<any>(null);
  const [leaveBalances, setLeaveBalances] = useState<any[]>([]);
  const [payrollHistory, setPayrollHistory] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [weekHours, setWeekHours] = useState<number>(0);
  const [lateCount, setLateCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      const month = today.substring(0, 7);

      const [attList, balances, payrolls, anns] = await Promise.all([
        ApiClient.getAttendance({ month, employeeId: employee?.id }),
        ApiClient.getLeaveBalances(employee?.id),
        ApiClient.getPayrollRuns().catch(() => []),
        ApiClient.getAnnouncements().catch(() => [])
      ]);

      const todayRecord = attList.find((a: any) => a.date === today);
      setAttendanceToday(todayRecord || null);

      let hours = 0;
      let lates = 0;
      attList.forEach((a: any) => {
        hours += a.hoursWorked || 0;
        if (a.status === 'late') lates++;
      });

      setWeekHours(Math.round(hours * 10) / 10);
      setLateCount(lates);
      setLeaveBalances(balances || []);
      setPayrollHistory(payrolls || []);
      setAnnouncements(anns || []);
    } catch (err) {
      console.error('Failed to load employee dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [employee]);

  const lastPayslip = payrollHistory.length > 0 ? payrollHistory[0] : null;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-medium text-indigo-300">Employee Self-Service Portal</div>
          <h1 className="text-xl font-bold tracking-tight mt-1">
            Welcome back, {employee?.fullName || user?.name}!
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            ID: <span className="font-mono">{employee?.employeeCode || 'N/A'}</span> · Office Shift: 09:00 AM (15m grace)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('attendance')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Clock className="w-4 h-4" />
            <span>Mark Attendance</span>
          </button>
          <button
            onClick={onOpenAIChat}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>Ask AI Assistant</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Check-in Status */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Today's Attendance</span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-center gap-2">
            {attendanceToday ? (
              <span className={`text-base font-bold capitalize ${
                attendanceToday.status === 'present' ? 'text-emerald-700' :
                attendanceToday.status === 'late' ? 'text-amber-600' : 'text-slate-800'
              }`}>
                {attendanceToday.status}
              </span>
            ) : (
              <span className="text-base font-semibold text-slate-400">Not Marked Yet</span>
            )}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {attendanceToday?.checkInTime ? `Checked in: ${attendanceToday.checkInTime}` : 'Check in before 09:15'}
          </div>
        </div>

        {/* Hours Logged */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Hours Logged (Month)</span>
            <CalendarCheck className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 text-2xl font-bold tabular-nums text-slate-900">
            {weekHours} <span className="text-xs font-normal text-slate-400">hours</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Based on validated checkouts</div>
        </div>

        {/* Late Count */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Late Count (Month)</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold tabular-nums text-amber-600">
            {lateCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {lateCount >= 3 ? 'Penalty applied (0.5 day/3 lates)' : 'Grace limit: 09:15 AM'}
          </div>
        </div>

        {/* Last Net Payslip */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Last Published Payslip</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-xl font-bold tabular-nums text-slate-900">
            {lastPayslip?.item?.netSalary ? `PKR ${lastPayslip.item.netSalary.toLocaleString()}` : 'Pending Run'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {lastPayslip ? `Month: ${lastPayslip.month}` : 'No finalized cycle yet'}
          </div>
        </div>
      </div>

      {/* Leave Balances Grid & Quick Smart Leave */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leave Balances */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-900">Annual Leave Quotas & Balances</h2>
            <button
              onClick={() => onNavigate('leave')}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              <span>Apply Leave</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {leaveBalances.map((b: any) => (
              <div key={b.leaveTypeId} className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-center">
                <div className="text-xs font-medium text-slate-700 truncate">{b.name}</div>
                <div className="text-2xl font-bold tabular-nums text-slate-900 my-1">
                  {b.remaining}
                </div>
                <div className="text-[10px] text-slate-400">
                  {b.used} used of {b.yearlyQuota === 999 ? '∞' : b.yearlyQuota}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Noticeboard */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col">
          <h2 className="text-sm font-semibold text-slate-900 mb-3">Noticeboard</h2>
          <div className="space-y-3 flex-1 overflow-y-auto max-h-56">
            {announcements.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No announcements</p>
            ) : (
              announcements.slice(0, 3).map((a: any) => (
                <div key={a.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                  <div className="font-semibold text-slate-900">{a.title}</div>
                  <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">{a.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
