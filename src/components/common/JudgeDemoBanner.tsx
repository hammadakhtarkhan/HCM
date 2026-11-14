import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/hcm';
import {
  RotateCcw,
  Sparkles,
  ClipboardList,
  CheckCircle2,
  X,
  UserCheck
} from 'lucide-react';

export const JudgeDemoBanner: React.FC = () => {
  const { user, switchRole, resetFresh, seedDemo, isSetupCompleted } = useAuth();
  const [showChecklist, setShowChecklist] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);

  const handleRoleSelect = async (role: UserRole) => {
    setLoadingAction(true);
    try {
      await switchRole(role);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleReset = async () => {
    if (window.confirm('Reset HCM Lite to empty first-run install for judging evaluation?')) {
      setLoadingAction(true);
      try {
        await resetFresh();
      } finally {
        setLoadingAction(false);
      }
    }
  };

  const handleSeed = async () => {
    setLoadingAction(true);
    try {
      await seedDemo();
    } finally {
      setLoadingAction(false);
    }
  };

  if (!isSetupCompleted) return null;

  return (
    <>
      <div className="bg-slate-900 text-white text-xs px-4 py-2 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-semibold text-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Saylani Hackathon Evaluator Bar</span>
          </div>

          <div className="hidden sm:flex items-center gap-1 bg-slate-800/80 p-0.5 rounded-md border border-slate-700/60">
            <button
              onClick={() => handleRoleSelect('admin')}
              disabled={loadingAction}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                user?.role === 'admin'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Admin View
            </button>
            <button
              onClick={() => handleRoleSelect('hr')}
              disabled={loadingAction}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                user?.role === 'hr'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              HR View
            </button>
            <button
              onClick={() => handleRoleSelect('employee')}
              disabled={loadingAction}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                user?.role === 'employee'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Employee View
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowChecklist(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
          >
            <ClipboardList className="w-3.5 h-3.5 text-indigo-400" />
            <span>5-Min Demo Script</span>
          </button>
          <button
            onClick={handleSeed}
            disabled={loadingAction}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-900/60 hover:bg-indigo-900 text-indigo-200 border border-indigo-700/60 transition-colors cursor-pointer"
            title="Seed Saylani IT Park Dataset"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            <span>Seed Demo Data</span>
          </button>
          <button
            onClick={handleReset}
            disabled={loadingAction}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-rose-950/60 hover:bg-rose-900 text-rose-200 border border-rose-800/60 transition-colors cursor-pointer"
            title="Reset to fresh clean empty install"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
            <span>Clean Fresh Install</span>
          </button>
        </div>
      </div>

      {/* 5-Minute Demo Script Modal */}
      {showChecklist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 text-slate-900 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">5-Minute Judge Demo Script</h3>
              </div>
              <button
                onClick={() => setShowChecklist(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs text-slate-600">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="font-semibold text-slate-900 mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Step 1: Fresh Install & Admin Setup
                </div>
                <p>
                  Start from a fresh install (or click "Clean Fresh Install"). Admin sets up company name, office hours (09:00, grace 15m), Karachi IT Park geofence (150m), and creates HR login.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="font-semibold text-slate-900 mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Step 2: HR Registers Employees & Check-In
                </div>
                <p>
                  HR registers 2–3 employees with salary structure. Employee signs in with temporary password, changes password, and performs Web or Camera Check-In with face detection & geofencing.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="font-semibold text-slate-900 mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Step 3: Smart Leave in Plain Words
                </div>
                <p>
                  Employee types: <em>"Need next Monday and Tuesday off for my sister's wedding"</em>. AI pre-fills the form with correct working days (skipping weekends). HR reviews & approves with comment.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="font-semibold text-slate-900 mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Step 4: HR Dashboard & AI Tool Calling
                </div>
                <p>
                  HR clicks <strong>"Summarize"</strong> to generate real KPI bullet insights. Asks AI: <em>"Who is on leave today?"</em>. HR runs monthly payroll draft, and Admin finalizes & locks it.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="font-semibold text-slate-900 mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Step 5: Payslip Download & Scope Guardrail
                </div>
                <p>
                  Employee downloads official PDF payslip. Employee asks AI: <em>"What is Bilal's salary?"</em> &rarr; Assistant politely refuses! Admin inspects the tamper-proof Audit Log feed.
                </p>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowChecklist(false)}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-medium rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                Close & Run Demo
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
