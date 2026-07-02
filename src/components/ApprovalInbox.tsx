import React, { useEffect, useState } from 'react';
import { CheckCircle2, Inbox, RefreshCw } from 'lucide-react';
import { approveMembershipRequest, authRoleLabel, fetchMembershipRequests } from '../auth/client';
import { AuthRole, MembershipRequest, PublicAuthSession } from '../auth/types';

const STANDARD_ROLES: AuthRole[] = [
  'FIRST_YEAR_MEMBER',
  'SECOND_YEAR_MEMBER',
  'THIRD_YEAR_MEMBER',
  'SOCIETY_MEMBER',
  'GUEST_OBSERVER',
];

export default function ApprovalInbox({ authSession }: { authSession: PublicAuthSession | null }) {
  const [requests, setRequests] = useState<MembershipRequest[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<Record<string, AuthRole>>({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const currentRole = authSession?.user?.role;
  const csrfToken = authSession?.session?.csrfToken || '';

  const roleOptions = currentRole === 'EB_ADMIN' || currentRole === 'PLATFORM_ADMIN'
    ? [...STANDARD_ROLES, 'REVIEWER', 'CORE_MEMBER', 'EB_ADMIN'] as AuthRole[]
    : STANDARD_ROLES;

  const load = async () => {
    if (!authSession?.authenticated) return;
    setLoading(true);
    try {
      const body = await fetchMembershipRequests();
      setRequests(body.requests);
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [authSession?.session?.id]);

  return (
    <div className="bg-white border border-[#EBE2D4] rounded-3xl p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3 pb-4 border-b border-[#FAF6EE] mb-4">
        <div className="flex items-center gap-2">
          <Inbox className="h-4.5 w-4.5 text-[#1A4331]" />
          <div>
            <h3 className="text-sm font-display font-bold text-[#1A4331]">Membership Approval Inbox</h3>
            <p className="text-xs text-emerald-950/60">Core members can approve ordinary members. EB admins can approve privileged requests.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={load}
          className="rounded-xl border border-[#EBE2D4] px-3 py-2 text-xs font-bold text-[#1A4331] flex items-center gap-1.5"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      {message && (
        <div className="mb-4 bg-[#E6EFEA] text-[#1A4331] px-4 py-2 text-xs font-bold border border-[#1A4331]/10 rounded-2xl">
          {message}
        </div>
      )}

      {loading ? (
        <p className="text-xs text-black/40 py-6">Loading approval queue...</p>
      ) : requests.length === 0 ? (
        <p className="text-xs text-black/40 py-6">No pending membership requests.</p>
      ) : (
        <div className="space-y-3">
          {requests.map(request => {
            const role = selectedRoles[request.id] || request.requested_role;
            return (
              <div key={request.id} className="rounded-2xl border border-[#EBE2D4] bg-[#FAF6EE]/50 p-4 flex flex-col lg:flex-row gap-3 lg:items-center">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[#1A4331] truncate">{request.verified_email}</p>
                  <p className="text-[10px] text-black/45 mt-1">
                    Requested {authRoleLabel(request.requested_role)} on {new Date(request.created_at).toLocaleString()}
                  </p>
                </div>
                <select
                  value={role}
                  onChange={(event) => setSelectedRoles(prev => ({ ...prev, [request.id]: event.target.value as AuthRole }))}
                  className="rounded-xl border border-[#EBE2D4] bg-white px-3 py-2 text-xs font-bold text-[#1A4331]"
                >
                  {roleOptions.map(option => (
                    <option key={option} value={option}>{authRoleLabel(option)}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={async () => {
                    await approveMembershipRequest({
                      requestId: request.id,
                      role,
                      teamIds: request.requested_team_ids,
                      version: request.version,
                      csrfToken,
                    });
                    setMessage(`Approved ${request.verified_email}`);
                    await load();
                  }}
                  className="rounded-xl bg-[#1A4331] px-4 py-2 text-xs font-bold text-white flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Approve
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
