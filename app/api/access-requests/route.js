import pool from '../../../src/db.js';

const ALLOWED_ORIGIN = 'https://landing-mx-puce.vercel.app';

function corsHeaders(origin) {
  const allowed = origin === ALLOWED_ORIGIN || origin === 'http://localhost:3000' ? origin : ALLOWED_ORIGIN;
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export async function OPTIONS(request) {
  const origin = request.headers.get('origin') || '';
  return new Response(null, { status: 204, headers: corsHeaders(origin) });
}

export async function POST(request) {
  const origin = request.headers.get('origin') || '';
  const headers = corsHeaders(origin);

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'JSON invalido' }, { status: 400, headers });
  }

  const { empresa, email, telefono } = body;

  if (!empresa?.trim() || !email?.trim() || !telefono?.trim()) {
    return Response.json({ error: 'Empresa, email y telefono son requeridos' }, { status: 400, headers });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return Response.json({ error: 'Email invalido' }, { status: 400, headers });
  }

  try {
    await pool.query(
      'INSERT INTO access_requests (empresa, email, telefono, status) VALUES ($1, $2, $3, $4)',
      [empresa.trim(), email.trim().toLowerCase(), telefono.trim(), 'pending']
    );
    return Response.json({ success: true }, { headers });
  } catch (err) {
    console.error('access-requests insert error:', err.message);
    return Response.json({ error: 'Error interno' }, { status: 500, headers });
  }
}
