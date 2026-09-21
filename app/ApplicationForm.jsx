'use client';

import { useEffect, useRef, useState } from 'react';
import { getCopy } from './copy';

const OPEN_EVENT = 'cosmo:open-application';

function track(event, data = {}) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...data });
}

export function ApplicationTrigger({ className = '', children }) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        track('form_start', { form_name: 'cosmo_application' });
        window.dispatchEvent(new CustomEvent(OPEN_EVENT));
      }}
    >
      {children}
    </button>
  );
}

export function ApplicationModal({ locale = 'ru' }) {
  const t = getCopy(locale).form;
  const registerLabel = locale === 'ua' ? 'Пройти повну реєстрацію' : locale === 'en' ? 'Complete registration' : 'Пройти полную регистрацию';
  const registerHint = locale === 'ua' ? 'Готова перейти до наступного етапу?' : locale === 'en' ? 'Ready for the next step?' : 'Готова перейти к следующему этапу?';
  const registerNote = locale === 'ua'
    ? 'Створи особистий кабінет, пройди верифікацію та надішли профіль менеджеру на підтвердження.'
    : locale === 'en'
      ? 'Create your account, complete verification and send your profile for manager approval.'
      : 'Создай личный кабинет, пройди верификацию и отправь профиль менеджеру на подтверждение.';
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState('idle');
  const firstInputRef = useRef(null);

  useEffect(() => {
    const openModal = () => {
      setStatus('idle');
      setOpen(true);
    };
    window.addEventListener(OPEN_EVENT, openModal);
    return () => window.removeEventListener(OPEN_EVENT, openModal);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event) => event.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    const timer = window.setTimeout(() => firstInputRef.current?.focus(), 180);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  async function submit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setStatus('sending');

    const payload = {
      name: String(data.name || '').trim(),
      phone: String(data.phone || '').trim(),
      telegram: String(data.telegram || '').trim(),
      locale,
      source: 'cosmo-agency',
      page: typeof window !== 'undefined' ? window.location.href : '',
      submitted_at: new Date().toISOString(),
    };

    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Lead endpoint returned an error');

      track('form_submit', { form_name: 'cosmo_application', locale });
      track('lead', { form_name: 'cosmo_application', locale });
      setStatus('success');
      form.reset();
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  }

  if (!open) return null;

  return (
    <div className="lead-modal" role="dialog" aria-modal="true" aria-labelledby="lead-modal-title" onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}>
      <div className="lead-modal__panel">
        <button className="lead-modal__close" type="button" aria-label={t.close} onClick={() => setOpen(false)}>×</button>
        <p className="eyebrow">COSMO AGENCY</p>
        <h2 id="lead-modal-title">{t.title}</h2>
        <p className="lead-modal__intro">{t.intro}</p>

        {status === 'success' ? (
          <div className="lead-modal__success">
            <strong>{t.thanks}</strong>
            <p>{t.success}</p>
            <div className="lead-modal__registration-card">
              <span>02 / REGISTRATION</span>
              <b>{registerLabel}</b>
              <p>{registerNote}</p>
              <a className="pink-btn lead-modal__register" href={`/${locale}/register/`}>{registerLabel} ↗</a>
            </div>
            <button className="lead-modal__ghost" type="button" onClick={() => setOpen(false)}>{t.close}</button>
          </div>
        ) : (
          <form className="lead-form" onSubmit={submit}>
            <label>
              <span>{t.name} <b>*</b></span>
              <input ref={firstInputRef} name="name" autoComplete="name" required maxLength="80" placeholder={t.namePh} />
            </label>
            <label>
              <span>{t.phone} <b>*</b></span>
              <input name="phone" type="tel" inputMode="tel" autoComplete="tel" required minLength="7" maxLength="30" placeholder="+380 ..." />
            </label>
            <label>
              <span>{t.telegram}</span>
              <input name="telegram" autoComplete="off" maxLength="80" placeholder="@username" />
            </label>
            <button className="pink-btn lead-form__submit" type="submit" disabled={status === 'sending'}>{status === 'sending' ? t.sending : t.submit}</button>
            <p className="lead-form__required">{t.required}</p>
            {status === 'error' && <p className="lead-form__error">{t.error}</p>}
            <a className="lead-form__register-card" href={`/${locale}/register/`}>
              <span>02 / REGISTRATION</span>
              <strong>{registerHint}</strong>
              <b>{registerLabel} ↗</b>
              <small>{registerNote}</small>
            </a>
          </form>
        )}
      </div>
    </div>
  );
}
