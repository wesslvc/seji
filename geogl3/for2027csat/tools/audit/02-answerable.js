/* 풀 수 없는 문항 잡기.
   객관식이 단답으로 바뀔 때 보기 목록이 사라지므로, 무엇을 답하라는지가
   문장에도 힌트에도 없으면 답할 방법이 없는 문항이 된다. */
const { openApp, check, done } = require('./_lib');

(async () => {
  const { browser, page } = await openApp({ viewport: { width: 900, height: 700 } });
  const r = await page.evaluate(() => {
    const bad = [];
    sqPool().filter(q => q.t === 'mc').forEach(q => {
      if (!sqCanSA(q)) return;
      const qn = sqNorm(q.q);
      const named = q.opts.some(o => qn.includes(sqNorm(o)));
      if (!named && !q.choices && q.opts.length <= 3) bad.push(q.q);
    });
    const t = {};
    sqPool().map(q => sqToOrdTxt(sqToSA(q))).forEach(q => t[q.t] = (t[q.t] || 0) + 1);
    return { bad, t, hint: sqPool().filter(q => q.choices || q.mnem).length, n: sqPool().length };
  });
  check('대상 불명 문항 0', r.bad.length === 0, r.bad.slice(0, 5).join(' | '));
  console.log('        총 ' + r.n + '문항 · 형식 ' + JSON.stringify(r.t) + ' · 힌트 ' + r.hint);
  await done(browser);
})();
