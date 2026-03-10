import { randomBytes } from 'crypto';
import { Resend } from 'resend';
import pool from '../../../../src/db.js';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  const { name, email } = await request.json();

  if (!name || !email) {
    return Response.json({ error: 'Nombre y email son requeridos' }, { status: 400 });
  }

  // Check if email already exists
  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.trim().toLowerCase()]);
  if (existing.rows.length > 0) {
    return Response.json({ error: 'Este email ya esta registrado' }, { status: 409 });
  }

  // Create user without password, unverified
  const { rows } = await pool.query(
    'INSERT INTO users (name, email, password_hash, verified, role) VALUES ($1, $2, $3, false, $4) RETURNING id',
    [name.trim(), email.trim().toLowerCase(), '', 'user']
  );
  const userId = rows[0].id;

  // Generate invite token (72h)
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
      to: email.trim().toLowerCase(),
      subject: 'Te invitaron a BucketsAI Use Case Generator',
      html: `
        <div style="font-family: -apple-system, system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
          <h2 style="color: #1B2559; margin-bottom: 16px;">Bienvenido a BucketsAI</h2>
          <p style="color: #6B7280; line-height: 1.6;">Hola ${name},</p>
          <p style="color: #6B7280; line-height: 1.6;">Has sido invitado a usar <strong>BucketsAI Use Case Generator</strong>. Para activar tu cuenta, crea tu contrasena haciendo clic en el siguiente boton:</p>
          <a href="${setupUrl}" style="display: inline-block; background: #4470DC; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0;">Crear mi contrasena</a>
          <p style="color: #9CA3AF; font-size: 13px; line-height: 1.6;">Este enlace expira en 72 horas.</p>
          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 24px 0;" />
          <p style="color: #9CA3AF; font-size: 12px;">BucketsAI - All your knowledge, one conversation away.</p>
        </div>
      `,
    });
  } catch (err) {
    console.error('Resend error:', err.message);
  }

  return Response.json({ ok: true, message: 'Invitacion enviada' });
}
