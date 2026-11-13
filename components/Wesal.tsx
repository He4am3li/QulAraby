import React from 'react';
import { createPortal } from 'react-dom';
import {
  Bell, CheckCheck, ChevronRight, Headset, LoaderCircle, Megaphone,
  MessageCircle, RefreshCw, Search, Send, Settings2, ShieldCheck, UsersRound, X
} from 'lucide-react';
import { useAuth } from './AuthProvider';
import './wesal.css';

type WesalTab = 'chats' | 'contacts' | 'announcements' | 'support' | 'settings';
type Kind = 'direct' | 'support';
type Contact = { uid: string; name: string; role: string; kind: Kind };
type Thread = { id: string; peerUid: string; peerName: string; peerRole: string; kind: Kind; lastText: string; lastAt: number; unread: boolean };
type Announcement = { id: string; title: string; body: string; audience: string; authorName: string; readCount: number; createdAt: number; seen: boolean };
type Classroom = { id: string; name: string };
type WesalData = {
  me?: { uid: string; name: string; role: string };
  contacts: Contact[]; threads: Thread[]; announcements: Announcement[];
  classes: Classroom[]; unreadCount: number; schoolLinked: boolean; guardianAvailable: boolean;
};
type Message = { id: string; senderUid: string; text: string; createdAt: number };
type WesalContextValue = { openWesal: () => void; unreadCount: number };
const WesalContext = React.createContext<WesalContextValue | undefined>(undefined);
const EMPTY: WesalData = { contacts: [], threads: [], announcements: [], classes: [], unreadCount: 0, schoolLinked: false, guardianAvailable: false };

async function wesalRequest(user: NonNullable<ReturnType<typeof useAuth>['user']>, payload: Record<string, unknown>): Promise<any> {
  const token = await user.getIdToken();
  const response = await fetch('/api/wesal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw Error(String(result.error || 'تعذر الوصول إلى خدمة وِصال.'));
  return result;
}

function initial(name: string): string { return (name || 'و').trim().charAt(0); }
function when(time: number): string { return time ? new Date(time).toLocaleTimeString('ar-AE', { hour: '2-digit', minute: '2-digit' }) : ''; }

export function WesalProvider({ children }: { children: React.ReactNode }) {
  const { user, profile } = useAuth();
  const [open, setOpen] = React.useState(false);
  const [panelTop, setPanelTop] = React.useState(14);
  const [tab, setTab] = React.useState<WesalTab>('chats');
  const [data, setData] = React.useState<WesalData>(EMPTY);
  const [search, setSearch] = React.useState('');
  const [peer, setPeer] = React.useState<Contact | null>(null);
  const [threadId, setThreadId] = React.useState<string | null>(null);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [loadingMessages, setLoadingMessages] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const [error, setError] = React.useState('');
  const [draft, setDraft] = React.useState('');
  const [title, setTitle] = React.useState('');
  const [body, setBody] = React.useState('');
  const [classId, setClassId] = React.useState('');
  const [noticesEnabled, setNoticesEnabled] = React.useState(true);
  const live = React.useRef(true);
  const activeThread = React.useRef<string | null>(null);
  const activePeer = React.useRef<Contact | null>(null);

  React.useEffect(() => { live.current = true; return () => { live.current = false; }; }, []);

  const refresh = React.useCallback(async (silent = false) => {
    if (!user || !profile) return;
    if (!silent) setLoading(true);
    try {
      const result = await wesalRequest(user, { action: 'bootstrap' });
      if (live.current) { setData({ ...EMPTY, ...result }); setError(''); }
    } catch (e) {
      if (live.current && !silent) setError(e instanceof Error ? e.message : 'تعذر تحديث المحادثات.');
    } finally { if (live.current && !silent) setLoading(false); }
  }, [user, profile?.uid]);

  const refreshHistory = React.useCallback(async (id: string, silent = false) => {
    if (!user || !id) return;
    if (!silent) setLoadingMessages(true);
    try {
      const result = await wesalRequest(user, { action: 'history', threadId: id });
      if (live.current && activeThread.current === id) {
        setMessages(Array.isArray(result.messages) ? result.messages : []);
        if (!silent) setError('');
      }
    } catch (e) {
      if (live.current && !silent) setError(e instanceof Error ? e.message : 'تعذر فتح المحادثة.');
    } finally { if (live.current && !silent) setLoadingMessages(false); }
  }, [user]);

  React.useEffect(() => {
    if (!user || !profile) { setOpen(false); setData(EMPTY); return; }
    // Low-frequency inbox refresh keeps unread indicators current without changing other modules.
    void refresh(true);
    const timer = window.setInterval(() => void refresh(true), 60000);
    return () => window.clearInterval(timer);
  }, [user?.uid, profile?.uid, refresh]);

  React.useEffect(() => {
    if (!open) return;
    void refresh(false);
    const timer = window.setInterval(() => {
      void refresh(true);
      if (activeThread.current) void refreshHistory(activeThread.current, true);
    }, 12000);
    return () => window.clearInterval(timer);
  }, [open, refresh, refreshHistory]);

  React.useEffect(() => {
    if (!open) return;
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (activePeer.current) leaveConversation();
        else setOpen(false);
      }
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [open]);

  const measureTopBarBottom = React.useCallback(() => {
    // Anchor the drawer to the actual header, even when QUL uses a different header on mobile.
    const topBar = document.querySelector('.wesal-launch')?.closest('header');
    if (!topBar) return 14;
    const bottom = Math.round(topBar.getBoundingClientRect().bottom) + 2;
    // Preserve enough room for usable conversations on unusually short viewports.
    return Math.max(0, Math.min(bottom, Math.max(0, window.innerHeight - 280)));
  }, []);

  const openWesal = React.useCallback(() => {
    setPanelTop(measureTopBarBottom());
    setOpen(true);
    setError('');
  }, [measureTopBarBottom]);

  React.useEffect(() => {
    if (!open) return;
    const updatePosition = () => setPanelTop(measureTopBarBottom());
    window.addEventListener('resize', updatePosition);
    window.addEventListener('orientationchange', updatePosition);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('orientationchange', updatePosition);
    };
  }, [open, measureTopBarBottom]);
  const leaveConversation = () => {
    setPeer(null); activePeer.current = null; activeThread.current = null;
    setThreadId(null); setMessages([]); setDraft(''); setError('');
  };
  const changeTab = (next: WesalTab) => { leaveConversation(); setTab(next); setSearch(''); };

  const openContact = (contact: Contact) => {
    const existing = data.threads.find(t => t.peerUid === contact.uid && t.kind === contact.kind);
    setPeer(contact); activePeer.current = contact; setError('');
    setThreadId(existing?.id || null); activeThread.current = existing?.id || null;
    setMessages([]);
    if (existing) void refreshHistory(existing.id);
  };

  const send = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user || !peer || !draft.trim() || sending) return;
    setSending(true); setError('');
    try {
      const result = await wesalRequest(user, { action: 'send', targetUid: peer.uid, kind: peer.kind, text: draft });
      setDraft('');
      const id = String(result.threadId);
      setThreadId(id); activeThread.current = id;
      setMessages(current => [...current, result.message as Message]);
      await refresh(true);
      await refreshHistory(id, true);
    } catch (e) { setError(e instanceof Error ? e.message : 'تعذر إرسال الرسالة.'); }
    finally { setSending(false); }
  };

  const announce = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user || sending || !title.trim() || !body.trim()) return;
    const manager = data.me?.role === 'schoolAdmin';
    if (!manager && !classId) { setError('اختر صفًا مرتبطًا بك أولًا.'); return; }
    setSending(true); setError('');
    try {
      await wesalRequest(user, { action: 'announce', audience: manager ? 'teachers' : 'class', classId: manager ? '' : classId, title, text: body });
      setTitle(''); setBody('');
      await refresh();
    } catch (e) { setError(e instanceof Error ? e.message : 'تعذر نشر التعميم.'); }
    finally { setSending(false); }
  };

  const ack = async (id: string) => {
    if (!user) return;
    try { await wesalRequest(user, { action: 'ack', id }); await refresh(true); }
    catch (e) { setError(e instanceof Error ? e.message : 'تعذر تأكيد القراءة.'); }
  };

  const context = React.useMemo(() => ({ openWesal, unreadCount: noticesEnabled ? data.unreadCount : 0 }), [openWesal, data.unreadCount, noticesEnabled]);
  const contactList = data.contacts.filter(c => c.kind === (tab === 'support' ? 'support' : 'direct'));
  const threadList = data.threads.filter(t => t.kind === (tab === 'support' ? 'support' : 'direct'));
  const matchingContacts = contactList.filter(c => (c.name + ' ' + c.role).toLowerCase().includes(search.toLowerCase()));
  const matchingThreads = threadList.filter(t => (t.peerName + ' ' + t.lastText).toLowerCase().includes(search.toLowerCase()));
  const manager = data.me?.role === 'schoolAdmin';
  const teacher = data.me?.role === 'teacher';
  const tabName: Record<WesalTab, string> = { chats: 'المحادثات', contacts: 'جهات الاتصال', announcements: 'التعميمات', support: 'الدعم', settings: 'الإعدادات' };

  return (
    <WesalContext.Provider value={context}>
      {children}
      {open && typeof document !== 'undefined' && createPortal(
        <>
          <div className="wesal-overlay" onClick={() => setOpen(false)} aria-hidden="true" />
          <section className="wesal-panel" style={{ top: panelTop }} role="dialog" aria-modal="true" aria-label="وِصال، مراسلات قُل">
            <header className="wesal-header">
              <div className="wesal-monogram" aria-hidden="true">و</div>
              <div className="wesal-name">
                <strong>وِصال</strong>
                <span>QUL CONNECT · {data.me?.role === 'schoolAdmin' ? 'إدارة المدرسة' : data.me?.role === 'admin' ? 'مالك قُل' : data.me?.role === 'teacher' ? 'المعلم' : 'الطالب'}</span>
              </div>
              <div className="wesal-header-actions">
                <button className="wesal-icon-button" type="button" onClick={() => void refresh()} title="تحديث الرسائل" aria-label="تحديث الرسائل"><RefreshCw size={17}/></button>
                <button className={'wesal-icon-button ' + (tab === 'settings' ? 'wesal-icon-selected' : '')} type="button" onClick={() => changeTab('settings')} title="الإعدادات" aria-label="إعدادات وِصال"><Settings2 size={17}/></button>
                <button className="wesal-icon-button" type="button" onClick={() => setOpen(false)} aria-label="إغلاق وِصال"><X size={18}/></button>
              </div>
            </header>
            <nav className="wesal-segments" aria-label="أقسام وِصال">
              {([
                ['chats', 'المحادثات'],
                ['contacts', 'الجهات'],
                ['announcements', 'التعميمات'],
                ['support', 'الدعم'],
              ] as const).map(([key, label]) => (
                <button key={key} className={'wesal-segment ' + (tab === key ? 'wesal-selected' : '')} type="button" onClick={() => changeTab(key)} aria-current={tab === key ? 'page' : undefined}>
                  {label}
                  {key === 'chats' && data.unreadCount > 0 && <span className="wesal-segment-count">{data.unreadCount > 9 ? '9+' : data.unreadCount}</span>}
                </button>
              ))}
            </nav>
            <div className="wesal-main">
              <div className="wesal-view">
                {peer ? (
                  <>
                    <div className="wesal-messages-head">
                      <button type="button" className="wesal-icon-button" onClick={leaveConversation} aria-label="رجوع"><ChevronRight size={19}/></button>
                      <div className="wesal-avatar">{initial(peer.name)}</div>
                      <div style={{flex:1,minWidth:0}}><strong>{peer.name}</strong><small>{peer.kind === 'support' ? 'مراسلة دعم المدرسة' : peer.role === 'student' ? 'طالب' : peer.role === 'teacher' ? 'معلم' : 'إدارة المدرسة'}</small></div>
                    </div>
                    <div className="wesal-messages" aria-live="polite">
                      {loadingMessages && <div className="wesal-empty">جاري تحميل المحادثة...</div>}
                      {!loadingMessages && messages.length === 0 && <div className="wesal-empty">ابدأ محادثتك برسالة قصيرة وواضحة.<br/> الرسائل تظهر للأطراف المصرح لها فقط.</div>}
                      {messages.map(m => <div className={'wesal-bubble ' + (m.senderUid === data.me?.uid ? 'mine' : '')} key={m.id}>{m.text}<small>{when(m.createdAt)}</small></div>)}
                    </div>
                    {error && <p className="wesal-alert" role="alert">{error}</p>}
                    <form className="wesal-compose" onSubmit={event => void send(event)}>
                      <textarea value={draft} maxLength={1100} onChange={event => setDraft(event.target.value)} onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} rows={2} placeholder="اكتب رسالتك هنا..." aria-label="نص الرسالة"/>
                      <button className="wesal-send" disabled={sending || !draft.trim()} title="إرسال" aria-label="إرسال الرسالة" type="submit">{sending ? <LoaderCircle className="animate-spin" size={19}/> : <Send size={19}/>}</button>
                    </form>
                  </>
                ) : (
                  <>
                    <div className="wesal-view-header">
                      <h2>{tab === 'chats' ? 'الرسائل الأخيرة' : tab === 'contacts' ? 'جهات التواصل' : tab === 'announcements' ? 'الإعلانات المدرسية' : tab === 'support' ? 'التواصل والدعم' : 'تفضيلات وِصال'}</h2>
                      {tab === 'chats' && data.unreadCount > 0 && <span className="wesal-pill">{data.unreadCount} غير مقروءة</span>}
                    </div>
                    {loading && <p className="wesal-note">جاري تحديث وِصال...</p>}
                    {error && <p className="wesal-alert" role="alert">{error}</p>}
                    {(tab === 'chats' || tab === 'contacts' || tab === 'support') &&
                      <label className="wesal-search"><Search size={17}/><input value={search} onChange={event => setSearch(event.target.value)} placeholder="ابحث في محادثاتك..." aria-label="بحث"/></label>}
                    <div className="wesal-scroll">
                      {(tab === 'chats' || tab === 'support') && (
                        <>
                          {(tab === 'support' && manager) && <p className="wesal-note">قناة مباشرة بين إدارة المدرسة ومالك قُل.</p>}
                          {matchingThreads.map(t => (
                            <button key={t.id} className="wesal-item" type="button" onClick={() => openContact({uid:t.peerUid,name:t.peerName,role:t.peerRole,kind:t.kind})}>
                              <div className="wesal-avatar-wrap">
                                <div className="wesal-avatar">{initial(t.peerName)}</div>
                                {t.unread && <span className="wesal-dot" aria-label="رسالة غير مقروءة"/>}
                              </div>
                              <div className="wesal-item-text">
                                <div className="wesal-item-heading"><strong>{t.peerName}</strong><time>{when(t.lastAt)}</time></div>
                                <div className="wesal-message-preview">{t.lastText || 'افتح المحادثة لقراءة الرسائل'}</div>
                              </div>
                            </button>
                          ))}
                          {tab === 'support' && contactList.filter(c => !threadList.some(t => t.peerUid === c.uid)).map(c => (
                            <button className="wesal-item" key={c.uid} onClick={() => openContact(c)} type="button"><div className="wesal-avatar-wrap"><div className="wesal-avatar">{initial(c.name)}</div></div><div className="wesal-item-text"><div className="wesal-item-heading"><strong>{c.name}</strong><ChevronRight size={15}/></div><div className="wesal-message-preview">فتح محادثة الدعم</div></div></button>
                          ))}
                          {tab === 'chats' && matchingThreads.length === 0 && <div className="wesal-empty">لا توجد محادثات بعد.<br/> ابدأ من «جهات الاتصال».</div>}
                          {tab === 'support' && matchingThreads.length === 0 && contactList.length === 0 && <div className="wesal-empty">قناة الدعم المباشر متاحة لإدارة المدرسة ومالك قُل.<br/> ويمكن لبقية المستخدمين الاستعانة بإدارة مدرستهم.</div>}
                        </>
                      )}
                      {tab === 'contacts' && (
                        <>
                          <p className="wesal-note">تظهر فقط الحسابات المرتبطة بك عبر المدرسة والصف وفق الصلاحيات.</p>
                          {matchingContacts.map(c => <button key={c.uid} type="button" className="wesal-item" onClick={() => openContact(c)}><div className="wesal-avatar-wrap"><div className="wesal-avatar">{initial(c.name)}</div></div><div className="wesal-item-text"><div className="wesal-item-heading"><strong>{c.name}</strong><ChevronRight size={15}/></div><div className="wesal-contact-subtitle">{c.role === 'student' ? 'طالب' : c.role === 'teacher' ? 'معلم' : 'إدارة المدرسة'}</div></div></button>)}
                          {matchingContacts.length === 0 && <p className="wesal-empty">لا توجد جهات متاحة بعد. تأكد من ربط الطلاب بفصولهم وإسناد معلم لكل فصل.</p>}
                          <p className="wesal-note">التواصل مع ولي الأمر غير متاح إلى أن يتم توثيق حسابه وربطه بابنه.</p>
                        </>
                      )}
                      {tab === 'announcements' && (
                        <>
                          {(manager || teacher) && <form className="wesal-card" onSubmit={event => void announce(event)}>
                            <h3><Megaphone style={{display:'inline',marginLeft:6}} size={17}/> إنشاء تعميم</h3>
                            <p>{manager ? 'إلى جميع معلمي مدرستك' : 'إلى طلاب أحد صفوفك'}</p>
                            {teacher && <select className="wesal-field" aria-label="اختر الصف" value={classId} onChange={event => setClassId(event.target.value)}>
                              <option value="">اختر الصف</option>{data.classes.map(c => <option value={c.id} key={c.id}>{c.name}</option>)}
                            </select>}
                            <input className="wesal-field" value={title} maxLength={85} placeholder="عنوان التعميم" aria-label="العنوان" onChange={event => setTitle(event.target.value)}/>
                            <textarea className="wesal-field" value={body} maxLength={750} rows={3} style={{resize:'vertical'}} placeholder="اكتب تفاصيل التعميم..." aria-label="نص التعميم" onChange={event => setBody(event.target.value)}/>
                            <button type="submit" className="wesal-action" disabled={sending || !title.trim() || !body.trim() || (teacher && !classId)}>{sending ? <LoaderCircle size={17} className="animate-spin"/> : <Send size={17}/>} نشر التعميم</button>
                          </form>}
                          {data.announcements.map(a => <article key={a.id} className="wesal-card">
                            <h3>{a.title}</h3><p style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{a.body}</p>
                            <small>{a.authorName} · {when(a.createdAt)}</small>
                            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:8,marginTop:10}}>
                              <small>اطّلع {a.readCount} على التعميم</small>
                              <button type="button" className="wesal-action" style={{width:'auto',minHeight:32,padding:'6px 10px'}} disabled={a.seen} onClick={() => void ack(a.id)}>
                                <CheckCheck size={14}/> {a.seen ? 'تم الاطلاع' : 'تأكيد الاطلاع'}
                              </button>
                            </div>
                          </article>)}
                          {data.announcements.length === 0 && <p className="wesal-empty">لا توجد تعميمات متاحة حاليًا.</p>}
                        </>
                      )}
                      {tab === 'settings' && <div className="wesal-card"><h3><Bell size={16} style={{display:'inline',marginLeft:6}}/> إشعارات وِصال</h3>
                        <p>يمكنك إخفاء عدّاد الرسائل في الشريط العلوي دون التأثير على الرسائل نفسها.</p>
                        <label style={{display:'flex',alignItems:'center',gap:10,fontSize:12,color:'#e2f7ee'}}><input type="checkbox" checked={noticesEnabled} onChange={event => setNoticesEnabled(event.target.checked)}/> عرض عدّاد الرسائل</label>
                        <p>مراسلات نصية فقط، دون مكالمات أو رسائل صوتية.</p>
                      </div>}
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="wesal-footer">رسائل مدرسية محمية بالصلاحيات، دون مجموعات اجتماعية مفتوحة.</div>
          </section>
        </>, document.body
      )}
    </WesalContext.Provider>
  );
}

export function useWesal() {
  const ctx = React.useContext(WesalContext);
  if (!ctx) throw Error('Wesal provider is missing');
  return ctx;
}

export function WesalLauncher({ lang = 'ar' }: { lang?: 'ar' | 'en' }) {
  const { openWesal, unreadCount } = useWesal();
  return <button type="button" className="wesal-launch" onClick={openWesal} title={lang === 'ar' ? 'فتح وِصال' : 'Open Wesal'} aria-label={lang === 'ar' ? 'فتح وِصال' : 'Open Wesal'}>
    <MessageCircle size={17}/><span>{lang === 'ar' ? 'وِصال' : 'Wesal'}</span>{unreadCount > 0 && <span className="wesal-unread">{unreadCount > 9 ? '9+' : unreadCount}</span>}
  </button>;
}
