import {
  createHash,
  createPublicKey,
  createSign,
  createVerify,
  randomBytes,
} from 'node:crypto';
import type { JsonWebKey as NodeJsonWebKey } from 'node:crypto';
import { AuthRole } from './types';

export const GOOGLE_AUTHORIZATION_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth';
export const GOOGLE_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
export const GOOGLE_JWKS_ENDPOINT = 'https://www.googleapis.com/oauth2/v3/certs';
export const OIDC_SCOPES = ['openid', 'email', 'profile'] as const;

export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  issuer: string;
  allowedHostedDomain: string;
}

export interface GoogleIdTokenClaims {
  iss: string;
  aud: string | string[];
  azp?: string;
  exp: number;
  iat: number;
  nonce: string;
  sub: string;
  hd?: string;
  email: string;
  email_verified: boolean | 'true' | 'false';
  name?: string;
  picture?: string;
}

export interface JwkKey {
  kid: string;
  kty: string;
  alg?: string;
  use?: string;
  n?: string;
  e?: string;
}

export class AuthError extends Error {
  code: string;

  constructor(code: string, message = code) {
    super(message);
    this.code = code;
  }
}

export function base64UrlEncode(input: Buffer | string): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

export function base64UrlDecode(input: string): Buffer {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  return Buffer.from(padded, 'base64');
}

export function randomToken(bytes = 32): string {
  return base64UrlEncode(randomBytes(bytes));
}

export function sha256Base64Url(value: string): string {
  return base64UrlEncode(createHash('sha256').update(value).digest());
}

export function hashSecret(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

export function createPkcePair() {
  const codeVerifier = randomToken(64);
  return {
    codeVerifier,
    codeChallenge: sha256Base64Url(codeVerifier),
  };
}

export function validateReturnTo(raw: unknown, fallback = '/app/dashboard'): string {
  if (typeof raw !== 'string' || raw.trim() === '') return fallback;
  if (!raw.startsWith('/') || raw.startsWith('//')) return fallback;

  try {
    const parsed = new URL(raw, 'https://acm-nexus.local');
    if (parsed.origin !== 'https://acm-nexus.local') return fallback;
    if (parsed.pathname.startsWith('/auth/')) return fallback;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}

export function createGoogleAuthorizationUrl(params: {
  config: OAuthConfig;
  state: string;
  nonce: string;
  codeChallenge: string;
  prompt?: 'select_account' | 'consent';
}): string {
  const query = new URLSearchParams({
    response_type: 'code',
    scope: OIDC_SCOPES.join(' '),
    client_id: params.config.clientId,
    redirect_uri: params.config.redirectUri,
    state: params.state,
    nonce: params.nonce,
    code_challenge: params.codeChallenge,
    code_challenge_method: 'S256',
    hd: params.config.allowedHostedDomain,
    prompt: params.prompt || 'select_account',
  });

  return `${GOOGLE_AUTHORIZATION_ENDPOINT}?${query.toString()}`;
}

function parseJwt(idToken: string): { header: Record<string, unknown>; payload: GoogleIdTokenClaims; signingInput: string; signature: Buffer } {
  const parts = idToken.split('.');
  if (parts.length !== 3) throw new AuthError('OAUTH_ID_TOKEN_INVALID');

  const [headerPart, payloadPart, signaturePart] = parts;
  try {
    const header = JSON.parse(base64UrlDecode(headerPart).toString('utf8')) as Record<string, unknown>;
    const payload = JSON.parse(base64UrlDecode(payloadPart).toString('utf8')) as GoogleIdTokenClaims;
    return {
      header,
      payload,
      signingInput: `${headerPart}.${payloadPart}`,
      signature: base64UrlDecode(signaturePart),
    };
  } catch {
    throw new AuthError('OAUTH_ID_TOKEN_INVALID');
  }
}

export function validateGoogleClaims(claims: GoogleIdTokenClaims, params: {
  clientId: string;
  issuer: string;
  nonce: string;
  allowedHostedDomain: string;
  nowSeconds?: number;
}) {
  const now = params.nowSeconds ?? Math.floor(Date.now() / 1000);
  const allowedIssuers = new Set([params.issuer, 'https://accounts.google.com', 'accounts.google.com']);
  const audience = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
  const normalizedHostedDomain = (claims.hd || '').toLowerCase();
  const allowedHostedDomain = params.allowedHostedDomain.toLowerCase();

  if (!allowedIssuers.has(claims.iss)) throw new AuthError('OAUTH_ISSUER_INVALID');
  if (!audience.includes(params.clientId)) throw new AuthError('OAUTH_AUDIENCE_INVALID');
  if (claims.azp && claims.azp !== params.clientId) throw new AuthError('OAUTH_AUDIENCE_INVALID');
  if (!claims.exp || claims.exp < now - 60) throw new AuthError('OAUTH_ID_TOKEN_INVALID', 'expired token');
  if (!claims.iat || claims.iat > now + 300) throw new AuthError('OAUTH_ID_TOKEN_INVALID', 'invalid issued-at');
  if (claims.nonce !== params.nonce) throw new AuthError('OAUTH_NONCE_INVALID');
  if (!claims.sub) throw new AuthError('OAUTH_ID_TOKEN_INVALID', 'missing subject');
  if (claims.email_verified !== true && claims.email_verified !== 'true') throw new AuthError('OAUTH_EMAIL_NOT_VERIFIED');
  if (!normalizedHostedDomain) throw new AuthError('OAUTH_DOMAIN_NOT_ALLOWED', 'missing hosted domain');
  if (normalizedHostedDomain !== allowedHostedDomain) throw new AuthError('OAUTH_DOMAIN_NOT_ALLOWED');

  return claims;
}

export async function verifyGoogleIdToken(idToken: string, params: {
  clientId: string;
  issuer: string;
  nonce: string;
  allowedHostedDomain: string;
  getJwk: (kid: string) => Promise<JwkKey | undefined>;
  nowSeconds?: number;
}): Promise<GoogleIdTokenClaims> {
  const parsed = parseJwt(idToken);
  const kid = parsed.header.kid;
  const alg = parsed.header.alg;

  if (typeof kid !== 'string' || alg !== 'RS256') {
    throw new AuthError('OAUTH_ID_TOKEN_INVALID');
  }

  const jwk = await params.getJwk(kid);
  if (!jwk) throw new AuthError('OAUTH_ID_TOKEN_INVALID');

  const publicKey = createPublicKey({ key: jwk as unknown as NodeJsonWebKey, format: 'jwk' });
  const verifier = createVerify('RSA-SHA256');
  verifier.update(parsed.signingInput);
  verifier.end();

  if (!verifier.verify(publicKey, parsed.signature)) {
    throw new AuthError('OAUTH_ID_TOKEN_INVALID', 'invalid signature');
  }

  return validateGoogleClaims(parsed.payload, params);
}

export async function fetchGoogleJwk(kid: string): Promise<JwkKey | undefined> {
  const response = await fetch(GOOGLE_JWKS_ENDPOINT);
  if (!response.ok) throw new AuthError('OAUTH_ID_TOKEN_INVALID', 'jwks fetch failed');
  const body = await response.json() as { keys?: JwkKey[] };
  return body.keys?.find(key => key.kid === kid);
}

export function canApproveMembership(approverRole: AuthRole, requestedRole: AuthRole, isSelf: boolean): boolean {
  if (isSelf) return false;
  if (approverRole === 'PLATFORM_ADMIN' || approverRole === 'EB_ADMIN') {
    return requestedRole !== 'PLATFORM_ADMIN';
  }
  if (approverRole === 'CORE_MEMBER') {
    return [
      'FIRST_YEAR_MEMBER',
      'SECOND_YEAR_MEMBER',
      'THIRD_YEAR_MEMBER',
      'SOCIETY_MEMBER',
      'GUEST_OBSERVER',
    ].includes(requestedRole);
  }
  return false;
}

export function createTestJwt(input: {
  claims: GoogleIdTokenClaims;
  privateKey: any;
  kid: string;
}) {
  const header = base64UrlEncode(JSON.stringify({ alg: 'RS256', typ: 'JWT', kid: input.kid }));
  const payload = base64UrlEncode(JSON.stringify(input.claims));
  const signingInput = `${header}.${payload}`;
  const signer = createSign('RSA-SHA256');
  signer.update(signingInput);
  signer.end();
  return `${signingInput}.${base64UrlEncode(signer.sign(input.privateKey))}`;
}
