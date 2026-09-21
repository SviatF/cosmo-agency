'use client';

import { useMemo, useState } from 'react';

const STATUS_LABELS={all:'Все',review:'На проверке',approved:'Approved',needs_changes:'Needs changes',rejected:'Rejected'};

export default function AdminApplications(){
  const [key,setKey]=useState(''); const [rows,setRows]=useState([]); const [loading,setLoading]=useState(false); const [error,setError]=useState(''); const [query,setQuery]=useState(''); const [filter,setFilter]=useState('all'); const [selected,setSelected]=useState(null); const [note,setNote]=useState('');
  async function load(){setLoading(true);setError('');const res=await fetch('/api/admin/applications',{headers:{'x-admin-key':key}});if(!res.ok){setError('Неверный ключ или сервер не настроен.');setLoading(false);return;}setRows(await res.json());setLoading(false);}
  async function openDocument(path){const res=await fetch(`/api/admin/document?path=${encodeURIComponent(path)}`,{headers:{'x-admin-key':key}});if(!res.ok){alert('Не удалось открыть документ');return;}const blob=await res.blob();const url=URL.createObjectURL(blob);window.open(url,'_blank','noopener,noreferrer');window.setTimeout(()=>URL.revokeObjectURL(url),60000);}
  async function update(id,status){if((status==='rejected'||status==='needs_changes')&&!note.trim()){alert('Добавь комментарий менеджера');return;}const res=await fetch(`/api/admin/applications/${id}/status`,{method:'POST',headers:{'content-type':'application/json','x-admin-key':key},body:JSON.stringify({status,review_note:note.trim()})});if(!res.ok){alert('Не удалось обновить статус');return;}await load();setSelected(null);setNote('');}
  const stats=useMemo(()=>({all:rows.length,review:rows.filter(r=>r.status==='review').length,approved:rows.filter(r=>r.status==='approved').length,needs_changes:rows.filter(r=>r.status==='needs_changes').length,rejected:rows.filter(r=>r.status==='rejected').length}),[rows]);
  const filtered=useMemo(()=>rows.filter(r=>(filter==='all'||r.status===filter)&&`${r.full_name} ${r.phone} ${r.telegram} ${r.email} ${r.country} ${r.city}`.toLowerCase().includes(query.toLowerCase())),[rows,filter,query]);
  const copy=(v)=>navigator.clipboard?.writeText(v||'');

  return <main className="crm-page">
    <aside className="crm-sidebar"><img src="/img/main-logo (1).webp" alt="COSMO Agency"/><p>COSMO OS</p><nav><button className="active">◈ Dashboard</button><button>◎ Applications</button><button>◇ Review queue</button><button>✓ Approved</button><button>! Needs changes</button><button>× Rejected</button></nav><small>MANAGER WORKSPACE</small></aside>
    <section className="crm-main">
      <header className="crm-topbar"><div><p className="eyebrow">COSMO CRM</p><h1>Заявки на регистрацию</h1></div><div className="crm-auth"><input type="password" value={key} onChange={e=>setKey(e.target.value)} placeholder="Admin access key"/><button onClick={load} disabled={!key||loading}>{loading?'Загрузка…':'Открыть CRM'}</button></div></header>
      {error&&<p className="register-error">{error}</p>}
      <div className="crm-stats">{['all','review','approved','needs_changes','rejected'].map(s=><button key={s} className={filter===s?'active':''} onClick={()=>setFilter(s)}><span>{STATUS_LABELS[s]}</span><strong>{stats[s]}</strong></button>)}</div>
      <div className="crm-toolbar"><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Поиск по имени, телефону, Telegram, email…"/><span>{filtered.length} records</span><button onClick={load}>↻ Refresh</button></div>
      <div className="crm-table-wrap"><table className="crm-table"><thead><tr><th>Кандидат</th><th>Контакты</th><th>Локация</th><th>Дата</th><th>Статус</th><th></th></tr></thead><tbody>{filtered.map(row=><tr key={row.id} onClick={()=>{setSelected(row);setNote(row.review_note||'')}}><td><b>{row.full_name}</b><small>{row.email}</small></td><td><b>{row.phone}</b><small>{row.telegram||'—'}</small></td><td><b>{[row.country,row.city].filter(Boolean).join(', ')||'—'}</b><small>{row.languages||'—'}</small></td><td><b>{new Date(row.created_at).toLocaleDateString()}</b><small>{new Date(row.created_at).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</small></td><td><span className={`crm-status crm-status--${row.status}`}>{row.status.replace('_',' ')}</span></td><td><button className="crm-open">Open →</button></td></tr>)}</tbody></table>{!filtered.length&&!loading&&<div className="crm-empty">Нет заявок по выбранному фильтру</div>}</div>
    </section>
    {selected&&<div className="crm-drawer-backdrop" onMouseDown={e=>e.target===e.currentTarget&&setSelected(null)}><aside className="crm-drawer"><button className="crm-close" onClick={()=>setSelected(null)}>×</button><div className="crm-drawer-head"><p className="eyebrow">APPLICATION</p><h2>{selected.full_name}</h2><span className={`crm-status crm-status--${selected.status}`}>{selected.status}</span></div>
      <div className="crm-detail-grid"><div><span>Дата рождения</span><b>{selected.date_of_birth}</b></div><div><span>Телефон</span><b>{selected.phone}</b><button onClick={()=>copy(selected.phone)}>copy</button></div><div><span>Telegram</span><b>{selected.telegram||'—'}</b><button onClick={()=>copy(selected.telegram)}>copy</button></div><div><span>Email</span><b>{selected.email}</b><button onClick={()=>copy(selected.email)}>copy</button></div><div><span>Локация</span><b>{[selected.country,selected.city].filter(Boolean).join(', ')||'—'}</b></div><div><span>Языки</span><b>{selected.languages||'—'}</b></div></div>
      <div className="crm-docs"><button onClick={()=>openDocument(selected.document_front_path)}>01 · FRONT DOCUMENT ↗</button><button onClick={()=>openDocument(selected.document_back_path)}>02 · BACK DOCUMENT ↗</button></div>
      {selected.experience&&<section className="crm-note-block"><span>Опыт</span><p>{selected.experience}</p></section>}{selected.schedule&&<section className="crm-note-block"><span>График</span><p>{selected.schedule}</p></section>}
      <label className="crm-manager-note"><span>Manager note</span><textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="Комментарий для кандидата / внутренняя заметка"/></label>
      <div className="crm-actions"><button className="approve" onClick={()=>update(selected.id,'approved')}>Approve</button><button onClick={()=>update(selected.id,'needs_changes')}>Needs changes</button><button className="reject" onClick={()=>update(selected.id,'rejected')}>Reject</button></div>
    </aside></div>}
  </main>;
}
