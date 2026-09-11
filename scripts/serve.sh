#!/usr/bin/env bash
# Grapsee Shop server supervisor — used by hand AND by the GitHub
# self-hosted runner (server.yml / keepalive.yml).
#
#   scripts/serve.sh start [--build]  start both servers (restart loop)
#   scripts/serve.sh stop             stop both servers
#   scripts/serve.sh check            probe both, exit 0 only if ALL up
#   scripts/serve.sh status           show PIDs + probe results
set -u
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LOGDIR="$ROOT/logs"
BACKEND_PID="$LOGDIR/backend.pid"
FRONTEND_PID="$LOGDIR/frontend.pid"
BACKEND_PORT="${BACKEND_PORT:-3000}"
FRONTEND_PORT="${FRONTEND_PORT:-3002}"

probe() { # $1=url -> "up (ms=X)" or "DOWN"
  local url="$1" start ms code
  start=$(date +%s%3N)
  code=$(curl -s -o /dev/null -w "%{http_code}" -m 10 "$url" 2>/dev/null || echo 000)
  ms=$(( $(date +%s%3N) - start ))
  if [ "$code" = "200" ]; then echo "up (ms=$ms)"; else echo "DOWN (http=$code)"; fi
}

backend_url() { echo "http://127.0.0.1:$BACKEND_PORT/api/health"; }
frontend_url() { echo "http://127.0.0.1:$FRONTEND_PORT/"; }

running() { [ -f "$1" ] && kill -0 "$(cat "$1")" 2>/dev/null; }

supervise() { # $1=name $2=dir $3=cmd $4=pidfile — restarts forever until pidfile removed
  local name="$1" dir="$2" cmd="$3" pidfile="$4"
  echo "$BASHPID" > "$pidfile"
  while [ -f "$pidfile" ] && [ "$(cat "$pidfile")" = "$BASHPID" ]; do
    echo "[$(date -Is)] $name starting: $cmd" >> "$LOGDIR/$name.log"
    ( cd "$dir" && eval "$cmd" >> "$LOGDIR/$name.log" 2>&1 )
    echo "[$(date -Is)] $name exited ($?), restarting in 5s" >> "$LOGDIR/$name.log"
    sleep 5
  done
}

cmd_start() {
  local build=0
  [ "${1:-}" = "--build" ] && build=1
  mkdir -p "$LOGDIR"
  if [ $build -eq 1 ]; then
    echo "building backend…"; ( cd "$ROOT/shop-backend" && npx next build --webpack )
    echo "building frontend…"; ( cd "$ROOT/shop-frontend" && npx next build --webpack )
  fi
  if running "$BACKEND_PID"; then echo "backend already up ($(cat $BACKEND_PID))"; else
    supervise backend "$ROOT/shop-backend" "npx next start -p $BACKEND_PORT" "$BACKEND_PID" &
    echo "backend supervisor $!"
  fi
  if running "$FRONTEND_PID"; then echo "frontend already up ($(cat $FRONTEND_PID))"; else
    supervise frontend "$ROOT/shop-frontend" "npx next start -p $FRONTEND_PORT" "$FRONTEND_PID" &
    echo "frontend supervisor $!"
  fi
  sleep 3
  cmd_status
}

cmd_stop() {
  for pid in "$BACKEND_PID" "$FRONTEND_PID"; do
    if [ -f "$pid" ]; then kill "$(cat "$pid")" 2>/dev/null; rm -f "$pid"; fi
  done
  pkill -f "next-server.*-p $BACKEND_PORT" 2>/dev/null
  pkill -f "next-server.*-p $FRONTEND_PORT" 2>/dev/null
  echo "stopped"
}

cmd_check() {
  local b f rc=0
  b=$(probe "$(backend_url)"); f=$(probe "$(frontend_url)")
  echo "backend($BACKEND_PORT): $b"
  echo "frontend($FRONTEND_PORT): $f"
  [ "$b" = "${b#DOWN}" ] || rc=1
  [ "$f" = "${f#DOWN}" ] || rc=1
  return $rc
}

cmd_status() {
  running "$BACKEND_PID" && echo "backend supervisor: alive ($(cat $BACKEND_PID))" || echo "backend supervisor: STOPPED"
  running "$FRONTEND_PID" && echo "frontend supervisor: alive ($(cat $FRONTEND_PID))" || echo "frontend supervisor: STOPPED"
  cmd_check || true
}

case "${1:-status}" in
  start) cmd_start "${2:-}" ;;
  stop) cmd_stop ;;
  check) cmd_check ;;
  status) cmd_status ;;
  *) echo "usage: serve.sh {start [--build]|stop|check|status}"; exit 2 ;;
esac
