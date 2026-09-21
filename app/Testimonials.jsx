'use client';

import { useEffect, useMemo, useState } from 'react';
import './testimonials.css';

const SOURCE_REVIEWS = [
  { lang: 'ru', text: 'Для меня самое сложное было начать, но я быстро втянулась в процесс благодаря твоей поддержке, спасибо большое. Надеюсь, что наше сотрудничество будет очень долгим, потому что сама работа и деньги, которые я тут получаю — просто топ ❤️' },
  { lang: 'ru', text: 'Я пробовала раньше себя в этой сфере, но всё было таким непонятным 🙈 А тут… спасибо за такое подробное обучение, всё просто и понятно. И за аванс — я не ожидала, что столько можно заработать за 3 дня 🥰' },
  { lang: 'ru', text: 'Так, ну скажу честно: на старте очень боялась и переживала, что не получится, но быстро влилась благодаря твоей поддержке и помощи 💗 На деле работа в удовольствие: удобный график, ооочень хорошая зарплата и иногда в чатах бывает супер весёлая атмосфера. Мне нравится, что можно быть самой собой и при этом зарабатывать, просто общаясь. Кстати, недавно в отпуске мне сказали, что у меня хороший английский, хотя пришла сюда, не зная его совсем — за это отдельный плюсик 🫶' },
  { lang: 'ua', text: 'Ти бачила взагалі ту зп? Я на машину почала відкладати нарешті 😍 Раніше могла відкласти тільки нервовий зрив до обідньої перерви 🤣 Якщо комусь потрібні відгуки, то ось мій чесний відгук: іноді буває важко, тому що за день спілкуєшся з різною кількістю людей, але це такий кайф, коли знаходиш класного співрозмовника і ще при цьому отримуєш за це гроші. Ще дякую, що підтримуєш в дні, коли я не в ресурсі ❤️‍🔥 і за своєчасну зарплату. Сподіваюсь, далі буде тільки ліпше!' },
  { lang: 'ua', text: 'Просто хочу сказати ДЯКУЮЮЮЮЮ ❤️ Я ніде ще не стикалася з таким відношенням від адміна, ти пречудова 😍 Про роботу можу сказати тільки одне — це суцільний кайф: спілкуєшся, заробляєш, зп без затримок, що великий плюсик вам в карму 😂 Вже відклала гроші на новий ноут і камеру.' },
  { lang: 'ua', text: 'Мені все подобається, від самої роботи до графіку і зп 🤗 Спочатку поєднувала з іншою роботою, а потім віддала пріоритет цій, змогла нарешті записатися в зал 😅, знайшла подружок, почала пізнавати цей світ, а не тільки дім-робота-дім. Це дуже цікавий і насичений досвід, дуже дякую за те, що тоді вмовила спробувати — ти дійсно хрещена-фея 🥰' },
];

const labels = {
  ru: { eyebrow: 'ОТЗЫВЫ СОТРУДНИЦ', title: 'РЕАЛЬНЫЕ ИСТОРИИ COSMO', person: 'COSMO GIRL', meta: 'ОТЗЫВ СОТРУДНИЦЫ', cta: 'Пройти регистрацию' },
  ua: { eyebrow: 'ВІДГУКИ ДІВЧАТ', title: 'РЕАЛЬНІ ІСТОРІЇ COSMO', person: 'COSMO GIRL', meta: 'ВІДГУК ДІВЧИНИ', cta: 'Пройти реєстрацію' },
  en: { eyebrow: 'TEAM STORIES', title: 'REAL COSMO STORIES', person: 'COSMO GIRL', meta: 'TEAM MEMBER REVIEW', cta: 'Complete registration' },
};

function localizedText(review, locale) {
  if (locale === review.lang) return review.text;
  const index = SOURCE_REVIEWS.indexOf(review);
  if (locale === 'en') return [
    'The hardest part for me was starting, but I quickly got into the process thanks to your support. Thank you so much. I hope we work together for a very long time because I genuinely love the work and the money I earn here ❤️',
    'I had tried this field before, but everything felt so confusing 🙈 Here it was completely different — thank you for such detailed training. Everything is simple and clear. I also did not expect I could earn that much in just three days 🥰',
    'I was honestly very nervous at the beginning and worried that it would not work out, but I settled in quickly thanks to your support 💗 The schedule is convenient, the income is great, and the chats can be really fun. I also love that I can be myself while earning through communication. I even improved my English from almost zero 🫶',
    'Have you seen that salary? I finally started saving for a car 😍 Before that, the only thing I could save up was a nervous breakdown by lunch 🤣 Some days are challenging because you talk to many different people, but it feels amazing when you find a great conversation and get paid for it. Thank you for the support and always-on-time payments ❤️‍🔥',
    'I just want to say THANK YOU ❤️ I have never had this kind of attitude and support from an admin before. The work itself is such a vibe: you communicate, earn, and the payments are always on time 😂 I have already saved money for a new laptop and camera.',
    'I like everything — the work itself, the schedule and the pay 🤗 At first I combined it with another job, but later I chose this one as my priority. I finally joined a gym, met new friends and started discovering life beyond the home-work-home routine. It has been a really interesting experience, and I am so grateful you convinced me to try 🥰',
  ][index];
  if (locale === 'ua') return [
    'Для мене найскладніше було почати, але я швидко втягнулася в процес завдяки твоїй підтримці, дуже дякую. Сподіваюся, що наша співпраця буде дуже довгою, тому що сама робота і гроші, які я тут отримую — просто топ ❤️',
    'Я пробувала себе в цій сфері раніше, але все було таким незрозумілим 🙈 А тут… дякую за таке детальне навчання, усе просто й зрозуміло. І за аванс — я не очікувала, що стільки можна заробити за 3 дні 🥰',
    'Чесно кажучи, на старті дуже боялася і переживала, що не вийде, але швидко влилася завдяки твоїй підтримці й допомозі 💗 Насправді робота в задоволення: зручний графік, дуже хороша зарплата, а в чатах іноді буває супер весела атмосфера. Подобається, що можна бути собою і при цьому заробляти, просто спілкуючись. А ще я підтягнула англійську майже з нуля 🫶',
  ][index] || review.text;
  return [
    review.text, review.text, review.text,
    'Ты вообще видела эту зарплату? Я наконец начала откладывать на машину 😍 Раньше могла отложить только нервный срыв до обеденного перерыва 🤣 Иногда бывает тяжело, потому что за день общаешься с разным количеством людей, но это такой кайф, когда находишь классного собеседника и ещё получаешь за это деньги. Спасибо за поддержку в дни, когда я не в ресурсе ❤️‍🔥 и за своевременную зарплату. Надеюсь, дальше будет только лучше!',
    'Просто хочу сказать СПАСИБООООО ❤️ Я нигде ещё не сталкивалась с таким отношением от админа, ты чудесная 😍 Про работу могу сказать только одно — это сплошной кайф: общаешься, зарабатываешь, зарплата без задержек, за что вам большой плюсик в карму 😂 Уже отложила деньги на новый ноут и камеру.',
    'Мне нравится всё — от самой работы до графика и зарплаты 🤗 Сначала совмещала с другой работой, а потом отдала приоритет этой, наконец смогла записаться в зал 😅, нашла подружек и начала узнавать этот мир, а не только дом-работа-дом. Это очень интересный и насыщенный опыт. Спасибо, что тогда уговорила попробовать — ты действительно крёстная-фея 🥰',
  ][index];
}

export default function Testimonials({ locale = 'ru' }) {
  const [active, setActive] = useState(0);
  const l = labels[locale] || labels.ru;
  const reviews = useMemo(() => SOURCE_REVIEWS.map((review) => ({ ...review, display: localizedText(review, locale) })), [locale]);
  useEffect(() => { const id = window.setInterval(() => setActive((v) => (v + 1) % reviews.length), 8500); return () => window.clearInterval(id); }, [reviews.length]);
  const review = reviews[active];
  return <section className="testimonials" id="reviews"><div className="testimonials__inner shell">
    <div className="testimonials__heading"><div><p className="eyebrow">{l.eyebrow}</p><h2>{l.title}</h2></div><div className="testimonials__counter"><span>{String(active + 1).padStart(2, '0')}</span><i>/</i><b>{String(reviews.length).padStart(2, '0')}</b></div></div>
    <article className="testimonial-card" key={`${locale}-${active}`}><div className="testimonial-card__top"><span>{l.meta}</span><div>✦ ✦ ✦ ✦ ✦</div></div><div className="testimonial-card__quote-mark">“</div><blockquote>{review.display}</blockquote><div className="testimonial-card__footer"><div className="testimonial-card__person"><div className="testimonial-card__avatar">C</div><div><strong>{l.person}</strong><small>VERIFIED TEAM STORY</small></div></div><div className="testimonial-card__controls"><button type="button" aria-label="Previous review" onClick={() => setActive((active - 1 + reviews.length) % reviews.length)}>←</button><button type="button" aria-label="Next review" onClick={() => setActive((active + 1) % reviews.length)}>→</button></div></div></article>
    <div className="testimonials__dots">{reviews.map((_, index) => <button key={index} className={index === active ? 'active' : ''} aria-label={`Review ${index + 1}`} onClick={() => setActive(index)} />)}</div>
    <div className="testimonials__cta"><span>{locale === 'ua' ? 'Твоя історія може бути наступною' : locale === 'en' ? 'Your story can be next' : 'Твоя история может быть следующей'}</span><a href={`/${locale}/register/`}>{l.cta} ↗</a></div>
  </div></section>;
}
