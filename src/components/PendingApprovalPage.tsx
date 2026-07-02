import React, { useState } from 'react';
import { Clock3, LogOut, XCircle } from 'lucide-react';
import { cancelMyMembershipRequest, logout, authRoleLabel } from '../auth/client';
import { PublicAuthSession } from '../auth/types';

export default function PendingApprovalPage({
  session,
  onRefresh,
}: {
  session: PublicAuthSession;
  onRefresh: () => void;
}) {
  const [message, setMessage] = useState('');
  const request = session.membershipRequest;
  const csrfToken = session.session?.csrfToken || '';

  return (
    <main className="min-h-screen bg-[#fcfaf7] flex items-center justify-center px-6">
      <section className="w-full max-w-2xl bg-white border border-[#EBE2D4] rounded-3xl p-8 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-2xl bg-[#E6EFEA] text-[#1A4331] flex items-center justify-center">
            <Clock3 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-[#1A4331]">Your Thapar account has been verified.</h1>
            <p className="text-sm text-black/60 mt-2 leading-relaxed">
              Your ACM Nexus membership request is awaiting approval from an authorized Core or EB member.
            </p>
          </div>
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 text-sm">
          <div className="rounded-xl bg-[#FAF6EE] border border-[#EBE2D4] p-4">
            <dt className="text-[10px] uppercase tracking-widest text-black/40 font-bold">Verified email</dt>
            <dd className="font-semibold text-[#1a1a1a] mt-1">{session.user?.primary_email}</dd>
          </div>
          <div className="rounded-xl bg-[#FAF6EE] border border-[#EBE2D4] p-4">
            <dt className="text-[10px] uppercase tracking-widest text-black/40 font-bold">Request date</dt>
            <dd className="font-semibold text-[#1a1a1a] mt-1">
              {request ? new Date(request.created_at).toLocaleString() : 'Not available'}
            </dd>
          </div>
          <div className="rounded-xl bg-[#FAF6EE] border border-[#EBE2D4] p-4">
            <dt className="text-[10px] uppercase tracking-widest text-black/40 font-bold">Requested role</dt>
            <dd className="font-semibold text-[#1a1a1a] mt-1">
              {request ? authRoleLabel(request.requested_role) : 'Society Member'}
            </dd>
          </div>
          <div className="rounded-xl bg-[#FAF6EE] border border-[#EBE2D4] p-4">
            <dt className="text-[10px] uppercase tracking-widest text-black/40 font-bold">Current status</dt>
            <dd className="font-semibold text-[#1a1a1a] mt-1">{request?.status || session.user?.account_state}</dd>
          </div>
        </dl>

        {message && (
          <div className="mt-5 rounded-xl border border-[#EBE2D4] bg-[#FAF6EE] px-4 py-3 text-xs text-black/60">
            {message}
          </div>
        )}

        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onRefresh}
            className="rounded-xl bg-[#1A4331] px-4 py-2.5 text-xs font-bold text-white"
          >
            Refresh status
          </button>
          {request?.status === 'PENDING' && (
            <button
              type="button"
              onClick={async () => {
                await cancelMyMembershipRequest(csrfToken);
                setMessage('Your request was cancelled.');
                onRefresh();
              }}
              className="rounded-xl border border-rose-200 px-4 py-2.5 text-xs font-bold text-rose-700 flex items-center justify-center gap-1.5"
            >
              <XCircle className="h-4 w-4" />
              Cancel request
            </button>
          )}
          <button
            type="button"
            onClick={async () => {
              await logout(csrfToken);
              window.location.assign('/');
            }}
            className="rounded-xl border border-[#EBE2D4] px-4 py-2.5 text-xs font-bold text-black/60 flex items-center justify-center gap-1.5"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </section>
    </main>
  );
}
