import pool from '../../../../../../src/db.js';

export async function POST(request, { params }) {
  const { id } = await params;

  const { rows: reqRows } = await pool.query(
    'SELECT * FROM access_requests WHERE id = $1',
    [id]
  );
  if (reqRows.length === 0) {
    return Response.json({ error: 'Solicitud no encontrada' }, { status: 404 });
  }

  const req = reqRows[0];

  const newExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const { rowCount } = await pool.query(
    'UPDATE users SET expires_at = $1 WHERE email = $2',
    [newExpiresAt, req.email]
  );

  if (rowCount === 0) {
    return Response.json({ error: 'Usuario no encontrado' }, { status: 404 });
  }

  return Response.json({ ok: true, expires_at: newExpiresAt });
}
