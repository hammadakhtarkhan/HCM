import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { KeyRound, ShieldAlert } from 'lucide-react';

export const ChangePasswordModal: React.FC = () => {
  const { user, changePassword } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!user || !user.mustChangePassword) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setSubmitting(true);
    try {
      await changePassword(newPassword);
    } catch (err: any) {
      setError(err.message || 'Failed to update password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 text-slate-900">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">Password Change Required</h3>
            <p className="text-xs text-slate-500">First-time login security verification</p>
          </div>
        </div>

        <div className="mt-3 p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            Your account was registered with a temporary credential. Please choose a new permanent password to continue into HCM Lite.
          </span>
        </div>

        {error && (
          <div className="mt-3 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">New Password</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              placeholder="Enter new password"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Confirm New Password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              placeholder="Confirm new password"
            />
          </div>

          <div className="pt-3">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2 px-4 bg-slate-900 text-white text-xs font-medium rounded-lg hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Set Permanent Password & Enter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
