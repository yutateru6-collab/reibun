import { basicExampleDecks } from '../data/cards';
import { CONTENT_VERSION } from '../data/exam_source_ledger';
import focusData from './focus.json';
import { grammarItems, TOPICS, type Topic } from './grammar';

export const RELEASE = '2026-final-classes-v1';
export type ClassId = '2-3' | '2-9';
export type Mode = 'cards' | 'cloze' | 'order' | 'final';
export type Item = {
  id: string; originalId?: number; lesson?: number; number?: number;
  unit: string; label: string; source: 'recitation' | 'original';
  en: string; ja: string; focus: string; alternatives: string[]; explanation: string;
};
export const CLASSES: Record<ClassId, { title: string; lessons: number[]; topics: Topic[]; range: string }> = {
  '2-3': { title: '2年3組', lessons: [5,6,7,8], topics: ['adjectives','relatives'], range: '暗唱⑤〜⑧・形容詞・関係詞' },
  '2-9': { title: '2年9組', lessons: [1,2,3,4], topics: ['modals','agreement','adjectives'], range: '暗唱①〜④・助動詞・Build Up 2・形容詞' },
};
export const LESSON_TITLES = ['','主語','動詞','時制・完了形','助動詞','形容詞','関係詞','副詞','話法'];
export const CIRCLED = ['','①','②','③','④','⑤','⑥','⑦','⑧'];
const variants: Record<number,string[]> = {
  4001:['a lot of books','lots of books'],4006:['To study abroad'],
  4011:['stayed','was'],4013:['go into'],
  4016:['took care of'],4023:['was'],4028:['have to','need to'],4029:['must','need to'],
  4030:['I have got to','I have to','I must'],4031:['You had better','You should','You ought to'],
  4032:['ought to'],4033:['ought not to','shouldn’t'],4034:['may','might','can'],4035:['might','could','can'],4036:['may','could'],
  4037:['ought to have checked'],4038:['may have sent','could have sent'],4048:['that'],4049:['that'],
  4052:['in which'],4053:['during which','in which',''],4054:['for which',''],4061:['Though','Even though'],
  4068:['proposed'],4071:['It is said that'],4072:['They say that'],
};

// Reuse the existing cards and stable IDs; the underlying 110 source sentences
// and the legacy storage version are deliberately unchanged.
export const recitations: Item[] = basicExampleDecks.slice(0,8).flatMap((deck,li) => deck.cards.map((card,ni) => ({
  id:`hope-${card.id}`, originalId:card.id, lesson:li+1, number:ni+1, unit:`hope-${li+1}`,
  label:`暗唱${CIRCLED[li+1]} / No.${ni+1}`, source:'recitation' as const,
  en:card.front, ja:card.translation, focus:(focusData as Record<string,string>)[card.id],
  alternatives:variants[card.id] ?? [],
  // The old third line is a decorative quip. Keep the concise grammar line only
  // in this new view; the previous view remains unmodified.
  explanation:card.comment.split('\n')[1] || '',
})));
export const practice: Item[] = grammarItems.map(g => ({id:g.id,unit:g.topic,label:g.point,source:'original',en:g.en,ja:g.ja,focus:g.focus,alternatives:g.alternatives,explanation:g.explanation}));
export const FAVORITES_KEY = `flashcard-favorites:${CONTENT_VERSION}`;
export const YET_KEY = `flashcard-yet-list:${CONTENT_VERSION}`;
export const PROGRESS_KEY = 'reibun:final26:progress:v1';
export const NEW_FAVORITES_KEY = 'reibun:final26:favorites:v1';
export const HISTORY_KEY = 'reibun:final26:history:v1';
export type Progress = Record<string,{ correct: number; attempts: number; lastCorrect: boolean }>;
export type Attempt = { id:string; correct:boolean; kind:'cloze'|'order'; selfChecked:boolean };
export type History = { classId:ClassId; date:string; correct:number; total:number; mode:Mode };

export function classItems(c:ClassId):Item[] {
  const config=CLASSES[c];
  return [...recitations.filter(x=>config.lessons.includes(x.lesson!)), ...practice.filter(x=>config.topics.includes(x.unit as Topic))];
}
export function unitTitle(unit:string):string {
  if(unit.startsWith('hope-')){const l=Number(unit.slice(5));return `暗唱${CIRCLED[l]} ${LESSON_TITLES[l]}`;}
  return TOPICS[unit as Topic]?.title || unit;
}
export function canonical(en:string):string {return en.replace(/\s*\[[^\]]+\]/g,'').trim();}
export function cloze(item:Item):string {return canonical(item.en).replace(item.focus,'［　　　　］');}
export function normalise(value:string):string {
  return value.normalize('NFKC').replace(/[‘’]/g,"'").replace(/[“”]/g,'"').toLowerCase().replace(/\s+/g,' ').trim().replace(/[.!?。]+$/,'').trim();
}
export function acceptedAnswers(item:Item):string[]{return [item.focus,...item.alternatives];}
export function checkCloze(item:Item,input:string):boolean {
  const answer=/^(省略|なし|∅|omit)$/i.test(input.trim())?'':input;
  return acceptedAnswers(item).some(x=>normalise(x)===normalise(answer));
}
export function orderTokens(item:Item):string[]{return canonical(item.en).split(/\s+/);}
export function checkOrder(item:Item,tokens:string[]):boolean {
  return tokens.join(' ')===canonical(item.en);
}
export function shuffled<T>(items:readonly T[]):T[]{
  const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;
}
// Round-robin across all active units guarantees coverage before adding a second
// question from any unit. Never select questions from the other class.
export function finalSample(items:Item[],count:number):Item[]{
  const groups=new Map<string,Item[]>();
  for(const item of shuffled(items))groups.set(item.unit,[...(groups.get(item.unit)||[]),item]);
  const out:Item[]=[];
  while(out.length<Math.min(count,items.length)) for(const group of groups.values()) {
    if(out.length>=count)break;
    const item=group.pop();if(item)out.push(item);
  }
  return shuffled(out);
}
export function readStored<T>(key:string,fallback:T):T {
  try {
    const raw=localStorage.getItem(key); if(!raw)return fallback;
    const parsed=JSON.parse(raw);
    if(Array.isArray(fallback))return Array.isArray(parsed)?parsed as T:fallback;
    if(fallback!==null&&typeof fallback==='object')return parsed!==null&&typeof parsed==='object'&&!Array.isArray(parsed)?parsed:fallback;
    return typeof parsed===typeof fallback?parsed:fallback;
  }catch{return fallback;}
}
export function writeStored(key:string,value:unknown):boolean {
  try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{return false;}
}
