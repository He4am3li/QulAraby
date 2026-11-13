import React from 'react';
import { createPortal } from 'react-dom';
import {
  Bell, CheckCheck, ChevronRight, LoaderCircle, Megaphone,
  MessageCircle, RefreshCw, Search, Send, Settings2, X
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
function when(time: number, lang: 'ar' | 'en'): string {
  return time ? new Date(time).toLocaleTimeString(lang === 'en' ? 'en-GB' : 'ar-AE', { hour: '2-digit', minute: '2-digit' }) : '';
}
const readLanguage = (): 'ar' | 'en' => typeof window !== 'undefined' && window.localStorage.getItem('hub_lang') === 'en' ? 'en' : 'ar';


export function WesalProvider({ children }: { children: React.ReactNode }) {
  const { user, profile } = useAuth();
  const [lang, setLang] = React.useState<'ar' | 'en'>(readLanguage);
  React.useEffect(() => {
    const syncLanguage = () => setLang(readLanguage());
    window.addEventListener('langChanged', syncLanguage);
    window.addEventListener('storage', syncLanguage);
    return () => {
      window.removeEventListener('langChanged', syncLanguage);
      window.removeEventListener('storage', syncLanguage);
    };
  }, []);
  const tr = (arabic: string, english: string) => lang === 'en' ? english : arabic;
  const roleName = (role?: string) => role === 'schoolAdmin' ? tr('إدارة المدرسة', 'School Administration')
    : role === 'admin' ? tr('مالك قُل', 'QUL Owner')
    : role === 'teacher' ? tr('المعلم', 'Teacher')
    : role === 'student' ? tr('الطالب', 'Student') : tr('مستخدم قُل', 'QUL User');
  // Personal names and messages are user-authored content and must not be silently rewritten.
  const displayName = (name: string) => lang === 'en'
    ? name === 'دعم قُل' ? 'QUL Support' : name === 'إدارة المدرسة' ? 'School Administration' : name === 'مستخدم قُل' ? 'QUL User' : name
    : name;
  const formatTime = (date: number) => when(date, lang);
  const errorText = (error: unknown, arabic: string, english: string) =>
    lang === 'en' ? english : error instanceof Error ? error.message : arabic;
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
      if (live.current && !silent) setError(errorText(e, 'تعذر تحديث المحادثات.', 'Could not refresh conversations.'));
    } finally { if (live.current && !silent) setLoading(false); }
  }, [user, profile?.uid, lang]);

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
      if (live.current && !silent) setError(errorText(e, 'تعذر فتح المحادثة.', 'Could not open this conversation.'));
    } finally { if (live.current && !silent) setLoadingMessages(false); }
  }, [user, lang]);

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
    } catch (e) { setError(errorText(e, 'تعذر إرسال الرسالة.', 'Could not send your message.')); }
    finally { setSending(false); }
  };

  const announce = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user || sending || !title.trim() || !body.trim()) return;
    const manager = data.me?.role === 'schoolAdmin';
    if (!manager && !classId) { setError(tr('اختر صفًا مرتبطًا بك أولًا.', 'Select one of your assigned classes first.')); return; }
    setSending(true); setError('');
    try {
      await wesalRequest(user, { action: 'announce', audience: manager ? 'teachers' : 'class', classId: manager ? '' : classId, title, text: body });
      setTitle(''); setBody('');
      await refresh();
    } catch (e) { setError(errorText(e, 'تعذر نشر التعميم.', 'Could not publish this announcement.')); }
    finally { setSending(false); }
  };

  const ack = async (id: string) => {
    if (!user) return;
    try { await wesalRequest(user, { action: 'ack', id }); await refresh(true); }
    catch (e) { setError(errorText(e, 'تعذر تأكيد القراءة.', 'Could not mark this announcement as read.')); }
  };

  const context = React.useMemo(() => ({ openWesal, unreadCount: noticesEnabled ? data.unreadCount : 0 }), [openWesal, data.unreadCount, noticesEnabled]);
  const contactList = data.contacts.filter(c => c.kind === (tab === 'support' ? 'support' : 'direct'));
  const threadList = data.threads.filter(t => t.kind === (tab === 'support' ? 'support' : 'direct'));
  const matchingContacts = contactList.filter(c => (c.name + ' ' + c.role).toLowerCase().includes(search.toLowerCase()));
  const matchingThreads = threadList.filter(t => (t.peerName + ' ' + t.lastText).toLowerCase().includes(search.toLowerCase()));
  const manager = data.me?.role === 'schoolAdmin';
  const teacher = data.me?.role === 'teacher';
  const tabName: Record<WesalTab, string> = { chats: tr('المحادثات', 'Chats'), contacts: tr('جهات الاتصال', 'Contacts'), announcements: tr('التعميمات', 'Announcements'), support: tr('الدعم', 'Support'), settings: tr('الإعدادات', 'Settings') };

  return (
    <WesalContext.Provider value={context}>
      {children}
      {open && typeof document !== 'undefined' && createPortal(
        <>
          <div className="wesal-overlay" onClick={() => setOpen(false)} aria-hidden="true" />
          <section className="wesal-panel" dir={lang === 'en' ? 'ltr' : 'rtl'} lang={lang} style={{ top: panelTop }} role="dialog" aria-modal="true" aria-label={tr('وِصال، مراسلات قُل', 'Wesal, QUL Messaging')}>
            <header className="wesal-header">
              <div className="wesal-name">
                <strong>{tr('وِصال', 'Wesal')}</strong>
                <span>QUL CONNECT · {roleName(data.me?.role)}</span>
              </div>
              <div className="wesal-header-actions">
                <button className="wesal-icon-button" type="button" onClick={() => void refresh()} title={tr('تحديث الرسائل', 'Refresh messages')} aria-label={tr('تحديث الرسائل', 'Refresh messages')}><RefreshCw size={17}/></button>
                <button className={'wesal-icon-button ' + (tab === 'settings' ? 'wesal-icon-selected' : '')} type="button" onClick={() => changeTab('settings')} title={tr('الإعدادات', 'Settings')} aria-label={tr('إعدادات وِصال', 'Wesal settings')}><Settings2 size={17}/></button>
                <button className="wesal-icon-button" type="button" onClick={() => setOpen(false)} aria-label={tr('إغلاق وِصال', 'Close Wesal')}><X size={18}/></button>
              </div>
            </header>
            <nav className="wesal-segments" aria-label={tr('أقسام وِصال', 'Wesal sections')}>
              {([
                ['chats', tabName.chats],
                ['contacts', tabName.contacts],
                ['announcements', tabName.announcements],
                ['support', tabName.support],
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
                      <button type="button" className="wesal-icon-button" onClick={leaveConversation} aria-label={tr('رجوع', 'Back')}><ChevronRight className="wesal-back-arrow" size={19}/></button>
                      <div className="wesal-avatar">{initial(displayName(peer.name))}</div>
                      <div style={{flex:1,minWidth:0}}><strong dir="auto">{displayName(peer.name)}</strong><small>{peer.kind === 'support' ? tr('مراسلة دعم المدرسة', 'School support') : roleName(peer.role)}</small></div>
                    </div>
                    <div className="wesal-messages" aria-live="polite">
                      {loadingMessages && <div className="wesal-empty">{tr('جاري تحميل المحادثة...', 'Loading conversation...')}</div>}
                      {!loadingMessages && messages.length === 0 && <div className="wesal-empty">{tr('ابدأ محادثتك برسالة قصيرة وواضحة.', 'Start with a short, clear message.')}<span className="wesal-empty-subline">{tr('الرسائل تظهر للأطراف المصرح لها فقط.', 'Only authorized participants can read these messages.')}</span></div>}
                      {messages.map(m => <div dir="auto" className={'wesal-bubble ' + (m.senderUid === data.me?.uid ? 'mine' : '')} key={m.id}>{m.text}<small>{formatTime(m.createdAt)}</small></div>)}
                    </div>
                    {error && <p className="wesal-alert" role="alert">{error}</p>}
                    <form className="wesal-compose" onSubmit={event => void send(event)}>
                      <textarea value={draft} maxLength={1100} onChange={event => setDraft(event.target.value)} onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} rows={2} placeholder={tr('اكتب رسالتك هنا...', 'Write your message...')} aria-label={tr('نص الرسالة', 'Message text')}/>
                      <button className="wesal-send" disabled={sending || !draft.trim()} title={tr('إرسال', 'Send')} aria-label={tr('إرسال الرسالة', 'Send message')} type="submit">{sending ? <LoaderCircle className="animate-spin" size={19}/> : <Send size={19}/>}</button>
                    </form>
                  </>
                ) : (
                  <>
                    <div className="wesal-view-header">
                      <h2>{tab === 'chats' ? tr('الرسائل الأخيرة', 'Recent messages') : tab === 'contacts' ? tr('جهات التواصل', 'Contacts') : tab === 'announcements' ? tr('الإعلانات المدرسية', 'School announcements') : tab === 'support' ? tr('التواصل والدعم', 'Support') : tr('تفضيلات وِصال', 'Wesal preferences')}</h2>
                      {tab === 'chats' && data.unreadCount > 0 && <span className="wesal-pill">{data.unreadCount} {tr('غير مقروءة', 'unread')}</span>}
                    </div>
                    {loading && <p className="wesal-note">{tr('جاري تحديث وِصال...', 'Refreshing Wesal...')}</p>}
                    {error && <p className="wesal-alert" role="alert">{error}</p>}
                    {(tab === 'chats' || tab === 'contacts' || tab === 'support') &&
                      <label className="wesal-search"><Search size={17}/><input value={search} onChange={event => setSearch(event.target.value)} placeholder={tr('ابحث في محادثاتك...', 'Search conversations...')} aria-label={tr('بحث', 'Search')}/></label>}
                    <div className="wesal-scroll">
                      {(tab === 'chats' || tab === 'support') && (
                        <>
                          {(tab === 'support' && manager) && <p className="wesal-note">{tr('قناة مباشرة بين إدارة المدرسة ومالك قُل.', 'Direct support channel between school management and the QUL owner.')}</p>}
                          {matchingThreads.map(t => (
                            <button key={t.id} className="wesal-item" type="button" onClick={() => openContact({uid:t.peerUid,name:t.peerName,role:t.peerRole,kind:t.kind})}>
                              <div className="wesal-avatar-wrap">
                                <div className="wesal-avatar">{initial(displayName(t.peerName))}</div>
                                {t.unread && <span className="wesal-dot" aria-label={tr('رسالة غير مقروءة', 'Unread message')}/>}
                              </div>
                              <div className="wesal-item-text">
                                <div className="wesal-item-heading"><strong dir="auto">{displayName(t.peerName)}</strong><time>{formatTime(t.lastAt)}</time></div>
                                <div dir="auto" className="wesal-message-preview">{t.lastText || tr('افتح المحادثة لقراءة الرسائل', 'Open the conversation to read messages')}</div>
                              </div>
                            </button>
                          ))}
                          {tab === 'support' && contactList.filter(c => !threadList.some(t => t.peerUid === c.uid)).map(c => (
                            <button className="wesal-item" key={c.uid} onClick={() => openContact(c)} type="button"><div className="wesal-avatar-wrap"><div className="wesal-avatar">{initial(displayName(c.name))}</div></div><div className="wesal-item-text"><div className="wesal-item-heading"><strong dir="auto">{displayName(c.name)}</strong><ChevronRight size={15}/></div><div className="wesal-message-preview">{tr('فتح محادثة الدعم', 'Start support conversation')}</div></div></button>
                          ))}
                          {tab === 'chats' && matchingThreads.length === 0 && <div className="wesal-empty">{tr('لا توجد محادثات بعد.', 'No conversations yet.')}<span className="wesal-empty-subline">{tr('ابدأ من «جهات الاتصال».', 'Start from Contacts.')}</span></div>}
                          {tab === 'support' && matchingThreads.length === 0 && contactList.length === 0 && <div className="wesal-empty">{tr('قناة الدعم المباشر متاحة لإدارة المدرسة ومالك قُل.', 'Direct support is available to school managers and the QUL owner.')}<span className="wesal-empty-subline">{tr('ويمكن لبقية المستخدمين الاستعانة بإدارة مدرستهم.', 'Other users can contact their school administration for help.')}</span></div>}
                        </>
                      )}
                      {tab === 'contacts' && (
                        <>
                          <p className="wesal-note">{tr('تظهر فقط الحسابات المرتبطة بك عبر المدرسة والصف وفق الصلاحيات.', 'Only authorized contacts linked to your school and classes are listed.')}</p>
                          {matchingContacts.map(c => <button key={c.uid} type="button" className="wesal-item" onClick={() => openContact(c)}><div className="wesal-avatar-wrap"><div className="wesal-avatar">{initial(c.name)}</div></div><div className="wesal-item-text"><div className="wesal-item-heading"><strong>{c.name}</strong><ChevronRight size={15}/></div><div className="wesal-contact-subtitle">{roleName(c.role)}</div></div></button>)}
                          {matchingContacts.length === 0 && <p className="wesal-empty">{tr('لا توجد جهات متاحة بعد. تأكد من ربط الطلاب بفصولهم وإسناد معلم لكل فصل.', 'No contacts yet. Check class assignments and the assigned teachers.')}</p>}
                          <p className="wesal-note">{tr('التواصل مع ولي الأمر غير متاح إلى أن يتم توثيق حسابه وربطه بابنه.', 'Parent messaging will be available after parent accounts have been verified and linked to students.')}</p>
                        </>
                      )}
                      {tab === 'announcements' && (
                        <>
                          {(manager || teacher) && <form className="wesal-card" onSubmit={event => void announce(event)}>
                            <h3><Megaphone style={{display:'inline',marginLeft:6}} size={17}/> {tr('إنشاء تعميم', 'New announcement')}</h3>
                            <p>{manager ? tr('إلى جميع معلمي مدرستك', 'To all teachers in your school') : tr('إلى طلاب أحد صفوفك', 'To students in one of your classes')}</p>
                            {teacher && <select className="wesal-field" aria-label={tr('اختر الصف', 'Select class')} value={classId} onChange={event => setClassId(event.target.value)}>
                              <option value="">{tr('اختر الصف', 'Select class')}</option>{data.classes.map(c => <option value={c.id} key={c.id}>{c.name}</option>)}
                            </select>}
                            <input className="wesal-field" value={title} maxLength={85} placeholder={tr('عنوان التعميم', 'Announcement title')} aria-label={tr('العنوان', 'Title')} onChange={event => setTitle(event.target.value)}/>
                            <textarea className="wesal-field" value={body} maxLength={750} rows={3} style={{resize:'vertical'}} placeholder={tr('اكتب تفاصيل التعميم...', 'Write the announcement...')} aria-label={tr('نص التعميم', 'Announcement text')} onChange={event => setBody(event.target.value)}/>
                            <button type="submit" className="wesal-action" disabled={sending || !title.trim() || !body.trim() || (teacher && !classId)}>{sending ? <LoaderCircle size={17} className="animate-spin"/> : <Send size={17}/>} {tr('نشر التعميم', 'Publish announcement')}</button>
                          </form>}
                          {data.announcements.map(a => <article key={a.id} className="wesal-card">
                            <h3 dir="auto">{a.title}</h3><p dir="auto" style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{a.body}</p>
                            <small><bdi>{a.authorName}</bdi> · {formatTime(a.createdAt)}</small>
                            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:8,marginTop:10}}>
                              <small>{tr('اطّلع', 'Read by')} {a.readCount} {tr('على التعميم', 'people')}</small>
                              <button type="button" className="wesal-action" style={{width:'auto',minHeight:32,padding:'6px 10px'}} disabled={a.seen} onClick={() => void ack(a.id)}>
                                <CheckCheck size={14}/> {a.seen ? tr('تم الاطلاع', 'Read') : tr('تأكيد الاطلاع', 'Mark as read')}
                              </button>
                            </div>
                          </article>)}
                          {data.announcements.length === 0 && <p className="wesal-empty">{tr('لا توجد تعميمات متاحة حاليًا.', 'No announcements yet.')}</p>}
                        </>
                      )}
                      {tab === 'settings' && <div className="wesal-card"><h3><Bell size={16} style={{display:'inline',marginLeft:6}}/> {tr('إشعارات وِصال', 'Wesal notifications')}</h3>
                        <p>{tr('يمكنك إخفاء عدّاد الرسائل في الشريط العلوي دون التأثير على الرسائل نفسها.', 'Hide the unread badge in the top bar without affecting messages.')}</p>
                        <label style={{display:'flex',alignItems:'center',gap:10,fontSize:12,color:'#e2f7ee'}}><input type="checkbox" checked={noticesEnabled} onChange={event => setNoticesEnabled(event.target.checked)}/> {tr('عرض عدّاد الرسائل', 'Show unread count')}</label>
                        <p>{tr('مراسلات نصية فقط، دون مكالمات أو رسائل صوتية.', 'Text messages only, without calls or voice messages.')}</p>
                      </div>}
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="wesal-footer">{tr('رسائل مدرسية محمية بالصلاحيات، دون مجموعات اجتماعية مفتوحة.', 'School communication protected by role permissions. No open social groups.')}</div>
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
