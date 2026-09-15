@echo off
"%LOCALAPPDATA%\Volta\tools\image\node\20.20.2\node.exe" "C:\ServiceTracker\scripts\validate-imports.js" > C:\ServiceTracker\validate-result.txt 2>&1
echo DONE >> C:\ServiceTracker\validate-result.txt
