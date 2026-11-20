/* 진행 중이던 판을 불러올 때, 문항을 고친 내용이 반영되는지 본다.
   저장본에는 문항 객체가 통째로 들어가므로 sqRefreshPlan()이 없으면
   옛 문장이 영원히 남는다. 진행(몇 번째·점수)은 유지되어야 한다. */
const { openApp, check, done } = require('./_lib');

(async () => {
  const { browser, page, errors } = await openApp({ viewport: { width: 1000, height: 800 } });
  await page.evaluate(() => {
    startSession('world', ['suteuk'], 'all_sq', 'all_sq');
    SQ.idx = 46; SQ.cor = 32; SQ.wr = 13; SQ.pts = 96;
    /* 아무 단답 문항 하나의 문장을 옛것으로 되돌려 저장본을 오염시킨다 */
    const i = SQ.plan.findIndex(q => q.t === 'txt' || q.t === 'mc');
    SQ.plan[i]._orig = SQ.plan[i].q;
    SQ.plan[i].q = '△△ 옛 문장 △△';
    SQ.idx = i; sqSave();
  });
  await page.evaluate(() => { SQ.inited = false; SQ.plan = []; endSession(); });
  await page.waitForTimeout(200);
  await page.evaluate(() => startSession('world', ['suteuk'], 'all_sq', 'all_sq'));
  await page.waitForTimeout(500);
  const r = await page.evaluate(() => ({
    cor: SQ.cor, wr: SQ.wr, pts: SQ.pts,
    stale: SQ.plan.some(q => /옛 문장/.test(q.q))
  }));
  check('옛 문장이 지금 문항으로 갈아 끼워짐', r.stale === false);
  check('진행과 점수는 유지 (정답' + r.cor + ' 오답' + r.wr + ' ' + r.pts + '점)',
        r.cor === 32 && r.wr === 13 && r.pts === 96);
  check('페이지 오류 없음', errors.length === 0, errors.slice(0, 3).join(' | '));
  await done(browser);
})();
