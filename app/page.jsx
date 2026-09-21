import { ApplicationModal, ApplicationTrigger } from './ApplicationForm';
import SiteEffects from './SiteEffects';

const ArrowUpRight = () => <span aria-hidden="true">↗</span>;

const PlanetLogo = ({ footer = false }) => footer ? (
  <div className="brand brand--footer" aria-label="COSMO Agency">
    <span className="brand__text">COSMO<small>AGENCY</small></span>
  </div>
) : (
  <a className="brand brand--navbar" href="#home" aria-label="COSMO Agency — Главная">
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

const benefits = [
  ['rocket', 'Стабильный\nдоход', 'Прозрачная система выплат, никаких скрытых условий.'],
  ['star', 'Полное обучение', 'Мы научим всему с нуля — от технической настройки до уверенного онлайн-общения.'],
  ['heart', 'Поддержка 24/7', 'Ты никогда не остаёшься одна — наша команда всегда рядом.'],
  ['crown', 'Безопасность\nи конфиденциальность', 'Твои данные под защитой. Мы ценим твоё доверие.'],
  ['bars', 'Реальные\nперспективы', 'Развивайся, увеличивай доход и достигай своих целей вместе с нами.'],
];

const steps = [
  ['01', 'doc', 'Оставляешь\nзаявку', 'Заполняй короткую форму на сайте'],
  ['02', 'user', 'Проходишь\nобучение', 'Получаешь все необходимые знания и поддержку'],
  ['03', 'play', 'Выходишь\nв эфир', 'Начинаешь работать на топовых платформах'],
  ['04', 'bars', 'Зарабатываешь\nи развиваешься', 'Мы всегда рядом, чтобы помочь тебе расти'],
];

const faq = [
  ['С какого возраста можно оставить заявку?', 'Заявку можно оставить с 18 лет.'],
  ['Нужен ли опыт?', 'Нет. В COSMO предусмотрено обучение с нуля и поддержка на каждом этапе.'],
  ['Как проходит обучение?', 'Команда помогает с технической настройкой, базовыми процессами и подготовкой к работе на стриминговых платформах.'],
  ['Как обеспечивается конфиденциальность?', 'Мы внимательно относимся к персональным данным и используем их только для обработки заявки и дальнейшей коммуникации.'],
  ['Какие платформы используются?', 'Среди платформ — Stripchat, MyFreeCams, Chaturbate и другие.'],
  ['Как связаться с COSMO?', 'Оставь заявку через форму на сайте или напиши на hello@cosmo.agency.'],
];

export default function Home() {
  return <>
    <SiteEffects />
    <main className="site-frame">
      <section className="hero" id="home">
        <div className="hero__shade" />
        <header className="header shell">
          <PlanetLogo />
          <nav className="nav" aria-label="Основная навигация">
            <a className="active" href="#home">Главная</a><a href="#about">О нас</a><a href="#how">Как это работает</a><a href="#benefits">Преимущества</a><a href="#faq">FAQ</a><a href="#contacts">Контакты</a>
          </nav>
          <ApplicationTrigger className="outline-btn">Оставить заявку <ArrowUpRight /></ApplicationTrigger>
        </header>

        <div className="hero__content shell">
          <p className="eyebrow">БОЛЬШЕ ЧЕМ РАБОТА</p>
          <h1>ТВОЯ ВСЕЛЕННАЯ<br/><em>ВОЗМОЖНОСТЕЙ</em></h1>
          <p className="hero__copy">Cosmo Agency — это команда, которая помогает<br className="desktop"/> зарабатывать на стриминговых платформах,<br className="desktop"/> развиваться и чувствовать поддержку на каждом этапе.</p>
          <div className="hero__actions"><ApplicationTrigger className="pink-btn">Начать сейчас <ArrowUpRight /></ApplicationTrigger><a className="text-link" href="#how">Узнать больше <span>↓</span></a></div>
          <div className="platforms"><p>Мы работаем с ведущими платформами:</p><div className="platforms__row"><img src="/img/stripchat-logo (new).png" alt="Stripchat"/><img src="/img/myfreecams-logo (new).png" alt="MyFreeCams"/><img src="/img/chaturbate-logo (new).png" alt="Chaturbate"/><span>и другими</span></div></div>
        </div>

        <div className="side-rail" aria-hidden="true"><span>✦</span><p>DREAM　•　STREAM　•　EARN　•　GROW</p></div>
      </section>

      <section className="benefits" id="benefits"><div className="benefits__grid shell">
        {benefits.map(([icon,title,copy]) => <article className="benefit" key={title}><div className="icon-ring"><Icon type={icon}/></div><h3>{title.split('\n').map((x,i)=><span key={i}>{x}<br/></span>)}</h3><p>{copy}</p></article>)}
      </div></section>

      <section className="how" id="how">
        <div className="how__shade" />
        <div className="how__content shell">
          <div className="how__spacer" />
          <div className="how__panel">
            <p className="eyebrow">КАК ВСЁ РАБОТАЕТ?</p>
            <h2>ПРОСТЫЕ ШАГИ<br/>К БОЛЬШИМ ЦЕЛЯМ</h2>
            <div className="steps">{steps.map(([num,icon,title,copy]) => <article className="step" key={num}><div className="step__top"><strong>{num}</strong><Icon type={icon}/></div><h3>{title.split('\n').map((x,i)=><span key={i}>{x}<br/></span>)}</h3><p>{copy}</p></article>)}</div>
          </div>
        </div>
        <div className="footer-zone shell" id="contacts">
          <div className="footer-zone__left">СТРИМИ <b>•</b> РАЗВИВАЙСЯ <b>•</b> ЗАРАБАТЫВАЙ</div>
          <div className="footer-zone__center"><PlanetLogo footer/><p>ТВОЙ ПОТЕНЦИАЛ — НАША ВСЕЛЕННАЯ</p></div>
          <div className="footer-zone__right"><ApplicationTrigger className="pink-btn pink-btn--small">Стать частью Cosmo <ArrowUpRight /></ApplicationTrigger><button className="moon" aria-label="Theme" type="button">◐</button></div>
        </div>
      </section>

      <section className="seo-content" id="about">
        <div className="seo-content__inner shell">
          <div className="seo-content__about">
            <p className="eyebrow">О COSMO AGENCY</p>
            <h2>Команда и поддержка на каждом этапе</h2>
            <p>COSMO Agency помогает начать работу на стриминговых платформах: от обучения и технической настройки до ежедневной поддержки. Мы работаем с ведущими платформами и уделяем отдельное внимание конфиденциальности, прозрачным условиям и понятному процессу для каждой участницы команды.</p>
            <div className="seo-content__actions"><ApplicationTrigger className="pink-btn">Оставить заявку <ArrowUpRight /></ApplicationTrigger><a href="mailto:hello@cosmo.agency" className="text-link">hello@cosmo.agency</a></div>
          </div>

          <div className="faq" id="faq">
            <p className="eyebrow">FAQ</p>
            <h2>Частые вопросы</h2>
            <div className="faq__list">
              {faq.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}
            </div>
          </div>
        </div>
        <div className="legal-bar shell"><span>18+</span><a href="/privacy/">Политика конфиденциальности</a><a href="/terms/">Условия использования</a><a href="mailto:hello@cosmo.agency">Контакты</a></div>
      </section>
    </main>
    <ApplicationModal />
  </>;
}
