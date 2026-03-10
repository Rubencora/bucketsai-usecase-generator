import { randomBytes } from 'crypto';
import { Resend } from 'resend';
import pool from '../../../../src/db.js';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  const { email } = await request.json();

  // Always return success to prevent email enumeration
  const ok = { ok: true, message: 'Si el email existe, recibiras un enlace para restablecer tu contrasena.' };

  const { rows } = await pool.query('SELECT id, email, name FROM users WHERE email = $1', [email]);
  const user = rows[0];
  if (!user) return Response.json(ok);

  // Generate token (valid 1 hour)
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await pool.query(
    'INSERT INTO password_resets (user_id, token, expires_at) VALUES ($1, $2, $3)',
    [user.id, token, expiresAt]
  );

  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3002';
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;

  try {
    await resend.emails.send({
      from: 'BucketsAI <ruben@hoytrabajas.com>',
      to: user.email,
      subject: 'Restablecer contrasena - BucketsAI',
      html: `
        <div style="font-family: -apple-system, system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
          <h2 style="color: #1B2559; margin-bottom: 16px;">Restablecer contrasena</h2>
          <p style="color: #6B7280; line-height: 1.6;">Hola ${user.name || ''},</p>
          <p style="color: #6B7280; line-height: 1.6;">Recibimos una solicitud para restablecer tu contrasena en BucketsAI Use Case Generator.</p>
          <a href="${resetUrl}" style="display: inline-block; background: #4470DC; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0;">Restablecer contrasena</a>
          <p style="color: #9CA3AF; font-size: 13px; line-height: 1.6;">Este enlace expira en 1 hora. Si no solicitaste esto, ignora este correo.</p>
          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 24px 0;" />
          <p style="color: #9CA3AF; font-size: 12px;">BucketsAI - All your knowledge, one conversation away.</p>
        </div>
      `,
    });
  } catch (err) {
    console.error('Resend error:', err.message);
  }

  return Response.json(ok);
}
