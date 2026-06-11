@echo off
setlocal enabledelayedexpansion
title FavSongMigrate - Install Dependencies

echo ========================================
echo    FavSongMigrate Tool - Install
echo ========================================
echo.

:: Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js not found. Please install Node.js first.
    echo Opening Node.js download page...
    start https://nodejs.org/en
    echo After installation, double-click install.bat again.
    pause
    exit /b 1
)

node -v
echo.

echo [1/3] Installing server dependencies...
cd /d "%~dp0server"
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Server dependencies installation failed.
    pause
    exit /b 1
)

echo.
echo [2/3] Installing client dependencies...
cd /d "%~dp0client"
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Client dependencies installation failed.
    pause
    exit /b 1
)

cd /d "%~dp0server"

echo.
echo [3/3] Downloading OCR language data (~15MB)...

if not exist "tessdata" mkdir tessdata

if not exist "tessdata\chi_sim.traineddata" (
    echo Downloading Chinese language pack (12MB)...
    powershell -Command "Invoke-WebRequest -Uri 'https://raw.githubusercontent.com/tesseract-ocr/tessdata_fast/main/chi_sim.traineddata' -OutFile 'tessdata\chi_sim.traineddata'"
    if exist "tessdata\chi_sim.traineddata" (echo Chinese pack OK) else (echo [WARNING] Chinese pack download failed, will retry on first use)
) else (
    echo Chinese language pack already exists.
)

if not exist "tessdata\eng.traineddata" (
    echo Downloading English language pack (4MB)...
    powershell -Command "Invoke-WebRequest -Uri 'https://raw.githubusercontent.com/tesseract-ocr/tessdata_fast/main/eng.traineddata' -OutFile 'tessdata\eng.traineddata'"
    if exist "tessdata\eng.traineddata" (echo English pack OK) else (echo [WARNING] English pack download failed)
) else (
    echo English language pack already exists.
)

cd /d "%~dp0"
echo.
echo ========================================
echo   Install complete.
echo   Now double-click start.bat to launch.
echo ========================================
pause
