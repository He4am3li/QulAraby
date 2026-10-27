import React, { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUpRight,
  Check,
  Globe,
  LogIn,
  Pause,
  Play,
  X,
} from "lucide-react";
import { useAuth } from "../components/AuthProvider";
import { LandingArtwork } from "../components/landing/LandingArtwork";
import type { createLandingScene } from "../components/landing/createLandingScene";
import "./Landing.css";

type Language = "ar" | "en";
const readLanguage = (): Language => {
  try {
    return localStorage.getItem("hub_lang") === "en" ? "en" : "ar";
  } catch {
    return "ar";
  }
};
// Only populate with an approved public booking/contact URL.
const SCHOOL_DEMO_URL = "";
const COPY = {
  ar: {
    nav: ["التجربة", "للمدارس"],
    login: "تسجيل الدخول",
    school: "اكتشف قُل لمدرستك",
    book: "احجز عرضًا لمدرستك",
    eyebrow: "العربية، كما تستحق أن تُعاش",
    title: (
      <>
        لغةٌ تفتح
        <br />
        <em>عالمًا.</em>
      </>
    ),
    intro:
      "منصة لتعليم العربية لغير الناطقين بها. تجارب تُشرك الطالب، وأدوات تمنح المعلم مساحة أكبر للتعليم.",
    explore: "ابدأ الاكتشاف",
    scroll: "مرّر لتكتشف",
    chapters: ["البداية", "اقرأ", "استمع", "اكتشف"],
    stories: [
      {
        label: "01 / بين السطور",
        title: (
          <>
            كل كلمة،
            <br />
            <em>بداية حكاية.</em>
          </>
        ),
        text: "قراءة تأخذ الطالب من معرفة الكلمة إلى فهم المعنى. خطوة بخطوة، وبإيقاعه الخاص.",
        tag: "القراءة · المفردات · الفهم",
      },
      {
        label: "02 / أصغِ إلى الحكاية",
        title: (
          <>
            لغةٌ تُسمع.
            <br />
            <em>ومعنى يبقى.</em>
          </>
        ),
        text: "حكايات تستحق الإصغاء. يستمع الطالب، يفكر، ثم يعود للنص بعينٍ أكثر فهمًا.",
        tag: "الاستماع · التفكير · التقييم",
      },
      {
        label: "03 / أبعد من الدرس",
        title: (
          <>
            فضول صغير.
            <br />
            <em>اكتشاف كبير.</em>
          </>
        ),
        text: "حين يصبح التعلّم مغامرة، تتحول المحاولة إلى رغبة في الاستمرار.",
        tag: "اللعب · التحدي · الاكتشاف",
      },
    ],
    schoolsLabel: "للمدارس التي ترى أبعد",
    schoolsTitle: (
      <>
        مكانٌ للطالب.
        <br />
        مساحةٌ للمعلم.
        <br />
        <em>رؤيةٌ للمدرسة.</em>
      </>
    ),
    schoolsText:
      "تجربة عربية واحدة تجمع التعلّم والتعليم والمتابعة، بهوية تناسب مجتمع مدرستك.",
    roles: [
      ["الطالب", "يتعلّم، يجرّب، ويتقدّم."],
      ["المعلم", "يوجّه التعلّم ويصنع التجربة."],
      ["المدرسة", "تتابع الرحلة من مكان واحد."],
    ],
    final: "تبدأ الرحلة بكلمة.",
    finalSub: "وتكبر مع كل تجربة.",
    rights: "قُل. مساحة للغة، وأفق للتعلّم.",
    pause: "إيقاف الحركة",
    resume: "تشغيل الحركة",
    close: "إغلاق",
    chooser: "أهلًا بك في قُل",
    google: "المتابعة باستخدام Google",
    connecting: "جارٍ الاتصال...",
    demoTitle: "جرّب كلمة",
    demoText: "نافذة صغيرة على تجربة المفردات.",
    word: "اكتب كلمة بالإنجليزية",
    translate: "اكتشف معناها",
    loading: "جارٍ البحث...",
    error: "تعذر تحميل المعنى. حاول مرة أخرى.",
    skip: "تجاوز إلى المحتوى",
  },
  en: {
    nav: ["The experience", "For schools"],
    login: "Sign in",
    school: "Explore QUL for your school",
    book: "Book a school demo",
    eyebrow: "ARABIC, BROUGHT TO LIFE",
    title: (
      <>
        A language.
        <br />
        <em>A whole world.</em>
      </>
    ),
    intro:
      "Arabic learning for non-native speakers. Experiences that engage students. Tools that give teachers more room to teach.",
    explore: "Explore the experience",
    scroll: "SCROLL TO DISCOVER",
    chapters: ["Welcome", "Read", "Listen", "Explore"],
    stories: [
      {
        label: "01 / BETWEEN THE LINES",
        title: (
          <>
            Every word.
            <br />
            <em>A new story.</em>
          </>
        ),
        text: "From recognising a word to understanding its meaning. Reading that moves at the learner’s own pace.",
        tag: "READING · VOCABULARY · UNDERSTANDING",
      },
      {
        label: "02 / A STORY WORTH HEARING",
        title: (
          <>
            Hear the language.
            <br />
            <em>Keep the meaning.</em>
          </>
        ),
        text: "Listen, reflect, then return to the story with a deeper understanding.",
        tag: "LISTENING · REFLECTION · ASSESSMENT",
      },
      {
        label: "03 / BEYOND THE LESSON",
        title: (
          <>
            A little curiosity.
            <br />
            <em>A big discovery.</em>
          </>
        ),
        text: "When learning becomes an adventure, every attempt is a reason to keep going.",
        tag: "PLAY · CHALLENGE · DISCOVERY",
      },
    ],
    schoolsLabel: "FOR SCHOOLS THAT LOOK FURTHER",
    schoolsTitle: (
      <>
        Room to learn.
        <br />
        Space to teach.
        <br />
        <em>A shared vision.</em>
      </>
    ),
    schoolsText:
      "Learning, teaching and progress in one Arabic experience, with a place for your whole school community.",
    roles: [
      ["Students", "Learn, experiment and grow."],
      ["Teachers", "Guide learning. Shape the experience."],
      ["Schools", "Follow the journey in one place."],
    ],
    final: "It starts with a word.",
    finalSub: "It grows with every experience.",
    rights: "QUL. A place for language. A world of learning.",
    pause: "Pause motion",
    resume: "Enable motion",
    close: "Close",
    chooser: "Welcome to QUL",
    google: "Continue with Google",
    connecting: "Connecting...",
    demoTitle: "Try a word",
    demoText: "A small window into vocabulary learning.",
    word: "Type an English word",
    translate: "Discover its meaning",
    loading: "Looking it up...",
    error: "Unable to load the meaning. Please try again.",
    skip: "Skip to content",
  },
};

function WordDemo({ lang }: { lang: Language }) {
  const [word, setWord] = useState("");
  const [result, setResult] = useState<{
    translation?: string;
    arabic_definition?: string;
    english_definition?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const t = COPY[lang];
  return (
    <details className="qul-word-demo">
      <summary>
        {t.demoTitle}
        <span>+</span>
      </summary>
      <p>{t.demoText}</p>
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          if (!word.trim() || loading) return;
          setLoading(true);
          setError(false);
          setResult(null);
          try {
            const { translateAndExpand } = await import("../services/gemini");
            const data = await translateAndExpand(word.trim(), false);
            if (mounted.current) setResult(data);
          } catch {
            if (mounted.current) setError(true);
          } finally {
            if (mounted.current) setLoading(false);
          }
        }}
      >
        <label htmlFor="qul-demo-word">{t.word}</label>
        <div>
          <input
            id="qul-demo-word"
            dir="auto"
            maxLength={100}
            value={word}
            onChange={(event) => setWord(event.target.value)}
            required
          />
          <button className="qul-button" disabled={loading || !word.trim()}>
            {loading ? t.loading : t.translate}
          </button>
        </div>
      </form>
      <div aria-live="polite">
        {error && <p role="alert">{t.error}</p>}
        {result && (
          <div className="qul-word-result">
            <strong lang="ar" dir="rtl">
              {result.translation}
            </strong>
            <p>
              {lang === "ar"
                ? result.arabic_definition
                : result.english_definition}
            </p>
          </div>
        )}
      </div>
    </details>
  );
}

export const Landing = () => {
  const { signIn, isSigningIn, authError, clearAuthError } = useAuth();
  const [lang, setLang] = useState<Language>(readLanguage);
  const [loginOpen, setLoginOpen] = useState(
    () => new URLSearchParams(window.location.search).get("login") === "1",
  );
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [wide, setWide] = useState(
    () => window.matchMedia("(min-width: 901px)").matches,
  );
  const [sceneReady, setSceneReady] = useState(false);
  const [sceneFailed, setSceneFailed] = useState(false);
  const [chapter, setChapter] = useState(0);
  const root = useRef<HTMLDivElement>(null),
    stage = useRef<HTMLDivElement>(null),
    dialog = useRef<HTMLDialogElement>(null);
  const scene = useRef<ReturnType<typeof createLandingScene> | null>(null);
  const progress = useRef(0);
  const t = COPY[lang];
  const moving = !paused && !reduced;
  const floatLetters = ["ق", "ل", "ع", "ر", "ب", "ي", "ة", "م", "ن", "ت", "س", "أ"];

  useEffect(() => {
    const sync = () => setLang(readLanguage());
    window.addEventListener("langChanged", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("langChanged", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  const changeLanguage = () => {
    const next = lang === "ar" ? "en" : "ar";
    setLang(next);
    try {
      localStorage.setItem("hub_lang", next);
      window.dispatchEvent(new Event("langChanged"));
    } catch {
      /* Storage may be blocked. */
    }
  };
  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)"),
      desktop = window.matchMedia("(min-width: 901px)");
    const update = () => {
      setReduced(motion.matches);
      setWide(desktop.matches);
    };
    motion.addEventListener("change", update);
    desktop.addEventListener("change", update);
    return () => {
      motion.removeEventListener("change", update);
      desktop.removeEventListener("change", update);
    };
  }, []);
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const sections = Array.from(
        element.querySelectorAll<HTMLElement>(".qul-chapter"),
      );
      const top = element.scrollTop;
      let value = 0;
      for (let i = 0; i < sections.length; i++) {
        const start = sections[i].offsetTop - sections[0].offsetTop;
        const next = sections[i + 1]
          ? sections[i + 1].offsetTop - sections[0].offsetTop
          : start + sections[i].offsetHeight;
        if (top >= start)
          value = i + Math.min(1, (top - start) / (next - start));
      }
      progress.current = Math.min(3, value);
      scene.current?.setProgress(progress.current);
      setChapter(Math.min(3, Math.floor(value + 0.5)));
      element.style.setProperty(
        "--qul-progress",
        String(top / Math.max(1, element.scrollHeight - element.clientHeight)),
      );
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    element.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    update();
    return () => {
      cancelAnimationFrame(frame);
      element.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);
  useEffect(() => {
    if (!wide || !moving || sceneFailed || !stage.current) return;
    let cancelled = false;
    const host = stage.current;
    Promise.all([
      import("../components/landing/createLandingScene"),
      document.fonts.load('100px "Al-Wissam"'),
    ])
      .then(([module]) => {
        if (cancelled) return;
        try {
          scene.current = module.createLandingScene(host, () => {
            setSceneFailed(true);
            setSceneReady(false);
          });
          scene.current.setProgress(progress.current);
          setSceneReady(true);
        } catch {
          setSceneFailed(true);
          setSceneReady(false);
        }
      })
      .catch(() => {
        if (!cancelled) setSceneFailed(true);
      });
    return () => {
      cancelled = true;
      scene.current?.dispose();
      scene.current = null;
      setSceneReady(false);
    };
  }, [wide, moving, sceneFailed]);
  useEffect(() => {
    const modal = dialog.current;
    if (!modal) return;
    if (loginOpen && !modal.open) modal.showModal();
    if (!loginOpen && modal.open) modal.close();
  }, [loginOpen]);
  const goTo = (id: string) => {
    const target = root.current?.querySelector<HTMLElement>(`#${id}`);
    target?.scrollIntoView({
      behavior: moving ? "smooth" : "instant",
      block: "start",
    });
    target?.focus({ preventScroll: true });
  };
  const openLogin = () => {
    clearAuthError();
    setLoginOpen(true);
  };
  const schoolAction = () =>
    SCHOOL_DEMO_URL
      ? window.open(SCHOOL_DEMO_URL, "_blank", "noopener,noreferrer")
      : goTo("qul-schools");

  return (
    <div
      ref={root}
      className={`qul-landing ${moving ? "" : "qul-still"} ${sceneReady ? "qul-webgl-ready" : ""}`}
      lang={lang}
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      <button className="qul-skip" onClick={() => goTo("qul-intro")}>
        {t.skip}
      </button>
      <header className="qul-header">
        <button
          className="qul-brand"
          onClick={() => goTo("qul-intro")}
          aria-label={lang === "ar" ? "قُل، البداية" : "QUL, home"}
        >
          <img src="/Logo.png" width="42" height="42" alt="" />
          <span>
            قُل<span className="qul-brand-latin">QUL</span>
          </span>
        </button>
        <nav
          aria-label={lang === "ar" ? "القائمة الرئيسية" : "Main navigation"}
        >
          <button onClick={() => goTo("qul-read")}>{t.nav[0]}</button>
          <button onClick={() => goTo("qul-schools")}>{t.nav[1]}</button>
        </nav>
        <div className="qul-header-actions">
          <button className="qul-language" onClick={changeLanguage}>
            <Globe size={15} />
            {lang === "ar" ? "EN" : "العربية"}
          </button>
          <button className="qul-login" onClick={openLogin}>
            <LogIn size={15} />
            {t.login}
          </button>
        </div>
      </header>
      {authError && !loginOpen && (
        <div className="qul-auth-notice" role="alert">
          <span>{authError}</span>
          <button onClick={clearAuthError} aria-label={t.close}>
            <X size={18} />
          </button>
        </div>
      )}
      <main>
        <div className="qul-journey">
          <div className="qul-floating-letters" aria-hidden="true">
            {floatLetters.map((letter, index) => (
              <span
                key={index}
                style={{
                  left: `${(index * 37 + 11) % 94}%`,
                  top: `${(index * 23 + 7) % 90}%`,
                  animationDelay: `${-(index * 1.7)}s`,
                  animationDuration: `${14 + (index % 5) * 3}s`,
                }}
              >{letter}</span>
            ))}
          </div>
          <div className="qul-stage" aria-hidden="true">
            <div className="qul-stage-glow" />
            <div className="qul-stage-fallback">
              <LandingArtwork chapter={chapter} />
            </div>
            <div ref={stage} className="qul-canvas" />
            <span className="qul-stage-caption">
              QUL /{" "}
              {
                [
                  "A WORLD OF WORDS",
                  "BETWEEN THE LINES",
                  "LISTEN CLOSELY",
                  "STAY CURIOUS",
                ][chapter]
              }
            </span>
          </div>
          <section
            className="qul-chapter qul-hero"
            id="qul-intro"
            tabIndex={-1}
          >
            <div className="qul-chapter-copy qul-glass">
              <p className="qul-eyebrow">
                <span />
                {t.eyebrow}
              </p>
              <h1>{t.title}</h1>
              <p className="qul-description">{t.intro}</p>
              <div className="qul-hero-actions">
                <button className="qul-button" onClick={schoolAction}>
                  {SCHOOL_DEMO_URL ? t.book : t.school}
                  <ArrowUpRight size={19} />
                </button>
                <button
                  className="qul-text-button"
                  onClick={() => goTo("qul-read")}
                >
                  {t.explore}
                  <ArrowDown size={16} />
                </button>
              </div>
              <div className="qul-hero-note">
                <span>قُل</span>
                <p>
                  Learn Arabic.
                  <br />
                  <b>Find your voice.</b>
                </p>
              </div>
            </div>
            <div className="qul-mobile-art">
              <LandingArtwork chapter={0} />
            </div>
            <button
              className="qul-scroll-hint"
              onClick={() => goTo("qul-read")}
            >
              <span>{t.scroll}</span>
              <ArrowDown size={17} />
            </button>
          </section>
          {t.stories.map((story, index) => (
            <section
              className="qul-chapter"
              id={["qul-read", "qul-listen", "qul-explore"][index]}
              key={index}
              tabIndex={-1}
            >
              <div className="qul-chapter-copy qul-glass">
                <p className="qul-eyebrow">{story.label}</p>
                <h2>{story.title}</h2>
                <p className="qul-description">{story.text}</p>
                <p className="qul-tags">{story.tag}</p>
                <button
                  className="qul-text-button"
                  onClick={() =>
                    goTo(["qul-listen", "qul-explore", "qul-schools"][index])
                  }
                >
                  {index === 2 ? t.nav[1] : t.chapters[index + 2]}
                  <ArrowDown size={16} />
                </button>
              </div>
              <div className="qul-mobile-art">
                <LandingArtwork chapter={index + 1} />
              </div>
            </section>
          ))}
          <div
            className="qul-chapter-nav"
            aria-label={lang === "ar" ? "مشاهد التجربة" : "Experience chapters"}
          >
            {t.chapters.map((name, index) => (
              <button
                key={name}
                aria-label={name}
                aria-current={chapter === index ? "step" : undefined}
                onClick={() =>
                  goTo(
                    ["qul-intro", "qul-read", "qul-listen", "qul-explore"][
                      index
                    ],
                  )
                }
              >
                <span>0{index + 1}</span>
                <i />
              </button>
            ))}
          </div>
        </div>
        <section className="qul-schools" id="qul-schools" tabIndex={-1}>
          <div className="qul-school-heading">
            <p className="qul-eyebrow">{t.schoolsLabel}</p>
            <h2>{t.schoolsTitle}</h2>
          </div>
          <div className="qul-school-detail">
            <p className="qul-description">{t.schoolsText}</p>
            <div className="qul-roles">
              {t.roles.map(([title, description], i) => (
                <div key={title}>
                  <span>0{i + 1}</span>
                  <div>
                    <h3>{title}</h3>
                    <p>{description}</p>
                  </div>
                  <Check size={18} />
                </div>
              ))}
            </div>
            {SCHOOL_DEMO_URL ? (
              <a
                className="qul-button"
                href={SCHOOL_DEMO_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t.book}
                <ArrowUpRight size={18} />
              </a>
            ) : (
              <button className="qul-button" onClick={openLogin}>
                {t.login}
                <ArrowLeft size={18} />
              </button>
            )}
            <WordDemo lang={lang} />
          </div>
        </section>
        <section className="qul-finale">
          <p className="qul-eyebrow">QUL / قُل</p>
          <h2>{t.final}</h2>
          <p>{t.finalSub}</p>
          <button className="qul-button" onClick={openLogin}>
            {t.login}
            <ArrowUpRight size={18} />
          </button>
          <div className="qul-finale-letters" aria-hidden="true">
            ع ر ب ي
          </div>
        </section>
      </main>
      <footer className="qul-footer">
        <span>{t.rights}</span>
        <span dir="ltr">© {new Date().getFullYear()} QUL</span>
      </footer>
      {!reduced && (
        <button
          className="qul-motion"
          onClick={() => setPaused((value) => !value)}
          aria-label={paused ? t.resume : t.pause}
          aria-pressed={paused}
        >
          {paused ? <Play size={14} /> : <Pause size={14} />}
          <span>{paused ? t.resume : t.pause}</span>
        </button>
      )}
      <dialog
        ref={dialog}
        className="qul-auth"
        onCancel={() => setLoginOpen(false)}
        onClose={() => setLoginOpen(false)}
        dir={lang === "ar" ? "rtl" : "ltr"}
        aria-labelledby="qul-auth-title"
      >
        <button
          className="qul-dialog-close"
          onClick={() => setLoginOpen(false)}
          aria-label={t.close}
        >
          <X size={22} />
        </button>
        <img src="/Logo.png" width="64" height="64" alt="قُل" />
        <h2 id="qul-auth-title">{t.chooser}</h2>
        <button
          className="qul-button"
          onClick={() => void signIn()}
          disabled={isSigningIn}
        >
          {isSigningIn ? t.connecting : t.google}
          <LogIn size={18} />
        </button>
        {authError && <p role="alert">{authError}</p>}
      </dialog>
    </div>
  );
};
export default Landing;
