import pool from '../../../../src/db.js';

export async function GET() {
  const { rows } = await pool.query(
    'SELECT * FROM access_requests ORDER BY created_at DESC'
  );
  return Response.json({ accessRequests: rows });
}
