'use client';

import { useEffect } from 'react';

export default function SiteEffects() {
  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const revealTargets = document.querySelectorAll(
      '.hero__content > *, .benefit, .how__panel > .eyebrow, .how__panel > h2, .step, .footer-zone > *, .seo-content__about > *, .faq > *, .faq details'
    );

    revealTargets.forEach((el, index) => {
      el.classList.add('reveal-ready');
      el.style.setProperty('--reveal-delay', `${Math.min((index % 6) * 70, 350)}ms`);
    });

    if (reduceMotion) {
      revealTargets.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -7% 0px' }
    );

    revealTargets.forEach((el) => observer.observe(el));

    const hero = document.querySelector('.hero');
    const siteFrame = document.querySelector('.site-frame');

    const onPointerMove = (event) => {
      if (!hero || window.innerWidth < 821) return;
      const rect = hero.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      hero.style.setProperty('--mx', x.toFixed(3));
      hero.style.setProperty('--my', y.toFixed(3));
      siteFrame?.style.setProperty('--frame-x', `${x * 10}px`);
    };

    const onPointerLeave = () => {
      hero?.style.setProperty('--mx', '0');
      hero?.style.setProperty('--my', '0');
      siteFrame?.style.setProperty('--frame-x', '0px');
    };

    hero?.addEventListener('pointermove', onPointerMove);
    hero?.addEventListener('pointerleave', onPointerLeave);

    const buttons = document.querySelectorAll('.pink-btn, .outline-btn');
    const onButtonMove = (event) => {
      if (window.innerWidth < 821) return;
      const el = event.currentTarget;
      const rect = el.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      el.style.setProperty('--button-x', `${x * 0.07}px`);
      el.style.setProperty('--button-y', `${y * 0.08}px`);
    };
    const onButtonLeave = (event) => {
      event.currentTarget.style.setProperty('--button-x', '0px');
      event.currentTarget.style.setProperty('--button-y', '0px');
    };

    buttons.forEach((button) => {
      button.addEventListener('pointermove', onButtonMove);
      button.addEventListener('pointerleave', onButtonLeave);
    });

    return () => {
      observer.disconnect();
      hero?.removeEventListener('pointermove', onPointerMove);
      hero?.removeEventListener('pointerleave', onPointerLeave);
      buttons.forEach((button) => {
        button.removeEventListener('pointermove', onButtonMove);
        button.removeEventListener('pointerleave', onButtonLeave);
      });
    };
  }, []);

  return null;
}
