// @vitest-environment node

import { describe, expect, it } from 'vitest';
import { generateKeyPairSync } from 'node:crypto';
import type { JsonWebKey as NodeJsonWebKey } from 'node:crypto';
import {
  AuthError,
  canApproveMembership,
  createGoogleAuthorizationUrl,
  createPkcePair,
  createTestJwt,
  OIDC_SCOPES,
  validateGoogleClaims,
  validateReturnTo,
  verifyGoogleIdToken,
  type GoogleIdTokenClaims,
} from './oauth';

const config = {
  clientId: 'client-123.apps.googleusercontent.com',
  clientSecret: 'secret',
  redirectUri: 'http://localhost:3001/api/v1/auth/google/callback',
  issuer: 'https://accounts.google.com',
  allowedHostedDomain: 'thapar.edu',
};

function baseClaims(overrides: Partial<GoogleIdTokenClaims> = {}): GoogleIdTokenClaims {
  return {
    iss: 'https://accounts.google.com',
    aud: config.clientId,
    exp: 2_000_000_000,
    iat: 1_900_000_000,
    nonce: 'nonce-123',
    sub: 'google-subject',
    hd: 'thapar.edu',
    email: 'student@thapar.edu',
    email_verified: true,
    name: 'Student User',
    ...overrides,
  };
}

describe('OAuth/OIDC helpers', () => {
  it('generates PKCE verifier and S256 challenge', () => {
    const pair = createPkcePair();
    expect(pair.codeVerifier).toHaveLength(86);
    expect(pair.codeChallenge).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(pair.codeChallenge).not.toEqual(pair.codeVerifier);
  });

  it('allows only internal return paths', () => {
    expect(validateReturnTo('/app/dashboard')).toBe('/app/dashboard');
    expect(validateReturnTo('/app/dashboard?tab=tasks')).toBe('/app/dashboard?tab=tasks');
    expect(validateReturnTo('https://evil.example/app')).toBe('/app/dashboard');
    expect(validateReturnTo('//evil.example/app')).toBe('/app/dashboard');
    expect(validateReturnTo('/auth/error')).toBe('/app/dashboard');
  });

  it('builds a Google authorization URL with minimal OIDC scopes and PKCE', () => {
    const url = new URL(createGoogleAuthorizationUrl({
      config,
      state: 'state-123',
      nonce: 'nonce-123',
      codeChallenge: 'challenge-123',
    }));

    expect(url.origin + url.pathname).toBe('https://accounts.google.com/o/oauth2/v2/auth');
    expect(url.searchParams.get('scope')).toBe(OIDC_SCOPES.join(' '));
    expect(url.searchParams.get('code_challenge_method')).toBe('S256');
    expect(url.searchParams.get('hd')).toBe('thapar.edu');
    expect(url.searchParams.get('prompt')).toBe('select_account');
  });

  it('requires exact thapar.edu hosted domain and verified email', () => {
    expect(() => validateGoogleClaims(baseClaims(), {
      clientId: config.clientId,
      issuer: config.issuer,
      nonce: 'nonce-123',
      allowedHostedDomain: 'thapar.edu',
      nowSeconds: 1_950_000_000,
    })).not.toThrow();

    expect(() => validateGoogleClaims(baseClaims({ hd: 'thapar.edu.evil.com' }), {
      clientId: config.clientId,
      issuer: config.issuer,
      nonce: 'nonce-123',
      allowedHostedDomain: 'thapar.edu',
      nowSeconds: 1_950_000_000,
    })).toThrow(AuthError);

    expect(() => validateGoogleClaims(baseClaims({ email_verified: false }), {
      clientId: config.clientId,
      issuer: config.issuer,
      nonce: 'nonce-123',
      allowedHostedDomain: 'thapar.edu',
      nowSeconds: 1_950_000_000,
    })).toThrow(AuthError);
  });

  it('verifies RS256 ID token signature before accepting claims', async () => {
    const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
    const jwk = publicKey.export({ format: 'jwk' }) as NodeJsonWebKey & { kid?: string };
    jwk.kid = 'kid-1';
    const jwt = createTestJwt({ claims: baseClaims(), privateKey, kid: jwk.kid! });

    const claims = await verifyGoogleIdToken(jwt, {
      clientId: config.clientId,
      issuer: config.issuer,
      nonce: 'nonce-123',
      allowedHostedDomain: 'thapar.edu',
      nowSeconds: 1_950_000_000,
      getJwk: async () => jwk as any,
    });

    expect(claims.sub).toBe('google-subject');
    await expect(verifyGoogleIdToken(`${jwt.slice(0, -3)}bad`, {
      clientId: config.clientId,
      issuer: config.issuer,
      nonce: 'nonce-123',
      allowedHostedDomain: 'thapar.edu',
      nowSeconds: 1_950_000_000,
      getJwk: async () => jwk as any,
    })).rejects.toThrow(AuthError);
  });

  it('enforces Core versus EB approval authority', () => {
    expect(canApproveMembership('CORE_MEMBER', 'SOCIETY_MEMBER', false)).toBe(true);
    expect(canApproveMembership('CORE_MEMBER', 'CORE_MEMBER', false)).toBe(false);
    expect(canApproveMembership('CORE_MEMBER', 'EB_ADMIN', false)).toBe(false);
    expect(canApproveMembership('EB_ADMIN', 'CORE_MEMBER', false)).toBe(true);
    expect(canApproveMembership('EB_ADMIN', 'EB_ADMIN', true)).toBe(false);
    expect(canApproveMembership('PLATFORM_ADMIN', 'PLATFORM_ADMIN', false)).toBe(false);
  });
});
