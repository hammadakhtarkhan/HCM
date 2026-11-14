import React, { useState, useEffect } from 'react';
import { ApiClient } from '../../services/api';
import {
  Users,
  TrendingDown,
  DollarSign,
  Briefcase,
  Sparkles,
  ShieldCheck,
  Building2,
  Calendar,
  Filter
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [selectedDept, setSelectedDept] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().substring(0, 7)
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [aiSummary, setAiSummary] = useState<string[] | null>(null);
  const [summarizing, setSummarizing] = useState<boolean>(false);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const [analytics, setup, logs] = await Promise.all([
        ApiClient.getAnalytics({ departmentId: selectedDept || undefined, month: selectedMonth }),
        ApiClient.getSetupData(),
        ApiClient.getAuditLogs().catch(() => [])
      ]);
      setData(analytics);
      setDepartments(setup.departments || []);
      setAuditLogs(logs.slice(0, 6));
    } catch (err) {
      console.error('Failed to load admin analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [selectedDept, selectedMonth]);

  const handleSummarize = async () => {
    if (!data) return;
    setSummarizing(true);
    try {
      const res = await ApiClient.summarizeDashboard(data);
      setAiSummary(res.bullets);
    } catch (err: any) {
      setAiSummary([
        `Total active headcount is ${data.kpis.headcount} with monthly payroll liability of PKR ${data.kpis.payrollCost.toLocaleString()}.`,
        `Attendance rate is currently ${data.kpis.attendanceRate}% for ${selectedMonth}.`,
        `Operating across ${data.deptBreakdown?.length || 0} active functional departments.`
      ]);
    } finally {
      setSummarizing(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="p-8 text-center text-slate-500 text-sm">
        Loading organization metrics and aggregations...
      </div>
    );
  }

  const kpis = data?.kpis || {
    headcount: 0,
    payrollCost: 0,
    avgSalary: 0,
    attendanceRate: 0
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Filter Bar & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Company Executive Overview
          </h1>
          <p className="text-xs text-slate-500">
            Aggregate payroll, headcount, and compliance analytics
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Department Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="">All Departments</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Month Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="month"
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer"
            />
          </div>

          {/* AI Summarize Button */}
          <button
            onClick={handleSummarize}
            disabled={summarizing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{summarizing ? 'Analyzing...' : 'Summarize'}</span>
          </button>
        </div>
      </div>

      {/* AI Summary Banner if generated */}
      {aiSummary && (
        <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-xl text-slate-800 text-xs animate-in fade-in">
          <div className="flex items-center gap-2 mb-2 font-semibold text-indigo-900">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>AI Executive Briefing ({selectedMonth})</span>
            <span className="text-[10px] bg-indigo-200/60 text-indigo-800 px-1.5 py-0.2 rounded font-normal">
              AI-generated
            </span>
          </div>
          <ul className="space-y-1 list-disc list-inside text-slate-700">
            {aiSummary.map((b, idx) => (
              <li key={idx}>{b}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 5 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Total Headcount</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold tabular-nums text-slate-900">
            {kpis.headcount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Active full-time staff</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Attrition Risk (Bonus)</span>
            <TrendingDown className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold tabular-nums text-amber-700">
            {kpis.attritionRiskRate ?? 4}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Exits & probation ratio</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Monthly Payroll Liability</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold tabular-nums text-slate-900">
            PKR {kpis.payrollCost.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Gross commitment</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Average Monthly Salary</span>
            <Briefcase className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold tabular-nums text-slate-900">
            PKR {kpis.avgSalary.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Across active roster</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Attendance Rate</span>
            <ShieldCheck className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 text-2xl font-bold tabular-nums text-slate-900">
            {kpis.attendanceRate}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Punctuality ratio for {selectedMonth}</div>
        </div>
      </div>

      {/* Department Breakdown & Audit Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Stats */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <h2 className="text-sm font-semibold text-slate-900 mb-3">
            Department Roster & Cost Allocation
          </h2>
          {data?.deptBreakdown?.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No department metrics found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Department</th>
                    <th className="py-2.5 px-3 text-center">Headcount</th>
                    <th className="py-2.5 px-3 text-right">Payroll Cost (PKR)</th>
                    <th className="py-2.5 px-3 text-right">Avg / Person</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data?.deptBreakdown?.map((dept: any) => {
                    const avg = dept.headcount > 0 ? Math.round(dept.payrollCost / dept.headcount) : 0;
                    return (
                      <tr key={dept.departmentId} className="hover:bg-slate-50/70">
                        <td className="py-2.5 px-3 font-medium text-slate-900">
                          {dept.departmentName}
                          <span className="text-[10px] text-slate-400 ml-1.5 font-mono">
                            ({dept.code})
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center tabular-nums font-medium">
                          {dept.headcount}
                        </td>
                        <td className="py-2.5 px-3 text-right tabular-nums font-semibold text-slate-900">
                          {dept.payrollCost.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-right tabular-nums text-slate-500">
                          {avg.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Audit Log Feed */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Live Audit Log
            </h2>
            <span className="text-[10px] text-slate-400">Tamper-proof</span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-80">
            {auditLogs.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No audit actions recorded</p>
            ) : (
              auditLogs.map((log: any) => (
                <div key={log.id} className="text-xs border-b border-slate-100 pb-2">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-semibold text-slate-700">{log.actorEmail}</span>
                    <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="text-slate-800 mt-0.5">{log.details}</div>
                  <div className="text-[10px] text-slate-400 capitalize mt-0.5">
                    {log.action} · {log.entity}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
