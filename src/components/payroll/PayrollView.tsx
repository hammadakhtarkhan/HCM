import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ApiClient } from '../../services/api';
import { jsPDF } from 'jspdf';
import {
  DollarSign,
  Lock,
  Unlock,
  Download,
  Eye,
  CheckCircle2,
  Calendar,
  AlertCircle,
  FileText,
  Printer,
  X
} from 'lucide-react';

export const PayrollView: React.FC = () => {
  const { user, employee, settings } = useAuth();
  const [payrollRuns, setPayrollRuns] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().substring(0, 7)
  );
  const [currentRun, setCurrentRun] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [runningDraft, setRunningDraft] = useState(false);
  const [finalizing, setFinalizing] = useState(false);

  // Payslip Modal State
  const [selectedPayslipItem, setSelectedPayslipItem] = useState<any | null>(null);
  const [selectedPayslipMonth, setSelectedPayslipMonth] = useState<string>('');

  const loadPayroll = async () => {
    try {
      setLoading(true);
      const runs = await ApiClient.getPayrollRuns();
      setPayrollRuns(runs || []);

      if (user?.role === 'employee') {
        // Runs for employee
      } else {
        const found = runs.find((r: any) => r.month === selectedMonth);
        setCurrentRun(found || null);
      }
    } catch (err) {
      console.error('Failed to load payroll:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayroll();
  }, [selectedMonth, user]);

  // HR Runs Draft
  const handleRunDraft = async () => {
    setRunningDraft(true);
    try {
      const res = await ApiClient.runPayrollDraft(selectedMonth);
      setCurrentRun(res.payroll);
      loadPayroll();
    } catch (err: any) {
      alert(err.message || 'Draft failed');
    } finally {
      setRunningDraft(false);
    }
  };

  // Admin Finalizes & Locks
  const handleFinalize = async () => {
    if (!confirm(`Finalize and lock payroll for ${selectedMonth}? Once locked, figures cannot be edited.`)) {
      return;
    }
    setFinalizing(true);
    try {
      const res = await ApiClient.finalizePayroll(selectedMonth);
      setCurrentRun(res.payroll);
      loadPayroll();
    } catch (err: any) {
      alert(err.message || 'Finalization failed');
    } finally {
      setFinalizing(false);
    }
  };

  // Generate & Download Payslip PDF via jsPDF
  const handleDownloadPdf = (item: any, month: string) => {
    try {
      const doc = new jsPDF();
      const company = settings?.companyName || 'Saylani HCM Systems';

      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, 210, 30, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.text(company, 15, 15);
      doc.setFontSize(10);
      doc.text(`Official Salary Payslip · Period: ${month}`, 15, 23);

      doc.setTextColor(30, 41, 59);
      doc.setFontSize(12);
      doc.text('Employee Information', 15, 45);

      doc.setFontSize(9);
      doc.text(`Name: ${item.employeeName}`, 15, 53);
      doc.text(`Code: ${item.employeeCode}`, 15, 60);
      doc.text(`Department: ${item.departmentName}`, 120, 53);
      doc.text(`Designation: ${item.designationName}`, 120, 60);

      // Earnings Table
      doc.setDrawColor(226, 232, 240);
      doc.line(15, 67, 195, 67);

      doc.setFontSize(11);
      doc.text('Salary & Allowance Breakdown', 15, 75);

      doc.setFontSize(9);
      doc.text('Basic Salary:', 15, 83);
      doc.text(`PKR ${item.basicSalary.toLocaleString()}`, 80, 83);

      doc.text('House Rent Allowance (HRA 40%):', 15, 90);
      doc.text(`PKR ${item.hra.toLocaleString()}`, 80, 90);

      doc.text('Medical Allowance (10%):', 15, 97);
      doc.text(`PKR ${item.medical.toLocaleString()}`, 80, 97);

      doc.setFont('helvetica', 'bold');
      doc.text('Gross Monthly Salary (1.5x Basic):', 15, 105);
      doc.text(`PKR ${item.grossSalary.toLocaleString()}`, 80, 105);

      // Deductions Table
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.text('Deductions & Taxation', 120, 75);

      doc.setFontSize(9);
      doc.text(`Absent / Unpaid (${item.absentDays + item.unpaidLeaveDays} days):`, 120, 83);
      doc.text(`PKR ${item.deductionAmount.toLocaleString()}`, 180, 83);

      doc.text(`Late Penalty (${item.penaltyDays} days):`, 120, 90);
      doc.text(`${item.lateCount} lates`, 180, 90);

      doc.text('Progressive Income Tax:', 120, 97);
      doc.text(`PKR ${item.monthlyTax.toLocaleString()}`, 180, 97);

      doc.line(15, 115, 195, 115);

      // Net Pay Box
      doc.setFillColor(241, 245, 249);
      doc.rect(15, 122, 180, 22, 'F');

      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('Net Pay Credited:', 20, 136);
      doc.setTextColor(16, 185, 129); // emerald
      doc.text(`PKR ${item.netSalary.toLocaleString()}`, 120, 136);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text('This is a computer-generated payslip generated by HCM Lite.', 15, 160);

      doc.save(`Payslip_${item.employeeCode}_${month}.pdf`);
    } catch (err: any) {
      alert(`PDF Error: ${err.message}`);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Payroll Lite & Payslip Generation
          </h1>
          <p className="text-xs text-slate-500">
            Gross = 1.5 × Basic · Prorated working day deductions · Progressive annual tax slabs · Lock upon Admin finalization
          </p>
        </div>

        {/* HR or Admin Controls */}
        {(user?.role === 'hr' || user?.role === 'admin') && (
          <div className="flex items-center gap-3">
            <input
              type="month"
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none"
            />

            {user?.role === 'hr' && currentRun?.status !== 'finalized' && (
              <button
                onClick={handleRunDraft}
                disabled={runningDraft}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer disabled:opacity-50"
              >
                {runningDraft ? 'Computing Draft...' : 'Calculate / Re-run Draft'}
              </button>
            )}

            {user?.role === 'admin' && currentRun && currentRun.status === 'draft' && (
              <button
                onClick={handleFinalize}
                disabled={finalizing}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Finalize & Lock Payroll</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Employee View: My Payslips */}
      {user?.role === 'employee' ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">My Finalized Monthly Payslips</h2>
            <span className="text-xs text-slate-400">{payrollRuns.length} published payslips</span>
          </div>

          {payrollRuns.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No finalized payroll runs for your account yet. Once Admin locks the month, your payslip will be available for download here.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {payrollRuns.map((r: any) => (
                <div key={r.month} className="p-4 flex items-center justify-between hover:bg-slate-50 text-xs">
                  <div>
                    <div className="font-semibold text-slate-900 text-sm">Month of {r.month}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Gross: PKR {r.item?.grossSalary.toLocaleString()} · Deductions: PKR {r.item?.deductionAmount.toLocaleString()} · Tax: PKR {r.item?.monthlyTax.toLocaleString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-bold text-slate-900 text-sm tabular-nums">
                        PKR {r.item?.netSalary.toLocaleString()}
                      </div>
                      <span className="text-[10px] text-emerald-600 font-medium bg-emerald-50 px-1.5 py-0.2 rounded">
                        Net Credited
                      </span>
                    </div>

                    <button
                      onClick={() => handleDownloadPdf(r.item, r.month)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PDF</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* HR / Admin Payroll Table */
        <div className="space-y-4">
          {/* Summary Banner */}
          {currentRun && (
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${currentRun.status === 'finalized' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                  {currentRun.status === 'finalized' ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-900">Payroll Cycle: {currentRun.month}</h2>
                    <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                      currentRun.status === 'finalized' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {currentRun.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {currentRun.status === 'finalized'
                      ? `Locked by Admin (${currentRun.finalizedBy || 'System'})`
                      : 'Draft stage: Review numbers before Admin lock'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 text-xs">
                <div>
                  <div className="text-slate-400">Total Gross</div>
                  <div className="font-bold text-slate-900 tabular-nums">PKR {currentRun.totalGross?.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-slate-400">Total Deductions</div>
                  <div className="font-bold text-rose-600 tabular-nums">PKR {currentRun.totalDeductions?.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-slate-400">Total Income Tax</div>
                  <div className="font-bold text-slate-700 tabular-nums">PKR {currentRun.totalTax?.toLocaleString()}</div>
                </div>
                <div className="pl-4 border-l border-slate-200">
                  <div className="text-slate-400">Total Net Disbursal</div>
                  <div className="font-bold text-emerald-700 text-base tabular-nums">PKR {currentRun.totalNet?.toLocaleString()}</div>
                </div>
              </div>
            </div>
          )}

          {/* Items Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            {!currentRun ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No payroll draft calculated for {selectedMonth}. HR can click "Calculate / Re-run Draft" to compute items for all active employees.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Employee</th>
                      <th className="py-2.5 px-3 text-right">Basic</th>
                      <th className="py-2.5 px-3 text-right">Gross (1.5x)</th>
                      <th className="py-2.5 px-3 text-center">Absent/Half</th>
                      <th className="py-2.5 px-3 text-right">Deduction</th>
                      <th className="py-2.5 px-3 text-right">Tax (Monthly)</th>
                      <th className="py-2.5 px-3 text-right">Net Pay (PKR)</th>
                      <th className="py-2.5 px-3 text-right">Payslip</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentRun.items.map((item: any) => (
                      <tr key={item.employeeId} className="hover:bg-slate-50/70">
                        <td className="py-2.5 px-3">
                          <div className="font-medium text-slate-900">{item.employeeName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{item.employeeCode} · {item.departmentName}</div>
                        </td>
                        <td className="py-2.5 px-3 text-right tabular-nums">{item.basicSalary.toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-right tabular-nums font-medium text-slate-800">{item.grossSalary.toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-center text-[11px] tabular-nums">
                          {item.absentDays} abs / {item.halfDays} half
                          {item.penaltyDays > 0 && <span className="text-rose-500 block text-[10px]">+{item.penaltyDays}d late</span>}
                        </td>
                        <td className="py-2.5 px-3 text-right tabular-nums text-rose-600 font-medium">
                          {item.deductionAmount > 0 ? `-${item.deductionAmount.toLocaleString()}` : '0'}
                        </td>
                        <td className="py-2.5 px-3 text-right tabular-nums text-slate-700">{item.monthlyTax.toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-right tabular-nums font-bold text-slate-900 text-sm">
                          {item.netSalary.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => handleDownloadPdf(item, currentRun.month)}
                            className="p-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                            title="Download PDF Payslip"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
