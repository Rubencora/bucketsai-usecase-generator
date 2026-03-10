'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const ENFOQUE_OPTIONS = [
  { value: 'Auto (el agente decide segun el perfil)', label: 'Automatico', desc: 'El agente decide segun el perfil de la empresa' },
  { value: 'Fuerza de ventas / equipos comerciales', label: 'Fuerza de ventas', desc: 'Equipos comerciales y vendedores en campo' },
  { value: 'Operaciones y primera linea (tiendas, bodegas)', label: 'Operaciones', desc: 'Primera linea: tiendas, bodegas, puntos de venta' },
  { value: 'Customer Success / postventa', label: 'Customer Success', desc: 'Postventa y retencion de clientes' },
  { value: 'Training y onboarding', label: 'Training', desc: 'Onboarding y capacitacion de equipos' },
];

const STATS = [
  { val: '4,000+', label: 'Colaboradores activos' },
  { val: '94%', label: 'Mejoran su trabajo' },
  { val: '< 60s', label: 'Tiempo de generacion' },
];

// --- SVG Icons (Heroicons) ---
function IconSparkles({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
  );
}

function IconCheck({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function IconDownload({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
  );
}

function IconArrowPath({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182M2.985 19.644l3.181-3.183" />
    </svg>
  );
}

function IconDocument({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

function IconXMark({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

// --- Components ---

function StepIndicator({ step, total }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
            i < step ? 'bg-brand-blue text-white' :
            i === step ? 'bg-brand-blue text-white ring-4 ring-brand-blue-light' :
            'bg-brand-border text-brand-gray-mid'
          }`}>
            {i < step ? <IconCheck className="w-4 h-4" /> : i + 1}
          </div>
          {i < total - 1 && (
            <div className={`w-12 h-0.5 rounded ${i < step ? 'bg-brand-blue' : 'bg-brand-border'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function ProgressStep({ message, index, isLast }) {
  return (
    <div className="animate-fade-in-up flex items-start gap-3">
      <div className="mt-0.5 flex-shrink-0">
        {!isLast ? (
          <div className="w-6 h-6 rounded-full bg-brand-blue flex items-center justify-center">
            <IconCheck className="w-3.5 h-3.5 text-white" />
          </div>
        ) : (
          <div className="w-6 h-6 rounded-full bg-brand-blue-med flex items-center justify-center animate-count-pulse">
            <div className="w-2 h-2 bg-white rounded-full" />
          </div>
        )}
      </div>
      <span className={`text-sm ${isLast ? 'text-brand-navy-text font-medium' : 'text-brand-text-muted'}`}>
        {message}
      </span>
    </div>
  );
}

// --- Main Page ---

export default function Home() {
  const [form, setForm] = useState({
    empresa: '',
    url: '',
    pais: '',
    idioma: 'Espanol',
    enfoque: 'Auto (el agente decide segun el perfil)',
    infoExtra: '',
    docType: 'usecase',
    deckEngine: 'auto',
  });
  const [status, setStatus] = useState('idle');
  const [steps, setSteps] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [gammaAvailable, setGammaAvailable] = useState(false);
  const empresaRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    if (status === 'idle' && empresaRef.current) {
      empresaRef.current.focus();
    }
  }, [status]);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (d.user?.role === 'admin') setIsAdmin(true);
      if (d.user?.gammaEnabled) setGammaAvailable(true);
    }).catch(() => {});
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleGenerate = async () => {
    if (!form.empresa.trim()) return;

    setStatus('generating');
    setSteps([]);
    setResult(null);
    setError(null);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = JSON.parse(line.slice(6));

          if (data.type === 'step') {
            setSteps((prev) => [...prev, data.message]);
          } else if (data.type === 'done') {
            setResult({ ...data, filename: data.docxFilename || data.onepagerFilename });
            setStatus('done');
          } else if (data.type === 'error') {
            setError(data.message);
            setStatus('error');
          }
        }
      }
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  };

  const handleReset = () => {
    setStatus('idle');
    setSteps([]);
    setResult(null);
    setError(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.metaKey && form.empresa.trim()) {
      handleGenerate();
    }
  };

  return (
    <div className="min-h-screen flex flex-col" onKeyDown={handleKeyDown}>
      {/* ---- NAVBAR ---- */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-brand-border">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={handleReset} className="cursor-pointer focus:outline-none">
            <Image src="/logo.png" alt="BucketsAI" width={160} height={36} priority className="h-8 w-auto" />
          </button>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <button
                onClick={() => router.push('/admin')}
                className="text-xs text-brand-orange font-semibold hover:text-brand-orange/80 cursor-pointer"
              >
                Admin
              </button>
            )}
            <button
              onClick={() => router.push('/history')}
              className="text-xs text-brand-blue font-semibold hover:text-brand-blue-med cursor-pointer"
            >
              Historial
            </button>
            <span className="text-xs text-brand-gray-mid bg-brand-blue-light px-3 py-1 rounded-full font-medium">
              Use Case Generator
            </span>
            <button
              onClick={async () => { await fetch('/api/auth/logout', { method: 'POST' }); router.push('/login'); router.refresh(); }}
              className="text-xs text-brand-gray-mid hover:text-red-500 cursor-pointer font-medium"
            >
              Salir
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10">

        {/* ========== IDLE STATE — FORM ========== */}
        {status === 'idle' && (
          <div className="animate-fade-in-up">
            {/* Hero */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-brand-blue-light text-brand-blue text-sm font-medium px-4 py-1.5 rounded-full mb-5">
                <IconSparkles className="w-4 h-4" />
                Generado con IA en menos de 60 segundos
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-brand-navy-text tracking-tight leading-tight mb-4">
                Crea un caso de uso<br />
                <span className="text-brand-blue">profesional</span> al instante
              </h1>
              <p className="text-brand-text-muted text-lg max-w-2xl mx-auto leading-relaxed">
                Ingresa el nombre de una empresa y genera automaticamente un documento Word con estructura, contenido y diseno de marca BucketsAI.
              </p>
            </div>

            {/* Stats bar */}
            <div className="flex justify-center gap-8 md:gap-16 mb-10">
              {STATS.map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-2xl font-bold text-brand-orange">{s.val}</p>
                  <p className="text-xs text-brand-gray-mid mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(68,112,220,0.08)] border border-brand-border p-8 md:p-10">
              <div className="space-y-6">
                {/* Empresa — primary field, larger */}
                <div>
                  <label htmlFor="empresa" className="block text-sm font-semibold text-brand-navy-text mb-2">
                    Nombre de la empresa <span className="text-brand-orange">*</span>
                  </label>
                  <input
                    ref={empresaRef}
                    id="empresa"
                    type="text"
                    name="empresa"
                    value={form.empresa}
                    onChange={handleChange}
                    placeholder="Ej: Grupo Nutresa, Bancolombia, Rappi..."
                    autoComplete="organization"
                    className="w-full px-5 py-4 rounded-xl border-2 border-brand-border bg-brand-page-bg text-brand-navy-text text-lg placeholder:text-brand-gray-mid focus:outline-none focus:border-brand-blue focus:bg-white focus:ring-4 focus:ring-brand-blue/10"
                  />
                </div>

                {/* URL del sitio web */}
                <div>
                  <label htmlFor="url" className="block text-sm font-semibold text-brand-navy-text mb-2">
                    Sitio web de la empresa <span className="font-normal text-brand-gray-mid">(opcional)</span>
                  </label>
                  <input
                    id="url"
                    type="url"
                    name="url"
                    value={form.url}
                    onChange={handleChange}
                    placeholder="Ej: https://www.gruponutresa.com"
                    autoComplete="url"
                    className="w-full px-4 py-3 rounded-xl border-2 border-brand-border bg-brand-page-bg text-brand-navy-text placeholder:text-brand-gray-mid focus:outline-none focus:border-brand-blue focus:bg-white focus:ring-4 focus:ring-brand-blue/10"
                  />
                </div>

                {/* Pais + Idioma row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="pais" className="block text-sm font-semibold text-brand-navy-text mb-2">
                      Pais <span className="font-normal text-brand-gray-mid">(opcional)</span>
                    </label>
                    <input
                      id="pais"
                      type="text"
                      name="pais"
                      value={form.pais}
                      onChange={handleChange}
                      placeholder="Ej: Colombia, Mexico, Peru..."
                      className="w-full px-4 py-3 rounded-xl border-2 border-brand-border bg-brand-page-bg text-brand-navy-text placeholder:text-brand-gray-mid focus:outline-none focus:border-brand-blue focus:bg-white focus:ring-4 focus:ring-brand-blue/10"
                    />
                  </div>
                  <div>
                    <label htmlFor="idioma" className="block text-sm font-semibold text-brand-navy-text mb-2">
                      Idioma del documento
                    </label>
                    <select
                      id="idioma"
                      name="idioma"
                      value={form.idioma}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border-2 border-brand-border bg-brand-page-bg text-brand-navy-text focus:outline-none focus:border-brand-blue focus:bg-white focus:ring-4 focus:ring-brand-blue/10 cursor-pointer"
                    >
                      <option value="Espanol">Espanol</option>
                      <option value="Ingles">Ingles</option>
                    </select>
                  </div>
                </div>

                {/* Enfoque — radio cards */}
                <div>
                  <label className="block text-sm font-semibold text-brand-navy-text mb-3">
                    Enfoque del caso de uso
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {ENFOQUE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setForm({ ...form, enfoque: opt.value })}
                        className={`text-left p-3.5 rounded-xl border-2 cursor-pointer transition-all duration-150 ${
                          form.enfoque === opt.value
                            ? 'border-brand-blue bg-brand-blue-lighter ring-2 ring-brand-blue/20'
                            : 'border-brand-border bg-brand-page-bg hover:border-brand-blue-med hover:bg-white'
                        }`}
                      >
                        <span className={`block text-sm font-semibold ${form.enfoque === opt.value ? 'text-brand-blue' : 'text-brand-navy-text'}`}>
                          {opt.label}
                        </span>
                        <span className="block text-xs text-brand-gray-mid mt-0.5 leading-snug">
                          {opt.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Document type selector */}
                <div>
                  <label className="block text-sm font-semibold text-brand-navy-text mb-3">
                    Tipo de documento
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'usecase', label: 'Use Case', desc: 'Documento completo con caso de uso detallado (PDF + Word)' },
                      { value: 'onepager', label: 'One-Pager', desc: 'Resumen ejecutivo de una pagina para ventas' },
                      { value: 'deck', label: 'Deck Comercial', desc: 'Presentacion PPTX personalizada para ventas' },
                      { value: 'both', label: 'Todos', desc: 'Genera Use Case + One-Pager + Deck Comercial' },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setForm({ ...form, docType: opt.value, deckEngine: 'auto' })}
                        className={`text-left p-3.5 rounded-xl border-2 cursor-pointer transition-all duration-150 ${
                          form.docType === opt.value
                            ? 'border-brand-orange bg-orange-50 ring-2 ring-brand-orange/20'
                            : 'border-brand-border bg-brand-page-bg hover:border-brand-orange/50 hover:bg-white'
                        }`}
                      >
                        <span className={`block text-sm font-semibold ${form.docType === opt.value ? 'text-brand-orange' : 'text-brand-navy-text'}`}>
                          {opt.label}
                        </span>
                        <span className="block text-xs text-brand-gray-mid mt-0.5 leading-snug">
                          {opt.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Deck engine selector — only when deck selected and Gamma available */}
                {(form.docType === 'deck' || form.docType === 'both') && gammaAvailable && (
                  <div>
                    <label className="block text-sm font-semibold text-brand-navy-text mb-3">
                      Motor de Deck
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: 'auto', label: 'Gamma AI', desc: 'Mayor calidad visual (predeterminado)', premium: false },
                        { value: 'presenton', label: 'Presenton', desc: 'Generacion rapida estandar', premium: false },
                      ].map((eng) => (
                        <button
                          key={eng.value}
                          type="button"
                          onClick={() => setForm({ ...form, deckEngine: eng.value })}
                          className={`text-left p-3.5 rounded-xl border-2 cursor-pointer transition-all duration-150 ${
                            form.deckEngine === eng.value
                              ? 'border-brand-blue bg-brand-blue-light ring-2 ring-brand-blue/20'
                              : 'border-brand-border bg-brand-page-bg hover:border-brand-blue/50 hover:bg-white'
                          }`}
                        >
                          <span className={`block text-sm font-semibold ${form.deckEngine === eng.value ? 'text-brand-blue' : 'text-brand-navy-text'}`}>
                            {eng.label}
                          </span>
                          <span className="block text-xs text-brand-gray-mid mt-0.5 leading-snug">
                            {eng.desc}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Info extra — collapsible feel */}
                <div>
                  <label htmlFor="infoExtra" className="block text-sm font-semibold text-brand-navy-text mb-2">
                    Informacion adicional <span className="font-normal text-brand-gray-mid">(opcional)</span>
                  </label>
                  <textarea
                    id="infoExtra"
                    name="infoExtra"
                    value={form.infoExtra}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Ej: La empresa tiene 500 vendedores en ruta, opera en 3 paises, el foco es canal TAT..."
                    className="w-full px-4 py-3 rounded-xl border-2 border-brand-border bg-brand-page-bg text-brand-navy-text placeholder:text-brand-gray-mid focus:outline-none focus:border-brand-blue focus:bg-white focus:ring-4 focus:ring-brand-blue/10 resize-none"
                  />
                </div>

                {/* Submit */}
                <button
                  onClick={handleGenerate}
                  disabled={!form.empresa.trim()}
                  className="w-full py-4 rounded-xl bg-brand-blue text-white font-bold text-lg cursor-pointer hover:bg-brand-blue-med disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 focus:outline-none focus:ring-4 focus:ring-brand-blue/30"
                >
                  <IconSparkles className="w-5 h-5" />
                  {form.docType === 'onepager' ? 'Generar One-Pager' : form.docType === 'deck' ? 'Generar Deck Comercial' : form.docType === 'both' ? 'Generar Todos los Documentos' : 'Generar caso de uso'}
                </button>
                <p className="text-center text-xs text-brand-gray-mid">
                  Cmd + Enter para generar
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ========== GENERATING STATE ========== */}
        {status === 'generating' && (
          <div className="animate-fade-in-up flex flex-col items-center pt-8">
            {/* Step indicator */}
            <StepIndicator step={Math.min(steps.length, 3)} total={4} />

            <div className="mt-10 mb-8 text-center">
              <h2 className="text-2xl font-bold text-brand-navy-text mb-1">
                Generando caso de uso
              </h2>
              <p className="text-brand-text-muted">{form.empresa}</p>
            </div>

            {/* Animated document preview skeleton */}
            <div className="w-full max-w-md bg-white rounded-2xl border border-brand-border shadow-sm p-6 mb-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-lg bg-brand-blue flex items-center justify-center">
                  <IconDocument className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="animate-shimmer h-4 w-48 rounded-md mb-1.5" />
                  <div className="animate-shimmer h-3 w-32 rounded-md" />
                </div>
              </div>
              <div className="space-y-2.5">
                <div className="animate-shimmer h-3 w-full rounded-md" />
                <div className="animate-shimmer h-3 w-5/6 rounded-md" />
                <div className="animate-shimmer h-3 w-4/6 rounded-md" />
                <div className="h-3" />
                <div className="animate-shimmer h-3 w-full rounded-md" />
                <div className="animate-shimmer h-3 w-3/4 rounded-md" />
              </div>
            </div>

            {/* Live steps */}
            <div className="w-full max-w-md space-y-3 stagger-children">
              {steps.map((step, i) => (
                <ProgressStep key={i} message={step} index={i} isLast={i === steps.length - 1} />
              ))}
            </div>
          </div>
        )}

        {/* ========== DONE STATE ========== */}
        {status === 'done' && result && (
          <div className="animate-fade-in-up flex flex-col items-center pt-8">
            <StepIndicator step={4} total={4} />

            <div className="mt-10 mb-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-green-500 flex items-center justify-center mx-auto mb-4">
                <IconCheck className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-brand-navy-text mb-1">
                Documento listo
              </h2>
              <p className="text-brand-text-muted">{form.empresa}</p>
            </div>

            {/* Result card */}
            <div className="w-full max-w-lg bg-white rounded-2xl border border-brand-border shadow-sm overflow-hidden">
              {/* Header */}
              <div className="bg-brand-blue px-6 py-5 flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <IconDocument className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-white font-bold text-lg">BucketsAI x {result.empresa}</p>
                  <p className="text-white/70 text-sm">{result.filename}</p>
                </div>
              </div>

              {/* Details */}
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {[
                    { label: 'Sector', value: result.sector || 'Detectado por IA' },
                    { label: 'Idioma', value: form.idioma },
                    ...(result.dim_a ? [{ label: 'Dimension A', value: result.dim_a }] : []),
                    ...(result.dim_b ? [{ label: 'Dimension B', value: result.dim_b }] : []),
                    ...(!result.dim_a && !result.dim_b ? [{ label: 'Tipo', value: 'One-Pager' }] : []),
                  ].map((item) => (
                    <div key={item.label} className="bg-brand-page-bg rounded-xl p-3">
                      <p className="text-xs text-brand-gray-mid mb-0.5">{item.label}</p>
                      <p className="text-sm font-semibold text-brand-navy-text leading-snug">{item.value}</p>
                    </div>
                  ))}
                </div>

                {/* Download buttons */}
                <div className="grid gap-3 grid-cols-2">
                  {result.pdfFilename && (
                    <a
                      href={`/api/download/${encodeURIComponent(result.pdfFilename)}`}
                      className="flex items-center justify-center gap-2 py-4 rounded-xl bg-brand-blue text-white font-bold cursor-pointer hover:bg-brand-blue-med focus:outline-none focus:ring-4 focus:ring-brand-blue/30 text-sm"
                    >
                      <IconDownload className="w-5 h-5" />
                      Use Case PDF
                    </a>
                  )}
                  {result.docxFilename && (
                    <a
                      href={`/api/download/${encodeURIComponent(result.docxFilename)}`}
                      className="flex items-center justify-center gap-2 py-4 rounded-xl bg-white text-brand-blue font-bold border-2 border-brand-blue cursor-pointer hover:bg-brand-blue-light focus:outline-none focus:ring-4 focus:ring-brand-blue/30 text-sm"
                    >
                      <IconDownload className="w-5 h-5" />
                      Use Case Word
                    </a>
                  )}
                  {result.onepagerFilename && (
                    <a
                      href={`/api/download/${encodeURIComponent(result.onepagerFilename)}`}
                      className="flex items-center justify-center gap-2 py-4 rounded-xl bg-brand-orange text-white font-bold cursor-pointer hover:bg-brand-orange/85 focus:outline-none focus:ring-4 focus:ring-brand-orange/30 text-sm"
                    >
                      <IconDownload className="w-5 h-5" />
                      One-Pager PDF
                    </a>
                  )}
                  {result.onepagerDocxFilename && (
                    <a
                      href={`/api/download/${encodeURIComponent(result.onepagerDocxFilename)}`}
                      className="flex items-center justify-center gap-2 py-4 rounded-xl bg-white text-brand-orange font-bold border-2 border-brand-orange cursor-pointer hover:bg-orange-50 focus:outline-none focus:ring-4 focus:ring-brand-orange/30 text-sm"
                    >
                      <IconDownload className="w-5 h-5" />
                      One-Pager Word
                    </a>
                  )}
                  {result.deckFilename && (
                    <a
                      href={`/api/download/${encodeURIComponent(result.deckFilename)}`}
                      className="flex items-center justify-center gap-2 py-4 rounded-xl bg-brand-navy-text text-white font-bold cursor-pointer hover:bg-brand-navy-text/85 focus:outline-none focus:ring-4 focus:ring-brand-navy-text/30 text-sm col-span-2"
                    >
                      <IconDownload className="w-5 h-5" />
                      Deck Comercial PPTX
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Completed steps */}
            <div className="w-full max-w-lg mt-6 space-y-2 stagger-children">
              {steps.map((step, i) => (
                <div key={i} className="flex items-center gap-2.5 text-sm text-brand-gray-mid">
                  <IconCheck className="w-4 h-4 text-brand-blue flex-shrink-0" />
                  {step}
                </div>
              ))}
            </div>

            {/* Reset */}
            <button
              onClick={handleReset}
              className="mt-8 flex items-center gap-2 text-brand-blue font-semibold hover:text-brand-blue-med cursor-pointer focus:outline-none focus:underline"
            >
              <IconArrowPath className="w-4 h-4" />
              Generar otro caso de uso
            </button>
          </div>
        )}

        {/* ========== ERROR STATE ========== */}
        {status === 'error' && (
          <div className="animate-fade-in-up flex flex-col items-center pt-16">
            <div className="w-16 h-16 rounded-2xl bg-red-500 flex items-center justify-center mb-6">
              <IconXMark className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-brand-navy-text mb-2">Error al generar</h2>
            <p className="text-red-600 text-sm max-w-md text-center mb-6 leading-relaxed">{error}</p>

            {steps.length > 0 && (
              <div className="w-full max-w-md mb-6 space-y-2">
                {steps.map((step, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-sm text-brand-gray-mid">
                    <IconCheck className="w-4 h-4 text-brand-blue flex-shrink-0" />
                    {step}
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-blue text-white font-bold cursor-pointer hover:bg-brand-blue-med focus:outline-none focus:ring-4 focus:ring-brand-blue/30"
            >
              <IconArrowPath className="w-4 h-4" />
              Intentar de nuevo
            </button>
          </div>
        )}
      </main>

      {/* ---- FOOTER ---- */}
      <footer className="text-center py-5 text-brand-gray-mid text-xs border-t border-brand-border">
        <span className="italic">All your knowledge, one conversation away.</span>
        <span className="mx-2">|</span>
        buckets-ai.com
      </footer>
    </div>
  );
}
