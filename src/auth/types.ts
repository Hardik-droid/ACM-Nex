export type AccountState =
  | 'PENDING_APPROVAL'
  | 'ACTIVE'
  | 'REJECTED'
  | 'SUSPENDED'
  | 'DEACTIVATED';

export type AuthRole =
  | 'PLATFORM_ADMIN'
  | 'EB_ADMIN'
  | 'CORE_MEMBER'
  | 'REVIEWER'
  | 'THIRD_YEAR_MEMBER'
  | 'SECOND_YEAR_MEMBER'
  | 'FIRST_YEAR_MEMBER'
  | 'SOCIETY_MEMBER'
  | 'GUEST_OBSERVER';

export type MembershipRequestStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'CLARIFICATION_REQUIRED'
  | 'CANCELLED'
  | 'EXPIRED';

export interface AuthUser {
  id: string;
  primary_email: string;
  normalized_email: string;
  full_name: string;
  avatar_url?: string;
  account_state: AccountState;
  role: AuthRole;
  team_ids: string[];
  email_verified_at?: string;
  approved_at?: string;
  approved_by?: string;
  permission_version: number;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
  version: number;
}

export interface ExternalIdentity {
  id: string;
  user_id: string;
  provider: 'google';
  provider_subject: string;
  provider_tenant: string;
  email_at_login: string;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
}

export interface MembershipRequest {
  id: string;
  user_id: string;
  organization_id: string;
  verified_email: string;
  google_subject: string;
  requested_role: AuthRole;
  requested_team_ids: string[];
  academic_year: string;
  reason_for_access: string;
  status: MembershipRequestStatus;
  created_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  decision_reason?: string;
  expires_at: string;
  version: number;
}

export interface AppSession {
  id: string;
  user_id: string;
  token_hash: string;
  csrf_token_hash: string;
  account_state_at_issue: AccountState;
  permission_version: number;
  created_at: string;
  last_seen_at: string;
  expires_at: string;
  revoked_at?: string;
  revocation_reason?: string;
}

export interface OAuthTransaction {
  state_hash: string;
  nonce: string;
  code_verifier: string;
  return_to: string;
  browser_binding_hash: string;
  created_at: string;
  expires_at: string;
  consumed_at?: string;
}

export interface AuditEvent {
  id: string;
  actor_user_id?: string;
  target_user_id?: string;
  action: string;
  result: 'SUCCESS' | 'DENIED' | 'FAILED';
  organization_id?: string;
  resource_type?: string;
  resource_id?: string;
  request_id?: string;
  timestamp: string;
  reason?: string;
  metadata?: Record<string, string | number | boolean | null>;
}

export interface AuthStoreData {
  users: AuthUser[];
  external_identities: ExternalIdentity[];
  membership_requests: MembershipRequest[];
  sessions: AppSession[];
  oauth_transactions: OAuthTransaction[];
  audit_events: AuditEvent[];
}

export interface PublicAuthSession {
  authenticated: boolean;
  session?: {
    id: string;
    csrfToken: string;
    expiresAt: string;
  };
  user?: Omit<AuthUser, 'normalized_email' | 'version'>;
  membershipRequest?: MembershipRequest;
}
