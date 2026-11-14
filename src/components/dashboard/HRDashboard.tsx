import React, { useState, useEffect } from 'react';
import { ApiClient } from '../../services/api';
import {
  Users,
  UserCheck,
  CalendarOff,
  Clock,
  AlertCircle,
  Sparkles,
  TrendingUp,
  Award
} from 'lucide-react';

export const HRDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [aiSummary, setAiSummary] = useState<string[] | null>(null);
  const [summarizing, setSummarizing] = useState<boolean>(false);
  const [announcements, setAnnouncements] = useState<any[]>([]);

  const loadHRData = async () => {
    try {
      setLoading(true);
      const [analytics, anns] = await Promise.all([
        ApiClient.getAnalytics(),
        ApiClient.getAnnouncements().catch(() => [])
      ]);
      setData(analytics);
      setAnnouncements(anns);
    } catch (err) {
      console.error('Failed to load HR dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHRData();
  }, []);

  const handleSummarize = async () => {
    if (!data) return;
    setSummarizing(true);
    try {
      const res = await ApiClient.summarizeDashboard(data);
      setAiSummary(res.bullets);
    } catch {
      setAiSummary([
        `Workforce currently stands at ${data.kpis.headcount} active personnel with ${data.kpis.presentToday} on premises today.`,
        `${data.kpis.lateToday} late marks recorded today past the 09:15 grace threshold.`,
        `${data.kpis.onLeaveToday} employees are on approved leave today.`
      ]);
    } finally {
      setSummarizing(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="p-8 text-center text-slate-500 text-sm">
        Loading People Operations metrics...
      </div>
    );
  }

  const kpis = data?.kpis || {
    headcount: 0,
    presentToday: 0,
    lateToday: 0,
    onLeaveToday: 0,
    pendingApprovals: 0
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            HR People Operations Dashboard
          </h1>
          <p className="text-xs text-slate-500">
            Daily attendance status, leave utilization, and operational queues
          </p>
        </div>

        <button
          onClick={handleSummarize}
          disabled={summarizing}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer self-start sm:self-auto disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{summarizing ? 'Analyzing...' : 'Summarize'}</span>
        </button>
      </div>

      {/* AI Briefing */}
      {aiSummary && (
        <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-xl text-slate-800 text-xs animate-in fade-in">
          <div className="flex items-center gap-2 mb-2 font-semibold text-indigo-900">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>AI HR Operational Insights</span>
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

      {/* 5 Daily Operations KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Headcount</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold tabular-nums text-slate-900">
            {kpis.headcount}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Active team members</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Present Today</span>
            <UserCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold tabular-nums text-emerald-700">
            {kpis.presentToday}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Checked in on-time</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>On Leave Today</span>
            <CalendarOff className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 text-2xl font-bold tabular-nums text-blue-700">
            {kpis.onLeaveToday}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Approved leaves</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Late Arrivals</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold tabular-nums text-amber-600">
            {kpis.lateToday}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">After 09:15 grace</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Pending Approvals</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2 text-2xl font-bold tabular-nums text-rose-600">
            {kpis.pendingApprovals}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Leaves & corrections</div>
        </div>
      </div>

      {/* Top 5 Late Comers & Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Late-Comers */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-500" />
              Top 5 Late-Comers This Month
            </h2>
            <span className="text-[10px] text-slate-400">Rule: 3 lates = 0.5 day deduction</span>
          </div>

          {data?.topLateComers?.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">
              No late arrivals recorded this month. Excellent punctuality!
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {data?.topLateComers?.map((c: any, idx: number) => (
                <div key={c.employeeId} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-5 text-center font-bold text-slate-400 tabular-nums">
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="font-medium text-slate-900">{c.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{c.code}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-xs tabular-nums">
                      {c.lateCount} lates
                    </span>
                    {c.lateCount >= 3 && (
                      <div className="text-[10px] text-rose-600 font-medium mt-0.5">
                        -{(Math.floor(c.lateCount / 3) * 0.5).toFixed(1)} day penalty
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Bonus: Absence Anomaly Flags */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                Absence Anomaly Flags (Bonus)
              </span>
              <span className="text-[10px] text-slate-400">&gt; 1 unexcused missing day</span>
            </div>
            {data?.absenceAnomalies && data.absenceAnomalies.length > 0 ? (
              <div className="space-y-1.5">
                {data.absenceAnomalies.map((a: any) => (
                  <div key={a.employeeId} className="p-2 rounded bg-rose-50/70 border border-rose-200 text-xs flex justify-between items-center text-rose-900">
                    <span className="font-medium">{a.name} ({a.code})</span>
                    <span className="text-[10px] text-rose-700">{a.reason}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-slate-400">Zero attendance anomalies flagged this cycle.</p>
            )}
          </div>
        </div>

        {/* Company Announcements */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col">
          <h2 className="text-sm font-semibold text-slate-900 mb-3">
            Active Noticeboard & Announcements
          </h2>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-72">
            {announcements.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No announcements published</p>
            ) : (
              announcements.map((a: any) => (
                <div
                  key={a.id}
                  className={`p-3 rounded-lg border text-xs ${
                    a.priority === 'important'
                      ? 'bg-amber-50/50 border-amber-200 text-slate-800'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between font-semibold text-slate-900">
                    <span>{a.title}</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      {new Date(a.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-1 text-slate-600 text-[11px] leading-relaxed">{a.content}</p>
                  <div className="mt-1 text-[10px] text-slate-400">
                    Posted by {a.authorName} ({a.authorRole.toUpperCase()})
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
