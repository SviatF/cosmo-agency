'use client';

import { useEffect } from 'react';

const options = [
  { code: 'ua', label: 'UA', href: '/ua/' },
  { code: 'ru', label: 'RU', href: '/ru/' },
  { code: 'en', label: 'EN', href: '/en/' },
];

export default function LanguageSwitcher({ locale = 'ru' }) {
  useEffect(() => {
    try { localStorage.setItem('cosmo-locale', locale); } catch {}
  }, [locale]);

  return (
    <div className="language-switcher" aria-label="Language selector">
      {options.map((option) => (
        <a
          key={option.code}
          href={option.href}
          className={option.code === locale ? 'active' : ''}
          hrefLang={option.code === 'ua' ? 'uk' : option.code}
          aria-current={option.code === locale ? 'page' : undefined}
        >
          {option.label}
        </a>
      ))}
    </div>
  );
}
