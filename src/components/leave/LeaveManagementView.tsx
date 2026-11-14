import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ApiClient } from '../../services/api';
import {
  Calendar,
  Sparkles,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  X,
  AlertCircle,
  Check
} from 'lucide-react';

export const LeaveManagementView: React.FC = () => {
  const { user, employee } = useAuth();
  const [leaves, setLeaves] = useState<any[]>([]);
  const [balances, setBalances] = useState<any[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Apply Modal
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedLeaveTypeId, setSelectedLeaveTypeId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);

  // Smart Leave State
  const [smartInput, setSmartInput] = useState('');
  const [parsingSmart, setParsingSmart] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [leaveList, balList, setup] = await Promise.all([
        ApiClient.getLeaves(),
        ApiClient.getLeaveBalances(user?.role === 'employee' ? employee?.id : undefined),
        ApiClient.getSetupData()
      ]);
      setLeaves(leaveList || []);
      setBalances(balList || []);
      setLeaveTypes(setup.leaveTypes || []);
      if (setup.leaveTypes?.length > 0 && !selectedLeaveTypeId) {
        setSelectedLeaveTypeId(setup.leaveTypes[0].id);
      }
    } catch (err) {
      console.error('Failed to load leave data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user, employee]);

  // Smart Leave Parser (M8 / M5 requirement)
  const handleSmartLeaveParse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!smartInput.trim()) return;

    setParsingSmart(true);
    setApplyError(null);
    try {
      const res = await ApiClient.smartLeave(smartInput);
      if (res.parsed) {
        if (res.parsed.leaveTypeId) setSelectedLeaveTypeId(res.parsed.leaveTypeId);
        setStartDate(res.parsed.startDate);
        setEndDate(res.parsed.endDate);
        setReason(res.parsed.reason);
        setShowApplyModal(true);
      }
    } catch (err: any) {
      alert(`Smart Leave Error: ${err.message}`);
    } finally {
      setParsingSmart(false);
    }
  };

  // Submit Leave Application
  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setApplying(true);
    setApplyError(null);

    try {
      await ApiClient.applyLeave({
        employeeId: employee?.id,
        leaveTypeId: selectedLeaveTypeId,
        startDate,
        endDate,
        reason
      });
      setShowApplyModal(false);
      setReason('');
      setSmartInput('');
      loadData();
    } catch (err: any) {
      setApplyError(err.message || 'Failed to submit leave');
    } finally {
      setApplying(false);
    }
  };

  // Cancel Leave (Employee)
  const handleCancelLeave = async (id: string) => {
    if (confirm('Are you sure you want to cancel this leave application?')) {
      try {
        await ApiClient.cancelLeave(id);
        loadData();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  // HR Review Leave
  const handleReviewLeave = async (id: string, approve: boolean) => {
    const hrComment = prompt(
      approve ? 'Enter approval note (optional):' : 'Enter reason for rejection:'
    );
    try {
      await ApiClient.reviewLeave(id, { approve, hrComment: hrComment || '' });
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Leave Administration & Applications
          </h1>
          <p className="text-xs text-slate-500">
            Working days calculation (excludes weekends & public holidays) · Quota verification (Rule 422)
          </p>
        </div>

        {user?.role === 'employee' && (
          <button
            onClick={() => {
              setApplyError(null);
              setShowApplyModal(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Apply For Leave</span>
          </button>
        )}
      </div>

      {/* Smart Leave Input Box (for Employees) */}
      {user?.role === 'employee' && (
        <div className="bg-gradient-to-r from-indigo-50/80 via-white to-purple-50/80 p-5 rounded-2xl border border-indigo-100 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-indigo-600 rounded-md text-white">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900">Smart Leave Assistant</span>
              <span className="text-[11px] text-slate-500 ml-2">Type your leave in plain words:</span>
            </div>
          </div>

          <form onSubmit={handleSmartLeaveParse} className="flex gap-2">
            <input
              type="text"
              value={smartInput}
              onChange={e => setSmartInput(e.target.value)}
              placeholder="e.g. Need next Monday and Tuesday off for my sister's wedding"
              className="flex-1 px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 shadow-xs"
            />
            <button
              type="submit"
              disabled={parsingSmart || !smartInput.trim()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{parsingSmart ? 'Parsing...' : 'Pre-Fill Form'}</span>
            </button>
          </form>
          <span className="text-[10px] text-slate-400 mt-1 block">
            AI automatically figures out dates, working days, and leave type (casual/sick/annual) for your review.
          </span>
        </div>
      )}

      {/* Leave Balances Grid */}
      <div>
        <h2 className="text-sm font-semibold text-slate-900 mb-3">
          {user?.role === 'employee' ? 'Your Annual Leave Balances' : 'Standard Organization Leave Quotas'}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {balances.map(b => (
            <div key={b.leaveTypeId} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-xs font-medium text-slate-600 truncate">{b.name}</div>
              <div className="text-2xl font-bold tabular-nums text-slate-900 my-1">
                {b.remaining}
              </div>
              <div className="text-[11px] text-slate-400">
                {b.used} used of {b.yearlyQuota === 999 ? 'Unlimited' : `${b.yearlyQuota} quota`}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Leave Requests Table (Approval Inbox for HR, History for Employee) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">
            {user?.role === 'employee' ? 'My Leave Applications' : 'Leave Approval Inbox & History'}
          </h2>
          <span className="text-xs text-slate-400">{leaves.length} records</span>
        </div>

        {leaves.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No leave requests registered.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Employee</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Start Date</th>
                  <th className="py-2.5 px-3">End Date</th>
                  <th className="py-2.5 px-3">Working Days</th>
                  <th className="py-2.5 px-3">Reason</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaves.map(l => (
                  <tr key={l.id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-900">{l.employeeName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{l.employeeCode}</div>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-800">{l.leaveTypeName}</td>
                    <td className="py-2.5 px-3 font-mono">{l.startDate}</td>
                    <td className="py-2.5 px-3 font-mono">{l.endDate}</td>
                    <td className="py-2.5 px-3 tabular-nums font-bold text-slate-900">
                      {l.workingDays} days
                    </td>
                    <td className="py-2.5 px-3 max-w-[200px] truncate text-slate-700">
                      {l.reason}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`text-[11px] font-semibold capitalize px-2 py-0.5 rounded ${
                        l.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        l.status === 'rejected' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                        l.status === 'cancelled' ? 'bg-slate-100 text-slate-600' :
                        'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {/* HR Approval Controls */}
                      {(user?.role === 'hr' || user?.role === 'admin') && l.status === 'pending' ? (
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleReviewLeave(l.id, true)}
                            className="p-1 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-800 cursor-pointer"
                            title="Approve Leave"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleReviewLeave(l.id, false)}
                            className="p-1 rounded bg-rose-100 hover:bg-rose-200 text-rose-800 cursor-pointer"
                            title="Reject Leave"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : user?.role === 'employee' && l.status === 'pending' ? (
                        <button
                          onClick={() => handleCancelLeave(l.id)}
                          className="text-[11px] text-rose-600 hover:underline cursor-pointer"
                        >
                          Cancel
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-400">
                          {l.hrComment ? `Note: ${l.hrComment}` : '--'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Apply Leave Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Apply for Leave</h3>
              <button onClick={() => setShowApplyModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {applyError && (
              <div className="mt-3 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-start gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{applyError}</span>
              </div>
            )}

            <form onSubmit={handleApply} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Leave Category</label>
                <select
                  value={selectedLeaveTypeId}
                  onChange={e => setSelectedLeaveTypeId(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  {leaveTypes.map(lt => (
                    <option key={lt.id} value={lt.id}>
                      {lt.name} ({lt.isUnpaid ? 'Unlimited' : `${lt.yearlyQuota} days/yr`})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Reason for Leave *</label>
                <textarea
                  rows={3}
                  required
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="State the purpose of your leave..."
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={applying}
                  className="px-4 py-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 cursor-pointer disabled:opacity-50"
                >
                  {applying ? 'Checking Quota & Applying...' : 'Confirm & Apply'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
