import React, { useState } from 'react';
import { Compass, KeyRound, ShieldCheck } from 'lucide-react';
import { startGoogleLogin } from '../auth/client';

export default function SignInPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const showDevBypass = import.meta.env.DEV && import.meta.env.VITE_DEV_AUTH_BYPASS === 'true';

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await startGoogleLogin('/app/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to start Google login.');
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#fcfaf7] flex items-center justify-center px-6">
      <section className="w-full max-w-md bg-white border border-[#EBE2D4] rounded-3xl p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-11 w-11 rounded-lg bg-[#1A4331] text-white flex items-center justify-center">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-[#1A4331] leading-none">ACM Nexus</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-black/40 mt-1">Thapar ACM operations</p>
          </div>
        </div>

        <div className="space-y-3 mb-7">
          <h2 className="font-display text-xl font-bold text-[#1a1a1a]">Sign in</h2>
          <p className="text-sm text-black/60 leading-relaxed">
            Only verified @thapar.edu Google Workspace accounts can access ACM Nexus.
            Access is subject to ACM membership approval.
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogin}
          disabled={loading}
          className="w-full rounded-xl bg-[#1A4331] px-4 py-3 text-sm font-bold text-white hover:bg-[#255C44] disabled:opacity-60 flex items-center justify-center gap-2"
        >
          <ShieldCheck className="h-4 w-4" />
          {loading ? 'Starting secure sign-in...' : 'Continue with Thapar Google Account'}
        </button>

        {showDevBypass && (
          <button
            type="button"
            onClick={() => window.location.assign('/api/v1/auth/dev-login?return_to=/app/dashboard')}
            className="mt-3 w-full rounded-xl border border-[#D8CDBB] bg-[#FAF6EE] px-4 py-3 text-sm font-bold text-[#1A4331] hover:bg-[#F2EADB] flex items-center justify-center gap-2"
          >
            <KeyRound className="h-4 w-4" />
            Continue with local dev session
          </button>
        )}

        {error && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-800">
            {error === 'OAUTH_CONFIG_MISSING'
              ? 'Google OAuth is not configured on the local API server.'
              : error}
          </div>
        )}
      </section>
    </main>
  );
}
