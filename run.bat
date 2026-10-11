@echo off
title EventHub Platform Launcher
cls
echo =====================================================================
echo                STARTING EVENTHUB PLATFORM
echo =====================================================================
echo.

cd /d "%~dp0"

echo [1/3] Initializing SQLite Database...
python database\seed_database.py >nul 2>&1

echo [2/3] Launching Web Browser...
timeout /t 2 /nobreak >nul
start http://localhost:3000

echo [3/3] Starting EventHub Server on http://localhost:3000 ...
echo.
echo =====================================================================
echo  EventHub is LIVE! Keep this window open while using the application.
echo  Press Ctrl+C to stop the server when finished.
echo =====================================================================
echo.

python backend\server.py
if errorlevel 1 (
    echo Python not detected in PATH, trying Node.js...
    node backend\server.js
)
pause
