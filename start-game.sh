#!/usr/bin/env bash
cd "$(dirname "$0")"
command -v node >/dev/null 2>&1 || { echo "Установите Node.js: https://nodejs.org"; exit 1; }
[ -f .env ] || { [ -f .env.example ] && cp .env.example .env; }
[ -x node_modules/.bin/next ] || npm install || exit 1
if command -v docker >/dev/null 2>&1 && docker compose up -d >/dev/null 2>&1; then
  echo "База данных запущена."
else
  echo "Docker не запущен — игра откроется в гостевом режиме (без регистрации)."
fi
( sleep 12; (command -v open >/dev/null && open http://localhost:3000) || (command -v xdg-open >/dev/null && xdg-open http://localhost:3000) ) >/dev/null 2>&1 &
npm run dev
