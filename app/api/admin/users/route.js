import pool from '../../../../src/db.js';

export async function GET() {
  const { rows } = await pool.query(
    'SELECT id, name, email, role, verified, gamma_enabled, created_at FROM users ORDER BY created_at DESC'
  );
  return Response.json({ users: rows });
}
