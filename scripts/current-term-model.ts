import assert from 'node:assert/strict';
import { recitations, practice, CLASSES, classItems, canonical, cloze, checkCloze, checkOrder, orderTokens, finalSample, FAVORITES_KEY, YET_KEY } from '../src/current-term/model';
import { basicExampleDecks } from '../src/data/cards';
assert.equal(recitations.length,72);
assert.equal(practice.length,67);
assert.equal(classItems('2-9').filter(x=>x.source==='recitation').length,38);
assert.equal(classItems('2-3').filter(x=>x.source==='recitation').length,34);
assert.equal(FAVORITES_KEY,'flashcard-favorites:2026-midterm-v1');
assert.equal(YET_KEY,'flashcard-yet-list:2026-midterm-v1');
for(const item of [...recitations,...practice]) {
  assert.ok(item.focus && canonical(item.en).includes(item.focus),item.id+' focus');
  assert.equal(cloze(item).split('［　　　　］').length,2,item.id+' one blank');
  assert.equal(cloze(item).replace('［　　　　］',item.focus),canonical(item.en),item.id+' reconstruction');
  assert.ok(checkCloze(item,item.focus.toUpperCase()),item.id+' casing');
  for(const a of item.alternatives)assert.ok(checkCloze(item,a||'省略'),item.id+' variant '+a);
  assert.ok(!checkCloze(item,'definitely incorrect'),item.id+' wrong');
  assert.ok(checkOrder(item,orderTokens(item)),item.id+' tokens');
  assert.ok(!checkOrder(item,orderTokens(item).slice(1)),item.id+' missing token');
  if(item.originalId){const original=basicExampleDecks.flatMap(d=>d.cards).find(c=>c.id===item.originalId)!;assert.equal(item.en,original.front);assert.equal(item.ja,original.translation);}
}
for(const c of ['2-3','2-9'] as const) {
  const items=classItems(c),ids=new Set(items.map(x=>x.id));
  assert.equal(items.length,ids.size);
  assert.ok(items.every(x=>x.lesson?CLASSES[c].lessons.includes(x.lesson):CLASSES[c].topics.includes(x.unit as any)));
  for(const n of [10,20,items.length,999])for(let run=0;run<25;run++){
    const sample=finalSample(items,n);
    assert.equal(sample.length,Math.min(n,items.length));
    assert.equal(new Set(sample.map(x=>x.id)).size,sample.length);
    assert.ok(sample.every(x=>ids.has(x.id)));
    assert.equal(new Set(sample.map(x=>x.unit)).size,new Set(items.map(x=>x.unit)).size);
  }
}
console.log('PASS: 72 unchanged recitations, 67 original practice items, class isolation, all cloze reconstructions/variants, all reorder token sets, balanced final checks, stable legacy storage keys');
