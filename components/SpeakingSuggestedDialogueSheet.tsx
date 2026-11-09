import React from 'react';
import { makeSpeakingSampleDialogue } from '../services/speakingSampleDialogue.mjs';
import './SpeakingSuggestedDialogueSheet.css';

interface Props {
  lang: 'ar'|'en';
  topicAr: string;
  topicEn: string;
  level: string;
  mode?: 'preview'|'print';
}

export const SpeakingSuggestedDialogueSheet:React.FC<Props>=({
  lang,topicAr,topicEn,level,mode='preview',
})=>{
  const ar=lang==='ar';
  const sample=makeSpeakingSampleDialogue({topicAr,topicEn,level});
  return <article className={'qul-speaking-sample-sheet '+(mode==='print'?'is-print':'is-preview')}
    dir={ar?'rtl':'ltr'} aria-label={ar?'محادثة مقترحة':'Suggested dialogue'}>
    <header className="qul-sample-header">
      <div>
        <small>QUL / قُل</small>
        <h2>{ar?'حوار مقترح للتدريب':'Suggested Practice Dialogue'}</h2>
        <p>{ar?sample.titleAr:sample.titleEn}</p>
      </div>
      <img src="/Logo.png" alt={ar?'شعار منصة قُل':'QUL logo'} draggable={false}/>
    </header>
    <div className="qul-sample-intro">
      <span>{ar?'تدرّب على المحادثة':'Practise the conversation'}</span>
      <span dir={ar?'ltr':'rtl'}>{ar?sample.titleEn:sample.titleAr}</span>
    </div>
    <div className="qul-sample-lines">
      {sample.lines.map((line,index)=>{
        const staff=line.role==='agent';
        return <div key={index} className={'qul-sample-turn '+(staff?'agent':'learner')}>
          <span className="qul-sample-who">
            {ar?(staff?'الموظف':'الطالب'):(staff?'Staff':'Learner')}
          </span>
          <div className="qul-sample-utterance">
            <strong lang="ar" dir="rtl">{line.ar}</strong>
            <span lang="en" dir="ltr">{line.en}</span>
          </div>
        </div>;
      })}
    </div>
    <div className="qul-sample-followup">
      <strong>{ar?'جرب بنفسك':'Your turn'}</strong>
      <p>{ar?sample.promptAr:sample.promptEn}</p>
    </div>
    <footer className="qul-sample-footer">
      <span>{ar?sample.noteAr:sample.noteEn}</span>
      <span dir="ltr">QUL · 02</span>
    </footer>
  </article>;
};
