import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const SESSION_SECRET = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET;
if (!SESSION_SECRET) {
  throw new Error('NEXTAUTH_SECRET (or JWT_SECRET) is required');
}
const SECRET = new TextEncoder().encode(SESSION_SECRET);
const COOKIE_NAME = 'bucketsai-session';

export async function createSession(user) {
  const payload = { userId: user.id, email: user.email, name: user.name, role: user.role || 'user' };
  if (user.expires_at) payload.expiresAt = new Date(user.expires_at).getTime();
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(SECRET);
  return token;
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload;
  } catch {
    return null;
  }
}

export { COOKIE_NAME };
