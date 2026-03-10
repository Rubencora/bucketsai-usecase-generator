import { COOKIE_NAME } from '../../../../src/auth.js';

export async function POST() {
  const response = Response.json({ ok: true });
  response.headers.set('Set-Cookie', `${COOKIE_NAME}=; Path=/; HttpOnly; Max-Age=0`);
  return response;
}
