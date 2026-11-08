import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const source=readFileSync(new URL('../data/translationBankExtended.ts',import.meta.url),'utf8');
const old=readFileSync(new URL('../data/translationBank.ts',import.meta.url),'utf8');
const studio=readFileSync(new URL('../components/TranslatorAcademy.tsx',import.meta.url),'utf8');
test('extended bank has 60 distinct entries for each level with complete fields',()=>{
 const match=source.match(/= (\{[\s\S]*\});\s*$/);
 assert.ok(match);
 const bank=JSON.parse(match[1]);
 for(const level of ['1','2','3']){
  assert.equal(bank[level].length,60);
  assert.equal(new Set(bank[level].map(t=>t.en)).size,60);
  for(const task of bank[level]){
   for(const field of ['en','ar','contextAr','contextEn','tipAr','tipEn']) assert.ok(typeof task[field]==='string'&&task[field].trim().length>4,field);
  }
 }
 assert.ok(studio.includes('...EXTENDED_TRANSLATION_BANK[level]'));
 assert.ok(studio.includes('qul_translation_last_'));
});
