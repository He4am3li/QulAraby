import React from 'react';
import { Search, Eye, MoreHorizontal, RefreshCw, Users, CheckCircle2, Clock3, BarChart3, X, Printer, ChevronLeft, ChevronRight } from 'lucide-react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

type Props = { results: any[]; loading: boolean; profile: any; user: any; lang: 'ar' | 'en'; onPreviewTest: () => void };
const CORE = [{key:'listening',ar:'الاستماع',en:'Listening',color:'#10b981'},{key:'speaking',ar:'التحدث',en:'Speaking',color:'#f43f5e'},{key:'reading',ar:'القراءة',en:'Reading',color:'#6366f1'},{key:'writing',ar:'الكتابة',en:'Writing',color:'#a855f7'}];
export const TeacherStudentLevels: React.FC<Props> = ({results,loading,profile,user,lang,onPreviewTest}) => {
  const ar=lang==='ar';
  const [search,setSearch]=React.useState('');
  const [status,setStatus]=React.useState('all');
  const [page,setPage]=React.useState(1);
  const [selected,setSelected]=React.useState<string[]>([]);
  const [detail,setDetail]=React.useState<any>(null);
  const [confirm,setConfirm]=React.useState<any>(null);
  const [busy,setBusy]=React.useState(false);
  const [error,setError]=React.useState('');
  const [success,setSuccess]=React.useState('');
  const [menu,setMenu]=React.useState<string|null>(null);
  const latest=React.useMemo(()=>{const map=new Map<string,any>(); for(const r of results){const id=r.userId||r.studentEmail||r.id;if(!map.has(id))map.set(id,r)}return [...map.values()]},[results]);
  const filtered=latest.filter(r=>(!search || [r.studentName,r.studentEmail].some(v=>String(v||'').toLowerCase().includes(search.toLowerCase()))) && (status==='all'||(status==='approved'?r.retakeApproved===true:status==='completed'?r.totalScore!=null:r.totalScore==null)));
  const pages=Math.max(1,Math.ceil(filtered.length/8));
  const visible=filtered.slice((Math.min(page,pages)-1)*8,Math.min(page,pages)*8);
  const completed=latest.filter(r=>r.totalScore!=null).length;
  const approved=latest.filter(r=>r.retakeApproved===true).length;
  const score=(r:any,key:string)=>Math.max(0,Math.min(10,Number(r.skillStats?.[key]?.correct)||0));
  const date=(r:any)=>r.completedAt?.seconds?new Date(r.completedAt.seconds*1000).toLocaleDateString(ar?'ar-AE':'en-US'):'—';
  const approve=async()=>{
    if(!confirm||busy)return;
    setError('');setSuccess('');setBusy(true);
    try{
      if(!user?.uid || !['teacher','admin','schoolAdmin'].includes(profile?.role))throw new Error('Not authorized');
      if(profile?.role!=='admin' && (!profile?.schoolId||profile.schoolId!==confirm.schoolId))throw new Error(ar?'الطالب لا ينتمي إلى مدرستك أو لا توجد بيانات مدرسة مؤكدة.':'Student is not in your school.');
      if(!confirm.id || !confirm.userId)throw new Error(ar?'بيانات الطالب غير مكتملة':'Missing student data');
      await updateDoc(doc(db,'placement_results',confirm.id),{retakeApproved:true,retakeApprovedAt:serverTimestamp(),retakeApprovedBy:user.uid});
      setSuccess(ar?'تم السماح بإعادة الاختبار.':'Retake authorized.');
      setConfirm(null);setSelected([]);
    }catch(e:any){setError(e?.message||String(e))}finally{setBusy(false)}
  };
  const selectedRows=latest.filter(r=>selected.includes(r.id));
  return <section dir={ar?'rtl':'ltr'} className="w-full h-full min-h-0 flex flex-col gap-3 p-3 md:p-5 text-slate-800 arabic-font">
    <div className="flex flex-wrap justify-between items-center gap-3 shrink-0">
      <div><h1 className="text-xl md:text-2xl font-black text-slate-900">{ar?'مستويات الطلاب':'Student Levels'}</h1><p className="text-xs text-slate-500 mt-1">{ar?'نتائج تحديد المستوى وإدارة المحاولات':'Placement results and retake management'}</p></div>
      <button onClick={onPreviewTest} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold hover:bg-slate-50">{ar?'معاينة الاختبار':'Preview test'}</button>
    </div>
    <div className="flex flex-wrap gap-2 shrink-0">
      <div className="relative flex-1 min-w-[180px]"><Search size={16} className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-400"/><input value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}} placeholder={ar?'ابحث عن طالب بالاسم أو البريد':'Search students'} className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-9 text-sm outline-none focus:border-emerald-500"/></div>
      <select value={status} onChange={e=>{setStatus(e.target.value);setPage(1)}} className="rounded-xl bg-white border border-slate-200 px-3 py-2 text-xs font-bold">
        <option value="all">{ar?'جميع الحالات':'All statuses'}</option><option value="completed">{ar?'أكملوا الاختبار':'Completed'}</option><option value="approved">{ar?'مسموح بالإعادة':'Retake approved'}</option>
      </select>
    </div>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 shrink-0">
      {[
        {title:ar?'الطلاب الذين أكملوا':'Completed',value:completed,icon:CheckCircle2},
        {title:ar?'متوسط الدرجة':'Average score',value:completed?Math.round(latest.reduce((a,r)=>a+(Number(r.totalScore)||0),0)/completed)+'/80':'—',icon:BarChart3},
        {title:ar?'مسموح لهم بالإعادة':'Retakes approved',value:approved,icon:RefreshCw},
        {title:ar?'إجمالي الطلاب المسجلين بالنتائج':'Students with results',value:latest.length,icon:Users}
      ].map((item,i)=><div key={i} className="rounded-2xl bg-white border border-slate-200 p-3 flex items-center justify-between gap-2"><div><p className="text-[11px] text-slate-500 font-bold">{item.title}</p><p className="text-xl font-black mt-1" dir="ltr">{item.value}</p></div><item.icon size={20} className="text-emerald-600"/></div>)}
    </div>
    <div className="flex-1 min-h-0 overflow-auto bg-white rounded-2xl border border-slate-200">
      <table className="w-full text-xs text-start border-collapse min-w-[790px]"><thead className="sticky top-0 z-10 bg-slate-50 text-slate-600"><tr>
        <th className="p-3 text-start"><input type="checkbox" checked={visible.length>0&&visible.every(r=>selected.includes(r.id))} onChange={e=>setSelected(e.target.checked?[...new Set([...selected,...visible.map(r=>r.id)])]:selected.filter(id=>!visible.some(r=>r.id===id)))}/></th>
        {(ar?['اسم الطالب','الدرجة','نتيجة المهارات','تاريخ الاختبار','الحالة','الإجراءات']:['Student','Score','Skills','Date','Status','Actions']).map(t=><th key={t} className="p-3 text-start font-bold">{t}</th>)}
      </tr></thead><tbody>{loading?<tr><td colSpan={7} className="p-12 text-center">{ar?'جاري تحميل النتائج...':'Loading results...'}</td></tr>:visible.length===0?<tr><td colSpan={7} className="p-12 text-center text-slate-500">{ar?'لا توجد نتائج مطابقة':'No matching results'}</td></tr>:visible.map(r=><tr key={r.id} className="border-t border-slate-100 hover:bg-slate-50">
        <td className="p-3"><input type="checkbox" checked={selected.includes(r.id)} onChange={e=>setSelected(e.target.checked?[...selected,r.id]:selected.filter(id=>id!==r.id))}/></td>
        <td className="p-3"><div className="font-extrabold text-slate-900">{r.studentName||r.studentEmail||'—'}</div><div className="text-[10px] text-slate-400">{r.studentEmail||''}</div></td>
        <td className="p-3 font-extrabold" dir="ltr">{r.totalScore??'—'} / 80</td>
        <td className="p-3"><div className="flex gap-1.5">{CORE.map(c=><div key={c.key} title={`${ar?c.ar:c.en}: ${score(r,c.key)}/10`} className="w-9 h-1.5 rounded-full bg-slate-100 overflow-hidden"><div style={{width:`${score(r,c.key)*10}%`,background:c.color}} className="h-full rounded-full"/></div>)}</div></td>
        <td className="p-3 whitespace-nowrap text-slate-600">{date(r)}</td>
        <td className="p-3"><span className={`rounded-lg px-2 py-1 font-bold whitespace-nowrap ${r.retakeApproved?'bg-blue-50 text-blue-700':'bg-emerald-50 text-emerald-700'}`}>{r.retakeApproved?(ar?'مسموح بالإعادة':'Retake approved'):(ar?'مكتمل':'Completed')}</span></td>
        <td className="p-3"><div className="flex gap-2 items-center"><button onClick={()=>setDetail(r)} className="border border-slate-200 rounded-lg px-2 py-1.5 font-bold hover:bg-slate-100 flex gap-1 items-center"><Eye size={14}/>{ar?'النتيجة':'Result'}</button><button disabled={r.retakeApproved} onClick={()=>setConfirm(r)} className="border border-blue-200 text-blue-700 rounded-lg px-2 py-1.5 font-bold hover:bg-blue-50 disabled:opacity-40" title={ar?'السماح بإعادة الاختبار':'Authorize retake'}><RefreshCw size={14}/></button></div></td>
      </tr>)}</tbody></table>
    </div>
    <div className="shrink-0 flex flex-wrap justify-between items-center gap-2">
      <div className="text-xs text-slate-500">{ar?'عدد الطلاب المحددين':'Selected'}: {selected.length}</div>
      <div className="flex items-center gap-2"><button disabled={page<=1} onClick={()=>setPage(p=>p-1)} className="p-2 border border-slate-200 rounded-lg disabled:opacity-30"><ChevronRight size={16}/></button><span className="text-xs font-bold">{Math.min(page,pages)} / {pages}</span><button disabled={page>=pages} onClick={()=>setPage(p=>p+1)} className="p-2 border border-slate-200 rounded-lg disabled:opacity-30"><ChevronLeft size={16}/></button></div>
      <button disabled={selectedRows.length!==1 || !!selectedRows[0]?.retakeApproved} onClick={()=>setConfirm(selectedRows[0])} className="rounded-xl bg-blue-600 px-4 py-2.5 text-white text-xs font-bold disabled:opacity-40">{ar?'السماح بإعادة الاختبار للطالب المحدد':'Authorize selected student retake'}</button>
    </div>
    {(error||success)&&<p role="status" className={`text-xs font-bold ${error?'text-red-600':'text-emerald-700'}`}>{error||success}</p>}
    {confirm&&<div className="fixed inset-0 z-[100] bg-slate-950/40 flex items-center justify-center p-4"><div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md space-y-4"><h2 className="text-lg font-black">{ar?'السماح بإعادة الاختبار':'Authorize retake'}</h2><p className="text-sm text-slate-600">{ar?'منح محاولة جديدة للطالب':'Allow a new attempt for'} <strong>{confirm.studentName}</strong>؟ {ar?'لن تُحذف النتائج السابقة.':'Previous results will remain saved.'}</p><div className="flex justify-end gap-2"><button onClick={()=>setConfirm(null)} className="border rounded-xl px-4 py-2 text-sm">{ar?'إلغاء':'Cancel'}</button><button disabled={busy} onClick={approve} className="bg-blue-600 text-white rounded-xl px-4 py-2 text-sm disabled:opacity-50">{busy?(ar?'جارٍ الحفظ':'Saving'):(ar?'تأكيد السماح':'Confirm')}</button></div></div></div>}
    {detail&&<div className="fixed inset-0 z-[100] bg-slate-950/40 flex items-center justify-center p-4"><div className="bg-white rounded-2xl shadow-xl p-5 w-full max-w-xl max-h-[85vh] overflow-auto"><div className="flex justify-between items-center mb-4"><h2 className="text-lg font-black">{detail.studentName} — {detail.totalScore}/80</h2><button onClick={()=>setDetail(null)}><X size={20}/></button></div><div className="grid grid-cols-2 gap-2">{Object.entries(detail.skillStats||{}).map(([key,v]:any)=><div key={key} className="border border-slate-200 rounded-xl p-3 flex justify-between"><span>{key}</span><strong>{v?.correct||0}/10</strong></div>)}</div><div className="flex justify-end mt-4"><button onClick={()=>window.print()} className="px-4 py-2 rounded-xl border text-sm flex items-center gap-2"><Printer size={16}/>{ar?'طباعة':'Print'}</button></div></div></div>}
  </section>;
};
