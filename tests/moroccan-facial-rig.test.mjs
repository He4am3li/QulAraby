import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { validateMoroccanManifest, planMoroccanFrame, paintMoroccan, resolveMoroccanAttention } from '../services/moroccanFacialRig.mjs';
import { getTutorStageDirection, getTutorPartnerDirection, TUTOR_BODY_VIEWPORT } from '../services/tutorAttention.mjs';
const read=actor=>JSON.parse(fs.readFileSync(`public/avatars/${actor}-facial-v1.json`));
test('Moroccan identities, source hashes and facial PNG dimensions are exact',()=>{
 for(const actor of ['yassine','kenza']){
  const m=read(actor);assert.equal(validateMoroccanManifest(m,actor),m);
  assert.equal(crypto.createHash('sha256').update(fs.readFileSync('public'+m.source)).digest('hex'),m.sourceSha256);
  for(const v of Object.values(m.layers)){const b=fs.readFileSync('public'+v.url);assert.equal(b.toString('hex',0,8),'89504e470d0a1a0a');assert.equal(b.readUInt32BE(16),v.w);assert.equal(b.readUInt32BE(20),v.h);}
 }
});
test('invalid identity, path, missing mouth and covering fail closed',()=>{
 for(const actor of ['yassine','kenza'])for(const mutate of [m=>m.characterId='saudi_male',m=>m.layers.Eyes_Left.url='/other.png',m=>delete m.layers.Mouth_A,m=>m.layers.Mouth_O.w++]){const m=read(actor);mutate(m);assert.equal(validateMoroccanManifest(m,actor),null);}
 const m=read('kenza');m.coverings=['FaceCover'];assert.equal(validateMoroccanManifest(m,'kenza'),null);
});
test('Moroccan partner positions remain inward in both interface languages',()=>{
 assert.deepEqual(TUTOR_BODY_VIEWPORT,{x:100,y:0,w:824,h:1536});
 for(const lang of ['en','ar']){assert.equal(getTutorStageDirection('morocco',lang),'rtl');assert.equal(getTutorPartnerDirection('morocco','male',lang),'left');assert.equal(getTutorPartnerDirection('morocco','female',lang),'right');}
 assert.deepEqual(resolveMoroccanAttention({isSpeaking:true,partnerSpeaking:true,partnerDirection:'left'}),{state:'speaking',gazeX:0});
 assert.deepEqual(resolveMoroccanAttention({partnerSpeaking:true,partnerDirection:'right'}),{state:'listening',gazeX:1});
 assert.deepEqual(resolveMoroccanAttention({isListening:true}),{state:'listening',gazeX:0});
});
test('blink covers side gaze and expressions affect face only',()=>{
 const commands=planMoroccanFrame(read('kenza'),{state:'listening',blink:1,gazeX:2});
 assert.deepEqual(commands.map(x=>x.name),['Brows_Attentive','Eyes_Right','Eyes_Closed']);
 assert.equal(commands[2].alpha,1);
 assert.deepEqual(planMoroccanFrame(read('yassine'),{state:'idle'}),[]);
});
test('listener ignores active partner lip cues',()=>{
 const m=read('kenza'),calls=[],ctx={drawImage(image){calls.push(image)},save(){},restore(){}};
 const images=Object.fromEntries(Object.keys(m.layers).map(k=>[k,k]));
 paintMoroccan(ctx,{manifest:m,original:'body',images,mouth:null},{state:'listening',gazeX:2,lips:{active:true,weights:{A:1}}});
 assert.equal(calls.at(-1),'Mouth_Smile');assert.ok(calls.includes('Mouth_Smile'));assert.ok(!calls.includes('Mouth_A'));
});
