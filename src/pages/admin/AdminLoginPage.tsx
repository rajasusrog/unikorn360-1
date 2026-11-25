import React, { useState, useEffect, useRef } from 'react';
import {
  Lock,
  ArrowRight,
  AlertTriangle,
  Mail,
  Loader2
} from 'lucide-react';
import { SEOHead } from '../../components/SEOHead';
import { AdminSessionCheckResult, servicesDb } from '../../lib/supabase';

interface AdminLoginPageProps {
  onNavigate: (path: string) => void;
}

const GoogleLogoIcon: React.FC = () => (
  <svg
    aria-hidden="true"
    className="w-4 h-4 shrink-0"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

function parseOAuthCallbackUrlState(): {
  oauthError: string | null;
  hasCallbackParams: boolean;
} {
  if (typeof window === 'undefined') {
    return { oauthError: null, hasCallbackParams: false };
  }

  const searchParams = new URLSearchParams(window.location.search || '');
  const rawHash = window.location.hash.startsWith('#')
    ? window.location.hash.slice(1)
    : window.location.hash || '';
  const hashParams = new URLSearchParams(rawHash);

  const rawErrorDesc =
    searchParams.get('error_description') ||
    hashParams.get('error_description') ||
    searchParams.get('error') ||
    hashParams.get('error');

  const hasCallbackParams = Boolean(
    searchParams.get('code') ||
      hashParams.get('access_token') ||
      hashParams.get('refresh_token')
  );

  if (!rawErrorDesc) {
    return { oauthError: null, hasCallbackParams };
  }

  const normalized = rawErrorDesc.replace(/\+/g, ' ').trim().slice(0, 240);
  return {
    oauthError: normalized || 'Google authentication failed or was cancelled.',
    hasCallbackParams
  };
}

function clearOAuthUrlParams(): void {
  if (typeof window === 'undefined' || !window.history?.replaceState) return;
  if (window.location.search || window.location.hash) {
    window.history.replaceState({}, '', '/admin/login');
  }
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onNavigate }) => {
  const initialCallback = parseOAuthCallbackUrlState();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(initialCallback.oauthError || '');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [oauthVerifying, setOauthVerifying] = useState(initialCallback.hasCallbackParams);

  const navigatedRef = useRef(false);

  // Restore session (including Supabase OAuth redirect callback via detectSessionInUrl)
  // and verify authenticated user UUID against creator_admin_users via /api/admin/auth/me.
  useEffect(() => {
    let active = true;
    const { oauthError, hasCallbackParams } = parseOAuthCallbackUrlState();

    if (oauthError) {
      setError(oauthError);
      setOauthVerifying(false);
      clearOAuthUrlParams();
    }

    const handleVerificationResult = (result: AdminSessionCheckResult) => {
      if (!active) return;

      if (result.status === 'authenticated' && result.session) {
        if (!navigatedRef.current) {
          navigatedRef.current = true;
          clearOAuthUrlParams();
          onNavigate('/admin');
        }
        return;
      }

      if (result.status === 'forbidden') {
        setError(
          result.error ||
            'Access Denied: Your Google account is not registered as an administrator in creator_admin_users.'
        );
        setOauthVerifying(false);
        setGoogleLoading(false);
        clearOAuthUrlParams();
        return;
      }

      if (result.status === 'error' && result.error) {
        setError(result.error);
        setOauthVerifying(false);
        setGoogleLoading(false);
      }
    };

    const unsubscribe = servicesDb.onAdminAuthStateChange((result, event) => {
      if (!active) return;
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
        handleVerificationResult(result);
        if (result.status === 'unauthenticated' && !hasCallbackParams) {
          setOauthVerifying(false);
        }
      }
    });

    servicesDb.verifyAdminSession().then((result) => {
      if (!active) return;
      handleVerificationResult(result);
      if (result.status === 'unauthenticated' && !hasCallbackParams) {
        setOauthVerifying(false);
      }
    });

    // Safety timeout if an OAuth callback query parameter fails to exchange into a session
    const callbackTimeout = hasCallbackParams
      ? window.setTimeout(() => {
          if (!active) return;
          setOauthVerifying(false);
        }, 5000)
      : null;

    return () => {
      active = false;
      unsubscribe();
      if (callbackTimeout !== null) {
        window.clearTimeout(callbackTimeout);
      }
    };
  }, [onNavigate]);

  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      const origin =
        typeof window !== 'undefined' && window.location?.origin
          ? window.location.origin
          : 'https://www.unikorn360.com';
      const result = await servicesDb.signInWithGoogleOAuth(origin);
      if (result.status !== 'redirecting') {
        setError(result.error || 'Unable to initiate Google authentication.');
        setGoogleLoading(false);
      }
    } catch {
      setError('Network communication failed while initiating Google sign-in.');
      setGoogleLoading(false);
    }
  };

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
        navigatedRef.current = true;
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

  const isBusy = loading || googleLoading || oauthVerifying;

  return (
    <main className="bg-[#06162D] min-h-screen flex items-center justify-center p-4">
      <SEOHead
        title="Admin Portal Login — UNIKORN360"
        description="Restricted administrative portal for UNIKORN360 operations and Creator Network roster management."
        canonicalUrl="https://www.unikorn360.com/admin/login"
        robots="noindex, nofollow"
      />

      <div className="max-w-md w-full bg-[#081B37] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl text-left">
        {/* Brand Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white border border-slate-700 flex items-center justify-center p-1 shrink-0 overflow-hidden shadow-md">
            <img
              src="/assets/aistudio/ChatGPT_Image_Oct_30__2026__06_57_30_AM_a8896c5c.png"
              alt="UNIKORN360 Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold font-serif text-white tracking-wide">
              UNIKORN<span className="text-[#F3C94F]">360</span> Operations
            </h1>
            <p className="text-[11px] text-slate-400 uppercase tracking-widest mt-0.5">
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

        {oauthVerifying && (
          <div className="mb-4 p-3 rounded-xl bg-[#06162D] border border-[#F3C94F]/40 text-[#F3C94F] text-xs flex items-center gap-2.5">
            <Loader2 className="w-4 h-4 shrink-0 animate-spin" />
            <span>Verifying Google session and administrator access...</span>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mb-4 p-3 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs flex items-center gap-2"
          >
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Google Sign-In Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isBusy}
          className="w-full py-3 px-4 bg-white hover:bg-slate-100 text-[#06162D] border border-slate-200 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-md active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {googleLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-[#06162D]" />
              <span>Redirecting to Google...</span>
            </>
          ) : (
            <>
              <GoogleLogoIcon />
              <span>Continue with Google</span>
            </>
          )}
        </button>

        {/* OR Divider */}
        <div className="my-5 flex items-center gap-3" aria-hidden="true">
          <div className="h-px flex-1 bg-slate-700/80" />
          <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
            OR
          </span>
          <div className="h-px flex-1 bg-slate-700/80" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>Admin Account Email</span>
            </label>
            <input
              type="email"
              required
              disabled={isBusy}
              placeholder="e.g. admin@unikorn360.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#06162D] border border-slate-700 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-400 focus:border-[#43C8E8] focus:outline-none disabled:opacity-60"
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
              disabled={isBusy}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter account password"
              className="w-full bg-[#06162D] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-400 focus:border-[#F3C94F] focus:outline-none disabled:opacity-60"
            />
          </div>

          <button
            type="submit"
            disabled={isBusy}
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
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('/');
            }}
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            ← Return to Public Website
          </a>
        </div>
      </div>
    </main>
  );
};
