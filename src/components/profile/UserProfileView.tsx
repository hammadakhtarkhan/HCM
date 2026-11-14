import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ApiClient } from '../../services/api';
import { User, Phone, MapPin, Mail, Building2, Briefcase, Calendar, ShieldCheck, Check } from 'lucide-react';

export const UserProfileView: React.FC = () => {
  const { user, employee, refresh } = useAuth();
  const [phone, setPhone] = useState(employee?.phone || '');
  const [address, setAddress] = useState(employee?.address || '');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee) return;
    setSaving(true);
    setSuccess(false);
    try {
      await ApiClient.updateEmployee(employee.id, { phone, address });
      setSuccess(true);
      await refresh();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          User Profile & Self-Service Contact
        </h1>
        <p className="text-xs text-slate-500">
          Update your phone number and residential address in compliance with company records
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xl mb-3">
            {employee?.firstName?.[0] || user?.name?.[0] || 'U'}
          </div>
          <h2 className="text-base font-bold text-slate-900">{employee?.fullName || user?.name}</h2>
          <span className="text-xs text-slate-500 font-mono mt-0.5">{employee?.employeeCode || user?.email}</span>
          <span className="mt-2 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
            Role: {user?.role}
          </span>

          <div className="mt-6 w-full text-left text-xs space-y-2.5 border-t border-slate-100 pt-4 text-slate-600">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-400" />
              <span className="truncate">{user?.email}</span>
            </div>
            {employee?.joiningDate && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Joined {employee.joiningDate}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Verified Account</span>
            </div>
          </div>
        </div>

        {/* Editable Contact Information */}
        <div className="md:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">
            Contact Information (Editable)
          </h3>

          {success && (
            <div className="mb-4 p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>Contact details updated successfully in HCM records</span>
            </div>
          )}

          <form onSubmit={handleSaveContact} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Mobile Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+92 300 1234567"
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Residential Address</label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <textarea
                  rows={3}
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="Street address, Apartment / Block, City"
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50 font-medium"
              >
                {saving ? 'Saving...' : 'Update Contact Info'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
