import assert from 'node:assert/strict';
import { QUESTION_BANK, originalQuestions, transformedQuestions, applicationQuestions } from '../src/workbook/bank';
import { makeWorksheet, answerLabel, validWorksheet, eligible, FORMATS, type Selection } from '../src/workbook/model';
import { basicTestDecks } from '../src/data/cards';
import { vq3_1_Cards, vq3_2_Cards, vq3_1_QuestionsCards, vq3_2_QuestionsCards } from '../src/data/vision_quest_exam_2026';
const selection: Selection = { unit:'both',format:'all',counts:{original:10,transformed:5,application:5},shuffle:true,shuffleChoices:true,grouping:'sections' };
assert.equal(new Set(QUESTION_BANK.map(q=>q.id)).size, QUESTION_BANK.length);
assert.equal(originalQuestions.length,56); assert.equal(transformedQuestions.length,32); assert.equal(applicationQuestions.length,40);
const sources = [...vq3_1_QuestionsCards,...vq3_2_QuestionsCards,...basicTestDecks.find(d=>d.id==='hope-test3')!.cards];
for(const q of originalQuestions) {
 const source=sources.find(c=>c.id===q.sourceId)!; assert.ok(source);
 assert.equal(q.prompt,q.unit==='hope3'?source.front+'\n'+source.translation:source.front);
 assert.equal(q.answer,source.back); assert.ok(q.explanation.includes(source.comment));
}
for(const q of transformedQuestions) {
 const source=[...vq3_1_Cards,...vq3_2_Cards].find(c=>c.id===q.sourceId)!; assert.ok(source); assert.equal(q.answer,source.back);
 if(q.tokens) assert.equal(q.tokens.join(' '),source.back);
 else assert.ok(q.prompt.startsWith(source.translation+'\n'));
}
for(const q of QUESTION_BANK) {
 assert.ok(q.prompt&&q.answer&&q.instruction&&q.explanation,q.id);
 if(q.choices) { assert.equal(new Set(q.choices.map(c=>c.text)).size,q.choices.length); assert.equal(q.choices.find(c=>c.id===q.correctId)?.text,q.answer); }
}
const untouched=JSON.stringify(QUESTION_BANK); const now=new Date('2026-09-13T11:00:00Z');
for(let seed=0;seed<300;seed++) {
 const w=makeWorksheet(QUESTION_BANK,selection,seed,now);
 assert.ok(validWorksheet(w)); assert.equal(w.questions.length,20); assert.equal(new Set(w.questions.map(q=>q.id)).size,20);
 assert.deepEqual(w,makeWorksheet(QUESTION_BANK,selection,seed,now));
 for(const q of w.questions.filter(q=>q.choices)) assert.ok(answerLabel(q).endsWith(q.answer));
 for(const q of w.questions.filter(q=>q.tokens)) assert.deepEqual([...q.tokens!].sort(),q.answer.split(/\s+/).sort());
 const roundtrip=JSON.parse(JSON.stringify(w)); assert.ok(validWorksheet(roundtrip)); assert.deepEqual(roundtrip,w);
}
assert.equal(JSON.stringify(QUESTION_BANK),untouched);
const all=makeWorksheet(QUESTION_BANK,{...selection,counts:{original:-1,transformed:-1,application:-1}},1,now);
assert.equal(all.questions.length,118);assert.ok(!all.questions.some(q=>q.unit==='hope3'));
for(const unit of ['tense1','tense2','hope3'] as const) for(const format of ['all',...Object.keys(FORMATS)]) {
 const s={...selection,unit,format} as Selection;
 const p=eligible(QUESTION_BANK,s);assert.ok(p.every(q=>q.unit===unit));
 if(p.length) assert.equal(makeWorksheet(QUESTION_BANK,{...s,counts:{original:-1,transformed:-1,application:-1}},9,now).questions.length,p.length);
}
assert.throws(()=>makeWorksheet(QUESTION_BANK,{...selection,counts:{original:999,transformed:0,application:0}}));
assert.throws(()=>makeWorksheet(QUESTION_BANK,{...selection,counts:{original:0,transformed:0,application:0}}));
for(const invalid of [null,{},[],{...all,questions:[]},{...all,questions:[all.questions[0],all.questions[0]]},{...all,version:'bad'}]) assert.equal(validWorksheet(invalid),false);
console.log(JSON.stringify({status:'passed',questions:QUESTION_BANK.length,original:56,transformed:32,application:40,seeds:300,originalContentPreserved:true},null,2));
