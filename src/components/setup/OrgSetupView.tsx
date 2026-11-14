import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ApiClient } from '../../services/api';
import {
  Building2,
  Clock,
  MapPin,
  Calendar,
  Users,
  Plus,
  Shield,
  CheckCircle2,
  Lock,
  UserCheck
} from 'lucide-react';

export const OrgSetupView: React.FC = () => {
  const { user, settings, refresh } = useAuth();
  const [data, setData] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Settings form
  const [companyName, setCompanyName] = useState('');
  const [officeStartTime, setOfficeStartTime] = useState('09:00');
  const [gracePeriodMinutes, setGracePeriodMinutes] = useState(15);
  const [halfDayHours, setHalfDayHours] = useState(5);
  const [radiusMeters, setRadiusMeters] = useState(150);
  const [savingSettings, setSavingSettings] = useState(false);

  // Add Department State
  const [deptName, setDeptName] = useState('');
  const [deptCode, setDeptCode] = useState('');

  // Add Designation State
  const [desigName, setDesigName] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState('');

  // Add Holiday State
  const [holidayName, setHolidayName] = useState('');
  const [holidayDate, setHolidayDate] = useState('');

  // Create HR Login State
  const [hrName, setHrName] = useState('');
  const [hrEmail, setHrEmail] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [setupData, userList] = await Promise.all([
        ApiClient.getSetupData(),
        user?.role === 'admin' ? ApiClient.getUsers() : Promise.resolve([])
      ]);
      setData(setupData);
      setUsers(userList || []);

      if (setupData.settings) {
        setCompanyName(setupData.settings.companyName || '');
        setOfficeStartTime(setupData.settings.officeStartTime || '09:00');
        setGracePeriodMinutes(setupData.settings.gracePeriodMinutes ?? 15);
        setHalfDayHours(setupData.settings.halfDayHours ?? 5);
        setRadiusMeters(setupData.settings.officeLocation?.radiusMeters ?? 150);
      }

      if (setupData.departments?.length > 0 && !selectedDeptId) {
        setSelectedDeptId(setupData.departments[0].id);
      }
    } catch (err) {
      console.error('Failed to load setup data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await ApiClient.updateSettings({
        companyName,
        officeStartTime,
        gracePeriodMinutes,
        halfDayHours,
        officeLocation: {
          ...data.settings.officeLocation,
          radiusMeters
        }
      });
      alert('Company parameters updated successfully');
      refresh();
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update settings');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleAddDept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptName || !deptCode) return;
    try {
      await ApiClient.addDepartment({ name: deptName, code: deptCode });
      setDeptName('');
      setDeptCode('');
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAddDesig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!desigName || !selectedDeptId) return;
    try {
      await ApiClient.addDesignation({ name: desigName, departmentId: selectedDeptId });
      setDesigName('');
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAddHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!holidayName || !holidayDate) return;
    try {
      await ApiClient.addHoliday({ name: holidayName, date: holidayDate });
      setHolidayName('');
      setHolidayDate('');
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateHr = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hrName || !hrEmail) return;
    try {
      await ApiClient.createHrUser({ name: hrName, email: hrEmail });
      alert(`Created HR user for ${hrEmail}. They can sign in and change password.`);
      setHrName('');
      setHrEmail('');
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggleUser = async (id: string) => {
    try {
      await ApiClient.toggleUserStatus(id);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Organization Setup & Governance
        </h1>
        <p className="text-xs text-slate-500">
          Shift rules, camera geofence parameters, department hierarchies, holidays, and HR access control
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Settings */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-4 font-semibold text-slate-900 text-sm">
            <Building2 className="w-4 h-4 text-slate-700" />
            <span>Shift & Geofence Rules</span>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Company Legal Name</label>
              <input
                type="text"
                required
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                disabled={user?.role !== 'admin'}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 disabled:bg-slate-50"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Shift Start</label>
                <input
                  type="time"
                  required
                  value={officeStartTime}
                  onChange={e => setOfficeStartTime(e.target.value)}
                  disabled={user?.role !== 'admin'}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 disabled:bg-slate-50"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-medium mb-1">Grace Period (min)</label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  required
                  value={gracePeriodMinutes}
                  onChange={e => setGracePeriodMinutes(parseInt(e.target.value, 10))}
                  disabled={user?.role !== 'admin'}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 disabled:bg-slate-50"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-medium mb-1">Half Day (hrs)</label>
                <input
                  type="number"
                  min="1"
                  max="8"
                  required
                  value={halfDayHours}
                  onChange={e => setHalfDayHours(parseInt(e.target.value, 10))}
                  disabled={user?.role !== 'admin'}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 disabled:bg-slate-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">
                Office Geofence Radius (Meters)
              </label>
              <input
                type="number"
                min="50"
                max="1000"
                required
                value={radiusMeters}
                onChange={e => setRadiusMeters(parseInt(e.target.value, 10))}
                disabled={user?.role !== 'admin'}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 disabled:bg-slate-50"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Office: {data?.settings?.officeLocation?.addressName} ({data?.settings?.officeLocation?.lat}, {data?.settings?.officeLocation?.lng})
              </span>
            </div>

            {user?.role === 'admin' && (
              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="px-4 py-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 cursor-pointer disabled:opacity-50"
                >
                  {savingSettings ? 'Saving...' : 'Update Settings'}
                </button>
              </div>
            )}
          </form>
        </div>

        {/* HR Login Accounts (Admin only) */}
        {user?.role === 'admin' && (
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col">
            <div className="flex items-center gap-2 mb-3 font-semibold text-slate-900 text-sm">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>Create & Manage HR Logins</span>
            </div>

            <form onSubmit={handleCreateHr} className="space-y-3 text-xs mb-4 pb-4 border-b border-slate-100">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  placeholder="HR Name (e.g. Ayesha Siddiqua)"
                  value={hrName}
                  onChange={e => setHrName(e.target.value)}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
                <input
                  type="email"
                  required
                  placeholder="HR Email (e.g. hr@saylani.org)"
                  value={hrEmail}
                  onChange={e => setHrEmail(e.target.value)}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
              <button
                type="submit"
                className="w-full py-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                Provision HR Account (Temporary Password)
              </button>
            </form>

            <div className="space-y-2 flex-1 overflow-y-auto max-h-48 text-xs">
              {users.map(u => (
                <div key={u.id} className="p-2 rounded bg-slate-50 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-900">{u.name || u.email}</div>
                    <div className="text-[10px] text-slate-400 capitalize">{u.role} · {u.email}</div>
                  </div>
                  {u.role !== 'admin' && (
                    <button
                      onClick={() => handleToggleUser(u.id)}
                      className={`text-[10px] px-2 py-0.5 rounded font-medium cursor-pointer ${
                        u.isActive ? 'bg-rose-50 text-rose-700 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      {u.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Departments & Designations */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3 font-semibold text-slate-900 text-sm">
            <Building2 className="w-4 h-4 text-indigo-600" />
            <span>Departments</span>
          </div>

          {user?.role === 'admin' && (
            <form onSubmit={handleAddDept} className="flex gap-2 text-xs mb-3">
              <input
                type="text"
                required
                placeholder="Dept Name (e.g. Cloud & DevOps)"
                value={deptName}
                onChange={e => setDeptName(e.target.value)}
                className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg"
              />
              <input
                type="text"
                required
                placeholder="Code (e.g. CLOUD)"
                value={deptCode}
                onChange={e => setDeptCode(e.target.value)}
                className="w-24 px-3 py-1.5 border border-slate-200 rounded-lg uppercase"
              />
              <button type="submit" className="px-3 py-1.5 bg-slate-900 text-white rounded-lg cursor-pointer">
                Add
              </button>
            </form>
          )}

          <div className="space-y-1.5 max-h-48 overflow-y-auto text-xs">
            {data?.departments?.map((d: any) => (
              <div key={d.id} className="p-2 rounded bg-slate-50 flex items-center justify-between">
                <span className="font-medium text-slate-800">{d.name}</span>
                <span className="font-mono text-slate-400 text-[10px]">{d.code}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Public Holidays */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3 font-semibold text-slate-900 text-sm">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span>Public Holidays (Auto-skipped in Leave calculations)</span>
          </div>

          {user?.role === 'admin' && (
            <form onSubmit={handleAddHoliday} className="flex gap-2 text-xs mb-3">
              <input
                type="text"
                required
                placeholder="Holiday Name (e.g. Pakistan Day)"
                value={holidayName}
                onChange={e => setHolidayName(e.target.value)}
                className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg"
              />
              <input
                type="date"
                required
                value={holidayDate}
                onChange={e => setHolidayDate(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg"
              />
              <button type="submit" className="px-3 py-1.5 bg-slate-900 text-white rounded-lg cursor-pointer">
                Add
              </button>
            </form>
          )}

          <div className="space-y-1.5 max-h-48 overflow-y-auto text-xs">
            {data?.holidays?.map((h: any) => (
              <div key={h.id} className="p-2 rounded bg-slate-50 flex items-center justify-between">
                <span className="font-medium text-slate-800">{h.name}</span>
                <span className="font-mono text-slate-400 text-[10px]">{h.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
