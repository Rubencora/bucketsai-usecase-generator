import pool from '../../../../src/db.js';

export async function GET() {
  const { rows } = await pool.query(`
    SELECT ar.*, u.expires_at AS user_expires_at, u.id AS user_id
    FROM access_requests ar
    LEFT JOIN users u ON u.email = ar.email
    ORDER BY ar.created_at DESC
  `);
  return Response.json({ accessRequests: rows });
}
