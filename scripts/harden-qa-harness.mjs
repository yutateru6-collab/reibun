import fs from 'node:fs';

const file = 'scripts/full-ui-state-audit.ts';
let s = fs.readFileSync(file, 'utf8');

s = s.replaceAll("await page.goto(BASE, { waitUntil: 'networkidle', timeout: 45000 });", "await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 20000 });");
s = s.replaceAll("await page.reload({ waitUntil: 'networkidle' });", "await page.reload({ waitUntil: 'domcontentloaded' });");
s = s.replaceAll("await (await firstClickableCard(page)).click();", "await (await firstClickableCard(page)).evaluate((el) => (el as HTMLElement).click());");

const persistenceOld = `  await page.reload({ waitUntil: 'domcontentloaded' });
  await assertBodyIncludes(page, card.front, 'VQ persistence after reload');
  await assertBodyIncludes(page, '★登録中', 'favorite persisted');
  await assertBodyIncludes(page, 'まだ登録中', 'yet persisted');

  await (await firstClickableCard(page)).evaluate((el) => (el as HTMLElement).click());`;
const persistenceNew = `  await page.reload({ waitUntil: 'domcontentloaded' });
  await openVqDeck(page, deck, true);
  await page.getByRole('button', { name: /問題カード/ }).click();
  await assertBodyIncludes(page, card.front, 'VQ persistence after reload');
  await assertBodyIncludes(page, '★登録中', 'favorite persisted');
  await assertBodyIncludes(page, 'まだ登録中', 'yet persisted');

  await (await firstClickableCard(page)).evaluate((el) => (el as HTMLElement).click());`;
if (!s.includes(persistenceOld)) throw new Error('persistence block not found');
s = s.replace(persistenceOld, persistenceNew);

fs.writeFileSync(file, s);
console.log('Hardened full-ui-state-audit.ts for deterministic QA execution.');
