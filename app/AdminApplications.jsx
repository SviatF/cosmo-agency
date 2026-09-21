'use client';

import { useEffect, useMemo, useState } from 'react';

const STATUS_LABELS={all:'Все',review:'На проверке',approved:'Approved',needs_changes:'Needs changes',rejected:'Rejected'};
const NAV=[
  {id:'dashboard',label:'Dashboard',icon:'◈'},
  {id:'all',label:'Applications',icon:'◎'},
  {id:'review',label:'Review queue',icon:'◇'},
  {id:'approved',label:'Approved',icon:'✓'},
  {id:'needs_changes',label:'Needs changes',icon:'!'},
  {id:'rejected',label:'Rejected',icon:'×'},
  {id:'settings',label:'Settings',icon:'⚙'},
];

export default function AdminApplications(){
  const [key,setKey]=useState('');
  const [authorized,setAuthorized]=useState(false);
  const [rows,setRows]=useState([]);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  const [query,setQuery]=useState('');
  const [view,setView]=useState('dashboard');
  const [selected,setSelected]=useState(null);
  const [note,setNote]=useState('');

  useEffect(()=>{const saved=sessionStorage.getItem('cosmo_admin_key');if(saved)setKey(saved);},[]);

  async function authorize(candidate=key){
    if(!candidate)return;
    setLoading(true);setError('');
    const res=await fetch('/api/admin/applications',{headers:{'x-admin-key':candidate}});
    if(!res.ok){setError('Неверный ключ доступа.');setAuthorized(false);setLoading(false);return;}
    const data=await res.json();
    sessionStorage.setItem('cosmo_admin_key',candidate);
    setRows(data);setAuthorized(true);setLoading(false);
  }

  async function load(){if(!authorized)return authorize();setLoading(true);const res=await fetch('/api/admin/applications',{headers:{'x-admin-key':key}});if(res.ok)setRows(await res.json());else{setAuthorized(false);sessionStorage.removeItem('cosmo_admin_key');}setLoading(false);}
  function logout(){sessionStorage.removeItem('cosmo_admin_key');setAuthorized(false);setRows([]);setSelected(null);setView('dashboard');}
  async function openDocument(path){const res=await fetch(`/api/admin/document?path=${encodeURIComponent(path)}`,{headers:{'x-admin-key':key}});if(!res.ok){alert('Не удалось открыть документ');return;}const blob=await res.blob();const url=URL.createObjectURL(blob);window.open(url,'_blank','noopener,noreferrer');window.setTimeout(()=>URL.revokeObjectURL(url),60000);}
  async function update(id,status){if((status==='rejected'||status==='needs_changes')&&!note.trim()){alert('Добавь комментарий менеджера');return;}const res=await fetch(`/api/admin/applications/${id}/status`,{method:'POST',headers:{'content-type':'application/json','x-admin-key':key},body:JSON.stringify({status,review_note:note.trim()})});if(!res.ok){alert('Не удалось обновить статус');return;}await load();setSelected(null);setNote('');}
  const stats=useMemo(()=>({all:rows.length,review:rows.filter(r=>r.status==='review').length,approved:rows.filter(r=>r.status==='approved').length,needs_changes:rows.filter(r=>r.status==='needs_changes').length,rejected:rows.filter(r=>r.status==='rejected').length}),[rows]);
  const activeFilter=['all','review','approved','needs_changes','rejected'].includes(view)?view:'all';
  const filtered=useMemo(()=>rows.filter(r=>(activeFilter==='all'||r.status===activeFilter)&&`${r.full_name} ${r.phone} ${r.telegram} ${r.email} ${r.country} ${r.city}`.toLowerCase().includes(query.toLowerCase())),[rows,activeFilter,query]);
  const recent=rows.slice(0,6);
  const copy=(v)=>navigator.clipboard?.writeText(v||'');

  if(!authorized) return <main className="crm-login-page">
    <section className="crm-login-card">
      <img src="/img/main-logo (1).webp" alt="COSMO Agency"/>
      <p className="eyebrow">COSMO OS / MANAGER ACCESS</p>
      <h1>Вход в CRM</h1>
      <p>Введите персональный ключ менеджера. Данные заявок и документы загрузятся только после успешной авторизации.</p>
      <form onSubmit={e=>{e.preventDefault();authorize();}}>
        <label><span>ADMIN ACCESS KEY</span><input autoFocus type="password" value={key} onChange={e=>setKey(e.target.value)} placeholder="••••••••••••••••"/></label>
        {error&&<div className="crm-login-error">{error}</div>}
        <button disabled={!key||loading}>{loading?'Проверяем доступ…':'Открыть COSMO CRM →'}</button>
      </form>
      <small>PRIVATE MANAGER WORKSPACE · SESSION ONLY</small>
    </section>
  </main>;

  return <main className="crm-page">
    <aside className="crm-sidebar">
      <img src="/img/main-logo (1).webp" alt="COSMO Agency"/>
      <p>COSMO OS</p>
      <nav>{NAV.map(item=><button key={item.id} className={view===item.id?'active':''} onClick={()=>setView(item.id)}><span>{item.icon}</span>{item.label}{['review','approved','needs_changes','rejected'].includes(item.id)&&<b>{stats[item.id]}</b>}</button>)}</nav>
      <div className="crm-sidebar-foot"><small>MANAGER WORKSPACE</small><button onClick={logout}>Выйти</button></div>
    </aside>

    <section className="crm-main">
      <header className="crm-topbar"><div><p className="eyebrow">COSMO CRM</p><h1>{view==='dashboard'?'Dashboard':view==='settings'?'Настройки':'Заявки на регистрацию'}</h1></div><div className="crm-top-actions"><span>● LIVE</span><button onClick={load}>{loading?'Обновляем…':'↻ Refresh'}</button></div></header>

      {view==='dashboard'&&<>
        <div className="crm-stats">{['all','review','approved','needs_changes','rejected'].map(s=><button key={s} onClick={()=>setView(s)}><span>{STATUS_LABELS[s]}</span><strong>{stats[s]}</strong></button>)}</div>
        <div className="crm-dashboard-grid">
          <section className="crm-panel"><div className="crm-panel-head"><div><span>RECENT APPLICATIONS</span><h2>Последние заявки</h2></div><button onClick={()=>setView('all')}>Все заявки →</button></div>{recent.map(row=><button className="crm-recent" key={row.id} onClick={()=>{setSelected(row);setNote(row.review_note||'')}}><div><b>{row.full_name}</b><small>{row.phone} · {row.telegram||'без Telegram'}</small></div><span className={`crm-status crm-status--${row.status}`}>{row.status.replace('_',' ')}</span></button>)}{!recent.length&&<div className="crm-empty">Пока нет заявок</div>}</section>
          <section className="crm-panel crm-panel--review"><span>REVIEW QUEUE</span><strong>{stats.review}</strong><p>кандидатов ожидают проверки менеджера</p><button onClick={()=>setView('review')}>Открыть очередь →</button></section>
        </div>
      </>}

      {view!=='dashboard'&&view!=='settings'&&<>
        <div className="crm-stats">{['all','review','approved','needs_changes','rejected'].map(s=><button key={s} className={activeFilter===s?'active':''} onClick={()=>setView(s)}><span>{STATUS_LABELS[s]}</span><strong>{stats[s]}</strong></button>)}</div>
        <div className="crm-toolbar"><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Поиск по имени, телефону, Telegram, email…"/><span>{filtered.length} records</span><button onClick={load}>↻ Refresh</button></div>
        <div className="crm-table-wrap"><table className="crm-table"><thead><tr><th>Кандидат</th><th>Контакты</th><th>Локация</th><th>Дата</th><th>Статус</th><th></th></tr></thead><tbody>{filtered.map(row=><tr key={row.id} onClick={()=>{setSelected(row);setNote(row.review_note||'')}}><td><b>{row.full_name}</b><small>{row.email}</small></td><td><b>{row.phone}</b><small>{row.telegram||'—'}</small></td><td><b>{[row.country,row.city].filter(Boolean).join(', ')||'—'}</b><small>{row.languages||'—'}</small></td><td><b>{new Date(row.created_at).toLocaleDateString()}</b><small>{new Date(row.created_at).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</small></td><td><span className={`crm-status crm-status--${row.status}`}>{row.status.replace('_',' ')}</span></td><td><button className="crm-open">Open →</button></td></tr>)}</tbody></table>{!filtered.length&&!loading&&<div className="crm-empty">Нет заявок по выбранному фильтру</div>}</div>
      </>}

      {view==='settings'&&<div className="crm-settings-grid">
        <section className="crm-panel"><span>ACCESS</span><h2>Manager access</h2><p>CRM защищена runtime secret <code>ADMIN_ACCESS_KEY</code>. Ключ хранится только в текущей browser session.</p><button onClick={logout}>Завершить сессию</button></section>
        <section className="crm-panel"><span>TELEGRAM</span><h2>Verification delivery</h2><p>Новые регистрации и документы отправляются менеджерам через приватную Telegram-группу. Оригиналы также остаются в private Supabase Storage.</p></section>
        <section className="crm-panel"><span>DATA</span><h2>Private KYC storage</h2><p>Документы доступны через защищённый admin API и не публикуются как открытые URL.</p></section>
      </div>}
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
