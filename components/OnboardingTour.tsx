import React from 'react';
import Joyride, { Step, CallBackProps, STATUS } from 'react-joyride';

interface OnboardingTourProps {
  lang: 'ar' | 'en';
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({ lang }) => {
  const [run, setRun] = React.useState(false);

  React.useEffect(() => {
    const hasSeenTour = localStorage.getItem('hub_onboarding_seen');
    if (!hasSeenTour) {
      // Start tour after a short delay to ensure elements are rendered
      const timer = setTimeout(() => {
        setRun(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false);
      localStorage.setItem('hub_onboarding_seen', 'true');
    }
  };

  const steps: Step[] = [
    {
      target: 'body',
      placement: 'center',
      content: (
        <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
          <h3 className="text-lg font-bold mb-2">
            {lang === 'ar' ? 'مرحباً بك في قُل!' : 'Welcome to Qul!'}
          </h3>
          <p>
            {lang === 'ar' 
              ? 'دعنا نأخذك في جولة سريعة للتعرف على مميزات المنصة.' 
              : "Let's take a quick tour to discover the platform's features."}
          </p>
        </div>
      ),
      disableBeacon: true,
    },
    {
      target: window.innerWidth > 768 ? '#nav-test' : '#mobile-nav-test',
      content: (
        <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
          <h3 className="text-lg font-bold mb-2">
            {lang === 'ar' ? 'اختبر نفسك' : 'Test Yourself'}
          </h3>
          <p>
            {lang === 'ar' 
              ? 'ابدأ بتحديد مستواك في اللغة العربية من خلال اختبار شامل.' 
              : 'Start by assessing your Arabic level through a comprehensive test.'}
          </p>
        </div>
      ),
    },
    {
      target: window.innerWidth > 768 ? '#nav-assistant' : '#mobile-nav-assistant',
      content: (
        <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
          <h3 className="text-lg font-bold mb-2">
            {lang === 'ar' ? 'مساعد القواعد الذكي' : 'AI Grammar Assistant'}
          </h3>
          <p>
            {lang === 'ar' 
              ? 'استخدم أدوات الذكاء الاصطناعي لتعلم القواعد وتصحيح نصوصك.' 
              : 'Use AI tools to learn grammar and correct your texts.'}
          </p>
        </div>
      ),
    },
    {
      target: window.innerWidth > 768 ? '#nav-reading' : '#mobile-nav-reading',
      content: (
        <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
          <h3 className="text-lg font-bold mb-2">
            {lang === 'ar' ? 'القراءة التفاعلية' : 'Interactive Reading'}
          </h3>
          <p>
            {lang === 'ar' 
              ? 'طور مهارات القراءة لديك من خلال نصوص وقصص تفاعلية.' 
              : 'Develop your reading skills through interactive texts and stories.'}
          </p>
        </div>
      ),
    },
    {
      target: window.innerWidth > 768 ? '#nav-games' : '#mobile-nav-games',
      content: (
        <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
          <h3 className="text-lg font-bold mb-2">
            {lang === 'ar' ? 'الألعاب التعليمية' : 'Educational Games'}
          </h3>
          <p>
            {lang === 'ar' 
              ? 'تعلم العربية بطريقة ممتعة من خلال الألعاب والتحديات.' 
              : 'Learn Arabic in a fun way through games and challenges.'}
          </p>
        </div>
      ),
    },
    {
      target: window.innerWidth > 768 ? '#weekly-goal' : 'body',
      placement: window.innerWidth > 768 ? 'top' : 'center',
      content: (
        <div className={lang === 'ar' ? 'text-right' : 'text-left'}>
          <h3 className="text-lg font-bold mb-2">
            {lang === 'ar' ? 'هدف الأسبوع' : 'Weekly Goal'}
          </h3>
          <p>
            {lang === 'ar' 
              ? 'تابع تقدمك وحاول تحقيق أهدافك الأسبوعية لتصبح متعلماً نشطاً.' 
              : 'Track your progress and try to achieve your weekly goals to become an active learner.'}
          </p>
        </div>
      ),
    },
  ];

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      locale={{
        back: lang === 'ar' ? 'السابق' : 'Back',
        close: lang === 'ar' ? 'إغلاق' : 'Close',
        last: lang === 'ar' ? 'ابدأ الآن' : 'Start Now',
        next: lang === 'ar' ? 'التالي' : 'Next',
        skip: lang === 'ar' ? 'تخطي' : 'Skip',
      }}
      styles={{
        options: {
          primaryColor: '#2563eb',
          zIndex: 10000,
        },
        tooltipContainer: {
          textAlign: lang === 'ar' ? 'right' : 'left',
          direction: lang === 'ar' ? 'rtl' : 'ltr',
        },
      }}
    />
  );
};
