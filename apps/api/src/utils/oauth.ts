import { OAuth2Client } from 'google-auth-library';
import appleSignin from 'apple-signin-auth';
import { env } from '../config/env.js';

let googleClient: OAuth2Client | null = null;

function getGoogleClient(): OAuth2Client {
  if (!googleClient && env.googleClientId) {
    googleClient = new OAuth2Client(env.googleClientId);
  }
  if (!googleClient) {
    throw new Error('Google OAuth is not configured');
  }
  return googleClient;
}

export interface OAuthUserInfo {
  email: string;
  emailVerified: boolean;
  oauthId: string;
  name?: string | undefined;
  avatarUrl?: string | undefined;
}

export async function verifyGoogleToken(idToken: string): Promise<OAuthUserInfo> {
  const client = getGoogleClient();

  if (!env.googleClientId) {
    throw new Error('Google OAuth is not configured');
  }

  const ticket = await client.verifyIdToken({
    idToken,
    audience: env.googleClientId,
  });

  const payload = ticket.getPayload();
  
  if (!payload || !payload.sub || !payload.email) {
    throw new Error('Invalid Google token payload');
  }

  return {
    email: payload.email,
    emailVerified: payload.email_verified ?? false,
    oauthId: payload.sub,
    name: payload.name || undefined,
    avatarUrl: payload.picture || undefined,
  };
}

export async function verifyAppleToken(idToken: string): Promise<OAuthUserInfo> {
  if (!env.appleClientId) {
    throw new Error('Apple OAuth is not configured');
  }

  try {
    const appleIdTokenClaims = await appleSignin.verifyIdToken(idToken, {
      audience: env.appleClientId,
      ignoreExpiration: false,
    });

    if (!appleIdTokenClaims.sub || !appleIdTokenClaims.email) {
      throw new Error('Invalid Apple token payload');
    }

    return {
      email: appleIdTokenClaims.email,
      emailVerified: appleIdTokenClaims.email_verified === 'true' || appleIdTokenClaims.email_verified === true,
      oauthId: appleIdTokenClaims.sub,
    };
  } catch (error) {
    throw new Error(`Apple token verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
