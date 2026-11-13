import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  pickCanvasState, pickStudentDrawing, MAX_CANVAS_BYTES, MAX_SUBMISSION_BYTES
} from '../services/liveWhiteboardState.mjs';

const file = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
let passed = 0;
const check = (label, fn) => { fn(); passed++; console.log('PASS: ' + label); };
const state = {
  title:'التعلم', pages:[{id:'p1',title:'مرحبا',elements:[{
    id:'e1',type:'text',text:'أهلا',x:10,y:20,color:'#ffffff'
  }]}], currentPageIndex:0, isLocked:true,
  wordBox:['مرحبا'], students:{private:{name:'student'}},
  activeActivity:{submissions:{secret:{answer:'Private learner answer'}}},
  teacherId:'private-teacher', joinCode:'SECRET',
  score:2000
};
check('shared teacher canvas contains only allowlisted public teaching fields', () => {
  const shared=pickCanvasState(state);
  assert.deepEqual(Object.keys(shared).sort(),
    ['pages','currentPageIndex','isLocked','wordBox','title'].sort());
  assert.equal(JSON.stringify(shared).includes('Private learner answer'),false);
  assert.equal(shared.teacherId,undefined);
  assert.equal(shared.joinCode,undefined);
});
check('teacher drawing and page order survive projection', () => {
  const shared=pickCanvasState(state);
  assert.equal(shared.pages[0].elements[0].text,'أهلا');
  assert.equal(shared.currentPageIndex,0);
  assert.equal(shared.isLocked,true);
});
check('invalid remote canvas fails closed', () => {
  assert.throws(() => pickCanvasState({pages:[]}),/INVALID_CANVAS_STATE/);
  assert.throws(() => pickCanvasState({pages:[{id:'x'}]}),/INVALID_CANVAS_STATE/);
  assert.throws(() => pickCanvasState({...state,currentPageIndex:500}),/INVALID_CANVAS_PAGE/);
});
check('student drawings are copies, not shared mutable teacher elements', () => {
  const source=[{id:'a',type:'path',color:'#fff',points:[{x:1,y:2}]}];
  const result=pickStudentDrawing(source);
  result[0].points[0].x=99;
  assert.equal(source[0].points[0].x,1);
});
check('student work payload enforces an element ceiling', () => {
  const many=Array.from({length:151},(_,i)=>({id:String(i),type:'text'}));
  assert.throws(()=>pickStudentDrawing(many),/TOO_MANY_ELEMENTS/);
});
check('student work payload refuses invalid items', () => {
  assert.throws(()=>pickStudentDrawing([{type:'text'}]),/INVALID_DRAWING/);
  assert.throws(()=>pickStudentDrawing([null]),/INVALID_DRAWING/);
});
check('student work payload refuses oversized private images', () => {
  assert.throws(()=>pickStudentDrawing([{id:'img',type:'image',src:'x'.repeat(MAX_SUBMISSION_BYTES)}]),/DRAWING_TOO_LARGE/);
});
check('huge teacher canvas cannot silently exceed Firestore limits', () => {
  const huge={...state,pages:[{id:'page',elements:[{id:'img',type:'image',src:'x'.repeat(MAX_CANVAS_BYTES)}]}]};
  assert.throws(()=>pickCanvasState(huge),/CANVAS_TOO_LARGE/);
});
const app=file('App.tsx');
const page=file('pages/Whiteboard.tsx');
const hook=file('components/useLiveWhiteboardCanvas.ts');
const work=file('components/useClassroomStudentWork.ts');
const modal=file('components/whiteboard/StudentWorksModal.tsx');
check('learner toolbar submit dispatches an actual whiteboard action', () => {
  assert.match(app,/qul_student_toolbar_action/);
  assert.match(page,/handleSendStudentAnswer/);
  assert.match(page,/void handleSendStudentAnswer\(\)/);
});
check('student answer submission writes to the secure Firestore service', () => {
  assert.match(work,/setDoc\(doc\(db, 'live_sessions', sessionId, 'student_work', uid\)/);
  assert.match(work,/submittedAt:\s*serverTimestamp\(\)/);
  assert.match(page,/await submit\(/);
});
check('teacher receives a Firestore work subscription', () => {
  assert.match(work,/onSnapshot\(collection\(db, 'live_sessions', sessionId, 'student_work'\)/);
  assert.match(modal,/submittedWork/);
  assert.match(page,/submittedWork=\{submissions\}/);
});
check('student sees only their own work document', () => {
  assert.match(work,/onSnapshot\(doc\(db, 'live_sessions', sessionId, 'student_work', uid\)/);
});
check('teacher updates grade through Firestore with server timestamp', () => {
  assert.match(work,/score, feedback: feedback.trim\(\), reviewedAt: serverTimestamp\(\)/);
  assert.match(modal,/onGradeSubmission/);
});
check('teacher broadcasts canvas changes, students do not write canvas', () => {
  assert.match(hook,/if \(!sessionId \|\| !uid \|\| !isTeacher \|\| !ready\) return;/);
  assert.match(hook,/onSnapshot\(ref,/);
  assert.match(hook,/updateDoc\(doc\(db, 'live_sessions', sessionId, 'canvas', 'main'\)/);
});
check('no learner drawing directly modifies teacher shared pages', () => {
  assert.match(page,/if \(!isTeacher\) \{/);
  assert.match(page,/setDraftPack\(prev =>/);
  assert.match(page,/draftMode \? \(draftPack.pages\[currentPage.id\]/);
});
check('fake teacher roster and fictional learner submissions removed from live default', () => {
  assert.doesNotMatch(page,/st_1.*أحمد علي/);
  assert.doesNotMatch(page,/st_2.*سارة محمد/);
  assert.doesNotMatch(page,/activeActivity:\s*\{[\s\S]*?st_2/);
});
console.log('Live whiteboard security and synchronization checks passed: '+passed);
