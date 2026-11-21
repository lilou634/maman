@echo off
cd /d "%~dp0"
title NeuroPlay
echo.
echo   ===  NeuroPlay  ===
echo.

if not exist "server.py" goto nozip

set "PY="
py -3 --version >nul 2>&1
if not errorlevel 1 set "PY=py -3"
if defined PY goto run
python --version >nul 2>&1
if not errorlevel 1 set "PY=python"
if defined PY goto run
goto nopython

:run
echo   Python trouve : %PY%
echo   Le site va s'ouvrir dans votre navigateur.
echo.
%PY% server.py
echo.
echo   Le serveur s'est arrete.
echo   S'il y a un message d'erreur au-dessus, copiez-le et envoyez-le a Claude.
echo.
pause
exit /b

:nozip
echo   [!] Le fichier server.py est introuvable.
echo.
echo   Le zip n'a sans doute pas ete decompresse :
echo   1. Clic droit sur maman.zip, puis "Extraire tout..."
echo   2. Ouvrez le dossier extrait, puis le dossier maman
echo   3. Double-cliquez sur lancer-windows.bat
echo.
pause
exit /b 1

:nopython
echo   [!] Python n'est pas installe sur cet ordinateur.
echo.
echo   1. La page de telechargement va s'ouvrir : cliquez sur "Download Python"
echo   2. Pendant l'installation, COCHEZ la case "Add python.exe to PATH"
echo   3. Une fois installe, relancez lancer-windows.bat
echo.
start "" "https://www.python.org/downloads/windows/"
pause
exit /b 1
