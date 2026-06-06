@echo off
title FavSongMigrate - Install Dependencies

echo ========================================
echo    FavSongMigrate Tool - Install
echo ========================================
echo.

:: Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js not found. Please install Node.js first.
    echo.
    echo Opening Node.js download page...
    start https://nodejs.org/en
    echo.
    echo After installation, double-click install.bat again.
    pause
    exit /b 1
)

node -v
echo.

echo [1/2] Installing server dependencies...
cd /d "%~dp0server"
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Server dependencies installation failed.
    pause
    exit /b 1
)

echo.
echo [2/2] Installing client dependencies...
cd /d "%~dp0client"
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Client dependencies installation failed.
    pause
    exit /b 1
)

cd /d "%~dp0"
echo.
echo ========================================
echo   Install complete!
echo   Now double-click start.bat to launch.
echo ========================================
pause
