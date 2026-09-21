'use client';

import { useState } from 'react';

export default function AdminApplications() {
  const [key, setKey] = useState('');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true); setError('');
    const res = await fetch('/api/admin/applications', { headers: { 'x-admin-key': key } });
    if (!res.ok) { setError('Неверный ключ или сервер не настроен.'); setLoading(false); return; }
    setRows(await res.json()); setLoading(false);
  }

  async function openDocument(path) {
    const res = await fetch(`/api/admin/document?path=${encodeURIComponent(path)}`, { headers: { 'x-admin-key': key } });
    if (!res.ok) { alert('Не удалось открыть документ'); return; }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank', 'noopener,noreferrer');
    window.setTimeout(() => URL.revokeObjectURL(url), 60000);
  }

  async function update(id, status) {
    const review_note = window.prompt('Комментарий менеджера (необязательно):', '') || '';
    const res = await fetch(`/api/admin/applications/${id}/status`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-admin-key': key },
      body: JSON.stringify({ status, review_note }),
    });
    if (!res.ok) { alert('Не удалось обновить статус'); return; }
    await load();
  }

  return <main className="admin-page">
    <header className="admin-header"><img src="/img/main-logo (1).webp" alt="COSMO Agency" /><span>MANAGER REVIEW</span></header>
    <section className="admin-shell">
      <div className="admin-title"><div><p className="eyebrow">COSMO OS</p><h1>Заявки на регистрацию</h1></div><div className="admin-auth"><input type="password" value={key} onChange={(e) => setKey(e.target.value)} placeholder="Admin access key"/><button className="pink-btn" onClick={load} disabled={!key || loading}>{loading ? 'Загрузка…' : 'Открыть'}</button></div></div>
      {error && <p className="register-error">{error}</p>}
      <div className="admin-grid">
        {rows.map((row) => <article className="admin-card" key={row.id}>
          <div className="admin-card__top"><div><small>{new Date(row.created_at).toLocaleString()}</small><h2>{row.full_name}</h2></div><span className={`admin-badge admin-badge--${row.status}`}>{row.status}</span></div>
          <div className="admin-data"><p><span>Дата рождения</span>{row.date_of_birth}</p><p><span>Телефон</span>{row.phone}</p><p><span>Telegram</span>{row.telegram || '—'}</p><p><span>Email</span>{row.email}</p><p><span>Локация</span>{[row.country,row.city].filter(Boolean).join(', ') || '—'}</p><p><span>Языки</span>{row.languages || '—'}</p></div>
          <div className="admin-documents"><button onClick={() => openDocument(row.document_front_path)}>Документ · FRONT ↗</button><button onClick={() => openDocument(row.document_back_path)}>Документ · BACK ↗</button></div>
          {row.experience && <div className="admin-copy"><span>Опыт</span><p>{row.experience}</p></div>}
          {row.schedule && <div className="admin-copy"><span>График</span><p>{row.schedule}</p></div>}
          {row.review_note && <div className="admin-copy"><span>Комментарий</span><p>{row.review_note}</p></div>}
          <div className="admin-actions"><button onClick={() => update(row.id,'approved')}>Approve</button><button onClick={() => update(row.id,'needs_changes')}>Needs changes</button><button onClick={() => update(row.id,'rejected')}>Reject</button></div>
        </article>)}
      </div>
    </section>
  </main>;
}
