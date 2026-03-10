import pool from '../../../../src/db.js';

export async function POST(request) {
  const { token } = await request.json();

  if (!token) {
    return Response.json({ error: 'Token requerido' }, { status: 400 });
  }

  const { rows } = await pool.query(
    'SELECT ev.id, ev.user_id FROM email_verifications ev WHERE ev.token = $1 AND ev.used = FALSE AND ev.expires_at > NOW()',
    [token]
  );
  const verification = rows[0];

  if (!verification) {
    return Response.json({ error: 'Enlace invalido o expirado.' }, { status: 400 });
  }

  await pool.query('UPDATE users SET verified = true, verified_at = NOW() WHERE id = $1', [verification.user_id]);
  await pool.query('UPDATE email_verifications SET used = TRUE WHERE id = $1', [verification.id]);

  return Response.json({ ok: true, message: 'Email verificado correctamente. Ya puedes iniciar sesion.' });
}
