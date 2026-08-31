/* 모든 수특퀴즈 문항을 정답으로 끝까지 풀어 본다.
   한 문항이라도 채점이 안 되거나 오답 처리되면 문항 데이터나 채점기가 깨진 것이다. */
const { openApp, check, done } = require('./_lib');

const KEYS = ['all_sq', 'all_sq_sqcnat', 'all_sq_sqfmap', 'all_sq_sqcpop_sqftext'];

(async () => {
  const { browser, page, errors } = await openApp();
  for (const fk of KEYS) {
    await page.evaluate(() => localStorage.clear());
    await page.evaluate(k => startSession('world', ['suteuk'], k, k), fk);
    await page.waitForTimeout(400);
    const n = await page.evaluate(() => SQ.plan.length);
    const stuck = [];
    for (let i = 0; i < n + 3; i++) {
      if (await page.evaluate(() => SQ.idx >= SQ.plan.length)) break;
      const r = await page.evaluate(() => {
        const q = SQ.plan[SQ.idx];
        if (q.t === 'map') sqMapClick(q.iso);
        else if (q.t === 'mc' && q.climap) {
          const j = q.opts.findIndex(o => sqSame(o, q.a));
          document.querySelectorAll('#sq-m-cards .sq-pcard')[j].click();
        } else if (q.t === 'mc') {
          const j = q.opts.findIndex(o => sqSame(o, q.a));
          document.querySelectorAll('#sq-ans .sq-opt')[j].click();
        } else if (q.t === 'order') {
          q.a.forEach(v => {
            const x = [...document.querySelectorAll('#sq-ans .sq-opt')]
              .find(y => !y.classList.contains('used') && sqSame(y.textContent, v));
            if (x) x.click();
          });
        } else if (q.t === 'txt') {
          const inp = document.getElementById('sq-input');
          inp.value = Array.isArray(q.a) ? q.a[0] : q.a; sqSubmit();
        } else if (q.t === 'multi' || q.t === 'ordtxt') {
          q.a.forEach(v => {
            const inp = document.getElementById('sq-input');
            if (!inp || inp.disabled) return;
            inp.value = v; sqSubmit();
          });
        }
        return { ok: SQ.answered, t: q.t, q: q.q.slice(0, 44) };
      });
      if (!r.ok) stuck.push(r.t + ' ' + r.q);
      await page.evaluate(() => sqNext());
    }
    const res = await page.evaluate(() => ({ cor: SQ.cor, wr: SQ.wr, pts: SQ.pts }));
    check(fk.padEnd(24) + n + '문항 정답' + res.cor + ' 오답' + res.wr + ' ' + res.pts + '점',
          res.wr === 0 && stuck.length === 0, stuck.slice(0, 3).join(' / '));
    await page.evaluate(() => {
      const e = document.getElementById('sq-end'); if (e) e.classList.remove('on');
      endSession();
    });
  }
  check('페이지 오류 없음', errors.length === 0, errors.slice(0, 3).join(' | '));
  await done(browser);
})();
