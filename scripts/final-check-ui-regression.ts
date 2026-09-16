import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium, webkit, type BrowserType, type Page } from 'playwright';

const BASE = process.env.APP_URL || 'http://127.0.0.1:4173';
const OUTPUT = process.env.QA_OUT || 'audit/final-check';

async function answerCurrent(page: Page, markFirstWrittenWrong: { value: boolean }) {
  const card = page.locator('[data-ui="final-check-question"]');
  const choices = card.locator('[data-ui="final-check-choices"] button');
  if (await choices.count()) {
    await choices.first().click();
    await card.locator('[data-ui="final-check-solution"]').waitFor();
  } else {
    await card.getByRole('button', { name: '解答・解説を見る', exact: true }).click();
    if (!markFirstWrittenWrong.value) {
      await card.getByRole('button', { name: 'もう一度', exact: true }).click();
      markFirstWrittenWrong.value = true;
    } else {
      await card.getByRole('button', { name: 'できた', exact: true }).click();
    }
  }
}

async function run(browserType: BrowserType, name: string) {
  const browser = await browserType.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 393, height: 852 } });
  page.setDefaultTimeout(20_000);
  const pageErrors: string[] = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  const out = path.join(OUTPUT, name);
  fs.mkdirSync(out, { recursive: true });

  try {
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.locator('[data-ui="final-check-launcher"]').waitFor();
    assert.match(await page.locator('[data-ui="final-check-launcher"]').innerText(), /試験前\s*最終チェック/);
    assert.match(await page.locator('[data-ui="workbook-launcher"]').innerText(), /時制・完了形\s*強化練習/);
    await page.screenshot({ path: path.join(out, 'home-mobile.png'), fullPage: true, animations: 'disabled' });

    await page.locator('[data-ui="final-check-launcher"]').click();
    assert.equal(await page.locator('#root').evaluate(root => (root as HTMLElement).inert), true);
    assert.equal(await page.locator('[data-range]').count(), 5);
    assert.equal(await page.locator('[data-strategy]').count(), 2);
    assert.equal(await page.getByRole('button', { name: '20問で最終チェックを始める', exact: true }).count(), 1);
    await page.screenshot({ path: path.join(out, 'setup-mobile.png'), fullPage: true, animations: 'disabled' });

    await page.getByRole('button', { name: '20問で最終チェックを始める', exact: true }).click();
    const ids = new Set<string>();
    const sections: string[] = [];
    const markedWrong = { value: false };
    for (let index = 0; index < 20; index += 1) {
      const card = page.locator('[data-ui="final-check-question"]');
      const id = await card.getAttribute('data-id');
      const section = await card.getAttribute('data-section');
      assert.ok(id && section);
      ids.add(id);
      sections.push(section);
      await answerCurrent(page, markedWrong);
      if (index === 0) await page.screenshot({ path: path.join(out, 'answered-mobile.png'), fullPage: true, animations: 'disabled' });
      await card.getByRole('button', { name: index === 19 ? '結果を見る' : '次の問題', exact: true }).click();
    }
    assert.equal(ids.size, 20);
    const distribution = ['tense1', 'tense2', 'verb1', 'verb2'].map(section => sections.filter(value => value === section).length);
    assert.ok(Math.max(...distribution) - Math.min(...distribution) <= 1, `not balanced: ${distribution}`);
    await page.locator('[data-ui="final-check-result"]').waitFor();
    const resultText = await page.locator('[data-ui="final-check-result"]').innerText();
    for (const label of ['時制・完了形①', '時制・完了形②', '動詞①', '動詞②']) assert.match(resultText, new RegExp(label));
    await page.screenshot({ path: path.join(out, 'result-mobile.png'), fullPage: true, animations: 'disabled' });

    await page.getByRole('button', { name: '範囲と問題数を選び直す', exact: true }).click();
    await page.locator('[data-range="verb2"]').click();
    assert.equal(await page.locator('[data-strategy]').count(), 0);
    assert.equal(await page.locator('[data-count="46"]').innerText(), '全46問');
    await page.locator('[data-count="10"]').click();
    await page.getByRole('button', { name: '10問で最終チェックを始める', exact: true }).click();
    for (let index = 0; index < 10; index += 1) {
      const card = page.locator('[data-ui="final-check-question"]');
      assert.equal(await card.getAttribute('data-section'), 'verb2');
      if (index < 9) await card.getByRole('button', { name: '次の問題', exact: true }).click();
    }

    await page.getByRole('button', { name: '設定画面へ戻る', exact: true }).click();
    await page.locator('[data-range="tense1"]').click();
    await page.locator('[data-count="52"]').click();
    await page.getByRole('button', { name: '52問で最終チェックを始める', exact: true }).click();
    const underlineTargets = new Map([
      ['vq2-final-r1-tense1-05', 'works'],
      ['vq2-final-r2-tense1-07', 'visiting'],
    ]);
    let renderedUnderlines = 0;
    const balancedChoicePositions: number[] = [];
    for (let index = 0; index < 52; index += 1) {
      const card = page.locator('[data-ui="final-check-question"]');
      const id = await card.getAttribute('data-id');
      const expected = id ? underlineTargets.get(id) : undefined;
      const underline = card.locator('[data-ui="final-check-underlined"]');
      if (expected) {
        assert.equal(await underline.innerText(), expected);
        renderedUnderlines += 1;
      } else {
        assert.equal(await underline.count(), 0);
      }
      const choiceButtons = card.locator('[data-ui="final-check-choices"] button');
      if (await choiceButtons.count()) {
        await choiceButtons.first().click();
        const correctChoice = card.locator('[data-state="correct"]');
        await correctChoice.waitFor();
        balancedChoicePositions.push(Number(await correctChoice.getAttribute('data-choice-index')));
        const solutionText = await card.locator('[data-ui="final-check-solution"]').innerText();
        assert.match(solutionText, /正解：[A-D]/);
        assert.doesNotMatch(solutionText, /[①②③④]/);
      }
      if (index < 51) await card.getByRole('button', { name: '次の問題', exact: true }).click();
    }
    assert.equal(renderedUnderlines, 2);
    const positionCounts = [0, 1, 2, 3].map(position => balancedChoicePositions.filter(value => value === position).length);
    assert.equal(balancedChoicePositions.length, 14);
    assert.ok(Math.max(...positionCounts) - Math.min(...positionCounts) <= 1, `choice positions not balanced: ${positionCounts}`);
    assert.ok(balancedChoicePositions.every((position, index, values) => index < 2 || position !== values[index - 1] || position !== values[index - 2]), `three identical positions: ${balancedChoicePositions}`);

    await page.getByRole('button', { name: '設定画面へ戻る', exact: true }).click();
    await page.getByRole('button', { name: 'ホームへ戻る', exact: true }).click();
    assert.equal(await page.locator('#root').evaluate(root => (root as HTMLElement).inert), false);
    await page.getByRole('button', { name: 'テーマ切り替え', exact: true }).click();
    await page.locator('[data-ui="final-check-launcher"]').click();
    await page.screenshot({ path: path.join(out, 'setup-dark.png'), fullPage: true, animations: 'disabled' });
    await page.getByRole('button', { name: 'ホームへ戻る', exact: true }).click();

    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.locator('[data-ui="final-check-launcher"]').click();
    await page.screenshot({ path: path.join(out, 'setup-desktop.png'), fullPage: true, animations: 'disabled' });
    await page.getByRole('button', { name: 'ホームへ戻る', exact: true }).click();
    assert.deepEqual(pageErrors, []);

    return { browser: name, balancedDistribution: distribution, uniqueQuestions: ids.size };
  } finally {
    await browser.close();
  }
}

const results = [];
results.push(await run(chromium, 'chromium'));
results.push(await run(webkit, 'webkit'));
console.log(JSON.stringify({ status: 'passed', results }, null, 2));
