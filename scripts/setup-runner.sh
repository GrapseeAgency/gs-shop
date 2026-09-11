#!/usr/bin/env bash
# One-time setup: registers THIS machine as the "grapsee" self-hosted runner
# so server.yml + keepalive.yml can deploy and watch the stack.
# Needs: a GitHub PAT with repo scope in $GH_PAT (or paste at prompt).
set -u
RUNNER_DIR="${RUNNER_DIR:-$HOME/actions-runner}"
REPO="${REPO:-GrapseeAgency/gs-shop}"
LABELS="${LABELS:-grapsee}"

if [ -z "${GH_PAT:-}" ]; then
  read -rsp "GitHub PAT (repo scope): " GH_PAT; echo
fi
mkdir -p "$RUNNER_DIR" && cd "$RUNNER_DIR"
case "$(uname -m)" in
  x86_64) ARCH=x64 ;; aarch64|arm64) ARCH=arm64 ;; *) echo "unsupported arch"; exit 1 ;;
esac
VER=$(curl -s -H "Authorization: Bearer $GH_PAT" https://api.github.com/repos/actions/runner/releases/latest 2>/dev/null | grep -oE '"tag_name": "v[0-9.]+"' | head -1 | cut -d'"' -f4)
VER="${VER:-2.328.0}"
echo "installing runner $VER ($ARCH) into $RUNNER_DIR"
curl -sL -o runner.tgz "https://github.com/actions/runner/releases/download/$VER/actions-runner-linux-$ARCH-$VER.tar.gz"
tar xzf runner.tgz && rm runner.tgz
./config.sh --unattended --url "https://github.com/$REPO" --token "$(curl -s -X POST -H "Authorization: Bearer $GH_PAT" -H "Accept: application/vnd.github+json" "https://api.github.com/repos/$REPO/actions/runners/registration-token" | grep -oE '"token": "[^"]+"' | cut -d'"' -f4)" --labels "$LABELS" --name "$(hostname)-grapsee"
echo
echo "Start it now:   ./run.sh   (foreground)"
echo "As a service:   sudo ./svc.sh install && sudo ./svc.sh start"
echo "Check at:       https://github.com/$REPO/settings/actions/runners"
