'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function AdminPage() {
  const [tab, setTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [useCases, setUseCases] = useState([]);
  const [accessRequests, setAccessRequests] = useState([]);
  const [approvingId, setApprovingId] = useState(null);
  const [renewingId, setRenewingId] = useState(null);
  const [revokingId, setRevokingId] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteMsg, setInviteMsg] = useState('');
  const [inviteError, setInviteError] = useState('');
  const router = useRouter();

  const loadData = () => {
    Promise.all([
      fetch('/api/admin/users').then((r) => r.json()),
      fetch('/api/admin/use-cases').then((r) => r.json()),
      fetch('/api/admin/access-requests').then((r) => r.json()),
    ]).then(([uData, ucData, arData]) => {
      setUsers(uData.users || []);
      setUseCases(ucData.useCases || []);
      setAccessRequests(arData.accessRequests || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(interval);
  }, []);

  const formatCountdown = (expiresAt) => {
    if (!expiresAt) return null;
    const diff = new Date(expiresAt).getTime() - now;
    if (diff <= 0) return { label: 'Expirado', color: 'bg-red-50 text-red-500' };
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const label = h > 0 ? `${h}h ${m}m restantes` : `${m}m restantes`;
    const color = h < 2 ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600';
    return { label, color };
  };

  const handleApprove = async (requestId) => {
    if (!confirm('¿Aprobar esta solicitud y enviar email de invitacion?')) return;
    setApprovingId(requestId);
    try {
      const res = await fetch(`/api/admin/access-requests/${requestId}/approve`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Error al aprobar');
      } else {
        const newExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        setAccessRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'approved', user_expires_at: newExpiresAt } : r));
      }
    } catch {
      alert('Error de conexion');
    } finally {
      setApprovingId(null);
    }
  };

  const handleRenew = async (requestId) => {
    if (!confirm('¿Renovar acceso por 24 horas adicionales desde ahora?')) return;
    setRenewingId(requestId);
    try {
      const res = await fetch(`/api/admin/access-requests/${requestId}/renew`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Error al renovar');
      } else {
        setAccessRequests(prev => prev.map(r => r.id === requestId ? { ...r, user_expires_at: data.expires_at } : r));
      }
    } catch {
      alert('Error de conexion');
    } finally {
      setRenewingId(null);
    }
  };

  const handleRevoke = async (requestId, empresa) => {
    if (!confirm(`¿Eliminar el acceso de ${empresa}? Esta accion no se puede deshacer.`)) return;
    setRevokingId(requestId);
    try {
      const res = await fetch(`/api/admin/access-requests/${requestId}/revoke`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Error al eliminar');
      } else {
        setAccessRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'revoked', user_expires_at: null } : r));
      }
    } catch {
      alert('Error de conexion');
    } finally {
      setRevokingId(null);
    }
  };

  useEffect(() => { loadData(); }, []);

  const formatDate = (d) => {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const handleToggleField = async (userId, field, currentValue) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/gamma`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: !currentValue }),
      });
      if (res.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, [field]: !currentValue } : u));
      }
    } catch { /* silent */ }
  };

  const handleDelete = async (userId, userName) => {
    if (!confirm(`¿Eliminar a ${userName}? Esta accion no se puede deshacer.`)) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error);
      } else {
        setUsers(users.filter(u => u.id !== userId));
      }
    } catch {
      alert('Error de conexion');
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviteError('');
    setInviteMsg('');
    setInviteLoading(true);

    try {
      const res = await fetch('/api/admin/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: inviteName, email: inviteEmail }),
      });
      const data = await res.json();
      setInviteLoading(false);

      if (!res.ok) {
        setInviteError(data.error);
      } else {
        setInviteMsg('Invitacion enviada exitosamente');
        setInviteName('');
        setInviteEmail('');
        // Reload users list
        fetch('/api/admin/users').then(r => r.json()).then(d => setUsers(d.users || []));
      }
    } catch {
      setInviteLoading(false);
      setInviteError('Error de conexion');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-page-bg">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-brand-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => router.push('/')} className="cursor-pointer focus:outline-none">
            <Image src="/logo.png" alt="BucketsAI" width={160} height={36} priority className="h-8 w-auto" />
          </button>
          <div className="flex items-center gap-3">
            <span className="text-xs text-white bg-brand-orange px-3 py-1 rounded-full font-medium">Admin</span>
            <button onClick={() => router.push('/')} className="text-xs text-brand-gray-mid hover:text-brand-navy-text cursor-pointer font-medium">
              Volver
            </button>
            <button
              onClick={async () => { await fetch('/api/auth/logout', { method: 'POST' }); router.push('/login'); router.refresh(); }}
              className="text-xs text-brand-gray-mid hover:text-red-500 cursor-pointer font-medium"
            >
              Salir
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-brand-navy-text">Panel de administracion</h1>
          <button
            onClick={() => { setShowInvite(!showInvite); setInviteMsg(''); setInviteError(''); }}
            className="px-4 py-2 rounded-xl bg-brand-blue text-white text-sm font-semibold cursor-pointer hover:bg-brand-blue-med focus:outline-none focus:ring-4 focus:ring-brand-blue/30"
          >
            + Invitar usuario
          </button>
        </div>

        {/* Invite Form */}
        {showInvite && (
          <div className="bg-white rounded-2xl border border-brand-border shadow-sm p-6 mb-6">
            <h3 className="text-sm font-bold text-brand-navy-text mb-4">Invitar nuevo usuario</h3>
            <form onSubmit={handleInvite} className="flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-semibold text-brand-navy-text mb-1">Nombre</label>
                <input
                  type="text"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="Nombre del usuario"
                  className="w-full px-3 py-2.5 rounded-lg border-2 border-brand-border bg-brand-page-bg text-sm text-brand-navy-text placeholder:text-brand-gray-mid focus:outline-none focus:border-brand-blue focus:bg-white"
                />
              </div>
              <div className="flex-1 min-w-[250px]">
                <label className="block text-xs font-semibold text-brand-navy-text mb-1">Email</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="email@ejemplo.com"
                  className="w-full px-3 py-2.5 rounded-lg border-2 border-brand-border bg-brand-page-bg text-sm text-brand-navy-text placeholder:text-brand-gray-mid focus:outline-none focus:border-brand-blue focus:bg-white"
                />
              </div>
              <button
                type="submit"
                disabled={inviteLoading || !inviteName || !inviteEmail}
                className="px-5 py-2.5 rounded-lg bg-brand-blue text-white text-sm font-semibold cursor-pointer hover:bg-brand-blue-med disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {inviteLoading ? 'Enviando...' : 'Enviar invitacion'}
              </button>
            </form>
            {inviteMsg && <p className="text-green-600 text-sm mt-3">{inviteMsg}</p>}
            {inviteError && <p className="text-red-500 text-sm mt-3">{inviteError}</p>}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white rounded-xl border border-brand-border p-1 w-fit">
          <button
            onClick={() => setTab('users')}
            className={`px-5 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-all ${tab === 'users' ? 'bg-brand-blue text-white' : 'text-brand-gray-mid hover:text-brand-navy-text'}`}
          >
            Usuarios ({users.length})
          </button>
          <button
            onClick={() => setTab('cases')}
            className={`px-5 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-all ${tab === 'cases' ? 'bg-brand-blue text-white' : 'text-brand-gray-mid hover:text-brand-navy-text'}`}
          >
            Casos de uso ({useCases.length})
          </button>
          <button
            onClick={() => setTab('requests')}
            className={`px-5 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-all flex items-center gap-2 ${tab === 'requests' ? 'bg-brand-blue text-white' : 'text-brand-gray-mid hover:text-brand-navy-text'}`}
          >
            Solicitudes
            {accessRequests.filter(r => r.status === 'pending').length > 0 && (
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${tab === 'requests' ? 'bg-white/20 text-white' : 'bg-brand-orange text-white'}`}>
                {accessRequests.filter(r => r.status === 'pending').length}
              </span>
            )}
          </button>
        </div>

        {loading ? (
          <p className="text-brand-text-muted">Cargando...</p>
        ) : tab === 'requests' ? (
          /* Access Requests Table */
          <div className="bg-white rounded-2xl border border-brand-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-brand-border bg-brand-page-bg">
                    <th className="text-left px-5 py-3 font-semibold text-brand-navy-text">Empresa</th>
                    <th className="text-left px-5 py-3 font-semibold text-brand-navy-text">Email</th>
                    <th className="text-left px-5 py-3 font-semibold text-brand-navy-text">Teléfono</th>
                    <th className="text-left px-5 py-3 font-semibold text-brand-navy-text">Estado</th>
                    <th className="text-left px-5 py-3 font-semibold text-brand-navy-text">Tiempo restante</th>
                    <th className="text-left px-5 py-3 font-semibold text-brand-navy-text">Fecha</th>
                    <th className="text-right px-5 py-3 font-semibold text-brand-navy-text">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {accessRequests.map((r) => {
                    const countdown = r.status === 'approved' ? formatCountdown(r.user_expires_at) : null;
                    const statusLabel = r.status === 'approved' ? 'Aprobado' : r.status === 'revoked' ? 'Eliminado' : 'Pendiente';
                    const statusColor = r.status === 'approved' ? 'bg-green-50 text-green-600' : r.status === 'revoked' ? 'bg-red-50 text-red-400' : 'bg-amber-50 text-amber-600';
                    return (
                      <tr key={r.id} className="border-b border-brand-border last:border-0 hover:bg-brand-page-bg/50">
                        <td className="px-5 py-3 font-medium text-brand-navy-text">{r.empresa}</td>
                        <td className="px-5 py-3 text-brand-text-muted">{r.email}</td>
                        <td className="px-5 py-3 text-brand-text-muted">{r.telefono}</td>
                        <td className="px-5 py-3">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColor}`}>{statusLabel}</span>
                        </td>
                        <td className="px-5 py-3">
                          {countdown ? (
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${countdown.color}`}>{countdown.label}</span>
                          ) : (
                            <span className="text-xs text-brand-gray-mid">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-brand-gray-mid text-xs">{formatDate(r.created_at)}</td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex gap-3 justify-end">
                            {r.status === 'pending' && (
                              <button
                                onClick={() => handleApprove(r.id)}
                                disabled={approvingId === r.id}
                                className="text-xs font-semibold text-brand-blue hover:text-brand-blue-med cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                {approvingId === r.id ? 'Aprobando...' : 'Aprobar'}
                              </button>
                            )}
                            {r.status === 'approved' && (
                              <button
                                onClick={() => handleRenew(r.id)}
                                disabled={renewingId === r.id}
                                className="text-xs font-semibold text-green-600 hover:text-green-700 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                {renewingId === r.id ? 'Renovando...' : 'Renovar'}
                              </button>
                            )}
                            {(r.status === 'approved' || r.status === 'pending') && (
                              <button
                                onClick={() => handleRevoke(r.id, r.empresa)}
                                disabled={revokingId === r.id}
                                className="text-xs font-semibold text-red-400 hover:text-red-600 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                {revokingId === r.id ? 'Eliminando...' : 'Eliminar'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {accessRequests.length === 0 && (
                    <tr><td colSpan={7} className="px-5 py-8 text-center text-brand-text-muted">No hay solicitudes de acceso aun</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : tab === 'users' ? (
          /* Users Table */
          <div className="bg-white rounded-2xl border border-brand-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-brand-border bg-brand-page-bg">
                    <th className="text-left px-5 py-3 font-semibold text-brand-navy-text">Nombre</th>
                    <th className="text-left px-5 py-3 font-semibold text-brand-navy-text">Email</th>
                    <th className="text-left px-5 py-3 font-semibold text-brand-navy-text">Rol</th>
                    <th className="text-left px-5 py-3 font-semibold text-brand-navy-text">Estado</th>
                    <th className="text-center px-3 py-3 font-semibold text-brand-navy-text text-xs">Deck</th>
                    <th className="text-center px-3 py-3 font-semibold text-brand-navy-text text-xs">Talk Track</th>
                    <th className="text-center px-3 py-3 font-semibold text-brand-navy-text text-xs">Informe</th>
                    <th className="text-left px-5 py-3 font-semibold text-brand-navy-text">Registro</th>
                    <th className="text-right px-5 py-3 font-semibold text-brand-navy-text">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-brand-border last:border-0 hover:bg-brand-page-bg/50">
                      <td className="px-5 py-3 font-medium text-brand-navy-text">{u.name || '-'}</td>
                      <td className="px-5 py-3 text-brand-text-muted">{u.email}</td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${u.role === 'admin' ? 'bg-brand-orange/10 text-brand-orange' : 'bg-brand-blue-light text-brand-blue'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${u.verified ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                          {u.verified ? 'Activo' : 'Pendiente'}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        {u.role === 'admin' ? (
                          <span className="text-xs text-brand-orange font-semibold">Si</span>
                        ) : (
                          <button
                            onClick={() => handleToggleField(u.id, 'deck_enabled', u.deck_enabled)}
                            className={`relative inline-flex h-5 w-9 items-center rounded-full cursor-pointer transition-colors ${u.deck_enabled ? 'bg-brand-blue' : 'bg-gray-300'}`}
                          >
                            <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${u.deck_enabled ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
                          </button>
                        )}
                      </td>
                      <td className="px-3 py-3 text-center">
                        {u.role === 'admin' ? (
                          <span className="text-xs text-brand-orange font-semibold">Si</span>
                        ) : (
                          <button
                            onClick={() => handleToggleField(u.id, 'talktrack_enabled', u.talktrack_enabled)}
                            className={`relative inline-flex h-5 w-9 items-center rounded-full cursor-pointer transition-colors ${u.talktrack_enabled ? 'bg-brand-blue' : 'bg-gray-300'}`}
                          >
                            <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${u.talktrack_enabled ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
                          </button>
                        )}
                      </td>
                      <td className="px-3 py-3 text-center">
                        {u.role === 'admin' ? (
                          <span className="text-xs text-brand-orange font-semibold">Si</span>
                        ) : (
                          <button
                            onClick={() => handleToggleField(u.id, 'market_report_enabled', u.market_report_enabled)}
                            className={`relative inline-flex h-5 w-9 items-center rounded-full cursor-pointer transition-colors ${u.market_report_enabled ? 'bg-brand-blue' : 'bg-gray-300'}`}
                          >
                            <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${u.market_report_enabled ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
                          </button>
                        )}
                      </td>
                      <td className="px-5 py-3 text-brand-gray-mid text-xs">{formatDate(u.created_at)}</td>
                      <td className="px-5 py-3 text-right">
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => handleDelete(u.id, u.name || u.email)}
                            className="text-xs text-red-400 hover:text-red-600 font-medium cursor-pointer"
                          >
                            Eliminar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Use Cases Table */
          <div className="bg-white rounded-2xl border border-brand-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-brand-border bg-brand-page-bg">
                    <th className="text-left px-5 py-3 font-semibold text-brand-navy-text">Empresa</th>
                    <th className="text-left px-5 py-3 font-semibold text-brand-navy-text">Usuario</th>
                    <th className="text-left px-5 py-3 font-semibold text-brand-navy-text">Sector</th>
                    <th className="text-left px-5 py-3 font-semibold text-brand-navy-text">Pais</th>
                    <th className="text-left px-5 py-3 font-semibold text-brand-navy-text">Idioma</th>
                    <th className="text-left px-5 py-3 font-semibold text-brand-navy-text">Fecha</th>
                    <th className="text-left px-5 py-3 font-semibold text-brand-navy-text">Descargas</th>
                  </tr>
                </thead>
                <tbody>
                  {useCases.map((uc) => (
                    <tr key={uc.id} className="border-b border-brand-border last:border-0 hover:bg-brand-page-bg/50">
                      <td className="px-5 py-3 font-medium text-brand-navy-text max-w-[200px] truncate">{uc.empresa}</td>
                      <td className="px-5 py-3">
                        <div className="text-brand-navy-text text-xs font-medium">{uc.user_name || '-'}</div>
                        <div className="text-brand-gray-mid text-xs">{uc.user_email || '-'}</div>
                      </td>
                      <td className="px-5 py-3">
                        {uc.sector && <span className="text-xs bg-brand-blue-light text-brand-blue px-2 py-0.5 rounded-full">{uc.sector}</span>}
                      </td>
                      <td className="px-5 py-3 text-brand-text-muted">{uc.pais || '-'}</td>
                      <td className="px-5 py-3 text-brand-text-muted">{uc.idioma || '-'}</td>
                      <td className="px-5 py-3 text-brand-gray-mid text-xs">{formatDate(uc.created_at)}</td>
                      <td className="px-5 py-3">
                        <div className="flex gap-2">
                          {uc.pdf_filename && (
                            <a href={`/api/download/${encodeURIComponent(uc.pdf_filename)}`} className="text-xs text-brand-blue font-semibold hover:text-brand-blue-med">PDF</a>
                          )}
                          {uc.docx_filename && (
                            <a href={`/api/download/${encodeURIComponent(uc.docx_filename)}`} className="text-xs text-brand-blue font-semibold hover:text-brand-blue-med">DOCX</a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {useCases.length === 0 && (
                    <tr><td colSpan={7} className="px-5 py-8 text-center text-brand-text-muted">No hay casos de uso generados aun</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
