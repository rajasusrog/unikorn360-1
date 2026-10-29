import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Lock, 
  ArrowRight, 
  AlertTriangle,
  Mail
} from 'lucide-react';
import { SEOHead } from '../../components/SEOHead';
import { servicesDb } from '../../lib/supabase';

interface AdminLoginPageProps {
  onNavigate: (path: string) => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If an active SDK session already exists and passes administrator membership check, redirect
  useEffect(() => {
    let active = true;
    servicesDb.verifyAdminSession().then((result) => {
      if (!active) return;
      if (result.status === 'authenticated' && result.session) {
        onNavigate('/admin');
      } else if (result.status === 'forbidden' && result.error) {
        setError(result.error);
      }
    });
    return () => {
      active = false;
    };
  }, [onNavigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please provide both your administrator email and password.');
      return;
    }

    setLoading(true);

    try {
      const result = await servicesDb.signInAdmin(email.trim(), password.trim());
      if (result.status === 'authenticated' && result.session) {
        onNavigate('/admin');
      } else {
        setError(result.error || 'Authentication rejected. Valid administrative credentials required.');
      }
    } catch {
      setError('Network communication failed while attempting to reach authentication server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#06162D] min-h-screen flex items-center justify-center p-4">
      <SEOHead
        title="Admin Portal Login — UNIKORN360"
        description="Restricted administrative portal for UNIKORN360 operations and Creator Network roster management."
        canonicalUrl="https://www.unikorn360.com/admin/login"
      />

      <div className="max-w-md w-full bg-[#081B37] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl text-left">
        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-[#F3C94F]">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold font-serif text-white tracking-wide">
              UNIKORN<span className="text-[#F3C94F]">360</span> Operations
            </h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest">
              Private Management Console
            </p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-white">Administrator Access</h2>
          <p className="text-xs text-slate-300 mt-1">
            Sign in with your authorized administrator Supabase credentials to access the console.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>Admin Account Email</span>
            </label>
            <input
              type="email"
              required
              placeholder="e.g. admin@unikorn360.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#06162D] border border-slate-700 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-400 focus:border-[#43C8E8] focus:outline-none"
              autoFocus
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#F3C94F]" />
                <span>Password</span>
              </label>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter account password"
              className="w-full bg-[#06162D] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-400 focus:border-[#F3C94F] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 bg-[#F3C94F] hover:bg-[#e0b83f] text-[#06162D] font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Enter Admin Console</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-800 text-center">
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            ← Return to Public Website
          </button>
        </div>
      </div>
    </div>
  );
};
