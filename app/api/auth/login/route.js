import bcrypt from 'bcryptjs';
import pool from '../../../../src/db.js';
import { createSession, COOKIE_NAME } from '../../../../src/auth.js';

export async function POST(request) {
  const { email, password } = await request.json();

  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  const user = rows[0];

  if (!user) {
    return Response.json({ error: 'Credenciales invalidas' }, { status: 401 });
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return Response.json({ error: 'Credenciales invalidas' }, { status: 401 });
  }

  if (!user.verified) {
    return Response.json({ error: 'Tu email aun no ha sido verificado. Revisa tu bandeja de entrada.' }, { status: 403 });
  }

  if (user.expires_at && new Date(user.expires_at) < new Date()) {
    return Response.json({ error: 'Tu acceso de prueba ha expirado. Contacta al administrador para renovarlo.' }, { status: 403 });
  }

  const token = await createSession({ id: user.id, email: user.email, name: user.name, role: user.role, expires_at: user.expires_at });

  const response = Response.json({ ok: true, user: { email: user.email, name: user.name, role: user.role } });
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  response.headers.set('Set-Cookie', `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax${secure}; Max-Age=${7 * 24 * 60 * 60}`);
  return response;
}
