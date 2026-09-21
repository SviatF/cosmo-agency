'use client';

import { useEffect } from 'react';

export default function SiteEffects() {
  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const revealTargets = document.querySelectorAll(
      '.hero__content > *, .platforms__row > *, .benefit, .how__panel > .eyebrow, .how__panel > h2, .step, .footer-zone > *, .seo-content__about > *, .faq > *, .faq details'
    );

    revealTargets.forEach((el, index) => {
      el.classList.add('reveal-ready');
      el.style.setProperty('--reveal-delay', `${Math.min((index % 6) * 70, 350)}ms`);
    });

    let observer;
    if (reduceMotion) {
      revealTargets.forEach((el) => el.classList.add('is-visible'));
    } else {
      observer = new IntersectionObserver(
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
    }

    const hero = document.querySelector('.hero');
    const how = document.querySelector('.how');
    const seo = document.querySelector('.seo-content');

    const onPointerMove = (event) => {
      if (!hero || window.innerWidth < 821) return;
      const rect = hero.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      hero.style.setProperty('--hero-glow-x', `${x * -12}px`);
      hero.style.setProperty('--hero-glow-y', `${y * -9}px`);
    };

    const onPointerLeave = () => {
      hero?.style.setProperty('--hero-glow-x', '0px');
      hero?.style.setProperty('--hero-glow-y', '0px');
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

    const navLinks = Array.from(document.querySelectorAll('.nav a[href^="#"]'));
    const sections = navLinks
      .map((link) => document.querySelector(link.getAttribute('href')))
      .filter(Boolean);

    const updateScrollEffects = () => {
      const y = window.scrollY + Math.min(window.innerHeight * 0.32, 260);
      let currentId = 'home';
      sections.forEach((section) => {
        if (section.offsetTop <= y) currentId = section.id;
      });
      navLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${currentId}`));

      if (!reduceMotion && window.innerWidth > 820) {
        if (how) {
          const rect = how.getBoundingClientRect();
          const progress = Math.max(-1, Math.min(1, (window.innerHeight * 0.5 - rect.top) / window.innerHeight));
          how.style.setProperty('--how-drift-y', `${progress * 8}px`);
        }
        if (seo) {
          const rect = seo.getBoundingClientRect();
          const progress = Math.max(-1, Math.min(1, (window.innerHeight * 0.55 - rect.top) / window.innerHeight));
          seo.style.setProperty('--seo-drift-y', `${progress * 10}px`);
        }
      }
    };

    updateScrollEffects();
    window.addEventListener('scroll', updateScrollEffects, { passive: true });
    window.addEventListener('resize', updateScrollEffects, { passive: true });

    const moon = document.querySelector('.moon');
    const toggleCosmicMode = () => {
      const enabled = document.body.classList.toggle('cosmo-boost');
      moon?.setAttribute('aria-pressed', String(enabled));
      moon?.setAttribute('title', enabled ? 'Уменьшить свечение' : 'Усилить свечение');
    };
    if (moon) {
      moon.setAttribute('aria-pressed', 'false');
      moon.setAttribute('title', 'Усилить свечение');
      moon.addEventListener('click', toggleCosmicMode);
    }

    const heroPrimary = document.querySelector('.hero__actions .pink-btn');
    let attentionTimer;
    let attentionCleanupTimer;
    if (!reduceMotion && heroPrimary) {
      attentionTimer = window.setTimeout(() => {
        heroPrimary.classList.add('attention-pulse');
        attentionCleanupTimer = window.setTimeout(() => heroPrimary.classList.remove('attention-pulse'), 2200);
      }, 8000);
    }

    return () => {
      observer?.disconnect();
      hero?.removeEventListener('pointermove', onPointerMove);
      hero?.removeEventListener('pointerleave', onPointerLeave);
      buttons.forEach((button) => {
        button.removeEventListener('pointermove', onButtonMove);
        button.removeEventListener('pointerleave', onButtonLeave);
      });
      window.removeEventListener('scroll', updateScrollEffects);
      window.removeEventListener('resize', updateScrollEffects);
      moon?.removeEventListener('click', toggleCosmicMode);
      if (attentionTimer) window.clearTimeout(attentionTimer);
      if (attentionCleanupTimer) window.clearTimeout(attentionCleanupTimer);
    };
  }, []);

  return null;
}
