@echo off
set PATH=%LOCALAPPDATA%\Volta\tools\image\node\20.20.2;%PATH%
cd /d C:\ServiceTracker
echo === EXPO EXPORT (bundle check) ===
call npx expo export --platform android --output-dir dist 2>&1
echo EXIT_CODE=%ERRORLEVEL%
echo === BUILD CHECK DONE ===
