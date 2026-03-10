import { getSession } from '../../../../src/auth.js';
import pool from '../../../../src/db.js';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return Response.json({ user: null }, { status: 401 });
  }

  const role = session.role || 'user';
  let gammaEnabled = role === 'admin';

  if (!gammaEnabled && session.userId) {
    try {
      const { rows } = await pool.query('SELECT gamma_enabled FROM users WHERE id = $1', [session.userId]);
      gammaEnabled = rows[0]?.gamma_enabled === true;
    } catch { /* default false */ }
  }

  return Response.json({
    user: { email: session.email, name: session.name, role, gammaEnabled },
  });
}
