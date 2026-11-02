@echo off
title SKEIN - Real-Time Financial Crime Network Detector
echo ==========================================================
echo  SKEIN - Real-Time Financial Crime Network Detector v3.0
echo ==========================================================

cd /d "%~dp0"
set PYTHONPATH=%~dp0

echo.
echo Starting Backend & Frontend via PowerShell launcher...
powershell -ExecutionPolicy Bypass -File "%~dp0start_skein.ps1"
pause
