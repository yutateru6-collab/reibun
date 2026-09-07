import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import path from 'node:path';

const PUBLIC_URL = process.env.PUBLIC_URL || 'https://reibun.itisnowornever271.workers.dev';
const OUT_DIR = path.resolve('audit/ui-ux');
rmSync(OUT_DIR, { recursive: true, force: true });
mkdirSync(OUT_DIR, { recursive: true });

const report = {
  generatedAt: new Date().toISOString(),
  publicUrl: PUBLIC_URL,
  states: [],
};

const sleep = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

async function collectState(page, viewportName, stateName, screenshotName, { fullPage = true } = {}) {
  await sleep();
  const viewport = page.viewportSize();
  const dom = await page.evaluate(() => {
    const visible = (el) => {
      const style = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) !== 0 && rect.width > 0 && rect.height > 0;
    };

    const selector = (el) => {
      if (el.id) return `#${el.id}`;
      const tag = el.tagName.toLowerCase();
      const cls = [...el.classList].slice(0, 3).join('.');
      return cls ? `${tag}.${cls}` : tag;
    };

    const vw = document.documentElement.clientWidth;
    const vh = window.innerHeight;
    const all = [...document.querySelectorAll('body *')].filter(visible);

    const overflow = all
      .map((el) => {
        const r = el.getBoundingClientRect();
        return {
          selector: selector(el),
          text: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 100),
          left: Math.round(r.left),
          right: Math.round(r.right),
          width: Math.round(r.width),
        };
      })
      .filter((x) => x.left < -1 || x.right > vw + 1)
      .slice(0, 30);

    const interactive = [...document.querySelectorAll('button, a, input, select, textarea, [role="button"]')]
      .filter(visible)
      .map((el) => {
        const r = el.getBoundingClientRect();
        const label = (el.getAttribute('aria-label') || el.getAttribute('title') || el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 100);
        return {
          selector: selector(el),
          label,
          width: Math.round(r.width),
          height: Math.round(r.height),
          x: Math.round(r.x),
          y: Math.round(r.y),
        };
      });

    const smallTapTargets = interactive.filter((x) => x.width < 44 || x.height < 44).slice(0, 40);
    const unnamedInteractive = interactive.filter((x) => !x.label).slice(0, 40);

    const tinyText = all
      .map((el) => {
        const ownText = [...el.childNodes].filter((n) => n.nodeType === Node.TEXT_NODE).map((n) => n.textContent || '').join(' ').replace(/\s+/g, ' ').trim();
        if (!ownText) return null;
        const style = getComputedStyle(el);
        const size = parseFloat(style.fontSize || '0');
        if (size >= 12) return null;
        const r = el.getBoundingClientRect();
        return {
          selector: selector(el),
          text: ownText.slice(0, 100),
          fontSize: size,
          x: Math.round(r.x),
          y: Math.round(r.y),
        };
      })
      .filter(Boolean)
      .slice(0, 40);

    const bodyStyle = getComputedStyle(document.body);
    return {
      viewport: { width: vw, height: vh },
      document: {
        scrollWidth: document.documentElement.scrollWidth,
        scrollHeight: document.documentElement.scrollHeight,
        horizontalOverflowPx: Math.max(0, document.documentElement.scrollWidth - vw),
        bodyFontFamily: bodyStyle.fontFamily,
        bodyFontSize: bodyStyle.fontSize,
      },
      interactiveCount: interactive.length,
      overflow,
      smallTapTargets,
      unnamedInteractive,
      tinyText,
    };
  });

  let axe = { violations: [], passes: 0, incomplete: 0 };
  try {
    const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    axe = {
      passes: result.passes.length,
      incomplete: result.incomplete.length,
      violations: result.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        help: v.help,
        helpUrl: v.helpUrl,
        nodes: v.nodes.slice(0, 10).map((n) => ({ target: n.target, failureSummary: n.failureSummary })),
      })),
    };
  } catch (error) {
    axe = { error: String(error), violations: [], passes: 0, incomplete: 0 };
  }

  const screenshotPath = path.join(OUT_DIR, screenshotName);
  await page.screenshot({ path: screenshotPath, fullPage });
  report.states.push({ viewportName, stateName, screenshot: screenshotName, dom, axe });
}

async function cleanStart(page) {
  await page.goto(PUBLIC_URL, { waitUntil: 'networkidle', timeout: 60000 });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle', timeout: 60000 });
}

async function goBasic(page) {
  await page.getByRole('button', { name: /基本例文マスター/ }).click();
  await page.getByRole('heading', { name: '基本例文マスター' }).waitFor();
}

async function goLesson1Standard(page) {
  const lesson1 = page.locator('button').filter({ hasText: /^Lesson 1/ }).first();
  await lesson1.click();
  await page.getByText('学習モードを選択してください').waitFor();
  await page.getByRole('button', { name: /単語カード/ }).click();
  await page.getByText('There are many books on the president’s life.', { exact: true }).waitFor();
}

async function openFirstCardBackAndHint(page) {
  await page.getByText('There are many books on the president’s life.', { exact: true }).click();
  await page.getByText('✅').first().waitFor({ state: 'visible' }).catch(() => {});
  const hint = page.getByRole('button', { name: /ヒント/ });
  await hint.waitFor({ state: 'visible' });
  await hint.click();
  await page.getByText(/There are ～/).first().waitFor({ state: 'visible' });
}

async function auditViewport(browser, viewportName, viewport) {
  const context = await browser.newContext({
    viewport,
    colorScheme: 'light',
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  await cleanStart(page);
  await collectState(page, viewportName, 'top', `${viewportName}-01-top.png`);

  await goBasic(page);
  await collectState(page, viewportName, 'basic-example-list', `${viewportName}-02-basic-list.png`);

  const testsTab = page.getByRole('button', { name: /公式穴埋め（54）/ });
  await testsTab.click();
  await collectState(page, viewportName, 'basic-official-tests', `${viewportName}-03-official-tests.png`);
  await page.getByRole('button', { name: /例文（110）/ }).click();

  const lesson1 = page.locator('button').filter({ hasText: /^Lesson 1/ }).first();
  await lesson1.click();
  await collectState(page, viewportName, 'lesson1-mode-menu', `${viewportName}-04-lesson1-menu.png`);

  await page.getByRole('button', { name: /単語カード/ }).click();
  await collectState(page, viewportName, 'lesson1-card-front', `${viewportName}-05-card-front.png`, { fullPage: false });

  await page.getByText('There are many books on the president’s life.', { exact: true }).click();
  await collectState(page, viewportName, 'lesson1-card-back', `${viewportName}-06-card-back.png`, { fullPage: false });

  const hint = page.getByRole('button', { name: /ヒント/ });
  await hint.click();
  await collectState(page, viewportName, 'lesson1-mini-explanation-open', `${viewportName}-07-mini-explanation.png`);

  await cleanStart(page);
  await page.getByRole('button', { name: /VISION QUEST/ }).click();
  await collectState(page, viewportName, 'vision-quest-list', `${viewportName}-08-vision-quest.png`);

  await context.close();
}

const browser = await chromium.launch({ headless: true });
try {
  await auditViewport(browser, 'mobile390', { width: 390, height: 844 });
  await auditViewport(browser, 'small320', { width: 320, height: 568 });
  await auditViewport(browser, 'desktop1440', { width: 1440, height: 1000 });
} finally {
  await browser.close();
}

const summaries = report.states.map((state) => ({
  viewport: state.viewportName,
  state: state.stateName,
  horizontalOverflowPx: state.dom.document.horizontalOverflowPx,
  smallTapTargets: state.dom.smallTapTargets.length,
  unnamedInteractive: state.dom.unnamedInteractive.length,
  tinyText: state.dom.tinyText.length,
  axeViolations: state.axe.violations.length,
}));
report.summary = summaries;
writeFileSync(path.join(OUT_DIR, 'report.json'), JSON.stringify(report, null, 2));
writeFileSync(path.join(OUT_DIR, 'summary.json'), JSON.stringify(summaries, null, 2));

console.log(JSON.stringify({
  screenshotCount: report.states.length,
  states: summaries,
}, null, 2));
