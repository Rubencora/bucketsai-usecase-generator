'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function HistoryPage() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/history')
      .then((res) => res.json())
      .then((data) => { setCases(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-brand-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => router.push('/')} className="cursor-pointer focus:outline-none">
            <Image src="/logo.png" alt="BucketsAI" width={160} height={36} priority className="h-8 w-auto" />
          </button>
          <div className="flex items-center gap-3">
            <span className="text-xs text-brand-gray-mid bg-brand-blue-light px-3 py-1 rounded-full font-medium">
              Historial
            </span>
            <button
              onClick={() => router.push('/')}
              className="text-sm text-brand-blue font-semibold hover:text-brand-blue-med cursor-pointer"
            >
              + Nuevo
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">
        <h1 className="text-2xl font-bold text-brand-navy-text mb-6">Casos de uso generados</h1>

        {loading ? (
          <div className="text-center py-16 text-brand-gray-mid">Cargando...</div>
        ) : cases.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-brand-gray-mid mb-4">No hay casos de uso generados aun.</p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 rounded-xl bg-brand-blue text-white font-bold cursor-pointer hover:bg-brand-blue-med"
            >
              Crear el primero
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {cases.map((c) => (
              <div key={c.id} className="bg-white rounded-xl border border-brand-border p-5 flex items-center justify-between hover:shadow-sm transition-shadow">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-brand-navy-text truncate">{c.empresa}</h3>
                    {c.sector && (
                      <span className="text-xs bg-brand-blue-light text-brand-blue px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                        {c.sector}
                      </span>
                    )}
                  </div>
                  {c.user_name && (
                    <div className="text-xs text-brand-orange font-medium mt-0.5">
                      {c.user_name} ({c.user_email})
                    </div>
                  )}
                  <div className="flex items-center gap-4 text-xs text-brand-gray-mid">
                    {c.pais && <span>{c.pais}</span>}
                    <span>{c.idioma}</span>
                    <span>{new Date(c.created_at).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-1.5 text-xs text-brand-text-muted">
                    <span>A: {c.dim_a}</span>
                    <span>B: {c.dim_b}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                  {c.pdf_filename && (
                    <a
                      href={`/api/download/${encodeURIComponent(c.pdf_filename)}`}
                      className="px-4 py-2 rounded-lg bg-brand-blue text-white text-sm font-semibold hover:bg-brand-blue-med"
                    >
                      PDF
                    </a>
                  )}
                  {c.docx_filename && (
                    <a
                      href={`/api/download/${encodeURIComponent(c.docx_filename)}`}
                      className="px-4 py-2 rounded-lg bg-white text-brand-blue text-sm font-semibold border-2 border-brand-blue hover:bg-brand-blue-light"
                    >
                      Word
                    </a>
                  )}
                  {c.onepager_filename && (
                    <a
                      href={`/api/download/${encodeURIComponent(c.onepager_filename)}`}
                      className="px-4 py-2 rounded-lg bg-brand-orange text-white text-sm font-semibold hover:bg-brand-orange/85"
                    >
                      1P PDF
                    </a>
                  )}
                  {c.onepager_docx_filename && (
                    <a
                      href={`/api/download/${encodeURIComponent(c.onepager_docx_filename)}`}
                      className="px-4 py-2 rounded-lg bg-white text-brand-orange text-sm font-semibold border-2 border-brand-orange hover:bg-orange-50"
                    >
                      1P Word
                    </a>
                  )}
                  {c.deck_filename && (
                    <a
                      href={`/api/download/${encodeURIComponent(c.deck_filename)}`}
                      className="px-4 py-2 rounded-lg bg-brand-navy-text text-white text-sm font-semibold hover:bg-brand-navy-text/85"
                    >
                      Deck
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="text-center py-5 text-brand-gray-mid text-xs border-t border-brand-border">
        <span className="italic">All your knowledge, one conversation away.</span>
        <span className="mx-2">|</span>
        buckets-ai.com
      </footer>
    </div>
  );
}
