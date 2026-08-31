/* 감사 스크립트 공용 준비 코드.
   로컬 정적 서버를 띄운 뒤 실행한다 — tools/audit/run-all.sh 참고. */
const { chromium } = require('playwright');

const BASE = process.env.SEJI_URL || 'http://localhost:8931';
const EXEC = process.env.PW_CHROMIUM || '/opt/pw-browsers/chromium';

/* 페이지를 열고 계정 연동을 껍데기로 바꾼다.
   account.js가 localStorage.setItem/removeItem을 감싸 두기 때문에
   지우지 않으면 테스트가 서버로 점수를 쏘려다 멈춘다. */
async function openApp(opts) {
  opts = opts || {};
  const browser = await chromium.launch({ executablePath: EXEC });
  const page = await browser.newPage({ viewport: opts.viewport || { width: 1100, height: 900 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(BASE + '/index.html?cb=' + Date.now());
  await page.waitForTimeout(opts.wait || 900);
  await page.evaluate(() => {
    delete localStorage.setItem; delete localStorage.removeItem;
    window.SejiAccount = {
      isLoggedIn: () => false, isAdmin: () => false,
      promptLogin: () => {}, submitScore: async () => {}
    };
    localStorage.clear();
  });
  return { browser, page, errors };
}

/* 통과/실패를 셈해 두었다가 프로세스 종료 코드로 돌려준다. */
let failed = 0;
function check(label, ok, detail) {
  console.log((ok ? '  PASS  ' : '  FAIL  ') + label + (detail ? ' — ' + detail : ''));
  if (!ok) failed++;
}
function done(browser) {
  return browser.close().then(() => {
    console.log(failed ? '\n실패 ' + failed + '건' : '\n모두 통과');
    process.exit(failed ? 1 : 0);
  });
}

module.exports = { openApp, check, done, BASE };
