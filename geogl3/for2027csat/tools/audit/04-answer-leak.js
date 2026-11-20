/* 정답이 문제에 그대로 드러나 있지 않은지 본다.
   ① 순서 배열 문항이 질문에서 항목을 정답 순서대로 나열하면 옮겨 쓰기만 하면 풀린다
   ② 보기를 안 섞으면 “정답은 늘 1번”이 된다 (실제로 81문항 중 80문항이 그랬다)
   ③ 단답 정답이 질문 문장 안에 들어 있으면 안 된다 */
const { openApp, check, done } = require('./_lib');

(async () => {
  const { browser, page } = await openApp({ viewport: { width: 900, height: 700 } });
  const r = await page.evaluate(() => {
    const bank = [].concat(SUTEUK_BANK, SUTEUK_B);

    const stemLeak = bank.filter(q => q.t === 'order').filter(q => {
      const pos = q.a.map(v => q.q.indexOf(v));
      if (pos.some(i => i < 0)) return false;
      return pos.slice().sort((a, b) => a - b).join() === pos.join();
    }).map(q => q.q.slice(0, 44));

    /* 판을 여러 번 짜서 정답 위치가 흩어지는지 본다 */
    const pos = {}; let mc = 0;
    for (let n = 0; n < 20; n++) {
      SQ.cats = null; SQ.fmts = null;
      sqBuildPlan().forEach(q => {
        if (q.t !== 'mc') return;
        mc++; const i = q.opts.indexOf(q.a); pos[i] = (pos[i] || 0) + 1;
      });
    }
    const share = Object.keys(pos).map(k => pos[k] / mc);
    const skew = mc ? Math.max.apply(null, share) : 0;

    const selfLeak = bank.filter(q => (q.t === 'txt' || q.t === 'mc')).filter(q => {
      const a = Array.isArray(q.a) ? q.a[0] : q.a;
      return a && String(a).length >= 3 && sqNorm(q.q).includes(sqNorm(a));
    }).map(q => q.q.slice(0, 44));

    /* 은행 원본이 섞기로 오염되지 않았는지 */
    const intact = bank.filter(q => q.t === 'mc').every(q => q.opts.indexOf(q.a) >= 0);

    return { stemLeak, pos, mc, skew, selfLeak, intact };
  });
  check('순서 문항 질문이 정답 순서를 안 흘림', r.stemLeak.length === 0, r.stemLeak.join(' | '));
  check('객관식 정답 위치가 한 번호에 안 쏠림 (최대 ' + (r.skew * 100).toFixed(0) + '%)',
        r.skew < 0.4, JSON.stringify(r.pos) + ' / ' + r.mc + '문항');
  check('정답이 질문 문장에 안 들어 있음', r.selfLeak.length === 0, r.selfLeak.join(' | '));
  check('보기를 섞어도 원본 문항 은행은 그대로', r.intact);
  await done(browser);
})();
