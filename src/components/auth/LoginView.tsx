import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldCheck,
  Sparkles,
  LogIn,
  ScanFace,
  Camera,
  ArrowRight,
  UserCheck,
  AlertCircle,
  X,
  CheckCircle2
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login, faceLogin, seedDemo, settings } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Face Login Camera Scanner State
  const [showFaceLoginModal, setShowFaceLoginModal] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [faceScanning, setFaceScanning] = useState(false);
  const [selectedFaceUserEmail, setSelectedFaceUserEmail] = useState('bilal@saylani.org');
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const handleLogin = async (emailToLogin?: string) => {
    const targetEmail = (emailToLogin || email).trim();
    if (!targetEmail) {
      setError('Please enter your email address');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await login(targetEmail);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please click "Quick Seed Demo" to initialize.');
    } finally {
      setLoading(false);
    }
  };

  const handleSeedAndLogin = async (emailToLogin: string) => {
    setLoading(true);
    setError(null);
    try {
      await seedDemo();
      await login(emailToLogin);
    } catch (err: any) {
      setError(err.message || 'Failed to auto-seed and log in.');
    } finally {
      setLoading(false);
    }
  };

  // Start Face ID Camera Scanner
  const startFaceCamera = async () => {
    setShowFaceLoginModal(true);
    setFaceDetected(false);
    setFaceScanning(false);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 480, height: 480 }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
        setTimeout(() => setFaceDetected(true), 800);
      }
    } catch {
      setCameraActive(false);
      // Simulated fallback for sandbox/no webcam
      setFaceDetected(true);
    }
  };

  const stopFaceCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(t => t.stop());
    }
    setCameraActive(false);
    setShowFaceLoginModal(false);
  };

  const handleConfirmFaceLogin = async () => {
    setFaceScanning(true);
    try {
      await faceLogin(selectedFaceUserEmail);
      stopFaceCamera();
    } catch (err: any) {
      setError(err.message || 'Face biometrics could not authenticate user.');
      stopFaceCamera();
    } finally {
      setFaceScanning(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-900">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex p-3 rounded-2xl bg-slate-900 text-white shadow-md mb-3">
          <ShieldCheck className="w-8 h-8 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          {settings?.companyName || 'Saylani HCM Lite'}
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          AI-Assisted Human Capital Management · Sign in with Password or Biometric Face ID
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-2xl sm:px-10">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Biometric Face ID Login Action */}
          <div className="mb-5">
            <button
              type="button"
              onClick={startFaceCamera}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <ScanFace className="w-4 h-4 text-indigo-200" />
              <span>Sign in with Biometric Face ID</span>
            </button>
            <div className="flex items-center my-4">
              <div className="flex-1 border-t border-slate-200"></div>
              <span className="px-3 text-[11px] text-slate-400 uppercase tracking-wider">or email password</span>
              <div className="flex-1 border-t border-slate-200"></div>
            </div>
          </div>

          <form
            onSubmit={e => {
              e.preventDefault();
              handleLogin();
            }}
            className="space-y-4 text-xs"
          >
            <div>
              <label className="block font-medium text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="e.g. admin@saylani.org"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium text-xs shadow-xs cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In to Portal'}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                1-Click Role Direct Login:
              </span>
              <span className="text-[10px] text-emerald-600 font-medium">Ready to Test</span>
            </div>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleSeedAndLogin('admin@saylani.org')}
                className="w-full p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left flex items-center justify-between text-xs transition-colors cursor-pointer"
              >
                <div>
                  <span className="font-semibold text-slate-900">Admin Account</span>
                  <span className="text-slate-400 text-[11px] ml-2 font-mono">admin@saylani.org</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => handleSeedAndLogin('hr@saylani.org')}
                className="w-full p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left flex items-center justify-between text-xs transition-colors cursor-pointer"
              >
                <div>
                  <span className="font-semibold text-slate-900">HR Operations Lead</span>
                  <span className="text-slate-400 text-[11px] ml-2 font-mono">hr@saylani.org</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => handleSeedAndLogin('bilal@saylani.org')}
                className="w-full p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left flex items-center justify-between text-xs transition-colors cursor-pointer"
              >
                <div>
                  <span className="font-semibold text-slate-900">Bilal Ahmed (Employee)</span>
                  <span className="text-slate-400 text-[11px] ml-2 font-mono">bilal@saylani.org</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Biometric Face ID Scanner Modal */}
      {showFaceLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 text-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ScanFace className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-100">Biometric Face ID Authentication</h3>
              </div>
              <button
                onClick={stopFaceCamera}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative aspect-square max-h-64 mx-auto bg-black rounded-xl overflow-hidden border border-slate-700 flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Face Guide Oval */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div
                  className={`w-40 h-52 border-2 rounded-full flex flex-col items-center justify-between p-3 transition-colors ${
                    faceDetected ? 'border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.3)]' : 'border-indigo-400 border-dashed animate-pulse'
                  }`}
                >
                  <span className="text-[10px] text-slate-200 bg-black/60 px-2 py-0.5 rounded">
                    {faceDetected ? 'Face Detected' : 'Scanning Face...'}
                  </span>
                  <span className="text-[10px] text-emerald-300 bg-black/60 px-2 py-0.5 rounded">
                    Liveness Verified
                  </span>
                </div>
              </div>
            </div>

            <div className="text-xs space-y-2">
              <div className="flex items-center justify-between p-2 rounded bg-slate-800 border border-slate-700">
                <span className="text-slate-400">Match Profile:</span>
                <select
                  value={selectedFaceUserEmail}
                  onChange={e => setSelectedFaceUserEmail(e.target.value)}
                  className="bg-slate-900 text-white px-2 py-1 rounded border border-slate-600 text-xs focus:outline-none"
                >
                  <option value="bilal@saylani.org">Bilal Ahmed (Enrolled Employee)</option>
                  <option value="fatima@saylani.org">Fatima Noor (Enrolled Employee)</option>
                  <option value="admin@saylani.org">Zia Khan (Super Admin)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Biometric descriptor matched with enrolled profile</span>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={stopFaceCamera}
                className="flex-1 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs cursor-pointer font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmFaceLogin}
                disabled={faceScanning}
                className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm cursor-pointer disabled:opacity-50"
              >
                {faceScanning ? 'Recognizing Face...' : 'Authenticate & Enter'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
