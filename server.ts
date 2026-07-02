import { config as loadEnv } from 'dotenv';
import express, { Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  AuthError,
  canApproveMembership,
  createGoogleAuthorizationUrl,
  createPkcePair,
  fetchGoogleJwk,
  hashSecret,
  randomToken,
  validateReturnTo,
  verifyGoogleIdToken,
  type GoogleIdTokenClaims,
  type OAuthConfig,
} from './src/auth/oauth';
import {
  AppSession,
  AuthRole,
  AuthStoreData,
  AuthUser,
  AuditEvent,
  ExternalIdentity,
  MembershipRequest,
  OAuthTransaction,
} from './src/auth/types';

loadEnv({ path: '.env.local' });
loadEnv();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = parseInt(process.env.API_PORT || process.env.WS_PORT || '3001', 10);
const DATA_DIR = process.env.AUTH_DATA_DIR || path.join(__dirname, 'data');
const STORE_FILE = path.join(DATA_DIR, 'auth-store.json');
const SESSION_TTL_MS = 1000 * 60 * 60 * 8;
const OAUTH_TRANSACTION_TTL_MS = 1000 * 60 * 10;
const MEMBERSHIP_REQUEST_TTL_MS = 1000 * 60 * 60 * 24 * 30;
const ORG_ID = 'org-acm';
const AUTH_ROLES: AuthRole[] = [
  'PLATFORM_ADMIN',
  'EB_ADMIN',
  'CORE_MEMBER',
  'REVIEWER',
  'THIRD_YEAR_MEMBER',
  'SECOND_YEAR_MEMBER',
  'FIRST_YEAR_MEMBER',
  'SOCIETY_MEMBER',
  'GUEST_OBSERVER',
];

const app = express();
const server = createServer(app);

interface AuthedRequest extends Request {
  auth?: {
    session: AppSession;
    user: AuthUser;
    csrfToken?: string;
  };
}

function nowIso() {
  return new Date().toISOString();
}

function requiredEnv(name: string) {
  return process.env[name] || '';
}

function getOAuthConfig(): OAuthConfig | null {
  const config: OAuthConfig = {
    clientId: requiredEnv('GOOGLE_OAUTH_CLIENT_ID'),
    clientSecret: requiredEnv('GOOGLE_OAUTH_CLIENT_SECRET'),
    redirectUri: requiredEnv('GOOGLE_OAUTH_REDIRECT_URI'),
    issuer: process.env.GOOGLE_OIDC_ISSUER || 'https://accounts.google.com',
    allowedHostedDomain: process.env.GOOGLE_ALLOWED_HOSTED_DOMAIN || 'thapar.edu',
  };

  if (!config.clientId || !config.clientSecret || !config.redirectUri) {
    return null;
  }
  return config;
}

function assertProductionConfig() {
  if (process.env.NODE_ENV !== 'production') return;
  const missing = [
    'GOOGLE_OAUTH_CLIENT_ID',
    'GOOGLE_OAUTH_CLIENT_SECRET',
    'GOOGLE_OAUTH_REDIRECT_URI',
    'FRONTEND_URL',
    'BACKEND_URL',
  ].filter(name => !process.env[name]);
  if (missing.length > 0) {
    throw new Error(`Missing production OAuth configuration: ${missing.join(', ')}`);
  }
}

function emptyStore(): AuthStoreData {
  return {
    users: [],
    external_identities: [],
    membership_requests: [],
    sessions: [],
    oauth_transactions: [],
    audit_events: [],
  };
}

function loadStore(): AuthStoreData {
  mkdirSync(DATA_DIR, { recursive: true });
  if (!existsSync(STORE_FILE)) {
    const initial = emptyStore();
    writeFileSync(STORE_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }

  return {
    ...emptyStore(),
    ...JSON.parse(readFileSync(STORE_FILE, 'utf8')),
  };
}

let store = loadStore();

function saveStore() {
  writeFileSync(STORE_FILE, JSON.stringify(store, null, 2));
}

function audit(event: Omit<AuditEvent, 'id' | 'timestamp'>) {
  store.audit_events.unshift({
    id: `audit-${Date.now()}-${randomToken(6)}`,
    timestamp: nowIso(),
    ...event,
  });
  store.audit_events = store.audit_events.slice(0, 1000);
  saveStore();
}

function seedBootstrapApprover() {
  const email = process.env.BOOTSTRAP_EB_ADMIN_EMAIL;
  const subject = process.env.BOOTSTRAP_EB_ADMIN_GOOGLE_SUB;
  if (!email || !subject) return;

  const existing = store.external_identities.find(identity => (
    identity.provider === 'google' && identity.provider_subject === subject
  ));
  if (existing) return;

  const now = nowIso();
  const user: AuthUser = {
    id: `user-${randomToken(10)}`,
    primary_email: email,
    normalized_email: email.toLowerCase(),
    full_name: process.env.BOOTSTRAP_EB_ADMIN_NAME || 'Bootstrap EB Admin',
    avatar_url: '',
    account_state: 'ACTIVE',
    role: 'EB_ADMIN',
    team_ids: [],
    email_verified_at: now,
    approved_at: now,
    approved_by: 'system',
    permission_version: 1,
    last_login_at: undefined,
    created_at: now,
    updated_at: now,
    version: 1,
  };
  const identity: ExternalIdentity = {
    id: `ext-${randomToken(10)}`,
    user_id: user.id,
    provider: 'google',
    provider_subject: subject,
    provider_tenant: process.env.GOOGLE_ALLOWED_HOSTED_DOMAIN || 'thapar.edu',
    email_at_login: email,
    email_verified: true,
    created_at: now,
    updated_at: now,
  };

  store.users.push(user);
  store.external_identities.push(identity);
  audit({
    actor_user_id: 'system',
    target_user_id: user.id,
    action: 'role.assigned',
    result: 'SUCCESS',
    organization_id: ORG_ID,
    reason: 'bootstrap EB admin provisioned from environment',
  });
}

seedBootstrapApprover();
assertProductionConfig();

function parseCookies(req: Request) {
  const header = req.headers.cookie || '';
  return Object.fromEntries(
    header.split(';')
      .map(part => part.trim())
      .filter(Boolean)
      .map(part => {
        const index = part.indexOf('=');
        return [part.slice(0, index), decodeURIComponent(part.slice(index + 1))];
      })
  );
}

function cookieOptions(maxAgeMs: number) {
  const secure = (process.env.SESSION_COOKIE_SECURE || '').toLowerCase() === 'true' ||
    process.env.NODE_ENV === 'production';
  const sameSite = process.env.SESSION_COOKIE_SAMESITE || 'lax';
  const domain = process.env.SESSION_COOKIE_DOMAIN;
  return [
    'Path=/',
    'HttpOnly',
    `Max-Age=${Math.floor(maxAgeMs / 1000)}`,
    `SameSite=${sameSite}`,
    secure ? 'Secure' : '',
    domain ? `Domain=${domain}` : '',
  ].filter(Boolean).join('; ');
}

function setCookie(res: Response, name: string, value: string, maxAgeMs: number) {
  res.append('Set-Cookie', `${name}=${encodeURIComponent(value)}; ${cookieOptions(maxAgeMs)}`);
}

function clearCookie(res: Response, name: string) {
  res.append('Set-Cookie', `${name}=; Path=/; HttpOnly; Max-Age=0; SameSite=lax`);
}

function allowedOrigins() {
  return new Set([
    process.env.FRONTEND_URL,
    process.env.BACKEND_URL,
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ].filter(Boolean) as string[]);
}

app.use(express.json());
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins().has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-CSRF-Token');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  next();
});

function isDevAuthBypassEnabled() {
  return process.env.NODE_ENV !== 'production' &&
    (process.env.DEV_AUTH_BYPASS || '').toLowerCase() === 'true';
}

function isLocalRequest(req: Request) {
  const remoteAddress = req.socket.remoteAddress || '';
  return [
    '127.0.0.1',
    '::1',
    '::ffff:127.0.0.1',
    '0:0:0:0:0:0:0:1',
  ].includes(remoteAddress);
}

function devAuthRole() {
  const requestedRole = process.env.DEV_AUTH_ROLE as AuthRole | undefined;
  return requestedRole && AUTH_ROLES.includes(requestedRole) ? requestedRole : 'EB_ADMIN';
}

function upsertDevAuthUser() {
  const now = nowIso();
  const email = process.env.DEV_AUTH_EMAIL || 'dev.eb.admin@local.test';
  const normalizedEmail = email.toLowerCase();
  const existing = store.users.find(user => user.normalized_email === normalizedEmail);

  if (existing) {
    existing.primary_email = email;
    existing.full_name = process.env.DEV_AUTH_NAME || existing.full_name || 'Dev EB Admin';
    existing.account_state = 'ACTIVE';
    existing.role = devAuthRole();
    existing.email_verified_at = existing.email_verified_at || now;
    existing.approved_at = existing.approved_at || now;
    existing.approved_by = existing.approved_by || 'dev-auth-bypass';
    existing.permission_version += 1;
    existing.last_login_at = now;
    existing.updated_at = now;
    existing.version += 1;
    saveStore();
    return existing;
  }

  const user: AuthUser = {
    id: `user-dev-${randomToken(10)}`,
    primary_email: email,
    normalized_email: normalizedEmail,
    full_name: process.env.DEV_AUTH_NAME || 'Dev EB Admin',
    avatar_url: '',
    account_state: 'ACTIVE',
    role: devAuthRole(),
    team_ids: [],
    email_verified_at: now,
    approved_at: now,
    approved_by: 'dev-auth-bypass',
    permission_version: 1,
    last_login_at: now,
    created_at: now,
    updated_at: now,
    version: 1,
  };

  store.users.push(user);
  saveStore();
  return user;
}

function publicUser(user: AuthUser) {
  const { normalized_email, version, ...safeUser } = user;
  return safeUser;
}

function currentSession(req: Request) {
  const cookieName = process.env.SESSION_COOKIE_NAME || 'acm_nexus_session';
  const token = parseCookies(req)[cookieName];
  if (!token) return null;
  const tokenHash = hashSecret(token);
  const session = store.sessions.find(item => item.token_hash === tokenHash);
  if (!session || session.revoked_at || new Date(session.expires_at).getTime() <= Date.now()) return null;
  const user = store.users.find(item => item.id === session.user_id);
  if (!user) return null;
  if (user.permission_version !== session.permission_version || user.account_state !== session.account_state_at_issue) {
    session.revoked_at = nowIso();
    session.revocation_reason = 'stale_permission_or_account_state';
    saveStore();
    return null;
  }
  session.last_seen_at = nowIso();
  saveStore();
  return { session, user };
}

function requireSession(options: { allowPending?: boolean; activeOnly?: boolean } = {}) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    const auth = currentSession(req);
    if (!auth) return res.status(401).json({ error: 'UNAUTHENTICATED' });

    if (options.activeOnly && auth.user.account_state !== 'ACTIVE') {
      return res.status(403).json({ error: `ACCOUNT_${auth.user.account_state}` });
    }
    if (!options.allowPending && auth.user.account_state !== 'ACTIVE') {
      return res.status(403).json({ error: `ACCOUNT_${auth.user.account_state}` });
    }

    req.auth = auth;
    return next();
  };
}

function requireCsrf(req: AuthedRequest, res: Response, next: NextFunction) {
  const origin = req.headers.origin;
  if (origin && !allowedOrigins().has(origin)) {
    return res.status(403).json({ error: 'CSRF_ORIGIN_INVALID' });
  }

  const csrfToken = req.headers['x-csrf-token'];
  if (typeof csrfToken !== 'string' || !req.auth || hashSecret(csrfToken) !== req.auth.session.csrf_token_hash) {
    return res.status(403).json({ error: 'CSRF_TOKEN_INVALID' });
  }
  req.auth.csrfToken = csrfToken;
  return next();
}

function createSession(user: AuthUser, res: Response) {
  const rawSessionToken = randomToken(48);
  const csrfToken = randomToken(32);
  const now = nowIso();
  const session: AppSession = {
    id: `sess-${randomToken(10)}`,
    user_id: user.id,
    token_hash: hashSecret(rawSessionToken),
    csrf_token_hash: hashSecret(csrfToken),
    account_state_at_issue: user.account_state,
    permission_version: user.permission_version,
    created_at: now,
    last_seen_at: now,
    expires_at: new Date(Date.now() + SESSION_TTL_MS).toISOString(),
  };
  store.sessions.push(session);
  saveStore();

  setCookie(res, process.env.SESSION_COOKIE_NAME || 'acm_nexus_session', rawSessionToken, SESSION_TTL_MS);
  audit({
    actor_user_id: user.id,
    target_user_id: user.id,
    action: 'session.created',
    result: 'SUCCESS',
    organization_id: ORG_ID,
    resource_type: 'session',
    resource_id: session.id,
  });

  return { session, csrfToken };
}

function revokeSessions(userId: string, reason: string, exceptSessionId?: string) {
  const revokedAt = nowIso();
  store.sessions.forEach(session => {
    if (session.user_id === userId && session.id !== exceptSessionId && !session.revoked_at) {
      session.revoked_at = revokedAt;
      session.revocation_reason = reason;
    }
  });
  saveStore();
}

function activeMembershipRequestForUser(userId: string) {
  return store.membership_requests.find(request => (
    request.user_id === userId && ['PENDING', 'CLARIFICATION_REQUIRED'].includes(request.status)
  ));
}

function requestForSession(user: AuthUser) {
  return activeMembershipRequestForUser(user.id) ||
    store.membership_requests
      .filter(request => request.user_id === user.id)
      .sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
}

async function exchangeCodeForToken(code: string, codeVerifier: string, config: OAuthConfig) {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.redirectUri,
      code_verifier: codeVerifier,
    }),
  });

  if (!response.ok) throw new AuthError('OAUTH_CODE_EXCHANGE_FAILED');
  return response.json() as Promise<{ id_token?: string; access_token?: string; token_type?: string; expires_in?: number }>;
}

function upsertUserFromClaims(claims: GoogleIdTokenClaims) {
  const now = nowIso();
  const normalizedEmail = claims.email.toLowerCase();
  const providerTenant = (claims.hd || '').toLowerCase();
  const existingIdentity = store.external_identities.find(identity => (
    identity.provider === 'google' && identity.provider_subject === claims.sub
  ));

  if (existingIdentity) {
    const user = store.users.find(item => item.id === existingIdentity.user_id);
    if (!user) throw new AuthError('OAUTH_ID_TOKEN_INVALID');
    existingIdentity.email_at_login = claims.email;
    existingIdentity.email_verified = true;
    existingIdentity.provider_tenant = providerTenant;
    existingIdentity.last_login_at = now;
    existingIdentity.updated_at = now;
    user.primary_email = claims.email;
    user.normalized_email = normalizedEmail;
    user.full_name = claims.name || user.full_name;
    user.avatar_url = claims.picture || user.avatar_url;
    user.last_login_at = now;
    user.updated_at = now;
    saveStore();
    return { user, created: false };
  }

  const collidingUser = store.users.find(user => user.normalized_email === normalizedEmail);
  if (collidingUser) {
    audit({
      action: 'oauth.identity_collision',
      result: 'DENIED',
      target_user_id: collidingUser.id,
      organization_id: ORG_ID,
      reason: 'google subject mismatch for existing email',
      metadata: { email: normalizedEmail, provider: 'google' },
    });
    throw new AuthError('OAUTH_IDENTITY_COLLISION');
  }

  const isBootstrap = process.env.BOOTSTRAP_EB_ADMIN_EMAIL?.toLowerCase() === normalizedEmail &&
    process.env.BOOTSTRAP_EB_ADMIN_GOOGLE_SUB === claims.sub;
  const user: AuthUser = {
    id: `user-${randomToken(10)}`,
    primary_email: claims.email,
    normalized_email: normalizedEmail,
    full_name: claims.name || claims.email,
    avatar_url: claims.picture || '',
    account_state: isBootstrap ? 'ACTIVE' : 'PENDING_APPROVAL',
    role: isBootstrap ? 'EB_ADMIN' : 'SOCIETY_MEMBER',
    team_ids: [],
    email_verified_at: now,
    approved_at: isBootstrap ? now : undefined,
    approved_by: isBootstrap ? 'system' : undefined,
    permission_version: 1,
    last_login_at: now,
    created_at: now,
    updated_at: now,
    version: 1,
  };
  const identity: ExternalIdentity = {
    id: `ext-${randomToken(10)}`,
    user_id: user.id,
    provider: 'google',
    provider_subject: claims.sub,
    provider_tenant: providerTenant,
    email_at_login: claims.email,
    email_verified: true,
    created_at: now,
    updated_at: now,
    last_login_at: now,
  };

  store.users.push(user);
  store.external_identities.push(identity);

  if (!isBootstrap) {
    const request: MembershipRequest = {
      id: `mr-${randomToken(10)}`,
      user_id: user.id,
      organization_id: ORG_ID,
      verified_email: claims.email,
      google_subject: claims.sub,
      requested_role: 'SOCIETY_MEMBER',
      requested_team_ids: [],
      academic_year: '',
      reason_for_access: 'Created automatically after verified Thapar Google login.',
      status: 'PENDING',
      created_at: now,
      expires_at: new Date(Date.now() + MEMBERSHIP_REQUEST_TTL_MS).toISOString(),
      version: 1,
    };
    store.membership_requests.push(request);
    audit({
      actor_user_id: user.id,
      target_user_id: user.id,
      action: 'access.request_created',
      result: 'SUCCESS',
      organization_id: ORG_ID,
      resource_type: 'membership_request',
      resource_id: request.id,
    });
  }

  saveStore();
  return { user, created: true };
}

function redirectToFrontend(res: Response, pathName: string) {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  res.redirect(new URL(pathName, frontendUrl).toString());
}

app.get('/api/v1/auth/dev-login', (req, res) => {
  if (!isDevAuthBypassEnabled()) return res.status(404).json({ error: 'NOT_FOUND' });
  if (!isLocalRequest(req)) return res.status(403).json({ error: 'DEV_AUTH_LOCAL_ONLY' });

  const user = upsertDevAuthUser();
  const { session } = createSession(user, res);
  audit({
    actor_user_id: user.id,
    target_user_id: user.id,
    action: 'dev_auth.session_created',
    result: 'SUCCESS',
    organization_id: ORG_ID,
    resource_type: 'session',
    resource_id: session.id,
    reason: 'local development OAuth bypass',
  });

  return redirectToFrontend(res, validateReturnTo(req.query.return_to));
});

app.get('/api/v1/auth/google/start', (req, res) => {
  const config = getOAuthConfig();
  if (!config) {
    return res.status(503).json({ error: 'OAUTH_CONFIG_MISSING' });
  }

  const state = randomToken(32);
  const nonce = randomToken(32);
  const bindingCookieName = 'acm_oauth_bind';
  const cookies = parseCookies(req);
  const browserBinding = cookies[bindingCookieName] || randomToken(32);
  const { codeVerifier, codeChallenge } = createPkcePair();
  const returnTo = validateReturnTo(req.query.return_to);
  const transaction: OAuthTransaction = {
    state_hash: hashSecret(state),
    nonce,
    code_verifier: codeVerifier,
    return_to: returnTo,
    browser_binding_hash: hashSecret(browserBinding),
    created_at: nowIso(),
    expires_at: new Date(Date.now() + OAUTH_TRANSACTION_TTL_MS).toISOString(),
  };

  store.oauth_transactions.push(transaction);
  store.oauth_transactions = store.oauth_transactions.filter(item => new Date(item.expires_at).getTime() > Date.now());
  saveStore();

  setCookie(res, bindingCookieName, browserBinding, OAUTH_TRANSACTION_TTL_MS);
  audit({
    action: 'oauth.login_started',
    result: 'SUCCESS',
    organization_id: ORG_ID,
    metadata: { return_to: returnTo },
  });

  return res.json({
    authorizationUrl: createGoogleAuthorizationUrl({
      config,
      state,
      nonce,
      codeChallenge,
    }),
  });
});

app.get('/api/v1/auth/google/callback', async (req, res) => {
  const config = getOAuthConfig();
  if (!config) return redirectToFrontend(res, '/auth/error?code=OAUTH_CONFIG_MISSING');

  try {
    const code = typeof req.query.code === 'string' ? req.query.code : '';
    const state = typeof req.query.state === 'string' ? req.query.state : '';
    if (!code || !state) throw new AuthError('OAUTH_STATE_INVALID');

    const stateHash = hashSecret(state);
    const transactionIndex = store.oauth_transactions.findIndex(item => item.state_hash === stateHash);
    const transaction = store.oauth_transactions[transactionIndex];
    if (!transaction) throw new AuthError('OAUTH_STATE_INVALID');
    if (transaction.consumed_at) throw new AuthError('OAUTH_STATE_INVALID');
    if (new Date(transaction.expires_at).getTime() <= Date.now()) throw new AuthError('OAUTH_STATE_EXPIRED');

    const browserBinding = parseCookies(req).acm_oauth_bind;
    if (!browserBinding || hashSecret(browserBinding) !== transaction.browser_binding_hash) {
      throw new AuthError('OAUTH_STATE_INVALID');
    }

    store.oauth_transactions.splice(transactionIndex, 1);
    saveStore();

    const tokenResponse = await exchangeCodeForToken(code, transaction.code_verifier, config);
    if (!tokenResponse.id_token) throw new AuthError('OAUTH_ID_TOKEN_INVALID');

    const claims = await verifyGoogleIdToken(tokenResponse.id_token, {
      clientId: config.clientId,
      issuer: config.issuer,
      nonce: transaction.nonce,
      allowedHostedDomain: config.allowedHostedDomain,
      getJwk: fetchGoogleJwk,
    });

    const { user } = upsertUserFromClaims(claims);
    audit({
      actor_user_id: user.id,
      target_user_id: user.id,
      action: 'oauth.callback_succeeded',
      result: 'SUCCESS',
      organization_id: ORG_ID,
      metadata: { provider: 'google', tenant: claims.hd || null },
    });

    if (user.account_state === 'ACTIVE') {
      createSession(user, res);
      return redirectToFrontend(res, transaction.return_to || '/app/dashboard');
    }

    if (user.account_state === 'PENDING_APPROVAL') {
      createSession(user, res);
      return redirectToFrontend(res, '/auth/pending-approval');
    }

    revokeSessions(user.id, user.account_state.toLowerCase());
    return redirectToFrontend(res, `/auth/${user.account_state.toLowerCase().replace('_approval', '').toLowerCase()}`);
  } catch (error) {
    const code = error instanceof AuthError ? error.code : 'OAUTH_CALLBACK_FAILED';
    audit({
      action: code === 'OAUTH_DOMAIN_NOT_ALLOWED' ? 'oauth.domain_rejected' : 'oauth.callback_failed',
      result: 'FAILED',
      organization_id: ORG_ID,
      reason: code,
    });
    return redirectToFrontend(res, `/auth/error?code=${encodeURIComponent(code)}`);
  }
});

app.get('/api/v1/auth/session', (req, res) => {
  const auth = currentSession(req);
  if (!auth) return res.json({ authenticated: false });

  const csrfToken = randomToken(32);
  auth.session.csrf_token_hash = hashSecret(csrfToken);
  saveStore();

  return res.json({
    authenticated: true,
    session: {
      id: auth.session.id,
      csrfToken,
      expiresAt: auth.session.expires_at,
    },
    user: publicUser(auth.user),
    membershipRequest: requestForSession(auth.user),
  });
});

app.post('/api/v1/auth/logout', requireSession({ allowPending: true }), requireCsrf, (req: AuthedRequest, res) => {
  req.auth!.session.revoked_at = nowIso();
  req.auth!.session.revocation_reason = 'user_logout';
  saveStore();
  clearCookie(res, process.env.SESSION_COOKIE_NAME || 'acm_nexus_session');
  audit({
    actor_user_id: req.auth!.user.id,
    target_user_id: req.auth!.user.id,
    action: 'session.revoked',
    result: 'SUCCESS',
    organization_id: ORG_ID,
    resource_type: 'session',
    resource_id: req.auth!.session.id,
    reason: 'user_logout',
  });
  res.json({ ok: true });
});

app.post('/api/v1/auth/logout-all', requireSession({ allowPending: true }), requireCsrf, (req: AuthedRequest, res) => {
  revokeSessions(req.auth!.user.id, 'user_logout_all');
  clearCookie(res, process.env.SESSION_COOKIE_NAME || 'acm_nexus_session');
  res.json({ ok: true });
});

app.get('/api/v1/auth/sessions', requireSession({ allowPending: true }), (req: AuthedRequest, res) => {
  res.json({
    sessions: store.sessions
      .filter(session => session.user_id === req.auth!.user.id)
      .map(session => ({
        id: session.id,
        created_at: session.created_at,
        last_seen_at: session.last_seen_at,
        expires_at: session.expires_at,
        revoked_at: session.revoked_at,
      })),
  });
});

app.delete('/api/v1/auth/sessions/:session_id', requireSession({ allowPending: true }), requireCsrf, (req: AuthedRequest, res) => {
  const target = store.sessions.find(session => (
    session.id === req.params.session_id && session.user_id === req.auth!.user.id
  ));
  if (!target) return res.status(404).json({ error: 'SESSION_NOT_FOUND' });
  target.revoked_at = nowIso();
  target.revocation_reason = 'user_revoked_session';
  saveStore();
  res.json({ ok: true });
});

app.get('/api/v1/membership-requests/me', requireSession({ allowPending: true }), (req: AuthedRequest, res) => {
  res.json({ request: requestForSession(req.auth!.user) || null });
});

app.post('/api/v1/membership-requests/me/cancel', requireSession({ allowPending: true }), requireCsrf, (req: AuthedRequest, res) => {
  const request = activeMembershipRequestForUser(req.auth!.user.id);
  if (!request) return res.status(404).json({ error: 'REQUEST_NOT_FOUND' });
  request.status = 'CANCELLED';
  request.reviewed_at = nowIso();
  request.version += 1;
  saveStore();
  res.json({ request });
});

app.get('/api/v1/membership-requests', requireSession({ activeOnly: true }), (req: AuthedRequest, res) => {
  if (!['CORE_MEMBER', 'EB_ADMIN', 'PLATFORM_ADMIN'].includes(req.auth!.user.role)) {
    return res.status(403).json({ error: 'APPROVAL_NOT_PERMITTED' });
  }
  res.json({
    requests: store.membership_requests.filter(request => request.status === 'PENDING'),
  });
});

app.post('/api/v1/membership-requests/:request_id/approve', requireSession({ activeOnly: true }), requireCsrf, (req: AuthedRequest, res) => {
  const request = store.membership_requests.find(item => item.id === req.params.request_id);
  if (!request) return res.status(404).json({ error: 'REQUEST_NOT_FOUND' });
  if (request.status !== 'PENDING') return res.status(409).json({ error: 'APPROVAL_VERSION_CONFLICT' });
  if (typeof req.body.version === 'number' && req.body.version !== request.version) {
    return res.status(409).json({ error: 'APPROVAL_VERSION_CONFLICT' });
  }

  const target = store.users.find(user => user.id === request.user_id);
  if (!target) return res.status(404).json({ error: 'USER_NOT_FOUND' });
  const assignedRole = (req.body.role || request.requested_role) as AuthRole;

  if (!canApproveMembership(req.auth!.user.role, assignedRole, req.auth!.user.id === target.id)) {
    audit({
      actor_user_id: req.auth!.user.id,
      target_user_id: target.id,
      action: 'access.approved',
      result: 'DENIED',
      organization_id: ORG_ID,
      resource_type: 'membership_request',
      resource_id: request.id,
      reason: 'APPROVAL_NOT_PERMITTED',
    });
    return res.status(403).json({ error: req.auth!.user.id === target.id ? 'SELF_APPROVAL_FORBIDDEN' : 'ROLE_ASSIGNMENT_NOT_PERMITTED' });
  }

  const now = nowIso();
  request.status = 'APPROVED';
  request.reviewed_at = now;
  request.reviewed_by = req.auth!.user.id;
  request.decision_reason = typeof req.body.decisionReason === 'string' ? req.body.decisionReason : 'Approved';
  request.requested_role = assignedRole;
  request.requested_team_ids = Array.isArray(req.body.teamIds) ? req.body.teamIds : request.requested_team_ids;
  request.version += 1;

  target.account_state = 'ACTIVE';
  target.role = assignedRole;
  target.team_ids = request.requested_team_ids;
  target.approved_at = now;
  target.approved_by = req.auth!.user.id;
  target.permission_version += 1;
  target.updated_at = now;
  target.version += 1;
  revokeSessions(target.id, 'approved_rotate_session');

  audit({
    actor_user_id: req.auth!.user.id,
    target_user_id: target.id,
    action: 'access.approved',
    result: 'SUCCESS',
    organization_id: ORG_ID,
    resource_type: 'membership_request',
    resource_id: request.id,
    reason: request.decision_reason,
  });
  saveStore();
  return res.json({ request, user: publicUser(target) });
});

app.post('/api/v1/membership-requests/:request_id/reject', requireSession({ activeOnly: true }), requireCsrf, (req: AuthedRequest, res) => {
  const request = store.membership_requests.find(item => item.id === req.params.request_id);
  if (!request) return res.status(404).json({ error: 'REQUEST_NOT_FOUND' });
  const target = store.users.find(user => user.id === request.user_id);
  if (!target) return res.status(404).json({ error: 'USER_NOT_FOUND' });
  if (req.auth!.user.id === target.id) return res.status(403).json({ error: 'SELF_APPROVAL_FORBIDDEN' });
  if (!['CORE_MEMBER', 'EB_ADMIN', 'PLATFORM_ADMIN'].includes(req.auth!.user.role)) {
    return res.status(403).json({ error: 'APPROVAL_NOT_PERMITTED' });
  }

  const now = nowIso();
  request.status = 'REJECTED';
  request.reviewed_at = now;
  request.reviewed_by = req.auth!.user.id;
  request.decision_reason = typeof req.body.decisionReason === 'string' ? req.body.decisionReason : 'Rejected';
  request.version += 1;
  target.account_state = 'REJECTED';
  target.permission_version += 1;
  target.updated_at = now;
  revokeSessions(target.id, 'rejected');
  audit({
    actor_user_id: req.auth!.user.id,
    target_user_id: target.id,
    action: 'access.rejected',
    result: 'SUCCESS',
    organization_id: ORG_ID,
    resource_type: 'membership_request',
    resource_id: request.id,
  });
  saveStore();
  return res.json({ request });
});

app.get('/api/v1/audit-events', requireSession({ activeOnly: true }), (req: AuthedRequest, res) => {
  if (!['EB_ADMIN', 'PLATFORM_ADMIN'].includes(req.auth!.user.role)) {
    return res.status(403).json({ error: 'APPROVAL_NOT_PERMITTED' });
  }
  res.json({ events: store.audit_events.slice(0, 200) });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[api] unhandled error', err.message);
  res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
});

interface PresenceRecord {
  userId: string;
  orgId: string;
  name: string;
  role: string;
  avatarUrl: string;
  initials: string;
  teamIds: string[];
  status: 'ONLINE' | 'AWAY' | 'JUST_JOINED';
  connectionCount: number;
  lastHeartbeat: number;
  joinedAt: number;
}

const presenceMap = new Map<string, PresenceRecord>();

function userToRecord(userId: string): PresenceRecord {
  const authUser = store.users.find(user => user.id === userId);
  return {
    userId,
    orgId: ORG_ID,
    name: authUser?.full_name || `Member ${userId.slice(-3)}`,
    role: authUser?.role || 'SOCIETY_MEMBER',
    avatarUrl: authUser?.avatar_url || '',
    initials: (authUser?.full_name || userId).split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase(),
    teamIds: authUser?.team_ids || [],
    status: 'ONLINE',
    connectionCount: 0,
    lastHeartbeat: Date.now(),
    joinedAt: Date.now(),
  };
}

function recordToMember(r: PresenceRecord) {
  return {
    id: r.userId,
    name: r.name,
    role: r.role,
    avatarUrl: r.avatarUrl || undefined,
    initials: r.initials,
    teamId: r.teamIds[0],
    status: r.status,
    lastSeenAt: new Date(r.lastHeartbeat).toISOString(),
  };
}

function broadcast(wsServer: WebSocketServer, data: object, exclude?: WebSocket) {
  const msg = JSON.stringify(data);
  wsServer.clients.forEach(client => {
    if (client !== exclude && client.readyState === WebSocket.OPEN) {
      client.send(msg);
    }
  });
}

function sendSnapshot(ws: WebSocket) {
  const members = Array.from(presenceMap.values()).map(recordToMember);
  ws.send(JSON.stringify({
    type: 'presence.snapshot',
    members,
    occurredAt: nowIso(),
  }));
}

const wss = new WebSocketServer({ server, path: '/api/v1/presence/ws' });
const OFFLINE_THRESHOLD_MS = 90000;

const cleanupInterval = setInterval(() => {
  const now = Date.now();
  const toRemove: string[] = [];
  presenceMap.forEach((record, key) => {
    if (record.connectionCount <= 0 && now - record.lastHeartbeat > OFFLINE_THRESHOLD_MS) {
      toRemove.push(key);
    }
  });
  toRemove.forEach(key => {
    presenceMap.delete(key);
    broadcast(wss, { type: 'presence.left', memberId: key, occurredAt: nowIso() });
  });
}, 15000);

wss.on('connection', (ws) => {
  let userId: string | null = null;

  ws.on('message', (raw) => {
    let data: { type?: string; userId?: string; status?: 'ONLINE' | 'AWAY' };
    try { data = JSON.parse(raw.toString()); } catch { return; }

    if (data.type === 'auth') {
      userId = data.userId || null;
      const authUser = userId ? store.users.find(user => user.id === userId) : undefined;
      if (!authUser || authUser.account_state !== 'ACTIVE') {
        ws.close(4001, 'Unauthorized');
        return;
      }

      let record = presenceMap.get(userId);
      if (!record) {
        record = userToRecord(userId);
        presenceMap.set(userId, record);
        broadcast(wss, { type: 'presence.joined', member: { ...recordToMember(record), status: 'JUST_JOINED' }, occurredAt: nowIso() });
      }

      record.connectionCount += 1;
      record.lastHeartbeat = Date.now();
      record.status = 'ONLINE';
      sendSnapshot(ws);
    }

    if (data.type === 'heartbeat' && userId) {
      const record = presenceMap.get(userId);
      if (record) record.lastHeartbeat = Date.now();
    }

    if (data.type === 'statusUpdate' && userId && data.status) {
      const record = presenceMap.get(userId);
      if (record) {
        record.status = data.status;
        broadcast(wss, { type: 'presence.updated', memberId: userId, status: data.status, occurredAt: nowIso() });
      }
    }
  });

  ws.on('close', () => {
    if (!userId) return;
    const record = presenceMap.get(userId);
    if (record) {
      record.connectionCount = Math.max(0, record.connectionCount - 1);
      record.lastHeartbeat = Date.now();
    }
  });
});

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`[api] running on http://localhost:${PORT}`);
    console.log(`[presence-ws] running on ws://localhost:${PORT}/api/v1/presence/ws`);
  });
}

function shutdown() {
  clearInterval(cleanupInterval);
  wss.close();
  server.close();
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

export { app, server, wss, store };
