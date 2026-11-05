import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Layers,
  User,
  Mail,
  Lock,
  ArrowRight,
  Shield,
  ShieldCheck,
  UserCheck,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  KeyRound,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, currentUser, adminSetupDone } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');

  // Auto redirect if already logged in
  React.useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'Admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/user/dashboard', { replace: true });
      }
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(identifier, password);
      if (user.role === 'Admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/user/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Quick fill student demo for testing
  const handleQuickFillStudent = () => {
    setIdentifier('alex@student.com');
    setPassword('User@123');
    setError('');
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSuccess(`Academic password recovery instructions have been logged for ${forgotEmail}.`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Logo */}
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 via-brand-500 to-indigo-400 text-white shadow-lg shadow-brand-500/25 mb-3">
          <Layers className="w-6 h-6" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          TaskFlow
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Smart Professional Academic Task Management System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 sm:px-10 shadow-premium rounded-3xl border border-slate-200/80 dark:border-slate-800">
          
          {/* Primary Admin Setup & Authentication Status Box */}
          {!adminSetupDone ? (
            <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 border border-indigo-200 dark:border-indigo-800 text-xs">
              <div className="flex items-center gap-2 font-bold text-brand-700 dark:text-brand-300 mb-1">
                <Sparkles className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                <span>Primary Admin Setup Required</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-[11px] mb-3 leading-relaxed">
                Welcome, <strong>Manohar</strong>! Complete your initial setup to establish your personal Admin credentials and set your password.
              </p>
              <Link
                to="/admin-setup"
                className="w-full py-2 px-3 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Set Up Owner Account (Manohar)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="mb-6 p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-brand-700 dark:text-brand-300 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-brand-600" />
                  <span>Primary Admin: Manohar</span>
                </div>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  Configured
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Log in below using username <strong className="font-mono text-slate-700 dark:text-slate-300">Manohar</strong> and your personal password.
              </p>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs border border-rose-200 dark:border-rose-900/60 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Username or Email Address
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. Manohar or student@university.edu"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs text-brand-600 dark:text-brand-400 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 active:bg-brand-800 rounded-xl shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to TaskFlow'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Fill for Student Testing */}
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Student Demo Tester:</span>
            <button
              type="button"
              onClick={handleQuickFillStudent}
              className="px-2.5 py-1 text-[11px] font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 hover:bg-brand-100 dark:bg-brand-950 rounded-lg transition-colors flex items-center gap-1"
            >
              <UserCheck className="w-3.5 h-3.5" /> Fill Student (Alex)
            </button>
          </div>

          {/* Signup link */}
          <div className="mt-5 text-center text-xs text-slate-500 dark:text-slate-400">
            Need a student account?{' '}
            <Link
              to="/signup"
              className="font-semibold text-brand-600 dark:text-brand-400 hover:underline"
            >
              Register as student
            </Link>
          </div>
        </div>

        <p className="mt-4 text-center text-[11px] text-slate-400 dark:text-slate-500">
          Client-Side SHA-256 Hashing • LocalStorage Security
        </p>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-premium">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Password Assistance
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Enter your email or username to request password reset assistance.
            </p>
            {forgotSuccess ? (
              <div className="mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{forgotSuccess}</span>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="mt-4 space-y-3">
                <input
                  type="text"
                  required
                  placeholder="Username or email address"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                />
                <button
                  type="submit"
                  className="w-full py-2 text-xs font-semibold text-white bg-brand-600 rounded-xl"
                >
                  Send Recovery Link
                </button>
              </form>
            )}
            <button
              onClick={() => {
                setShowForgotModal(false);
                setForgotSuccess('');
              }}
              className="mt-4 w-full py-2 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            >
              Back to Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
