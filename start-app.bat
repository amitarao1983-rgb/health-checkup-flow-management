@echo off
title HealthFirst360 - Check-up Flow
cd /d "%~dp0"
echo.
echo  Starting HealthFirst360 (frontend + backend combined)...
echo.
call npm run dev
pause
