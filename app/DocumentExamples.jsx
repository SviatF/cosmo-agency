'use client';

const EXAMPLES = {
  id_card: [
    ['front','/img/id_card_example_front_side.webp'],
    ['back','/img/id_card_example_back_side.webp'],
    ['selfie','/img/id_card_example_selfie.webp'],
  ],
  foreign_passport: [
    ['passport','/img/passport_example.webp'],
    ['selfie','/img/passport_example_selfie.webp'],
  ],
  driver_license: [
    ['front','/img/passdrive_example_fronside.webp'],
    ['back','/img/passdrive_example_backside.webp'],
    ['selfie','/img/passdrive_example_selfie.webp'],
  ],
};

const TEXT = {
  ru: {
    label:'ВЕРИФИКАЦИЯ', title:'ПРИМЕРЫ ФОТО ДОКУМЕНТОВ', intro:'Загрузите чёткие и качественные фото, как на примерах ниже. Это поможет быстрее пройти проверку.',
    names:{front:'Фото документа — лицевая сторона',back:'Фото документа — обратная сторона',passport:'Фото загранпаспорта',selfie:'Селфи с документом'},
    quality:['Хорошее освещение','Вся информация чётко видна','Документ не обрезан','Без размытия, бликов и фильтров'],
    docs:{id_card:'ID-карта',foreign_passport:'Загранпаспорт',driver_license:'Водительское удостоверение'}
  },
  ua: {
    label:'ВЕРИФІКАЦІЯ', title:'ПРИКЛАДИ ФОТО ДОКУМЕНТІВ', intro:'Завантажте чіткі та якісні фото, як у прикладах нижче. Це допоможе швидше пройти перевірку.',
    names:{front:'Фото документа — лицьова сторона',back:'Фото документа — зворотна сторона',passport:'Фото закордонного паспорта',selfie:'Селфі з документом'},
    quality:['Хороше освітлення','Уся інформація чітко видна','Документ не обрізаний','Без розмиття, відблисків і фільтрів'],
    docs:{id_card:'ID-картка',foreign_passport:'Закордонний паспорт',driver_license:'Посвідчення водія'}
  },
  en: {
    label:'VERIFICATION', title:'DOCUMENT PHOTO EXAMPLES', intro:'Upload clear, high-quality photos like the examples below. This helps us review your verification faster.',
    names:{front:'Document photo — front side',back:'Document photo — back side',passport:'International passport photo',selfie:'Selfie with document'},
    quality:['Good lighting','All information clearly visible','Document is not cropped','No blur, glare or filters'],
    docs:{id_card:'ID card',foreign_passport:'International passport',driver_license:'Driver’s license'}
  }
};

export default function DocumentExamples({ locale='ru', documentType='id_card' }) {
  const t=TEXT[locale]||TEXT.ru;
  const examples=EXAMPLES[documentType]||EXAMPLES.id_card;
  return <section className="document-verification" aria-live="polite">
    <div className="document-verification__hero">
      <div className="document-verification__head">
        <div><p>{t.label}</p><h3>{t.title}</h3></div>
        <span className="document-verification__badge">{t.docs[documentType]}</span>
      </div>
      <p className="reg-note">{t.intro}</p>
      <div className={`document-example-grid ${examples.length===2?'is-two':''}`}>
        {examples.map(([type,src],i)=><article className="document-example-card" key={src}>
          <div className="document-example-card__top"><span>{String(i+1).padStart(2,'0')}</span><strong>{t.names[type]}</strong></div>
          <div className="document-example-card__media"><img src={src} alt={t.names[type]}/></div>
        </article>)}
      </div>
      <div className="document-quality">{t.quality.map(item=><div key={item}><i>✦</i><span>{item}</span></div>)}</div>
    </div>
  </section>;
}
