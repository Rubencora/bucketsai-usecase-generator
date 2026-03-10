import pool from '../../../../../../src/db.js';

export async function PATCH(request, { params }) {
  const { id } = await params;
  const { gamma_enabled } = await request.json();

  await pool.query('UPDATE users SET gamma_enabled = $1 WHERE id = $2', [!!gamma_enabled, id]);

  return Response.json({ ok: true, gamma_enabled: !!gamma_enabled });
}
