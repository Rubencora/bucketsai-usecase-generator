import bcrypt from 'bcryptjs';
import pool from '../../../../src/db.js';

export async function POST(request) {
  const { token, password } = await request.json();

  if (!token || !password || password.length < 6) {
    return Response.json({ error: 'Token y contrasena (min 6 caracteres) son requeridos' }, { status: 400 });
  }

  // Find valid token
  const { rows } = await pool.query(
    'SELECT ev.id, ev.user_id FROM email_verifications ev WHERE ev.token = $1 AND ev.used = FALSE AND ev.expires_at > NOW()',
    [token]
  );
  const verification = rows[0];

  if (!verification) {
    return Response.json({ error: 'Enlace invalido o expirado. Solicita una nueva invitacion al administrador.' }, { status: 400 });
  }

  // Set password and verify user
  const hash = await bcrypt.hash(password, 10);
  await pool.query('UPDATE users SET password_hash = $1, verified = true, verified_at = NOW() WHERE id = $2', [hash, verification.user_id]);

  // Mark token as used
  await pool.query('UPDATE email_verifications SET used = TRUE WHERE id = $1', [verification.id]);

  return Response.json({ ok: true, message: 'Contrasena creada. Ya puedes iniciar sesion.' });
}
