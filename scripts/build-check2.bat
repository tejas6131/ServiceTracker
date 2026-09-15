@echo off
set PATH=%LOCALAPPDATA%\Volta\tools\image\node\20.20.2;%PATH%
cd /d C:\ServiceTracker
call npx expo export --platform android --output-dir dist > C:\ServiceTracker\build-output.txt 2>&1
echo EXIT_CODE=%ERRORLEVEL% >> C:\ServiceTracker\build-output.txt
