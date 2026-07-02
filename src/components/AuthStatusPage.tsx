import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { startGoogleLogin } from '../auth/client';

const copy: Record<string, { title: string; body: string }> = {
  rejected: {
    title: 'Membership request rejected',
    body: 'This Google identity is verified, but the local ACM Nexus membership request was not approved.',
  },
  suspended: {
    title: 'Account suspended',
    body: 'This account cannot access ACM Nexus until an authorized EB administrator restores access.',
  },
  deactivated: {
    title: 'Account deactivated',
    body: 'This account is no longer active in ACM Nexus.',
  },
  error: {
    title: 'Sign-in failed',
    body: 'The OAuth response could not be accepted. No application session was created.',
  },
};

export default function AuthStatusPage({ kind = 'error' }: { kind?: string }) {
  const details = copy[kind] || copy.error;
  const errorCode = new URLSearchParams(window.location.search).get('code');

  return (
    <main className="min-h-screen bg-[#fcfaf7] flex items-center justify-center px-6">
      <section className="w-full max-w-md bg-white border border-[#EBE2D4] rounded-3xl p-8 shadow-sm text-center">
        <div className="mx-auto h-12 w-12 rounded-2xl bg-rose-50 text-[#E15B3A] flex items-center justify-center">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h1 className="font-display text-2xl font-bold text-[#1a1a1a] mt-5">{details.title}</h1>
        <p className="text-sm text-black/60 mt-2 leading-relaxed">{details.body}</p>
        {errorCode && (
          <p className="mt-4 rounded-xl bg-[#FAF6EE] border border-[#EBE2D4] px-3 py-2 text-xs font-mono text-black/50">
            {errorCode}
          </p>
        )}
        <button
          type="button"
          onClick={() => startGoogleLogin('/app/dashboard')}
          className="mt-6 w-full rounded-xl bg-[#1A4331] px-4 py-2.5 text-xs font-bold text-white"
        >
          Try sign-in again
        </button>
      </section>
    </main>
  );
}
