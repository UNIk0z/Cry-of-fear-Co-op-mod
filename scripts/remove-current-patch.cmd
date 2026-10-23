@echo off
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0install-shared-note.ps1" -Remove
set "cofPatchExit=%errorlevel%"
echo.
if not "%cofPatchExit%"=="0" echo Patch removal failed. Read the message above.
pause
exit /b %cofPatchExit%
