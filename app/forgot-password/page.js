'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      await res.json();
      setLoading(false);
      setSent(true);
    } catch {
      setLoading(false);
      setError('Error de conexion');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-page-bg">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Image src="/logo.png" alt="BucketsAI" width={200} height={45} priority className="mx-auto h-10 w-auto mb-4" />
          <p className="text-brand-text-muted text-sm">Use Case Generator</p>
        </div>

        <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(68,112,220,0.08)] border border-brand-border p-8">
          {sent ? (
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-green-500 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-brand-navy-text mb-2">Correo enviado</h2>
              <p className="text-brand-text-muted text-sm mb-6">
                Si el email existe en nuestro sistema, recibiras un enlace para restablecer tu contrasena.
              </p>
              <button
                onClick={() => router.push('/login')}
                className="text-brand-blue font-semibold hover:text-brand-blue-med cursor-pointer"
              >
                Volver al login
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-brand-navy-text mb-2 text-center">Recuperar contrasena</h2>
              <p className="text-brand-text-muted text-sm text-center mb-6">
                Ingresa tu email y te enviaremos un enlace para restablecer tu contrasena.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-brand-navy-text mb-2">Email</label>
                  <input
                    id="email"
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    autoComplete="email"
                    className="w-full px-4 py-3 rounded-xl border-2 border-brand-border bg-brand-page-bg text-brand-navy-text placeholder:text-brand-gray-mid focus:outline-none focus:border-brand-blue focus:bg-white focus:ring-4 focus:ring-brand-blue/10"
                  />
                </div>

                {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full py-3.5 rounded-xl bg-brand-blue text-white font-bold cursor-pointer hover:bg-brand-blue-med disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-brand-blue/30"
                >
                  {loading ? 'Enviando...' : 'Enviar enlace'}
                </button>
              </form>

              <p className="text-center mt-4">
                <button onClick={() => router.push('/login')} className="text-sm text-brand-blue font-semibold hover:text-brand-blue-med cursor-pointer">
                  Volver al login
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
