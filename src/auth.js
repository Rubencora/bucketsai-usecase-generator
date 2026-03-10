import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'bucketsai-secret-key-2026');
const COOKIE_NAME = 'bucketsai-session';

export async function createSession(user) {
  const token = await new SignJWT({ userId: user.id, email: user.email, name: user.name, role: user.role || 'user' })
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
