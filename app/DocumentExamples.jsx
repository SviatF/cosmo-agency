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

function QualityIcon({type}){
  const common={viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:'1.6',strokeLinecap:'round',strokeLinejoin:'round','aria-hidden':'true'};
  if(type==='photo') return <svg {...common}><rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><circle cx="9" cy="10" r="1.7"/><path d="m5.8 17 4.1-4.1 2.8 2.7 2.1-2.1 3.4 3.5"/></svg>;
  if(type==='scan') return <svg {...common}><path d="M8 4H5a1 1 0 0 0-1 1v3M16 4h3a1 1 0 0 1 1 1v3M8 20H5a1 1 0 0 1-1-1v-3M16 20h3a1 1 0 0 0 1-1v-3"/><circle cx="12" cy="12" r="3.1"/><path d="M9.2 12h5.6"/></svg>;
  if(type==='crop') return <svg {...common}><path d="M7 3v14a2 2 0 0 0 2 2h12M3 7h12a2 2 0 0 1 2 2v12"/><path d="M17 3v4h4M3 17h4v4"/></svg>;
  if(type==='sparkle') return <svg {...common}><path d="M12 3.5c.7 4.4 2.6 6.3 7 7-.4 4.4-2.3 6.3-7 7-.7-4.7-2.6-6.6-7-7 4.4-.7 6.3-2.6 7-7Z"/><path d="M19 3v3M20.5 4.5h-3"/></svg>;
  return <svg {...common}><circle cx="12" cy="12" r="8"/><circle cx="9" cy="9" r="1"/><circle cx="15" cy="8" r="1"/><circle cx="8" cy="14" r="1"/><path d="M15.8 14.2 18 16.4M18 14.2l-2.2 2.2"/></svg>;
}

const TEXT = {
  ru: {
    label:'ВЕРИФИКАЦИЯ', title:'ПРИМЕРЫ ФОТО ДОКУМЕНТОВ', intro:'Загрузите чёткие и качественные фото, как на примерах ниже. Это поможет быстрее пройти проверку.',
    names:{front:'Фото документа — лицевая сторона',back:'Фото документа — обратная сторона',passport:'Фото загранпаспорта',selfie:'Селфи с документом'},
    qualityTitle:'ВАЖНО, ЧТОБЫ:',
    quality:[
      ['photo','Было хорошее освещение'],
      ['scan','Вся информация была чётко видна'],
      ['crop','Документ не был обрезан'],
      ['sparkle','Фото не было размытым или засвеченным'],
      ['original','Использовались оригинальные фото, без фильтров и редактирования'],
    ],
    docs:{id_card:'ID-карта',foreign_passport:'Загранпаспорт',driver_license:'Водительское удостоверение'}
  },
  ua: {
    label:'ВЕРИФІКАЦІЯ', title:'ПРИКЛАДИ ФОТО ДОКУМЕНТІВ', intro:'Завантажте чіткі та якісні фото, як у прикладах нижче. Це допоможе швидше пройти перевірку.',
    names:{front:'Фото документа — лицьова сторона',back:'Фото документа — зворотна сторона',passport:'Фото закордонного паспорта',selfie:'Селфі з документом'},
    qualityTitle:'ВАЖЛИВО, ЩОБ:',
    quality:[
      ['photo','Було хороше освітлення'],
      ['scan','Уся інформація була чітко видна'],
      ['crop','Документ не був обрізаний'],
      ['sparkle','Фото не було розмитим або засвіченим'],
      ['original','Використовувалися оригінальні фото, без фільтрів і редагування'],
    ],
    docs:{id_card:'ID-картка',foreign_passport:'Закордонний паспорт',driver_license:'Посвідчення водія'}
  },
  en: {
    label:'VERIFICATION', title:'DOCUMENT PHOTO EXAMPLES', intro:'Upload clear, high-quality photos like the examples below. This helps us review your verification faster.',
    names:{front:'Document photo — front side',back:'Document photo — back side',passport:'International passport photo',selfie:'Selfie with document'},
    qualityTitle:'IMPORTANT:',
    quality:[
      ['photo','Use good lighting'],
      ['scan','Make sure all information is clearly visible'],
      ['crop','Do not crop the document'],
      ['sparkle','Avoid blur, glare and overexposure'],
      ['original','Use original photos without filters or editing'],
    ],
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
      <section className="document-quality-panel" aria-label={t.qualityTitle}>
        <p className="document-quality-panel__title">{t.qualityTitle}</p>
        <div className="document-quality">
          {t.quality.map(([icon,item])=><div key={item}><i><QualityIcon type={icon}/></i><span>{item}</span></div>)}
        </div>
      </section>
    </div>
  </section>;
}
