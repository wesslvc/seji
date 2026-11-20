#!/usr/bin/env bash
# 수특퀴즈 감사 모음 실행.
#   bash tools/audit/run-all.sh
# 빌드 과정이 없는 정적 사이트라, 로컬 정적 서버만 띄우면 된다.
set -u
cd "$(dirname "$0")/../.."

PORT="${SEJI_PORT:-8931}"
export SEJI_URL="http://localhost:$PORT"

# 서버가 이미 떠 있으면 그대로 쓴다 (pkill 금지 — 셸까지 죽는 환경이 있다)
if ! curl -sf -o /dev/null "$SEJI_URL/index.html"; then
  (nohup python3 -m http.server "$PORT" --directory . >/tmp/seji-srv.log 2>&1 &)
  sleep 1
fi
curl -sf -o /dev/null "$SEJI_URL/index.html" || { echo "정적 서버를 못 띄웠습니다"; exit 1; }

# playwright는 전역 설치본을 쓴다 (저장소에 node_modules가 없다)
export NODE_PATH="${NODE_PATH:-/opt/node22/lib/node_modules}"

fail=0
for f in tools/audit/0*.js; do
  echo ""
  echo "=== $(basename "$f") ==="
  node "$f" || fail=1
done
echo ""
[ $fail -eq 0 ] && echo "전체 통과" || echo "실패한 감사가 있습니다"
exit $fail
