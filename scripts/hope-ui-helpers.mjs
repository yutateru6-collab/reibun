// Shared navigation for regression suites after merging the two Hope indexes.
// Keep assertions about source content, timing, storage and VQ modes unchanged.
export async function openHopeMenuFromList(page, deckId, advanced = true) {
  const lessonId = deckId.replace('hope-test', 'hope-lesson');
  await page.locator(`[data-ui="hope-lesson-list"] [data-lesson="${lessonId}"]`).click();
  await page.locator('[data-ui="hope-lesson-menu"]').waitFor();
  if (deckId.startsWith('hope-test')) {
    await page.locator('[data-mode="cloze"]').click();
    await page.getByRole('button', { name: '学習モード選択へ戻る', exact: true }).click();
  }
  if (advanced) await page.locator('[data-ui="hope-more-practice"] summary').click();
}
export async function firstStudyCard(page) {
  const card=page.locator('[data-ui="hope-study-card"] > button, div.cursor-pointer').first();
  await card.waitFor({state:'visible'});
  return card;
}
