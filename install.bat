@echo off
chcp 65001 >nul
title 歌单迁移工具 - 安装依赖

echo ========================================
echo    歌单迁移工具 - 安装依赖
echo ========================================
echo.

:: Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [错误] 未检测到 Node.js，请先安装 Node.js
    echo.
    echo 正在打开 Node.js 下载页面...
    start https://nodejs.org/zh-cn
    echo.
    echo 安装完成后，重新双击 install.bat 即可
    pause
    exit /b 1
)

node -v
echo.

echo [1/2] 安装服务端依赖...
cd /d "%~dp0server"
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [错误] 服务端依赖安装失败
    pause
    exit /b 1
)

echo.
echo [2/2] 安装客户端依赖...
cd /d "%~dp0client"
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [错误] 客户端依赖安装失败
    pause
    exit /b 1
)

cd /d "%~dp0"
echo.
echo ========================================
echo   安装完成！现在可以双击 start.bat 启动
echo ========================================
pause
