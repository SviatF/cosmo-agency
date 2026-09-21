import { ApplicationModal, ApplicationTrigger } from './ApplicationForm';
import SiteEffects from './SiteEffects';
import LanguageSwitcher from './LanguageSwitcher';
import CosmicStars from './CosmicStars';
import { getCopy } from './copy';

const ArrowUpRight = () => <span aria-hidden="true">↗</span>;

const PlanetLogo = ({ footer = false, homeHref = '#home' }) => footer ? (
  <div className="brand brand--footer" aria-label="COSMO Agency">
    <span className="brand__text">COSMO<small>AGENCY</small></span>
  </div>
) : (
  <a className="brand brand--navbar" href={homeHref} aria-label="COSMO Agency">
    <img className="brand__main-logo" src="/img/main-logo (1).webp" alt="COSMO Agency" />
  </a>
);

const Icon = ({ type }) => {
  const common = { width: 26, height: 26, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.45, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };
  const paths = {
    rocket: <><path d="M14 5c3.7-3.7 6-3 6-3s.7 2.3-3 6l-4 4-4-4 5-3Z"/><path d="m9 8-4 1-3 3 5 1M13 12l-1 5-3 3-1-5M15 6l3 3M6 16l-2 2M5 13l-3 3"/></>,
    star: <path d="m12 3 1.25 5.75L19 10l-5.75 1.25L12 17l-1.25-5.75L5 10l5.75-1.25L12 3Z"/>,
    heart: <path d="M20.8 4.8a5.5 5.5 0 0 0-7.8 0L12 5.8l-1-1a5.5 5.5 0 1 0-7.8 7.8L12 21l8.8-8.4a5.5 5.5 0 0 0 0-7.8Z"/>,
    crown: <><path d="m3 7 4 4 5-7 5 7 4-4-2 11H5L3 7Z"/><path d="M5 18h14"/></>,
    bars: <><path d="M5 20v-5M10 20V9M15 20V5M20 20V2"/><path d="M3 20h19"/></>,
    doc: <><path d="M6 2h8l4 4v16H6z"/><path d="M14 2v5h5M9 12h6M9 16h6"/></>,
    user: <><circle cx="10" cy="7" r="3"/><path d="M4 20v-2c0-3 2.5-5 6-5s6 2 6 5v2M19 8v6M16 11h6"/></>,
    play: <><circle cx="12" cy="12" r="9"/><path d="m10 8 6 4-6 4z"/></>,
  };
  return <svg {...common}>{paths[type]}</svg>;
};

function multiline(text) {
  return text.split('\n').map((x, i) => <span key={i}>{x}<br/></span>);
}

export default function CosmoPage({ locale = 'ru' }) {
  const t = getCopy(locale);
  const base = `/${locale}/`;

  return <>
    <SiteEffects />
    <CosmicStars />
    <main className="site-frame" data-locale={locale}>
      <section className="hero" id="home">
        <div className="hero__shade" />
        <header className="header shell">
          <PlanetLogo homeHref={`${base}#home`} />
          <nav className="nav" aria-label="Main navigation">
            <a className="active" href="#home">{t.nav[0]}</a><a href="#about">{t.nav[1]}</a><a href="#how">{t.nav[2]}</a><a href="#benefits">{t.nav[3]}</a><a href="#faq">{t.nav[4]}</a><a href="#contacts">{t.nav[5]}</a>
          </nav>
          <div className="header__actions">
            <LanguageSwitcher locale={locale} />
            <ApplicationTrigger className="outline-btn">{t.apply} <ArrowUpRight /></ApplicationTrigger>
          </div>
        </header>

        <div className="hero__content shell">
          <p className="eyebrow">{t.eyebrow}</p>
          <h1>{t.hero1}<br/><em>{t.hero2}</em></h1>
          <p className="hero__copy">{t.heroCopy}</p>
          <div className="hero__actions"><ApplicationTrigger className="pink-btn">{t.start} <ArrowUpRight /></ApplicationTrigger><a className="text-link" href="#how">{t.learn} <span>↓</span></a></div>
          <div className="platforms"><p>{t.platforms}</p><div className="platforms__row"><img src="/img/stripchat-logo (new).png" alt="Stripchat"/><img src="/img/myfreecams-logo (new).png" alt="MyFreeCams"/><img src="/img/chaturbate-logo (new).png" alt="Chaturbate"/><span>{t.others}</span></div></div>
        </div>

        <div className="side-rail" aria-hidden="true"><span>✦</span><p>DREAM　•　STREAM　•　EARN　•　GROW</p></div>
      </section>

      <section className="benefits" id="benefits"><div className="benefits__grid shell">
        {t.benefits.map(([icon,title,copy]) => <article className="benefit" key={title}><div className="icon-ring"><Icon type={icon}/></div><h3>{multiline(title)}</h3><p>{copy}</p></article>)}
      </div></section>

      <section className="how" id="how">
        <div className="how__shade" />
        <div className="how__content shell">
          <div className="how__spacer" />
          <div className="how__panel">
            <p className="eyebrow">{t.howEyebrow}</p>
            <h2>{t.howTitle1}<br/>{t.howTitle2}</h2>
            <div className="steps">{t.steps.map(([num,icon,title,copy]) => <article className="step" key={num}><div className="step__top"><strong>{num}</strong><Icon type={icon}/></div><h3>{multiline(title)}</h3><p>{copy}</p></article>)}</div>
          </div>
        </div>
        <div className="footer-zone shell" id="contacts">
          <div className="footer-zone__left">{t.footerWords[0]} <b>•</b> {t.footerWords[1]} <b>•</b> {t.footerWords[2]}</div>
          <div className="footer-zone__center"><PlanetLogo footer/><p>{t.footerTag}</p></div>
          <div className="footer-zone__right"><ApplicationTrigger className="pink-btn pink-btn--small">{t.join} <ArrowUpRight /></ApplicationTrigger><button className="moon" aria-label="Theme" type="button">◐</button></div>
        </div>
      </section>

      <section className="seo-content" id="about">
        <CosmicStars zone="faq" />
        <div className="seo-content__inner shell">
          <div className="seo-content__about">
            <p className="eyebrow">{t.aboutEyebrow}</p>
            <h2>{t.aboutTitle}</h2>
            <p>{t.aboutCopy}</p>
            <div className="seo-content__actions"><ApplicationTrigger className="pink-btn">{t.apply} <ArrowUpRight /></ApplicationTrigger><a href="mailto:hello@cosmo.agency" className="text-link">hello@cosmo.agency</a></div>
          </div>

          <div className="faq" id="faq">
            <p className="eyebrow">FAQ</p>
            <h2>{t.faqTitle}</h2>
            <div className="faq__list">
              {t.faq.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}
            </div>
          </div>
        </div>
        <div className="legal-bar shell"><span>18+</span><a href="/privacy/">{t.privacy}</a><a href="/terms/">{t.terms}</a><a href="mailto:hello@cosmo.agency">{t.contacts}</a></div>
      </section>
    </main>
    <ApplicationTrigger className="mobile-cta">{t.apply} ↗</ApplicationTrigger>
    <ApplicationModal locale={locale} />
  </>;
}
