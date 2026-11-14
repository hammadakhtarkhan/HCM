import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, MapPin, Clock, Building2, UserCheck, Sparkles } from 'lucide-react';

export const FirstRunSetupModal: React.FC = () => {
  const { completeSetup, seedDemo } = useAuth();
  const [companyName, setCompanyName] = useState('Saylani IT Systems');
  const [adminName, setAdminName] = useState('Zia Khan');
  const [adminEmail, setAdminEmail] = useState('admin@saylani.org');
  const [officeStartTime, setOfficeStartTime] = useState('09:00');
  const [gracePeriodMinutes, setGracePeriodMinutes] = useState(15);
  const [halfDayHours, setHalfDayHours] = useState(5);
  const [officeLat, setOfficeLat] = useState('24.8607');
  const [officeLng, setOfficeLng] = useState('67.0011');
  const [radiusMeters, setRadiusMeters] = useState(150);
  const [addressName, setAddressName] = useState('Zaitoon Ashraf IT Park, Karachi');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await completeSetup({
        companyName,
        adminName,
        adminEmail,
        officeStartTime,
        gracePeriodMinutes,
        halfDayHours,
        officeLat: parseFloat(officeLat),
        officeLng: parseFloat(officeLng),
        radiusMeters,
        addressName
      });
    } catch (err: any) {
      setError(err.message || 'Setup failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSeedClick = async () => {
    setIsSubmitting(true);
    try {
      await seedDemo();
    } catch (err: any) {
      setError(err.message || 'Seeding failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full p-8 my-8 text-slate-900">
        <div className="flex items-center justify-between pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                Saylani Hackathon 2026
              </span>
              <span className="text-xs text-slate-500">First-Run Installation Wizard</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
              Initialize HCM Lite System
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Set up your organization, admin credentials, and core attendance parameters.
            </p>
          </div>
          <button
            type="button"
            onClick={handleSeedClick}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Quick Demo Seed
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Section: Organization Details */}
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 mb-3">
              <Building2 className="w-4 h-4 text-slate-600" />
              <span>Company Information</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  placeholder="e.g. Saylani IT Systems"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Office Address Name</label>
                <input
                  type="text"
                  required
                  value={addressName}
                  onChange={e => setAddressName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  placeholder="e.g. Zaitoon Ashraf IT Park"
                />
              </div>
            </div>
          </div>

          {/* Section: Admin Account */}
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 mb-3">
              <UserCheck className="w-4 h-4 text-slate-600" />
              <span>Super Admin Credentials</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Admin Full Name</label>
                <input
                  type="text"
                  required
                  value={adminName}
                  onChange={e => setAdminName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  placeholder="e.g. Zia Khan"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Admin Email Address</label>
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={e => setAdminEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  placeholder="admin@saylani.org"
                />
              </div>
            </div>
          </div>

          {/* Section: Attendance Rules */}
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 mb-3">
              <Clock className="w-4 h-4 text-slate-600" />
              <span>Attendance & Shift Policies</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Shift Start Time</label>
                <input
                  type="time"
                  required
                  value={officeStartTime}
                  onChange={e => setOfficeStartTime(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Grace Period (Minutes)</label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  required
                  value={gracePeriodMinutes}
                  onChange={e => setGracePeriodMinutes(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">Late marked after 09:15</span>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Half Day Threshold (Hours)</label>
                <input
                  type="number"
                  min="1"
                  max="8"
                  required
                  value={halfDayHours}
                  onChange={e => setHalfDayHours(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">&lt; 5 hours = half day</span>
              </div>
            </div>
          </div>

          {/* Section: Geofence Location */}
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 mb-3">
              <MapPin className="w-4 h-4 text-slate-600" />
              <span>Office Geofence (Haversine Camera Check)</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Latitude</label>
                <input
                  type="text"
                  required
                  value={officeLat}
                  onChange={e => setOfficeLat(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Longitude</label>
                <input
                  type="text"
                  required
                  value={officeLng}
                  onChange={e => setOfficeLng(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Radius (Meters)</label>
                <input
                  type="number"
                  min="50"
                  max="1000"
                  required
                  value={radiusMeters}
                  onChange={e => setRadiusMeters(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              {isSubmitting ? 'Configuring System...' : 'Complete First-Run Setup'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
