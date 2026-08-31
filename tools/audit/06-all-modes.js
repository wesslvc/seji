/* 수특퀴즈를 건드리다 다른 퀴즈 모드를 깨뜨리지 않았는지 본다.
   11개 모드를 차례로 열어 세션이 서고 페이지 오류가 없는지만 확인한다. */
const { openApp, check, done } = require('./_lib');

const MODES = [['name','all'],['border','all'],['rborder','all_nomap'],['religion','all_rM'],
               ['texp','all_dM'],['timp','all_dM'],['tenergy','all_eM'],['river','all_vL'],
               ['climate','all_clM'],['suteuk','all_sqM']];

(async () => {
  const { browser, page, errors } = await openApp({ viewport: { width: 1100, height: 820 } });
  for (const [act, key] of MODES) {
    await page.evaluate(([a, k]) => startSession('world', [a], k, k), [act, key]);
    await page.waitForTimeout(450);
    const ok = await page.evaluate(() => ({
      tab: SESSION.cur, inSess: document.body.classList.contains('in-session')
    }));
    check(act.padEnd(10), ok.tab === act && ok.inSess, JSON.stringify(ok));
    await page.evaluate(() => endSession());
    await page.waitForTimeout(150);
  }
  await page.evaluate(() => startSession('korea', ['korea'], 'M'));
  await page.waitForTimeout(500);
  check('korea'.padEnd(10), await page.evaluate(() => SESSION.cur === 'korea'));
  await page.evaluate(() => endSession());
  check('페이지 오류 없음', errors.length === 0, errors.slice(0, 3).join(' | '));
  await done(browser);
})();
