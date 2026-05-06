import pool from '../../../../../../src/db.js';

export async function DELETE(request, { params }) {
  const { id } = await params;

  const { rows: reqRows } = await pool.query(
    'SELECT * FROM access_requests WHERE id = $1',
    [id]
  );
  if (reqRows.length === 0) {
    return Response.json({ error: 'Solicitud no encontrada' }, { status: 404 });
  }

  const req = reqRows[0];

  await pool.query('DELETE FROM users WHERE email = $1', [req.email]);
  await pool.query(
    'UPDATE access_requests SET status = $1 WHERE id = $2',
    ['revoked', id]
  );

  return Response.json({ ok: true });
}
