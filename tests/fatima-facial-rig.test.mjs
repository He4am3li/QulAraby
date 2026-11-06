import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {validateFatimaManifest,planFatimaFrame,paintFatima,resolveFatimaAttention} from '../services/fatimaFacialRig.mjs';
import {REST_LIPS,SpeechLipSync} from '../services/speechLipSync.mjs';
import {getTutorStageDirection,getTutorPartnerDirection} from '../services/tutorAttention.mjs';
const manifest=JSON.parse(fs.readFileSync(new URL('../public/avatars/fatima-facial-v2.json',import.meta.url)));
test('Fatima assets have their declared dimensions and retain the reviewed source',()=>{
 assert.ok(validateFatimaManifest(manifest));
 const original=fs.readFileSync(new URL('../public'+manifest.source,import.meta.url));
 assert.equal(crypto.createHash('sha256').update(original).digest('hex'),manifest.sourceSha256);
 for(const l of Object.values(manifest.layers)) {
  const png=fs.readFileSync(new URL('../public'+l.url,import.meta.url));
  assert.equal(png.readUInt32BE(16),l.w); assert.equal(png.readUInt32BE(20),l.h);
  assert.ok(l.y>=100&&l.y+l.h<=230,'expression must stay within face');
 }
});
test('invalid identity, unreviewed assets, traversal and mouth misregistration fail closed',()=>{
 for(const mutate of [m=>m.version=1,m=>m.characterId='libya_female',m=>m.status='draft',m=>delete m.layers.Mouth_FV,
  m=>m.layers.Mouth_A.x++,m=>m.layers.Eyes_Left.url='/avatars/fatima-layers/../other.png',
  m=>m.layers.Blink_L_Closed.w=1024]){const m=structuredClone(manifest);mutate(m);assert.equal(validateFatimaManifest(m),null);}
});
test('Egyptian body poses face inward in both languages without reversing other countries',()=>{
 for(const lang of ['ar','en']) {
  assert.equal(getTutorStageDirection('egypt',lang),'rtl');
  assert.equal(getTutorPartnerDirection('egypt','male',lang),'left');
  assert.equal(getTutorPartnerDirection('egypt','female',lang),'right');
 }
 assert.equal(getTutorStageDirection('qatar','en'),'ltr');
 assert.equal(getTutorPartnerDirection('qatar','male','en'),'right');
 assert.equal(getTutorPartnerDirection('qatar','female','ar'),'right');
});
test('complete blinks suppress gaze, invalid inputs remain bounded, idle preserves source',()=>{
 assert.deepEqual(planFatimaFrame(manifest),[]);
 assert.deepEqual(planFatimaFrame(manifest,{blink:NaN,gazeX:Infinity}),[]);
 const commands=planFatimaFrame(manifest,{blink:99,gazeX:-99});
 assert.deepEqual(commands.map(c=>c.name),['Blink_R_Closed','Blink_L_Closed']);
 assert.ok(commands.every(c=>c.alpha===1));
});
test('speaking without playback does not animate lips; stop returns original face',()=>{
 const calls=[];const original={};const sync=new SpeechLipSync();
 const context={drawImage:(...args)=>calls.push(args)};
 paintFatima(context,{original,manifest},{state:'speaking',lips:sync.read()});
 assert.equal(sync.read(),REST_LIPS);assert.equal(calls.length,1);assert.equal(calls[0][0],original);
});
test('Fatima smiles on success and retry without touching clothing',()=>{
 const calls=[];const layer=manifest.layers.Mouth_Smile;const smile={};
 paintFatima({drawImage:(...args)=>calls.push(args)},{original:{},manifest,images:{Mouth_Smile:smile}},{state:'retry'});
 assert.deepEqual(calls[1],[smile,layer.x,layer.y,layer.w,layer.h]);
});
test('attention follows Ahmed in both layouts and returns to the student on her turn',()=>{
 assert.deepEqual(resolveFatimaAttention({partnerSpeaking:true,partnerDirection:'left'}),{state:'listening',gazeX:-1});
 assert.deepEqual(resolveFatimaAttention({partnerSpeaking:true,partnerDirection:'right'}),{state:'listening',gazeX:1});
 assert.deepEqual(resolveFatimaAttention({isSpeaking:true,partnerSpeaking:true}),{state:'speaking',gazeX:0});
 assert.deepEqual(resolveFatimaAttention({isListening:true}),{state:'listening',gazeX:0});
 assert.deepEqual(resolveFatimaAttention({isLoading:true}),{state:'thinking',gazeX:0});
 assert.deepEqual(resolveFatimaAttention(),{state:'idle',gazeX:0});
});
test('eye turns replace pupils completely and speech emphasis is bounded',()=>{
 for(const gazeX of [-1,-0.1,0.1,1]) {
  const eyes=planFatimaFrame(manifest,{gazeX}).find(c=>c.name.startsWith('Eyes_'));
  assert.equal(eyes.alpha,1,'a semi-transparent gaze would double the original pupils');
 }
 assert.deepEqual(planFatimaFrame(manifest,{state:'speaking',emphasis:0}),[]);
 assert.equal(planFatimaFrame(manifest,{state:'speaking',emphasis:99})[0].alpha,0.35);
 assert.equal(planFatimaFrame(manifest,{state:'listening'})[0].alpha,0.16);
});
test('listening uses a closed smile while speaking keeps the output-audio mouth',()=>{
 const calls=[];const assets={original:{},manifest,images:{Brows_Thinking:{},Mouth_Smile:{}}};
 paintFatima({drawImage:(...args)=>calls.push(args),save(){},restore(){}},assets,{state:'listening',lips:REST_LIPS});
 assert.equal(calls.at(-1)[0],assets.images.Mouth_Smile);
 assert.equal(calls.length,3,'listening draws original, attentive brows and a closed smile only');
});
