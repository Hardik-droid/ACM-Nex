import { AuthRole, MembershipRequest, PublicAuthSession } from './types';

export async function fetchAuthSession(): Promise<PublicAuthSession> {
  const response = await fetch('/api/v1/auth/session', { credentials: 'include' });
  if (!response.ok) throw new Error('SESSION_FETCH_FAILED');
  return response.json();
}

export async function startGoogleLogin(returnTo = '/app/dashboard') {
  const response = await fetch(`/api/v1/auth/google/start?return_to=${encodeURIComponent(returnTo)}`, {
    credentials: 'include',
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || 'OAUTH_START_FAILED');
  window.location.assign(body.authorizationUrl);
}

export async function logout(csrfToken: string) {
  await fetch('/api/v1/auth/logout', {
    method: 'POST',
    credentials: 'include',
    headers: { 'X-CSRF-Token': csrfToken },
  });
}

export async function cancelMyMembershipRequest(csrfToken: string) {
  const response = await fetch('/api/v1/membership-requests/me/cancel', {
    method: 'POST',
    credentials: 'include',
    headers: { 'X-CSRF-Token': csrfToken },
  });
  if (!response.ok) throw new Error('CANCEL_REQUEST_FAILED');
  return response.json();
}

export async function fetchMembershipRequests(): Promise<{ requests: MembershipRequest[] }> {
  const response = await fetch('/api/v1/membership-requests', { credentials: 'include' });
  if (!response.ok) throw new Error('REQUESTS_FETCH_FAILED');
  return response.json();
}

export async function approveMembershipRequest(input: {
  requestId: string;
  role: AuthRole;
  teamIds: string[];
  version: number;
  csrfToken: string;
}) {
  const response = await fetch(`/api/v1/membership-requests/${input.requestId}/approve`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': input.csrfToken,
    },
    body: JSON.stringify({
      role: input.role,
      teamIds: input.teamIds,
      version: input.version,
      decisionReason: 'Approved from ACM Nexus approval inbox.',
    }),
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || 'APPROVAL_FAILED');
  return body;
}

export function authRoleLabel(role: AuthRole) {
  return role
    .toLowerCase()
    .split('_')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
