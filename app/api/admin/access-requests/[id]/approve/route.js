import { randomBytes } from 'crypto';
import { Resend } from 'resend';
import pool from '../../../../../../src/db.js';

const resend = new Resend(process.env.RESEND_API_KEY);

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

  if (req.status === 'approved') {
    return Response.json({ error: 'Esta solicitud ya fue aprobada' }, { status: 409 });
  }

  // Check if user already exists
  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [req.email]);
  let userId;

  const userExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  if (existing.rows.length > 0) {
    userId = existing.rows[0].id;
    await pool.query('UPDATE users SET expires_at = $1 WHERE id = $2', [userExpiresAt, userId]);
  } else {
    // Create user with empresa as name, no password, unverified, 24h trial
    const { rows: newUser } = await pool.query(
      'INSERT INTO users (name, email, password_hash, verified, role, expires_at) VALUES ($1, $2, $3, false, $4, $5) RETURNING id',
      [req.empresa, req.email, '', 'user', userExpiresAt]
    );
    userId = newUser[0].id;
  }

  // Generate 72h invite token
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000);

  await pool.query(
    'INSERT INTO email_verifications (user_id, token, expires_at) VALUES ($1, $2, $3)',
    [userId, token, expiresAt]
  );

  // Send invite email
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3002';
  const setupUrl = `${baseUrl}/setup-password?token=${token}`;

  try {
    await resend.emails.send({
      from: 'BucketsAI <noreply@byruben.io>',
      to: req.email,
      subject: 'Tu acceso a BucketsAI Use Case Generator fue aprobado',
      html: `
        <div style="font-family: -apple-system, system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
          <h2 style="color: #1B2559; margin-bottom: 16px;">Tu solicitud fue aprobada</h2>
          <p style="color: #6B7280; line-height: 1.6;">Hola,</p>
          <p style="color: #6B7280; line-height: 1.6;">Tu solicitud de acceso para <strong>${req.empresa}</strong> al <strong>BucketsAI Use Case Generator</strong> ha sido aprobada. Para activar tu cuenta, crea tu contrasena haciendo clic en el siguiente boton:</p>
          <a href="${setupUrl}" style="display: inline-block; background: #4470DC; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0;">Activar mi cuenta</a>
          <p style="color: #9CA3AF; font-size: 13px; line-height: 1.6;">Este enlace expira en 72 horas. Tu acceso de prueba tiene una duracion de <strong>24 horas</strong> a partir de ahora.</p>
          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 24px 0;" />
          <p style="color: #9CA3AF; font-size: 12px;">BucketsAI - All your knowledge, one conversation away.</p>
        </div>
      `,
    });
  } catch (err) {
    console.error('Resend error:', err.message);
  }

  // Mark request as approved
  await pool.query(
    'UPDATE access_requests SET status = $1, approved_at = NOW() WHERE id = $2',
    ['approved', id]
  );

  return Response.json({ ok: true, message: 'Solicitud aprobada y email enviado' });
}
