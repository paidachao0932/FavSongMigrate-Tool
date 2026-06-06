@echo off
title FavSongMigrate Tool

echo ========================================
echo    FavSongMigrate Tool
echo ========================================
echo.

:: Check if dependencies installed
if not exist "%~dp0server\node_modules" (
    echo [INFO] First run detected. Installing dependencies...
    call "%~dp0install.bat"
    if %ERRORLEVEL% NEQ 0 exit /b 1
)

if not exist "%~dp0client\node_modules" (
    echo [INFO] First run detected. Installing dependencies...
    call "%~dp0install.bat"
    if %ERRORLEVEL% NEQ 0 exit /b 1
)

echo [1/2] Building frontend...
cd /d "%~dp0client"
call npx vite build
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Frontend build failed.
    pause
    exit /b 1
)

echo.
echo [2/2] Starting server...
cd /d "%~dp0server"

:: Start server in a new window so user can see its output
start "FavSongMigrate Server" cmd /c "npx tsx src/index.ts"

:: Wait for server to start
timeout /t 3 /nobreak >nul

:: Get local IP for phone access
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    set LOCAL_IP=%%a
    set LOCAL_IP=!LOCAL_IP: =!
)

echo.
echo ========================================
echo   Server is running!
echo.
echo   PC browser:  http://localhost:3001
echo.
echo   Phone browser:  http://!LOCAL_IP!:3001
echo   (Phone and PC must be on same WiFi)
echo.
echo   Press any key in THIS window to stop.
echo ========================================
pause >nul

:: Kill all node processes
taskkill /f /im node.exe >nul 2>nul
