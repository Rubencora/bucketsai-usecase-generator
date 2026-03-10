import pool from '../../../src/db.js';
import { getSession } from '../../../src/auth.js';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: 'No autorizado' }, { status: 401 });
  }

  if (session.role === 'admin') {
    const { rows } = await pool.query(
      `SELECT uc.id, uc.empresa, uc.pais, uc.idioma, uc.enfoque, uc.sector, uc.dim_a, uc.dim_b, uc.pdf_filename, uc.docx_filename, uc.onepager_filename, uc.onepager_docx_filename, uc.deck_filename, uc.created_at,
              u.name AS user_name, u.email AS user_email
       FROM use_cases uc LEFT JOIN users u ON uc.user_id = u.id
       ORDER BY uc.created_at DESC LIMIT 100`
    );
    return Response.json(rows);
  }

  const { rows } = await pool.query(
    'SELECT id, empresa, pais, idioma, enfoque, sector, dim_a, dim_b, pdf_filename, docx_filename, onepager_filename, onepager_docx_filename, deck_filename, created_at FROM use_cases WHERE user_id = $1 ORDER BY created_at DESC LIMIT 100',
    [session.userId]
  );
  return Response.json(rows);
}
