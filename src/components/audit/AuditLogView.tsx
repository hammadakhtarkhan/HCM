import React, { useState, useEffect } from 'react';
import { ApiClient } from '../../services/api';
import {
  ShieldCheck,
  Search,
  Filter,
  Code2,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

export const AuditLogView: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await ApiClient.getAuditLogs();
      setLogs(data || []);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filteredLogs = logs.filter(l => {
    if (actionFilter && l.action !== actionFilter) return false;
    if (entityFilter && l.entity !== entityFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        l.actorEmail.toLowerCase().includes(q) ||
        l.details.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            Security & Compliance Audit Log
          </h1>
          <p className="text-xs text-slate-500">
            Immutable chronological record of create, update, approve, and finalize actions with before/after state diffs
          </p>
        </div>

        <span className="text-xs text-slate-400 font-mono">
          Total Logs: {logs.length}
        </span>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by actor email, details, or action..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <select
          value={actionFilter}
          onChange={e => setActionFilter(e.target.value)}
          className="text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none"
        >
          <option value="">All Actions</option>
          <option value="create">Create</option>
          <option value="update">Update</option>
          <option value="approve">Approve</option>
          <option value="reject">Reject</option>
          <option value="finalize">Finalize</option>
          <option value="login">Login</option>
        </select>

        <select
          value={entityFilter}
          onChange={e => setEntityFilter(e.target.value)}
          className="text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none"
        >
          <option value="">All Entities</option>
          <option value="company">Company</option>
          <option value="user">User</option>
          <option value="employee">Employee</option>
          <option value="attendance">Attendance</option>
          <option value="leave">Leave</option>
          <option value="payroll">Payroll</option>
          <option value="settings">Settings</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading audit feed...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">No audit logs matching filters</div>
        ) : (
          <div className="divide-y divide-slate-100 text-xs">
            {filteredLogs.map(log => {
              const isExpanded = expandedId === log.id;
              const hasDiff = log.beforeJSON || log.afterJSON;

              return (
                <div key={log.id} className="p-3.5 hover:bg-slate-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      {hasDiff ? (
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : log.id)}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 cursor-pointer"
                        >
                          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                      ) : (
                        <div className="w-6" />
                      )}

                      <div>
                        <div className="font-semibold text-slate-900">{log.details}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Actor: <span className="font-medium text-slate-700">{log.actorEmail}</span> ·
                          Role: <span className="capitalize font-medium text-slate-700">{log.actorRole}</span> ·
                          Entity: <span className="capitalize font-mono text-slate-600">{log.entity}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-right shrink-0">
                      <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                        log.action === 'create' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        log.action === 'approve' || log.action === 'finalize' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                        log.action === 'reject' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {log.action}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Expanded JSON Diffs */}
                  {isExpanded && hasDiff && (
                    <div className="mt-3 pl-8 grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                      {log.beforeJSON && (
                        <div className="bg-slate-900 text-slate-200 rounded-lg p-2.5 font-mono text-[10px] overflow-x-auto">
                          <div className="text-slate-400 mb-1 font-sans text-xs">Before State:</div>
                          <pre>{JSON.stringify(JSON.parse(log.beforeJSON), null, 2)}</pre>
                        </div>
                      )}
                      {log.afterJSON && (
                        <div className="bg-slate-900 text-slate-200 rounded-lg p-2.5 font-mono text-[10px] overflow-x-auto">
                          <div className="text-slate-400 mb-1 font-sans text-xs">After State:</div>
                          <pre>{JSON.stringify(JSON.parse(log.afterJSON), null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
