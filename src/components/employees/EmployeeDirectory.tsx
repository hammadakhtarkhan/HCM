import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ApiClient } from '../../services/api';
import {
  Users,
  Search,
  Plus,
  FileSpreadsheet,
  Download,
  Upload,
  Eye,
  X,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign
} from 'lucide-react';

export const EmployeeDirectory: React.FC = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [designations, setDesignations] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals & Drawers
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selected360Id, setSelected360Id] = useState<string | null>(null);
  const [profile360, setProfile360] = useState<any | null>(null);
  const [loading360, setLoading360] = useState(false);

  // New Employee Form State
  const [formData, setFormData] = useState({
    employeeCode: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    departmentId: '',
    designationId: '',
    gender: 'male',
    joiningDate: new Date().toISOString().split('T')[0],
    basicSalary: 100000
  });

  // CSV Import State
  const [csvContent, setCsvContent] = useState('');
  const [dryRunResult, setDryRunResult] = useState<any | null>(null);
  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [empRes, setupRes] = await Promise.all([
        ApiClient.getEmployees({
          query: searchQuery || undefined,
          departmentId: deptFilter || undefined
        }),
        ApiClient.getSetupData()
      ]);
      setEmployees(empRes.data || []);
      setDepartments(setupRes.departments || []);
      setDesignations(setupRes.designations || []);

      if (setupRes.departments?.length > 0 && !formData.departmentId) {
        setFormData(prev => ({
          ...prev,
          departmentId: setupRes.departments[0].id,
          designationId: setupRes.designations[0]?.id || ''
        }));
      }
    } catch (err) {
      console.error('Failed to load employees:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchQuery, deptFilter]);

  const handleOpen360 = async (id: string) => {
    setSelected360Id(id);
    setLoading360(true);
    try {
      const res = await ApiClient.getEmployee360(id);
      setProfile360(res);
    } catch (err) {
      console.error('Failed to load 360 profile:', err);
    } finally {
      setLoading360(false);
    }
  };

  const handleRegisterEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ApiClient.registerEmployee(formData);
      setShowAddModal(false);
      setFormData({
        employeeCode: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        departmentId: departments[0]?.id || '',
        designationId: designations[0]?.id || '',
        gender: 'male',
        joiningDate: new Date().toISOString().split('T')[0],
        basicSalary: 100000
      });
      loadData();
    } catch (err: any) {
      alert(`Registration error: ${err.message}`);
    }
  };

  const handleDryRunCsv = async () => {
    if (!csvContent.trim()) return;
    setImporting(true);
    setImportMessage(null);
    try {
      const result = await ApiClient.importEmployeesCsv(csvContent, true);
      setDryRunResult(result);
    } catch (err: any) {
      alert(`CSV Error: ${err.message}`);
    } finally {
      setImporting(false);
    }
  };

  const handleCommitCsv = async () => {
    if (!csvContent.trim()) return;
    setImporting(true);
    try {
      const result = await ApiClient.importEmployeesCsv(csvContent, false);
      setImportMessage(result.message);
      setDryRunResult(null);
      loadData();
    } catch (err: any) {
      alert(`Import error: ${err.message}`);
    } finally {
      setImporting(false);
    }
  };

  const sampleCsvTemplate = `employeeCode,firstName,lastName,email,department,designation,salary,phone
SIT-201,Farhan,Ali,farhan@saylani.org,Engineering,Software Engineer,130000,+923001112233
SIT-202,Sara,Khan,sara@saylani.org,Human Resources,HR Lead,110000,+923004445566`;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Employee Directory & 360 Records
          </h1>
          <p className="text-xs text-slate-500">
            Manage personnel profiles, job designations, and salary structures
          </p>
        </div>

        {(user?.role === 'hr' || user?.role === 'admin') && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setCsvContent(sampleCsvTemplate);
                setShowImportModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-medium cursor-pointer shadow-xs"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span>CSV Import</span>
            </button>
            <a
              href="/api/employees/export-csv"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-medium cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>CSV Export</span>
            </a>
            {user?.role === 'hr' && (
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Register Employee</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by name, employee code, or email..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <select
          value={deptFilter}
          onChange={e => setDeptFilter(e.target.value)}
          className="text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer"
        >
          <option value="">All Departments</option>
          {departments.map(d => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs">Loading directory...</div>
        ) : employees.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No employees found. HR can register new staff or import via CSV.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Department & Role</th>
                  <th className="py-3 px-4">Status</th>
                  {(user?.role === 'hr' || user?.role === 'admin') && (
                    <th className="py-3 px-4 text-right">Gross Salary (PKR)</th>
                  )}
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees.map(emp => {
                  const dept = departments.find(d => d.id === emp.departmentId);
                  const des = designations.find(d => d.id === emp.designationId);
                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-mono font-medium text-slate-900">
                        {emp.employeeCode}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{emp.fullName}</div>
                        <div className="text-[11px] text-slate-400">{emp.email}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-slate-800">{des?.name || 'Staff Member'}</div>
                        <div className="text-[11px] text-slate-400">{dept?.name || 'General'}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[11px] font-medium capitalize text-emerald-700">
                          {emp.status}
                        </span>
                      </td>
                      {(user?.role === 'hr' || user?.role === 'admin') && (
                        <td className="py-3 px-4 text-right font-semibold text-slate-900 tabular-nums">
                          {emp.grossSalary.toLocaleString()}
                        </td>
                      )}
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleOpen360(emp.id)}
                          className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium cursor-pointer"
                        >
                          360 View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Employee 360 Modal / Drawer */}
      {selected360Id && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 text-slate-900 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {profile360?.employee?.fullName || 'Employee 360 View'}
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  {profile360?.employee?.employeeCode} · {profile360?.department}
                </span>
              </div>
              <button
                onClick={() => setSelected360Id(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loading360 ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading 360 data...</div>
            ) : profile360 ? (
              <div className="mt-4 space-y-5 text-xs">
                {/* Contact & Job details */}
                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Email</span>
                    <span className="font-medium text-slate-800">{profile360.employee.email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Phone</span>
                    <span className="font-medium text-slate-800">{profile360.employee.phone || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Role / Designation</span>
                    <span className="font-medium text-slate-800">{profile360.designation}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Joining Date</span>
                    <span className="font-medium text-slate-800">{profile360.employee.joiningDate}</span>
                  </div>
                </div>

                {/* Salary Breakdown (HR / Admin or own view) */}
                {(user?.role === 'hr' || user?.role === 'admin' || user?.employeeId === profile360.employee.id) && (
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">Salary Structure (Gross = 1.5 × Basic)</h4>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div className="p-2 bg-slate-50 rounded border border-slate-200">
                        <div className="text-[10px] text-slate-400">Basic</div>
                        <div className="font-bold tabular-nums">PKR {profile360.employee.basicSalary.toLocaleString()}</div>
                      </div>
                      <div className="p-2 bg-slate-50 rounded border border-slate-200">
                        <div className="text-[10px] text-slate-400">HRA (40%)</div>
                        <div className="font-bold tabular-nums">PKR {profile360.employee.hra.toLocaleString()}</div>
                      </div>
                      <div className="p-2 bg-slate-50 rounded border border-slate-200">
                        <div className="text-[10px] text-slate-400">Medical (10%)</div>
                        <div className="font-bold tabular-nums">PKR {profile360.employee.medical.toLocaleString()}</div>
                      </div>
                      <div className="p-2 bg-emerald-50 rounded border border-emerald-200 text-emerald-800">
                        <div className="text-[10px]">Total Gross</div>
                        <div className="font-bold tabular-nums">PKR {profile360.employee.grossSalary.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Leave Balances */}
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">Annual Leave Balances</h4>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    {profile360.balances?.map((b: any) => (
                      <div key={b.leaveTypeId} className="p-2 bg-slate-50 rounded border border-slate-200">
                        <div className="text-[10px] text-slate-500 font-medium truncate">{b.leaveName}</div>
                        <div className="text-base font-bold tabular-nums text-slate-900 my-0.5">{b.remaining}</div>
                        <div className="text-[9px] text-slate-400">{b.used} used</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Register Employee Modal (HR Only) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 text-slate-900 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Register New Employee</h3>
                <p className="text-xs text-slate-500">Auto-creates employee login with temporary password</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRegisterEmployee} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Employee Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.employeeCode}
                    onChange={e => setFormData({ ...formData, employeeCode: e.target.value })}
                    placeholder="e.g. SIT-105"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Email (Login ID) *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="employee@saylani.org"
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Department *</label>
                  <select
                    value={formData.departmentId}
                    onChange={e => setFormData({ ...formData, departmentId: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Designation *</label>
                  <select
                    value={formData.designationId}
                    onChange={e => setFormData({ ...formData, designationId: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    {designations.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Basic Salary (PKR) *</label>
                  <input
                    type="number"
                    required
                    min="10000"
                    value={formData.basicSalary}
                    onChange={e => setFormData({ ...formData, basicSalary: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Gross will be {((formData.basicSalary || 0) * 1.5).toLocaleString()} (HRA 40%, Medical 10%)
                  </span>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Joining Date</label>
                  <input
                    type="date"
                    required
                    value={formData.joiningDate}
                    onChange={e => setFormData({ ...formData, joiningDate: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 cursor-pointer"
                >
                  Save & Issue Login
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Import Modal with Dry Run */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 text-slate-900 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">CSV Bulk Employee Import</h3>
                <p className="text-xs text-slate-500">Includes pre-validation dry run to verify formats & unique codes</p>
              </div>
              <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Paste CSV Content</label>
                <textarea
                  rows={6}
                  value={csvContent}
                  onChange={e => setCsvContent(e.target.value)}
                  className="w-full p-2.5 font-mono text-[11px] border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              {dryRunResult && (
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="font-semibold text-slate-900 mb-1 flex items-center gap-1.5">
                    {dryRunResult.errorCount === 0 ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                    )}
                    <span>
                      Dry Run Result: {dryRunResult.validCount} valid, {dryRunResult.errorCount} errors
                    </span>
                  </div>

                  {dryRunResult.errors.length > 0 && (
                    <ul className="text-rose-600 space-y-0.5 mt-1 list-disc list-inside">
                      {dryRunResult.errors.map((err: any, idx: number) => (
                        <li key={idx}>
                          Row {err.row}: {err.field} - {err.reason}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {importMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg">
                  {importMessage}
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleDryRunCsv}
                  disabled={importing}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer"
                >
                  Run Dry Run Validation
                </button>
                <button
                  type="button"
                  onClick={handleCommitCsv}
                  disabled={importing || (dryRunResult && dryRunResult.validCount === 0)}
                  className="px-4 py-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 cursor-pointer"
                >
                  Commit & Import
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
