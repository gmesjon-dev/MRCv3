import { env } from 'cloudflare:workers';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export type AuthenticatedUser = {
  userId: string;
  displayName: string;
  email: string;
  fullName: string | null;
};

const ACCESS_JWT_HEADER = 'Cf-Access-Jwt-Assertion';
export const ACCESS_LOGOUT_PATH = '/cdn-cgi/access/logout';

let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

function getJwks() {
  jwks ??= createRemoteJWKSet(
    new URL(`https://${env.CF_ACCESS_TEAM_DOMAIN}/cdn-cgi/access/certs`),
  );
  return jwks;
}

export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  const requestHeaders = await headers();
  const token = requestHeaders.get(ACCESS_JWT_HEADER);

  if (!token) {
    // import.meta.env.DEV is inlined at build time, so this branch is dead code
    // in a production Worker bundle even if LOCAL_DEV_USER_EMAIL is set by mistake.
    if (import.meta.env.DEV && env.LOCAL_DEV_USER_EMAIL) {
      const email = env.LOCAL_DEV_USER_EMAIL;
      return { userId: email, email, displayName: email, fullName: null };
    }
    return null;
  }

  if (!env.CF_ACCESS_TEAM_DOMAIN || !env.CF_ACCESS_AUD) {
    throw new Error(
      'CF_ACCESS_TEAM_DOMAIN e CF_ACCESS_AUD precisam estar configurados em wrangler.jsonc para validar o Cloudflare Access.',
    );
  }

  try {
    const { payload } = await jwtVerify(token, getJwks(), {
      audience: env.CF_ACCESS_AUD,
    });
    const email = typeof payload.email === 'string' ? payload.email : null;
    if (!email) return null;
    return { userId: email, email, displayName: email, fullName: null };
  } catch {
    return null;
  }
}

export async function requireAuthenticatedUser(
  returnTo: string,
): Promise<AuthenticatedUser> {
  const user = await getAuthenticatedUser();
  if (user) return user;
  redirect(`/login?return_to=${encodeURIComponent(returnTo)}`);
}
