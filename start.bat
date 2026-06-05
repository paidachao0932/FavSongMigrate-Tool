@echo off
chcp 65001 >nul
title 歌单迁移工具

echo ========================================
echo    歌单迁移工具
echo ========================================
echo.

:: Check if dependencies installed
if not exist "%~dp0server\node_modules" (
    echo [提示] 首次运行需要安装依赖，正在启动安装...
    call "%~dp0install.bat"
    if %ERRORLEVEL% NEQ 0 exit /b 1
)

if not exist "%~dp0client\node_modules" (
    echo [提示] 首次运行需要安装依赖，正在启动安装...
    call "%~dp0install.bat"
    if %ERRORLEVEL% NEQ 0 exit /b 1
)

echo [1/2] 构建前端...
cd /d "%~dp0client"
call npx vite build
if %ERRORLEVEL% NEQ 0 (
    echo [错误] 前端构建失败
    pause
    exit /b 1
)

echo.
echo [2/2] 启动服务...
cd /d "%~dp0server"
start "" /b cmd /c "npx tsx src/index.ts"

:: Wait for server to start
timeout /t 3 /nobreak >nul

:: Get local IP
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    set LOCAL_IP=%%a
    set LOCAL_IP=!LOCAL_IP: =!
)

echo.
echo ========================================
echo   启动成功！
echo.
echo   电脑浏览器打开: http://localhost:3001
echo.
echo   👉 手机浏览器打开: http://!LOCAL_IP!:3001
echo      (手机和电脑需在同一 WiFi 下)
echo.
echo   按任意键停止服务
echo ========================================
pause >nul

:: Kill server
taskkill /f /im node.exe >nul 2>nul
