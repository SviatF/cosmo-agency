'use client';

import { useEffect, useState } from 'react';

const copy = {
  ru: { title: 'Личный кабинет', intro: 'Войди, чтобы проверить статус регистрации.', email: 'Email', password: 'Пароль', login: 'Войти', logout: 'Выйти', status: 'Статус аккаунта', review: 'На проверке', approved: 'Аккаунт подтверждён', rejected: 'Заявка отклонена', needs_changes: 'Нужны изменения', noApp: 'Заявка пока не найдена.', manager: 'Комментарий менеджера', back: 'Вернуться на сайт', error: 'Не удалось войти. Проверь email и пароль.' },
  ua: { title: 'Особистий кабінет', intro: 'Увійди, щоб перевірити статус реєстрації.', email: 'Email', password: 'Пароль', login: 'Увійти', logout: 'Вийти', status: 'Статус акаунта', review: 'На перевірці', approved: 'Акаунт підтверджено', rejected: 'Заявку відхилено', needs_changes: 'Потрібні зміни', noApp: 'Заявку поки не знайдено.', manager: 'Коментар менеджера', back: 'Повернутися на сайт', error: 'Не вдалося увійти. Перевір email і пароль.' },
  en: { title: 'Personal account', intro: 'Sign in to check your registration status.', email: 'Email', password: 'Password', login: 'Sign in', logout: 'Sign out', status: 'Account status', review: 'Under review', approved: 'Account approved', rejected: 'Application rejected', needs_changes: 'Changes required', noApp: 'No application found yet.', manager: 'Manager note', back: 'Back to website', error: 'Unable to sign in. Check your email and password.' },
};

const statusClass = (status) => `account-status account-status--${status || 'review'}`;

export default function AccountPortal({ locale = 'ru' }) {
  const t = copy[locale] || copy.ru;
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function refresh() {
    setLoading(true);
    const res = await fetch('/api/me', { credentials: 'include' });
    if (res.ok) setMe(await res.json()); else setMe(null);
    setLoading(false);
  }

  useEffect(() => { refresh(); }, []);

  async function login(event) {
    event.preventDefault(); setError('');
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    const res = await fetch('/api/login', { method: 'POST', headers: { 'content-type': 'application/json' }, credentials: 'include', body: JSON.stringify(data) });
    if (!res.ok) { setError(t.error); return; }
    await refresh();
  }

  async function logout() {
    await fetch('/api/logout', { method: 'POST', credentials: 'include' });
    setMe(null);
  }

  const app = me?.application;
  const labels = { review: t.review, submitted: t.review, draft: t.review, approved: t.approved, rejected: t.rejected, needs_changes: t.needs_changes };

  return <main className="account-page">
    <div className="account-stars" aria-hidden="true" />
    <div className="account-shell">
      <header className="account-header"><a href={`/${locale}/`}><img src="/img/main-logo (1).webp" alt="COSMO Agency" /></a><a href={`/${locale}/`} className="account-back">← {t.back}</a></header>
      <section className="account-card">
        <p className="eyebrow">COSMO ACCOUNT</p><h1>{t.title}</h1><p className="account-intro">{t.intro}</p>
        {loading ? <div className="account-loading">COSMO ···</div> : !me ? <form className="account-login" onSubmit={login}>
          <label><span>{t.email}</span><input name="email" type="email" required autoComplete="email" /></label>
          <label><span>{t.password}</span><input name="password" type="password" required autoComplete="current-password" /></label>
          {error && <p className="register-error">{error}</p>}
          <button className="pink-btn" type="submit">{t.login} ↗</button>
        </form> : <div className="account-dashboard">
          <div className="account-user"><span>{me.user?.email}</span><button onClick={logout} type="button">{t.logout}</button></div>
          {app ? <>
            <div className={statusClass(app.status)}><span className="account-status__dot" /><div><small>{t.status}</small><strong>{labels[app.status] || app.status}</strong></div></div>
            <div className="account-meta"><div><small>ID</small><b>{app.id}</b></div><div><small>{t.email}</small><b>{app.email}</b></div><div><small>{t.phone || 'Phone'}</small><b>{app.phone}</b></div><div><small>Telegram</small><b>{app.telegram || '—'}</b></div></div>
            {app.review_note && <div className="account-note"><small>{t.manager}</small><p>{app.review_note}</p></div>}
          </> : <p>{t.noApp}</p>}
        </div>}
      </section>
    </div>
  </main>;
}
