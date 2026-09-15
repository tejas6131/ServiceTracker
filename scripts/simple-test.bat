@echo off
echo STARTING > C:\ServiceTracker\test-result.txt
"%LOCALAPPDATA%\Volta\tools\image\node\20.20.2\node.exe" -e "console.log('NODE_OK')" >> C:\ServiceTracker\test-result.txt 2>&1
echo FINISHED >> C:\ServiceTracker\test-result.txt
