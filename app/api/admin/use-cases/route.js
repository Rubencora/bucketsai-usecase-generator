import pool from '../../../../src/db.js';

export async function GET() {
  const { rows } = await pool.query(`
    SELECT uc.id, uc.empresa, uc.pais, uc.idioma, uc.enfoque, uc.sector,
           uc.dim_a, uc.dim_b, uc.pdf_filename, uc.docx_filename, uc.created_at,
           u.name AS user_name, u.email AS user_email
    FROM use_cases uc
    LEFT JOIN users u ON uc.user_id = u.id
    ORDER BY uc.created_at DESC
  `);
  return Response.json({ useCases: rows });
}
