'use client';

import { useEffect, useState } from 'react';

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

export function ApplicationModal() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState('idle');

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
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  async function submit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    const endpoint = process.env.NEXT_PUBLIC_LEAD_ENDPOINT;
    setStatus('sending');

    try {
      if (endpoint) {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...data, source: 'cosmo-agency' }),
        });
        if (!response.ok) throw new Error('Lead endpoint returned an error');
      } else {
        const subject = encodeURIComponent('Новая заявка — COSMO Agency');
        const body = encodeURIComponent(
          `Имя: ${data.name}\nВозраст: ${data.age}\nКонтакт: ${data.contact}\nГород / страна: ${data.location || '-'}\nОпыт: ${data.experience || '-'}\n`
        );
        window.location.href = `mailto:hello@cosmo.agency?subject=${subject}&body=${body}`;
      }

      track('form_submit', { form_name: 'cosmo_application' });
      track('lead', { form_name: 'cosmo_application' });
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
        <button className="lead-modal__close" type="button" aria-label="Закрыть" onClick={() => setOpen(false)}>×</button>
        <p className="eyebrow">COSMO AGENCY</p>
        <h2 id="lead-modal-title">Оставить заявку</h2>
        <p className="lead-modal__intro">Заполни короткую форму — команда COSMO свяжется с тобой и расскажет о следующих шагах.</p>

        {status === 'success' ? (
          <div className="lead-modal__success">
            <strong>Спасибо!</strong>
            <p>Заявка подготовлена. Мы свяжемся с тобой по указанному контакту.</p>
            <button className="pink-btn" type="button" onClick={() => setOpen(false)}>Закрыть</button>
          </div>
        ) : (
          <form className="lead-form" onSubmit={submit}>
            <label>Имя<input name="name" autoComplete="name" required maxLength="80" /></label>
            <label>Возраст<input name="age" type="number" inputMode="numeric" min="18" max="99" required /></label>
            <label>Telegram или телефон<input name="contact" autoComplete="tel" required maxLength="120" /></label>
            <label>Город / страна<input name="location" autoComplete="address-level2" maxLength="120" /></label>
            <label>Опыт<textarea name="experience" rows="3" maxLength="600" placeholder="Если опыта нет — можно оставить поле пустым" /></label>
            <label className="lead-form__consent"><input type="checkbox" required /> <span>Я подтверждаю, что мне исполнилось 18 лет, и соглашаюсь с <a href="/privacy/" target="_blank">политикой конфиденциальности</a>.</span></label>
            <button className="pink-btn lead-form__submit" type="submit" disabled={status === 'sending'}>{status === 'sending' ? 'Отправляем…' : 'Отправить заявку ↗'}</button>
            {status === 'error' && <p className="lead-form__error">Не удалось отправить заявку. Попробуй ещё раз или напиши на hello@cosmo.agency.</p>}
          </form>
        )}
      </div>
    </div>
  );
}
