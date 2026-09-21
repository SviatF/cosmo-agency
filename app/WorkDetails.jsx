const content = {
  ru: {
    eyebrow: 'УСЛОВИЯ РАБОТЫ',
    title: 'КАК УСТРОЕНА РАБОТА В COSMO',
    intro: 'Всё важное до регистрации: график, выплаты, формат работы, обучение и правила общения.',
    cta: 'Пройти регистрацию',
    cards: [
      {n:'01',title:'График',lines:['Основной: 5/2 по 6 часов в день.','Альтернативный: 6/1 по 4 часа.','Также доступны 2/2 или 3/3 по 8 часов.','Выходные и время работы выбираешь сама. Часы внутри смены не разбиваются, предусмотрен перерыв.']},
      {n:'02',title:'Выплаты',lines:['Два раза в месяц — 10-го и 25-го числа.','После 3-дневного обучения — аванс 50% от заработанного за эти 3 дня.','Выплата на карту любого банка или другим согласованным способом.']},
      {n:'03',title:'Доход',lines:['Новые сотрудники в первый месяц — от 35 000 грн.','Опытные сотрудники — от 110 000 грн.','Итог зависит от количества платных минут, активности пользователей, донатов и виртуальных подарков.']},
      {n:'04',title:'Суть работы',lines:['Лайв-чат с камерой и перепиской в реальном времени.','Ты знакомишься, поддерживаешь беседу и сама направляешь разговор.','Главная задача — сделать общение интересным, комфортным и продолжительным.']},
      {n:'05',title:'Английский',lines:['Знание английского не обязательно.','На обучении подключаем переводчик и показываем, как удобно вести диалоги без языкового барьера.']},
      {n:'06',title:'Границы общения',lines:['Темы могут быть разными: повседневное общение, интересы, путешествия, лёгкий флирт.','Ты сама определяешь комфортные границы и направление разговора.','Политика и религия запрещены; дополнительные ограничения зависят от конкретной платформы.']},
    ]
  },
  ua: {
    eyebrow: 'УМОВИ РОБОТИ',
    title: 'ЯК ВЛАШТОВАНА РОБОТА В COSMO',
    intro: 'Усе важливе до реєстрації: графік, виплати, формат роботи, навчання та правила спілкування.',
    cta: 'Пройти реєстрацію',
    cards: [
      {n:'01',title:'Графік',lines:['Основний: 5/2 по 6 годин на день.','Альтернативний: 6/1 по 4 години.','Також доступні 2/2 або 3/3 по 8 годин.','Вихідні та час роботи обираєш сама. Години всередині зміни не розбиваються, передбачена перерва.']},
      {n:'02',title:'Виплати',lines:['Двічі на місяць — 10-го та 25-го числа.','Після 3-денного навчання — аванс 50% від заробленого за ці 3 дні.','Виплата на картку будь-якого банку або іншим погодженим способом.']},
      {n:'03',title:'Дохід',lines:['Нові співробітники в перший місяць — від 35 000 грн.','Досвідчені співробітники — від 110 000 грн.','Підсумок залежить від кількості платних хвилин, активності користувачів, донатів і віртуальних подарунків.']},
      {n:'04',title:'Суть роботи',lines:['Лайв-чат з камерою та листуванням у реальному часі.','Ти знайомишся, підтримуєш бесіду й сама спрямовуєш розмову.','Головне завдання — зробити спілкування цікавим, комфортним і тривалим.']},
      {n:'05',title:'Англійська',lines:['Знання англійської не є обов’язковим.','На навчанні підключаємо перекладач і показуємо, як зручно вести діалоги без мовного бар’єра.']},
      {n:'06',title:'Межі спілкування',lines:['Теми можуть бути різними: повсякденне спілкування, інтереси, подорожі, легкий флірт.','Ти сама визначаєш комфортні межі та напрямок розмови.','Політика й релігія заборонені; додаткові обмеження залежать від конкретної платформи.']},
    ]
  },
  en: {
    eyebrow: 'WORK CONDITIONS',
    title: 'HOW WORK AT COSMO IS STRUCTURED',
    intro: 'Everything important before registration: schedule, payouts, work format, training and communication rules.',
    cta: 'Complete registration',
    cards: [
      {n:'01',title:'Schedule',lines:['Main option: 5/2, 6 hours a day.','Alternative: 6/1, 4 hours a day.','2/2 or 3/3 with 8-hour shifts are also available.','You choose your days off and preferred working time. Shifts are continuous with a scheduled break.']},
      {n:'02',title:'Payouts',lines:['Twice a month — on the 10th and 25th.','After the 3-day training period, a 50% advance of what you earned during those 3 days is paid.','Payment can be sent to any bank card or another agreed method.']},
      {n:'03',title:'Income',lines:['New team members in the first month — from UAH 35,000.','Experienced team members — from UAH 110,000.','Final income depends on paid chat minutes, user activity, tips and virtual gifts.']},
      {n:'04',title:'The work',lines:['Live chat with camera and real-time messaging.','You meet users, keep the conversation going and guide the interaction yourself.','The goal is to make communication engaging, comfortable and long-lasting.']},
      {n:'05',title:'English',lines:['English is not required.','During training we set up a translator and show you how to communicate comfortably without a language barrier.']},
      {n:'06',title:'Boundaries',lines:['Topics can range from everyday life and interests to travel and light flirting.','You define your own comfort boundaries and direction of conversation.','Politics and religion are prohibited; additional restrictions depend on the specific platform.']},
    ]
  }
};

export default function WorkDetails({ locale='ru' }) {
  const t=content[locale]||content.ru;
  return <section className="work-details" id="work-details">
    <div className="shell work-details__inner">
      <div className="work-details__head">
        <div><p className="eyebrow">{t.eyebrow}</p><h2>{t.title}</h2><p>{t.intro}</p></div>
        <a href={`/${locale}/register/`} className="work-details__cta">{t.cta} ↗</a>
      </div>
      <div className="work-details__grid">
        {t.cards.map(card=><article className="work-detail-card" key={card.n}>
          <div className="work-detail-card__top"><span>{card.n}</span><i>✦</i></div>
          <h3>{card.title}</h3>
          <div>{card.lines.map((line,i)=><p key={i}>{line}</p>)}</div>
        </article>)}
      </div>
    </div>
  </section>;
}
