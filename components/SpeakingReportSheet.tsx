import React from 'react';
import './SpeakingReportSheet.css';

type TurnEvidence = { learnerTurns: number; arabicWords: number; uniqueArabicWords: number };
type SessionInsights = {
  assessmentStatus?: 'analyzed' | 'limited' | string;
  summary?: string;
  summaryEn?: string;
  tutor_tip_ar?: string;
  tutor_tip_en?: string;
  key_vocabulary?: Array<{ word: string; translation: string }>;
  corrections?: Array<{ original: string; correction: string; explanation?: string }>;
  missionEvidence?: Array<{ goal: string; achieved: boolean; evidence?: string }>;
};
export type SpeakingReportSheetProps = {
  lang: 'ar' | 'en';
  topicAr?: string;
  topicEn?: string;
  levelAr?: string;
  levelEn?: string;
  evidence: TurnEvidence;
  insights: SessionInsights | null;
  objectivesAr?: readonly string[];
  objectivesEn?: readonly string[];
  nextPractice: { promptAr: string; promptEn: string };
  mode?: 'preview' | 'print';
};

export const SpeakingReportSheet: React.FC<SpeakingReportSheetProps> = ({
  lang, topicAr, topicEn, levelAr, levelEn, evidence, insights,
  objectivesAr=[], objectivesEn=[], nextPractice, mode='preview',
}) => {
  const ar=lang==='ar';
  const words=Array.isArray(insights?.key_vocabulary)?insights.key_vocabulary.slice(0,5):[];
  const corrections=Array.isArray(insights?.corrections)?insights.corrections.slice(0,2):[];
  const goals=Array.isArray(insights?.missionEvidence)?insights.missionEvidence:[];
  const hasGoals=objectivesAr.length>0;
  const limited=insights?.assessmentStatus!=='analyzed';
  const title=ar?'ورقة متابعة التحدث':'Speaking Practice Worksheet';
  const labels={
    session:ar?'معلومات الجلسة':'Session details',
    evidence:ar?'مؤشرات من الحوار':'Transcript evidence',
    learner:ar?'مداخلات الطالب':'Learner turns',
    arabic:ar?'كلمات عربية':'Arabic words',
    unique:ar?'كلمات مختلفة':'Distinct words',
    objective:ar?'أهداف المكالمة':'Call objectives',
    summary:ar?'ملخص المحادثة':'Conversation summary',
    tip:ar?'ملاحظة المعلم':'Tutor feedback',
    vocab:ar?'مفردات من الحوار':'Vocabulary from the call',
    corrections:ar?'تصويبات لغوية':'Language corrections',
    next:ar?'تدريب مقترح':'Suggested practice',
    status:ar?'تعذر تحليل الجلسة تحليلًا موثوقًا.':'A reliable session analysis was unavailable.',
    evidenceNote:ar?'هذه مؤشرات من النص المُفرَّغ، وليست قياسًا للنطق أو الطلاقة الصوتية.':'These figures come from the transcript, not a pronunciation or oral fluency score.',
    footer:ar?'قُل | اللغة العربية للناطقين بغيرها':'QUL | Arabic for Non-Native Speakers',
  };
  const section=(heading:string, children:React.ReactNode)=>
    <section className="qul-report-section">
      <h3 className="qul-report-section-title">{heading}</h3>
      {children}
    </section>;

  return (
    <article className={'qul-speaking-report-sheet '+(mode==='print'?'is-print':'is-preview')}
      dir={ar?'rtl':'ltr'} aria-label={title}>
      <header className="qul-report-paper-header">
        <div>
          <span className="qul-report-overline">QUL · قُل</span>
          <h2>{title}</h2>
          <p lang={ar?'en':'ar'} dir={ar?'ltr':'rtl'}>
            {ar?'ARABIC SPEAKING PRACTICE':'تقرير ممارسة التحدث بالعربية'}
          </p>
        </div>
        <div className="qul-report-seal" aria-hidden="true">
          <img src="/Logo.png" alt="" draggable={false}/>
        </div>
      </header>
      <div className="qul-report-session-meta">
        <div><span>{labels.session}</span>
          <strong>{ar?(topicAr||'المحادثة'):(topicEn||'Conversation')}</strong>
          <small dir={ar?'ltr':'rtl'}>{ar?topicEn:topicAr}</small>
        </div>
        <div><span>{ar?'المستوى':'Level'}</span>
          <strong>{ar?(levelAr||''):(levelEn||'')}</strong>
          <small dir={ar?'ltr':'rtl'}>{ar?levelEn:levelAr}</small>
        </div>
        <div><span>{ar?'التاريخ':'Date'}</span>
          <strong dir="ltr">{new Date().toLocaleDateString(ar?'ar-AE':'en-AE',{
            year:'numeric',month:'short',day:'numeric'
          })}</strong>
        </div>
      </div>
      {section(labels.evidence,
        <>
          <div className="qul-report-evidence">
            {[
              [evidence.learnerTurns,labels.learner],
              [evidence.arabicWords,labels.arabic],
              [evidence.uniqueArabicWords,labels.unique]
            ].map(([value,label])=>(
              <div key={String(label)}><strong dir="ltr">{value}</strong><span>{label}</span></div>
            ))}
          </div>
          <p className="qul-report-caution">{labels.evidenceNote}</p>
        </>
      )}
      {hasGoals && section(labels.objective,
        <div className="qul-report-goals">
          {objectivesAr.map((goal,index)=>{
            const done=insights?.assessmentStatus==='analyzed'&&goals[index]?.achieved===true;
            return <div key={index} className={'qul-report-goal '+(done?'achieved':'')}>
              <span className="qul-report-goal-mark">{done?'✓':'○'}</span>
              <div><strong>{ar?goal:(objectivesEn[index]||goal)}</strong>
              {goals[index]?.achieved&&goals[index].evidence&&
                <small dir="rtl" lang="ar">{goals[index].evidence}</small>}</div>
            </div>;
          })}
        </div>
      )}
      {section(labels.summary,
        <p className="qul-report-body-paragraph">{limited ? ((ar ? insights?.summary : insights?.summaryEn) || labels.status) : insights?.summary}</p>
      )}
      {section(labels.tip,
        <div className="qul-report-tutor-tip">
          <p lang="ar" dir="rtl">{insights?.tutor_tip_ar||'اختر جملة من المحادثة وتدرّب عليها مرة أخرى.'}</p>
          <p lang="en" dir="ltr">{insights?.tutor_tip_en||'Choose a sentence from the dialogue and practise it again.'}</p>
        </div>
      )}
      {words.length>0 && section(labels.vocab,
        <div className="qul-report-vocabulary">
          {words.map((item,i)=>(
            <div key={i}><strong lang="ar" dir="rtl">{item.word}</strong>
            <span lang="en" dir="ltr">{item.translation}</span></div>
          ))}
        </div>
      )}
      {corrections.length>0 && section(labels.corrections,
        <div className="qul-report-corrections">
          {corrections.map((item,i)=>(
            <div key={i}><del lang="ar" dir="rtl">{item.original}</del>
              <strong lang="ar" dir="rtl">{item.correction}</strong>
              {item.explanation&&<small>{item.explanation}</small>}</div>
          ))}
        </div>
      )}
      {section(labels.next,
        <div className="qul-report-next-practice">
          <p lang="ar" dir="rtl">{nextPractice.promptAr}</p>
          <p lang="en" dir="ltr">{nextPractice.promptEn}</p>
        </div>
      )}
      <footer className="qul-report-paper-footer">
        <span>{labels.footer}</span>
        <span>QUL · 01</span>
      </footer>
    </article>
  );
};
