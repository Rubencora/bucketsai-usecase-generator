'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

function VerifyForm() {
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Enlace invalido. No se encontro el token.');
      return;
    }

    fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (ok) {
          setStatus('success');
          setMessage(data.message);
        } else {
          setStatus('error');
          setMessage(data.error);
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Error de conexion');
      });
  }, [token]);

  if (status === 'loading') {
    return <p className="text-center text-brand-text-muted">Verificando...</p>;
  }

  if (status === 'success') {
    return (
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl bg-green-500 flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-brand-navy-text mb-2">Email verificado</h2>
        <p className="text-brand-text-muted text-sm mb-6">{message}</p>
        <button
          onClick={() => router.push('/login')}
          className="px-6 py-3 rounded-xl bg-brand-blue text-white font-bold cursor-pointer hover:bg-brand-blue-med"
        >
          Ir al login
        </button>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="w-14 h-14 rounded-2xl bg-red-500 flex items-center justify-center mx-auto mb-4">
        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-brand-navy-text mb-2">Error de verificacion</h2>
      <p className="text-red-500 text-sm mb-6">{message}</p>
      <button
        onClick={() => router.push('/login')}
        className="text-brand-blue font-semibold hover:text-brand-blue-med cursor-pointer"
      >
        Volver al login
      </button>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-page-bg">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Image src="/logo.png" alt="BucketsAI" width={200} height={45} priority className="mx-auto h-10 w-auto mb-4" />
          <p className="text-brand-text-muted text-sm">Use Case Generator</p>
        </div>
        <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(68,112,220,0.08)] border border-brand-border p-8">
          <Suspense fallback={<p className="text-center text-brand-text-muted">Cargando...</p>}>
            <VerifyForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
