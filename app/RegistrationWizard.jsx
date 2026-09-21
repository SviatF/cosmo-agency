'use client';

import { useMemo, useState } from 'react';

const copy = {
  ru: {
    back: 'Назад на сайт', title: 'Регистрация в COSMO', intro: 'Создай рабочий профиль и пройди обязательную верификацию личности и возраста.',
    steps: ['Данные', 'О себе', 'Аккаунт', 'Верификация', 'Готово'], next: 'Продолжить', prev: 'Назад', submit: 'Отправить на проверку', sending: 'Отправляем…',
    name: 'Имя и фамилия', dob: 'Дата рождения', phone: 'Номер телефона', telegram: 'Telegram', country: 'Страна', city: 'Город', experience: 'Опыт', schedule: 'Желаемый график', languages: 'Языки', email: 'Email', password: 'Пароль', docType: 'Документ', front: 'Фото документа — лицевая сторона', backDoc: 'Фото документа — обратная сторона', consent: 'Я подтверждаю, что мне исполнилось 18 лет, данные указаны верно и я согласна на обработку данных для регистрации и проверки.',
    expPh: 'Коротко расскажи, был ли опыт на стриминговых платформах', schedulePh: 'Например: 5 дней в неделю, вечер', langPh: 'Например: русский, украинский, английский', passHint: 'Минимум 8 символов. Этот пароль будет использоваться для входа в личный кабинет.', docHint: 'Документы хранятся приватно. В Telegram отправляются только данные заявки и ссылка для менеджера — сами файлы документов туда не отправляются.',
    reviewTitle: 'Аккаунт отправлен на проверку', reviewCopy: 'Менеджер COSMO проверит данные и подтвердит аккаунт. Статус можно отслеживать в личном кабинете.', account: 'Открыть личный кабинет', error: 'Не удалось завершить регистрацию. Проверь данные и попробуй ещё раз.'
  },
  ua: {
    back: 'Назад на сайт', title: 'Реєстрація в COSMO', intro: 'Створи робочий профіль і пройди обов’язкову верифікацію особи та віку.',
    steps: ['Дані', 'Про себе', 'Акаунт', 'Верифікація', 'Готово'], next: 'Продовжити', prev: 'Назад', submit: 'Надіслати на перевірку', sending: 'Надсилаємо…',
    name: 'Ім’я та прізвище', dob: 'Дата народження', phone: 'Номер телефону', telegram: 'Telegram', country: 'Країна', city: 'Місто', experience: 'Досвід', schedule: 'Бажаний графік', languages: 'Мови', email: 'Email', password: 'Пароль', docType: 'Документ', front: 'Фото документа — лицьова сторона', backDoc: 'Фото документа — зворотна сторона', consent: 'Я підтверджую, що мені виповнилося 18 років, дані вказані правильно та я погоджуюся на обробку даних для реєстрації й перевірки.',
    expPh: 'Коротко розкажи, чи був досвід на стримінгових платформах', schedulePh: 'Наприклад: 5 днів на тиждень, вечір', langPh: 'Наприклад: українська, російська, англійська', passHint: 'Мінімум 8 символів. Цей пароль використовуватиметься для входу в особистий кабінет.', docHint: 'Документи зберігаються приватно. У Telegram надсилаються лише дані заявки та посилання для менеджера — самі файли документів туди не надсилаються.',
    reviewTitle: 'Акаунт надіслано на перевірку', reviewCopy: 'Менеджер COSMO перевірить дані та підтвердить акаунт. Статус можна відстежувати в особистому кабінеті.', account: 'Відкрити особистий кабінет', error: 'Не вдалося завершити реєстрацію. Перевір дані та спробуй ще раз.'
  },
  en: {
    back: 'Back to site', title: 'Register with COSMO', intro: 'Create your work profile and complete the required identity and age verification.',
    steps: ['Details', 'About you', 'Account', 'Verification', 'Done'], next: 'Continue', prev: 'Back', submit: 'Submit for review', sending: 'Submitting…',
    name: 'Full name', dob: 'Date of birth', phone: 'Phone number', telegram: 'Telegram', country: 'Country', city: 'City', experience: 'Experience', schedule: 'Preferred schedule', languages: 'Languages', email: 'Email', password: 'Password', docType: 'Document', front: 'Document photo — front side', backDoc: 'Document photo — back side', consent: 'I confirm that I am 18 or older, the information is correct, and I consent to the processing of my data for registration and verification.',
    expPh: 'Briefly describe any previous streaming-platform experience', schedulePh: 'For example: 5 days a week, evenings', langPh: 'For example: English, Ukrainian, Russian', passHint: 'Minimum 8 characters. You will use this password to sign in to your account.', docHint: 'Documents are stored privately. Telegram receives only application details and a manager link — the document files themselves are never sent there.',
    reviewTitle: 'Your account is under review', reviewCopy: 'A COSMO manager will review your information and approve the account. You can track the status in your personal account.', account: 'Open my account', error: 'Registration could not be completed. Check your details and try again.'
  },
};

const Input = ({ label, ...props }) => <label className="reg-field"><span>{label}</span><input {...props} /></label>;

export default function RegistrationWizard({ locale = 'ru' }) {
  const t = copy[locale] || copy.ru;
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [form, setForm] = useState({ full_name: '', date_of_birth: '', phone: '', telegram: '', country: '', city: '', experience: '', schedule: '', languages: '', email: '', password: '', document_type: 'passport', consent: false });
  const [files, setFiles] = useState({ document_front: null, document_back: null });

  const progress = useMemo(() => ((step + 1) / t.steps.length) * 100, [step, t.steps.length]);
  const setValue = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  function validCurrent() {
    if (step === 0) return form.full_name && form.date_of_birth && form.phone;
    if (step === 2) return form.email && form.password.length >= 8;
    if (step === 3) return files.document_front && files.document_back && form.consent;
    return true;
  }

  async function submit() {
    if (!validCurrent()) return;
    setStatus('sending'); setError('');
    const fd = new FormData();
    Object.entries(form).forEach(([key, value]) => fd.append(key, String(value)));
    fd.append('locale', locale);
    fd.append('document_front', files.document_front);
    fd.append('document_back', files.document_back);
    try {
      const res = await fetch('/api/register', { method: 'POST', body: fd });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || 'registration_failed');
      setStatus('success');
      setStep(4);
    } catch (e) {
      console.error(e);
      setStatus('error');
      setError(t.error);
    }
  }

  return <main className="register-page">
    <div className="register-stars" aria-hidden="true" />
    <section className="register-shell">
      <aside className="register-aside">
        <a href={`/${locale}/`} className="register-logo"><img src="/img/main-logo (1).webp" alt="COSMO Agency" /></a>
        <div>
          <p className="eyebrow">COSMO ONBOARDING</p>
          <h1>{t.title}</h1>
          <p>{t.intro}</p>
        </div>
        <div className="register-security"><span>18+</span><p>PRIVATE KYC<br/>SECURE REVIEW</p></div>
      </aside>

      <section className="register-card">
        <div className="register-progress"><span style={{ width: `${progress}%` }} /></div>
        <div className="register-stepper">{t.steps.map((label, i) => <div className={i <= step ? 'active' : ''} key={label}><b>{String(i + 1).padStart(2, '0')}</b><span>{label}</span></div>)}</div>

        <div className="register-stage">
          {step === 0 && <>
            <p className="register-kicker">01 / PERSONAL DETAILS</p>
            <h2>{t.steps[0]}</h2>
            <div className="reg-grid"><Input label={t.name} value={form.full_name} onChange={setValue('full_name')} required /><Input label={t.dob} type="date" value={form.date_of_birth} onChange={setValue('date_of_birth')} required /><Input label={t.phone} type="tel" value={form.phone} onChange={setValue('phone')} placeholder="+380 ..." required /><Input label={t.telegram} value={form.telegram} onChange={setValue('telegram')} placeholder="@username" /></div>
          </>}

          {step === 1 && <>
            <p className="register-kicker">02 / PROFILE</p><h2>{t.steps[1]}</h2>
            <div className="reg-grid"><Input label={t.country} value={form.country} onChange={setValue('country')} /><Input label={t.city} value={form.city} onChange={setValue('city')} /></div>
            <label className="reg-field"><span>{t.experience}</span><textarea value={form.experience} onChange={setValue('experience')} placeholder={t.expPh} /></label>
            <div className="reg-grid"><Input label={t.schedule} value={form.schedule} onChange={setValue('schedule')} placeholder={t.schedulePh} /><Input label={t.languages} value={form.languages} onChange={setValue('languages')} placeholder={t.langPh} /></div>
          </>}

          {step === 2 && <>
            <p className="register-kicker">03 / ACCOUNT</p><h2>{t.steps[2]}</h2>
            <div className="reg-grid reg-grid--single"><Input label={t.email} type="email" value={form.email} onChange={setValue('email')} autoComplete="email" required /><Input label={t.password} type="password" value={form.password} onChange={setValue('password')} minLength="8" autoComplete="new-password" required /></div>
            <p className="reg-note">{t.passHint}</p>
          </>}

          {step === 3 && <>
            <p className="register-kicker">04 / IDENTITY VERIFICATION</p><h2>{t.steps[3]}</h2>
            <label className="reg-field"><span>{t.docType}</span><select value={form.document_type} onChange={setValue('document_type')}><option value="passport">Passport / ID</option><option value="id_card">ID Card</option></select></label>
            <div className="document-grid">
              <label className={`document-drop ${files.document_front ? 'has-file' : ''}`}><input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={(e) => setFiles((p) => ({ ...p, document_front: e.target.files?.[0] || null }))} /><span>01</span><strong>{t.front}</strong><small>{files.document_front?.name || 'JPG / PNG / WEBP / PDF · max 8 MB'}</small></label>
              <label className={`document-drop ${files.document_back ? 'has-file' : ''}`}><input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={(e) => setFiles((p) => ({ ...p, document_back: e.target.files?.[0] || null }))} /><span>02</span><strong>{t.backDoc}</strong><small>{files.document_back?.name || 'JPG / PNG / WEBP / PDF · max 8 MB'}</small></label>
            </div>
            <p className="reg-privacy">✦ {t.docHint}</p>
            <label className="reg-consent"><input type="checkbox" checked={form.consent} onChange={setValue('consent')} /><span>{t.consent}</span></label>
          </>}

          {step === 4 && <div className="register-success"><div className="register-orbit">✓</div><p className="register-kicker">05 / REVIEW</p><h2>{t.reviewTitle}</h2><p>{t.reviewCopy}</p><a className="pink-btn" href={`/${locale}/account/`}>{t.account} ↗</a></div>}

          {error && <p className="register-error">{error}</p>}
        </div>

        {step < 4 && <div className="register-nav">
          <button type="button" className="register-back" onClick={() => step === 0 ? (window.location.href = `/${locale}/`) : setStep((s) => s - 1)}>{step === 0 ? t.back : t.prev}</button>
          {step < 3 ? <button type="button" className="pink-btn" disabled={!validCurrent()} onClick={() => setStep((s) => s + 1)}>{t.next} ↗</button> : <button type="button" className="pink-btn" disabled={!validCurrent() || status === 'sending'} onClick={submit}>{status === 'sending' ? t.sending : t.submit} ↗</button>}
        </div>}
      </section>
    </section>
  </main>;
}
