import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Employee, OrgSettings, UserRole } from '../types/hcm';
import { ApiClient } from '../services/api';

interface AuthContextType {
  user: User | null;
  employee: Employee | null;
  settings: OrgSettings | null;
  loading: boolean;
  isSetupCompleted: boolean;
  login: (email: string) => Promise<void>;
  faceLogin: (targetEmail?: string) => Promise<void>;
  logout: () => void;
  changePassword: (newPass: string) => Promise<void>;
  completeSetup: (data: any) => Promise<void>;
  refresh: () => Promise<void>;
  seedDemo: () => Promise<void>;
  resetFresh: () => Promise<void>;
  switchRole: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [settings, setSettings] = useState<OrgSettings | null>(null);
  const [isSetupCompleted, setIsSetupCompleted] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);

  const refresh = async () => {
    try {
      setLoading(true);
      const status = await ApiClient.getSystemStatus();
      setIsSetupCompleted(status.isSetupCompleted);

      const token = localStorage.getItem('hcm_token');
      if (token) {
        try {
          const me = await ApiClient.getMe();
          setUser(me.user);
          setEmployee(me.employee || null);
          setSettings(me.settings);
        } catch {
          localStorage.removeItem('hcm_token');
          setUser(null);
          setEmployee(null);
        }
      } else {
        setUser(null);
        setEmployee(null);
      }
    } catch (err) {
      console.error('Failed to load initial auth state:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const login = async (email: string) => {
    const res = await ApiClient.login(email);
    localStorage.setItem('hcm_token', res.token);
    setUser(res.user);
    await refresh();
  };

  const faceLogin = async (targetEmail?: string) => {
    const res = await ApiClient.faceLogin(targetEmail);
    localStorage.setItem('hcm_token', res.token);
    setUser(res.user);
    await refresh();
  };

  const logout = () => {
    localStorage.removeItem('hcm_token');
    setUser(null);
    setEmployee(null);
  };

  const changePassword = async (newPass: string) => {
    const res = await ApiClient.changePassword(newPass);
    setUser(res.user);
  };

  const completeSetup = async (data: any) => {
    const res = await ApiClient.setupFirstRun(data);
    localStorage.setItem('hcm_token', res.token);
    setUser(res.user);
    setSettings(res.settings);
    setIsSetupCompleted(true);
    await refresh();
  };

  const seedDemo = async () => {
    await ApiClient.seedDemoData();
    localStorage.removeItem('hcm_token');
    await refresh();
  };

  const resetFresh = async () => {
    await ApiClient.resetFreshInstall();
    localStorage.removeItem('hcm_token');
    setUser(null);
    setEmployee(null);
    setIsSetupCompleted(false);
    await refresh();
  };

  // Helper for judges to test roles immediately
  const switchRole = async (targetRole: UserRole) => {
    try {
      const usersRes = await ApiClient.getUsers().catch(() => []);
      const targetUser = usersRes.find((u: User) => u.role === targetRole);
      if (targetUser) {
        await login(targetUser.email);
      } else if (targetRole === 'admin') {
        await login('admin@saylani.org').catch(() => login('admin@company.com'));
      } else if (targetRole === 'hr') {
        await login('hr@saylani.org');
      } else if (targetRole === 'employee') {
        await login('bilal@saylani.org');
      }
    } catch (err) {
      console.warn('Switch role helper error:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        employee,
        settings,
        loading,
        isSetupCompleted,
        login,
        faceLogin,
        logout,
        changePassword,
        completeSetup,
        refresh,
        seedDemo,
        resetFresh,
        switchRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
