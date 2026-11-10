#!/usr/bin/env bash
# Startet die echte docker-compose.yml mit Testwerten und prüft Health, Login-Seite und Manifest.
# Läuft in der Pipeline und lokal: scripts/smoke-test.sh
set -euo pipefail

project=questlog-smoke
export QUESTLOG_DB_PASSWORD=smoke-db
export QUESTLOG_USERNAME=smoke
export QUESTLOG_PASSWORD=smoke
export QUESTLOG_REMEMBER_ME_KEY=smoke-key

compose() { docker compose -p "$project" -f docker-compose.yml "$@"; }

cleanup() {
  if [[ $? -ne 0 ]]; then compose logs app; fi
  compose down -v --remove-orphans
}
trap cleanup EXIT

compose up -d --build --wait --wait-timeout 180

# Die Compose-Datei veröffentlicht keine Ports (das übernimmt Coolify), daher prüft ein
# curl-Container im selben Netzwerk.
check() {
  local path=$1 expected=$2
  docker run --rm --network "${project}_default" curlimages/curl:latest \
    -fsS "http://app:8080${path}" | grep -q -- "$expected"
  echo "ok  ${path}"
}

check /actuator/health '"UP"'
check /login 'name="password"'
check /manifest.webmanifest '"short_name": "Questlog"'
