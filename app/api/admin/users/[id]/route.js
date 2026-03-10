import pool from '../../../../../src/db.js';

export async function DELETE(request, { params }) {
  const { id } = await params;

  // Prevent deleting yourself
  const { rows: target } = await pool.query('SELECT email, role FROM users WHERE id = $1', [id]);
  if (!target[0]) {
    return Response.json({ error: 'Usuario no encontrado' }, { status: 404 });
  }
  if (target[0].role === 'admin') {
    return Response.json({ error: 'No puedes eliminar un administrador' }, { status: 403 });
  }

  // Delete related data first
  await pool.query('DELETE FROM email_verifications WHERE user_id = $1', [id]);
  await pool.query('DELETE FROM use_cases WHERE user_id = $1', [id]);
  await pool.query('DELETE FROM users WHERE id = $1', [id]);

  return Response.json({ ok: true });
}
