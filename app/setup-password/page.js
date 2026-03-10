'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

function SetupForm() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('Las contrasenas no coinciden');
      return;
    }
    if (password.length < 6) {
      setError('La contrasena debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/setup-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(data.error);
      } else {
        setDone(true);
      }
    } catch {
      setLoading(false);
      setError('Error de conexion');
    }
  };

  const EyeIcon = ({ show }) => show ? (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12c1.292 4.338 5.31 7.5 10.066 7.5.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  );

  if (!token) {
    return (
      <div className="text-center">
        <p className="text-red-500 mb-4">Enlace invalido. No se encontro el token.</p>
        <button onClick={() => router.push('/login')} className="text-brand-blue font-semibold cursor-pointer">Volver al login</button>
      </div>
    );
  }

  return done ? (
    <div className="text-center">
      <div className="w-14 h-14 rounded-2xl bg-green-500 flex items-center justify-center mx-auto mb-4">
        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-brand-navy-text mb-2">Cuenta activada</h2>
      <p className="text-brand-text-muted text-sm mb-6">Tu contrasena fue creada exitosamente. Ya puedes iniciar sesion.</p>
      <button
        onClick={() => router.push('/login')}
        className="px-6 py-3 rounded-xl bg-brand-blue text-white font-bold cursor-pointer hover:bg-brand-blue-med"
      >
        Ir al login
      </button>
    </div>
  ) : (
    <>
      <h2 className="text-xl font-bold text-brand-navy-text mb-2 text-center">Crea tu contrasena</h2>
      <p className="text-brand-text-muted text-sm text-center mb-6">Configura tu contrasena para acceder a BucketsAI Use Case Generator.</p>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="password" className="block text-sm font-semibold text-brand-navy-text mb-2">Contrasena</label>
          <div className="relative">
            <input
              id="password" type={showPassword ? 'text' : 'password'} value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimo 6 caracteres"
              className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-brand-border bg-brand-page-bg text-brand-navy-text placeholder:text-brand-gray-mid focus:outline-none focus:border-brand-blue focus:bg-white focus:ring-4 focus:ring-brand-blue/10"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-gray-mid hover:text-brand-navy-text cursor-pointer" tabIndex={-1}>
              <EyeIcon show={showPassword} />
            </button>
          </div>
        </div>
        <div>
          <label htmlFor="confirm" className="block text-sm font-semibold text-brand-navy-text mb-2">Confirmar contrasena</label>
          <div className="relative">
            <input
              id="confirm" type={showConfirm ? 'text' : 'password'} value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repite la contrasena"
              className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-brand-border bg-brand-page-bg text-brand-navy-text placeholder:text-brand-gray-mid focus:outline-none focus:border-brand-blue focus:bg-white focus:ring-4 focus:ring-brand-blue/10"
            />
            <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-gray-mid hover:text-brand-navy-text cursor-pointer" tabIndex={-1}>
              <EyeIcon show={showConfirm} />
            </button>
          </div>
        </div>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <button
          type="submit" disabled={loading || !password || !confirm}
          className="w-full py-3.5 rounded-xl bg-brand-blue text-white font-bold cursor-pointer hover:bg-brand-blue-med disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-brand-blue/30"
        >
          {loading ? 'Creando...' : 'Crear contrasena'}
        </button>
      </form>
    </>
  );
}

export default function SetupPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-page-bg">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Image src="/logo.png" alt="BucketsAI" width={200} height={45} priority className="mx-auto h-10 w-auto mb-4" />
          <p className="text-brand-text-muted text-sm">Use Case Generator</p>
        </div>
        <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(68,112,220,0.08)] border border-brand-border p-8">
          <Suspense fallback={<p className="text-center text-brand-text-muted">Cargando...</p>}>
            <SetupForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
