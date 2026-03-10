import bcrypt from 'bcryptjs';
import pool from '../../../../src/db.js';

export async function POST(request) {
  const { token, password } = await request.json();

  if (!token || !password || password.length < 6) {
    return Response.json({ error: 'Token y contrasena (min 6 caracteres) son requeridos' }, { status: 400 });
  }

  // Find valid token
  const { rows } = await pool.query(
    'SELECT pr.id, pr.user_id FROM password_resets pr WHERE pr.token = $1 AND pr.used = FALSE AND pr.expires_at > NOW()',
    [token]
  );
  const reset = rows[0];

  if (!reset) {
    return Response.json({ error: 'Enlace invalido o expirado. Solicita uno nuevo.' }, { status: 400 });
  }

  // Update password
  const hash = await bcrypt.hash(password, 10);
  await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, reset.user_id]);

  // Mark token as used
  await pool.query('UPDATE password_resets SET used = TRUE WHERE id = $1', [reset.id]);

  return Response.json({ ok: true, message: 'Contrasena actualizada correctamente' });
}
