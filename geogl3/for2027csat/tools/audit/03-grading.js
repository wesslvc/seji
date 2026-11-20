/* 채점기가 너무 후하거나 너무 빡빡하지 않은지 본다.
   - 한 문항 안의 서로 다른 정답끼리 겹치면 아무거나 써도 통과한다
   - 객관식의 오답 보기가 정답으로 인정되면 안 된다 */
const { openApp, check, done } = require('./_lib');

(async () => {
  const { browser, page } = await openApp({ viewport: { width: 900, height: 700 } });
  const r = await page.evaluate(() => {
    const collide = [], loose = [];
    sqPool().map(q => sqToOrdTxt(sqToSA(q))).forEach(q => {
      if (q.t === 'multi' || q.t === 'ordtxt') {
        for (let i = 0; i < q.a.length; i++) for (let j = 0; j < q.a.length; j++) {
          if (i === j) continue;
          if (sqAnsOk(q, q.a[i], q.a[j]))
            collide.push(q.q.slice(0, 36) + ' : "' + q.a[j] + '" → "' + q.a[i] + '"');
        }
      }
      if (q.t === 'txt' && q.opts) q.opts.forEach(o => {
        if (sqSame(o, q.a)) return;
        if (sqAnsOk(q, q.a, o)) loose.push(q.q.slice(0, 36) + ' : 오답 "' + o + '" 인정됨');
      });
    });
    return { collide, loose };
  });
  check('같은 문항 안 정답끼리 안 겹침', r.collide.length === 0, r.collide.slice(0, 5).join(' | '));
  check('오답 보기가 정답으로 안 붙음', r.loose.length === 0, r.loose.slice(0, 5).join(' | '));
  await done(browser);
})();
