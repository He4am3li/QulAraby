import assert from 'node:assert/strict';
import { Window } from 'happy-dom';
import { indexedDB } from 'fake-indexeddb';
import { build } from 'esbuild';
import { mkdir, rm } from 'node:fs/promises';
import path from 'node:path';

const window = new Window({ url: 'https://radio.test/' });
for (const key of ['window','document','navigator','HTMLElement','Element','Node','Event','CustomEvent','localStorage','sessionStorage','File','Blob']) {
  Object.defineProperty(globalThis,key,{value:key==='window'?window:window[key],configurable:true,writable:true});
}
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
globalThis.indexedDB = indexedDB;
window.matchMedia = () => ({ matches: true, addEventListener(){}, removeEventListener(){} });
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const realTimeout = window.setTimeout.bind(window);
window.setTimeout = (fn,ms,...args) => realTimeout(fn, ms === 5000 ? 1 : ms, ...args);
const urls = new Map(); let serial=0, currentSpeech=null, spoken=[], voices=[];
URL.createObjectURL = blob => {const url='blob:radio-test-'+(++serial);urls.set(url,blob);return url;};
URL.revokeObjectURL = url => urls.delete(url);
window.speechSynthesis = Object.assign(new window.EventTarget(), {
  speaking:false,paused:false,getVoices:()=>voices,
  speak(speech){currentSpeech=speech;spoken.push(speech);this.speaking=true;},
  cancel(){currentSpeech=null;this.speaking=false;this.paused=false;},
  pause(){this.paused=true;},resume(){this.paused=false;}
});
globalThis.SpeechSynthesisUtterance = class {constructor(text){this.text=text;}};
const audios=[];
globalThis.Audio = class {
  constructor(src=''){this._src=src;this.paused=true;this.currentTime=0;this.duration=10;audios.push(this);}
  get src(){return this._src;} set src(value){this._src=value;queueMicrotask(()=>this.onloadedmetadata?.());}
  play(){this.paused=false;return Promise.resolve();} pause(){this.paused=true;}
  removeAttribute(){this._src='';}load(){}
};
window.HTMLMediaElement.prototype.pause=function(){};
const param=()=>({value:0,setValueAtTime(){},exponentialRampToValueAtTime(){},linearRampToValueAtTime(){}});
const node=()=>({connect(){},start(){},stop(){},frequency:param(),gain:param(),Q:param()});
globalThis.AudioContext=window.AudioContext=class {
  constructor(){this.state='running';this.currentTime=0;this.sampleRate=24000;this.destination={};}
  createGain(){return node();}createOscillator(){return node();}createBiquadFilter(){return node();}
  createBufferSource(){return node();}createBuffer(channels,length){return {getChannelData:()=>new Float32Array(length)};}
  resume(){return Promise.resolve();}close(){return Promise.resolve();}
};
const streams=[];let permission='allow', resolvePermission;
function stream(){const track={stopped:false,stop(){this.stopped=true;}};const value={getTracks:()=>[track]};streams.push(value);return value;}
Object.defineProperty(navigator,'mediaDevices',{value:{getUserMedia:()=>{
  if(permission==='deny')return Promise.reject(new Error('denied'));
  if(permission==='pending')return new Promise(resolve=>resolvePermission=()=>resolve(stream()));
  return Promise.resolve(stream());
}}});
globalThis.MediaRecorder=class {
  constructor(stream){this.stream=stream;this.state='inactive';this.mimeType='audio/webm';}
  start(){this.state='recording';}stop(){this.state='inactive';queueMicrotask(()=>{this.ondataavailable?.({data:new Blob(['voice'],{type:this.mimeType})});this.onstop?.();});}
};
const React=await import('react');const {act}=React;const {createRoot}=await import('react-dom/client');
const stub=path.resolve('tests/radio-browser-stubs.tsx');
const motionStub='import React from "react";const cache=new Map();export const motion=new Proxy({},{get(_,tag){if(!cache.has(tag))cache.set(tag,React.forwardRef(({initial,animate,exit,transition,layout,whileHover,whileTap,children,...props},ref)=>React.createElement(tag,{...props,ref},children)));return cache.get(tag);}});export const AnimatePresence=({children})=>children;';
await mkdir('node_modules/.cache',{recursive:true});
const outfile=path.resolve('node_modules/.cache/radio-ui.mjs');
await build({entryPoints:['pages/Listening.tsx'],outfile,bundle:true,platform:'node',format:'esm',packages:'external',loader:{'.css':'empty'},plugins:[{name:'isolate-radio',setup(build){
  build.onResolve({filter:/^(?:\.\.\/|\.\/)(?:components\/)?(?:AuthProvider|CassettePlayer|PageHeader)$/},()=>({path:stub}));
  build.onResolve({filter:/^\.\.\/(?:firebase|services\/gemini)$/},()=>({path:stub}));
  build.onResolve({filter:/^framer-motion$/},()=>({path:'motion-stub',namespace:'test'}));
  build.onLoad({filter:/.*/,namespace:'test'},()=>({contents:motionStub,loader:'js',resolveDir:process.cwd()}));
}}]});
const {Listening}=await import('file://'+outfile);
const {MemoryRouter}=await import('react-router-dom');
const container=document.createElement('div');document.body.append(container);let root;
const flush=()=>act(async()=>{await delay(15);});
const mount=async()=>{root=createRoot(container);await act(async()=>root.render(React.createElement(MemoryRouter,null,React.createElement(Listening))));await flush();};
const button=(name)=>{const found=[...container.querySelectorAll('button')].find(b=>b.getAttribute('aria-label')===name||b.textContent.trim()===name);assert.ok(found,'Missing button '+name);return found;};
const click=async(name)=>{const b=typeof name==='string'?button(name):name;assert.ok(!b.disabled,'Disabled '+(b.textContent||name));await act(async()=>{b.click();await delay(10);});await flush();};
const seed=()=>localStorage.setItem('qul_radio_text_history_v1:radio-test',JSON.stringify({'beginner:scenario':{remaining:['beginner-scenario-01'],last:null,cycle:1}}));
const tune=async()=>{seed();await click([...container.querySelectorAll('button')].find(b=>b.textContent.includes('Beginner')));await click([...container.querySelectorAll('aside button')].find(b=>b.textContent.includes('الراديو')));await click('موقف');await flush();};
const finishSpeech=async()=>{let count=0;await act(async()=>{while(currentSpeech){assert.ok(++count<100);const speech=currentSpeech;currentSpeech=null;speech.onend?.();}window.speechSynthesis.speaking=false;});await flush();};
const finishQuiz=async()=>{for(let i=0;i<5;i++){await click(container.querySelector('.qul-radio-printer-options button'));if(i<4)await click('التالي');}};
const errors=[];const originalError=console.error;console.error=(...args)=>{errors.push(args.join(' '));originalError(...args);};
try {
  await mount();await tune();
  const initialPanels=container.querySelectorAll('.qul-original-radio-speaker');
  assert.ok(initialPanels[0].querySelector('[lang=en]')?.textContent.trim(), 'Translation visible before playback');
  assert.ok(initialPanels[1].querySelector('[lang=ar]')?.textContent.trim(), 'Arabic visible before playback');
  assert.match(container.querySelector('.qul-radio-printer-name').textContent,/راديو قُل/);
  const dial=container.querySelector('[role=slider]');
  await click(dial); assert.equal(dial.getAttribute('aria-valuenow'),'60');
  await act(async()=>dial.dispatchEvent(new window.KeyboardEvent('keydown',{key:'End',bubbles:true})));
  assert.equal(dial.getAttribute('aria-valuenow'),'100');
  await click('تشغيل الراديو');assert.match(container.querySelector('[role=alert]').textContent,/لا يوجد صوت عربي/);
  assert.equal(container.querySelector('.qul-radio-printer-question'),null);
  voices=[{name:'Local Arabic Enhanced',voiceURI:'local-ar',lang:'ar-SA',localService:true},{name:'Cloud Arabic',voiceURI:'cloud',lang:'ar-SA',localService:false}];
  await act(async()=>window.speechSynthesis.dispatchEvent(new Event('voiceschanged')));
  assert.equal(container.querySelectorAll('.qul-radio-audio-options select')[0].options.length,1);
  await click('جرّب الصوت');await finishSpeech();assert.equal(container.querySelector('.qul-radio-printer-question'),null,'Preview must not complete first listen');
  await click('تشغيل الراديو');assert.equal(currentSpeech.volume,1);await click(dial);assert.equal(currentSpeech.volume,0);
  await act(async()=>dial.dispatchEvent(new window.KeyboardEvent('keydown',{key:'End',bubbles:true})));assert.equal(currentSpeech.volume,1);await click('إيقاف مؤقت');assert.equal(window.speechSynthesis.paused,true);
  await click('تشغيل الراديو');await finishSpeech();assert.ok(container.querySelector('.qul-radio-printer-question'));
  await finishQuiz();await click('الاستماع الثاني');await finishSpeech();
  const panels=container.querySelectorAll('.qul-original-radio-speaker');
  assert.ok(panels[0].querySelector('[lang=en]'));assert.ok(panels[1].querySelector('[lang=ar]'));
  await click('Toggle language');assert.ok(panels[0].querySelector('[lang=en]'));await click('Toggle language');
  await finishQuiz();await click('إنهاء وتقييم');await click('المفردات الجديدة');
  assert.equal(container.querySelectorAll('.qul-radio-word-row').length,4);
  assert.match(container.querySelector('.qul-radio-words-grid').textContent,/مستعدready/);
  console.log('PASS: voice availability, preview, pause/resume, both listens, five questions, language order, four words');
  const phone='تدريب شفهي: سجّل إجابتك واستمع إليها';
  await click(phone);await click('بدء التدريب الشفهي');await click('بدء التسجيل');assert.ok(streams.length);
  await click('إيقاف التسجيل');assert.ok(streams.at(-1).getTracks().every(t=>t.stopped));
  assert.ok(container.querySelector('audio[controls]'));assert.ok([...urls.values()].some(blob=>blob.type==='audio/webm'));
  await click('إنهاء التدريب');assert.equal(container.querySelector('audio[controls]'),null);assert.equal(urls.size,0);
  await click(phone);await click('بدء التدريب الشفهي');permission='deny';await click('بدء التسجيل');assert.match(container.textContent,/تعذّر فتح الميكروفون/);
  permission='pending';await click('بدء التسجيل');await click('إنهاء التدريب');await act(async()=>{resolvePermission();await delay(10);});
  assert.ok(streams.at(-1).getTracks().every(t=>t.stopped),'Late permission stream must close');
  permission='allow';await click(phone);await click('بدء التدريب الشفهي');await click('بدء التسجيل');await click('حوار');
  assert.ok(streams.at(-1).getTracks().every(t=>t.stopped),'Station change must stop microphone');
  console.log('PASS: local recording, replay, deletion, permission denial, late permission and station-change cleanup');
  await tune();
  const input=container.querySelector('input[type=file]');
  const file=new File(['RIFF mock audio'],'teacher.wav',{type:'audio/wav'});
  Object.defineProperty(input,'files',{value:[file],configurable:true});
  await act(async()=>{input.dispatchEvent(new Event('change',{bubbles:true}));await delay(30);});await flush();
  assert.match(container.textContent,/التسجيل المستخدم: teacher.wav/);
  const before=spoken.length;await click('تشغيل الراديو');assert.equal(spoken.length,before);assert.ok(audios.at(-1).src.startsWith('blob:'));
  await act(async()=>audios.at(-1).onended?.());await flush();assert.ok(container.querySelector('.qul-radio-printer-question'));
  await act(async()=>root.unmount());assert.equal(urls.size,0,'Unmount must revoke recording URL');
  await mount();await tune();assert.match(container.textContent,/التسجيل المستخدم: teacher.wav/,'Recording survives remount for the same text');
  await click('إزالة التسجيل المحلي');assert.doesNotMatch(container.textContent,/التسجيل المستخدم/);
  console.log('PASS: local recording import, preferred playback, end-of-audio progress, persistent reload and removal');
  assert.equal(errors.length,0,'No React/runtime errors');
  console.log('ALL RADIO UI TESTS PASSED (DOM, speech and microphone APIs mocked; no hardware/audio-quality assertion)');
} finally {await act(async()=>root?.unmount());console.error=originalError;await rm(outfile,{force:true});await window.happyDOM.close();}
