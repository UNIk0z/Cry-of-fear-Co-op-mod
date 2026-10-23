@echo off
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0rc2\install-story-package.ps1"
if errorlevel 1 goto failed
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0rc3\install-story-package.ps1"
if errorlevel 1 goto failed
echo Installation complete. P1: open rc3\Host Coop Game.cmd. Both join before ready.
pause
exit /b 0
:failed
echo Installation stopped. Read the error above and rc3\TESTING.md. Do not launch.
pause
exit /b 1
