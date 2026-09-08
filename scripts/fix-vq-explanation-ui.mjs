import fs from 'node:fs';

function replaceExactly(path, from, to, expectedCount = 1) {
  let text = fs.readFileSync(path, 'utf8');
  const count = text.split(from).length - 1;
  if (count !== expectedCount) {
    throw new Error(`${path}: expected ${expectedCount} occurrence(s), found ${count}`);
  }
  text = text.replace(from, to);
  fs.writeFileSync(path, text);
}

// 1) Hide only the redundant generic label reported in the VQ question card.
replaceExactly(
  'src/App.tsx',
  `const vqQuestionPrompt = (card: Card) => card.front.includes(card.translation)\n  ? card.front : card.translation + '\\n' + card.front;`,
  `const HIDDEN_VQ_TASK_LABELS = new Set(['日本語に合うように空欄補充']);\nconst vqQuestionPrompt = (card: Card) =>\n  HIDDEN_VQ_TASK_LABELS.has(card.translation) || card.front.includes(card.translation)\n    ? card.front\n    : card.translation + '\\n' + card.front;`
);

// 2) Replace source-only comments with source-backed explanation text.
replaceExactly(
  'src/data/vision_quest_exam_2026.ts',
  `import type { Card } from './cards';`,
  `import type { Card } from './cards';\nimport { getVisionQuestPoint } from './vision_quest_points';`
);

replaceExactly(
  'src/data/vision_quest_exam_2026.ts',
  `const makeComment = (source: string, alternatives: string[] = [], note = '') => {\n  const parts = [\`【出典】\${source}\`];\n  if (alternatives.length) parts.push(\`【資料に明記された別解】\\n\${alternatives.join('\\n')}\`);\n  if (note) parts.push(\`【原資料メモ】\\n\${note}\`);\n  return parts.join('\\n\\n');\n};`,
  `const makeComment = (source: string, alternatives: string[] = [], note = '') => {\n  const parts: string[] = [];\n  const point = getVisionQuestPoint(source);\n  if (point) parts.push(point);\n  if (alternatives.length) parts.push(\`【別解】\\n\${alternatives.join('\\n')}\`);\n  if (note) parts.push(note);\n  return parts.join('\\n\\n');\n};`
);

// 3) Keep source provenance in code/data flow, but never require it to be exposed in the UI comment.
replaceExactly(
  'scripts/validate-vq-exercises.ts',
  `    assert(card.comment.includes('【出典】'), \`\${group.lesson}: missing source label at \${card.id}\`);`,
  `    assert(!card.comment.includes('【出典】'), \`\${group.lesson}: source label must not be exposed at \${card.id}\`);`
);

console.log('Vision Quest explanation/UI patch applied.');
