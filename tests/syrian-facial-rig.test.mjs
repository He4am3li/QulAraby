import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { validateSyrianManifest, planSyrianFrame, paintSyrian, resolveSyrianAttention } from '../services/syrianFacialRig.mjs';
import { getTutorStageDirection, getTutorPartnerDirection, TUTOR_BODY_VIEWPORT } from '../services/tutorAttention.mjs';
const read=actor=>JSON.parse(fs.readFileSync(`public/avatars/${actor}-facial-v1.json`));
test('Syrian identities, source hashes and facial PNG dimensions are exact',()=>{
 for(const actor of ['bassel','sham']){
  const m=read(actor);assert.equal(validateSyrianManifest(m,actor),m);
  assert.equal(crypto.createHash('sha256').update(fs.readFileSync('public'+m.source)).digest('hex'),m.sourceSha256);
  for(const v of Object.values(m.layers)){const b=fs.readFileSync('public'+v.url);assert.equal(b.toString('hex',0,8),'89504e470d0a1a0a');assert.equal(b.readUInt32BE(16),v.w);assert.equal(b.readUInt32BE(20),v.h);}
 }
});
test('invalid identity, path, missing mouth and covering fail closed',()=>{
 for(const actor of ['bassel','sham'])for(const mutate of [m=>m.characterId='saudi_male',m=>m.layers.Eyes_Left.url='/other.png',m=>delete m.layers.Mouth_A,m=>m.layers.Mouth_O.w++]){const m=read(actor);mutate(m);assert.equal(validateSyrianManifest(m,actor),null);}
 const m=read('sham');m.coverings=['FaceCover'];assert.equal(validateSyrianManifest(m,'sham'),null);
});
test('Syrian partner positions remain inward in both interface languages',()=>{
 assert.deepEqual(TUTOR_BODY_VIEWPORT,{x:100,y:0,w:824,h:1536});
 for(const lang of ['en','ar']){assert.equal(getTutorStageDirection('syria',lang),'rtl');assert.equal(getTutorPartnerDirection('syria','male',lang),'left');assert.equal(getTutorPartnerDirection('syria','female',lang),'right');}
 assert.deepEqual(resolveSyrianAttention({isSpeaking:true,partnerSpeaking:true,partnerDirection:'left'}),{state:'speaking',gazeX:0});
 assert.deepEqual(resolveSyrianAttention({partnerSpeaking:true,partnerDirection:'right'}),{state:'listening',gazeX:1});
 assert.deepEqual(resolveSyrianAttention({isListening:true}),{state:'listening',gazeX:0});
});
test('blink covers side gaze and expressions affect face only',()=>{
 const commands=planSyrianFrame(read('sham'),{state:'listening',blink:1,gazeX:2});
 assert.deepEqual(commands.map(x=>x.name),['Brows_Attentive','Eyes_Right','Eyes_Closed']);
 assert.equal(commands[2].alpha,1);
 assert.deepEqual(planSyrianFrame(read('bassel'),{state:'idle'}),[]);
});
test('listener ignores active partner lip cues',()=>{
 const m=read('sham'),calls=[],ctx={drawImage(image){calls.push(image)},save(){},restore(){}};
 const images=Object.fromEntries(Object.keys(m.layers).map(k=>[k,k]));
 paintSyrian(ctx,{manifest:m,original:'body',images,mouth:null},{state:'listening',gazeX:2,lips:{active:true,weights:{A:1}}});
 assert.equal(calls.at(-1),'Mouth_Smile');assert.ok(calls.includes('Mouth_Smile'));assert.ok(!calls.includes('Mouth_A'));
});
