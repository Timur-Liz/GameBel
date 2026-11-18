@echo off
chcp 65001 >nul
title КиберЩит: Беларусь
cd /d "%~dp0"
echo.
echo  ==========================================
echo     КИБЕРЩИТ: БЕЛАРУСЬ - запуск игры
echo  ==========================================
echo.

where node >nul 2>nul
if errorlevel 1 goto nonode

if not exist ".env" if exist ".env.example" copy ".env.example" ".env" >nul

if exist "node_modules\.bin\next.cmd" goto deps_ok
echo  [1/3] Установка зависимостей, 1-3 минуты...
call npm install
if errorlevel 1 goto npmfail
:deps_ok

echo  [2/3] Запуск базы данных...
where docker >nul 2>nul
if errorlevel 1 goto nodocker
docker compose up -d >nul 2>nul
if errorlevel 1 goto nodocker
echo        База данных запущена.
goto run

:nodocker
echo        Docker не найден или не запущен - игра откроется в гостевом режиме
echo        (без регистрации). Для аккаунтов запустите Docker Desktop и перезапустите файл.

:run
echo.
echo  [3/3] Запуск игры. Браузер откроется сам через ~15 секунд.
echo        Адрес: http://localhost:3000   Остановить - закрыть это окно.
echo.
start "" cmd /c "timeout /t 15 >nul & start http://localhost:3000"
call npm run dev
pause
exit /b 0

:nonode
echo  [!] Не установлен Node.js. Скачайте версию LTS, установите,
echo      перезагрузите компьютер и снова запустите этот файл.
start https://nodejs.org
pause
exit /b 1

:npmfail
echo  [!] Не удалось установить зависимости. Проверьте интернет.
pause
exit /b 1
