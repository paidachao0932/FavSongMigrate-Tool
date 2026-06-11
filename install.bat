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
echo [3/3] Downloading OCR language data (~15MB, one time only)...

:: Create tessdata directory
if not exist "tessdata" mkdir tessdata

:: Download Chinese language data if not exists
if not exist "tessdata\chi_sim.traineddata" (
    echo Downloading Chinese language pack (12MB)...
    powershell -Command "Invoke-WebRequest -Uri 'https://cdn.jsdelivr.net/gh/tesseract-ocr/tessdata_fast@main/chi_sim.traineddata' -OutFile 'tessdata\chi_sim.traineddata'" 2>nul
    if not exist "tessdata\chi_sim.traineddata" (
        echo Retrying from alternate mirror...
        powershell -Command "Invoke-WebRequest -Uri 'https://raw.githubusercontent.com/tesseract-ocr/tessdata_fast/main/chi_sim.traineddata' -OutFile 'tessdata\chi_sim.traineddata'" 2>nul
    )
    if exist "tessdata\chi_sim.traineddata" (
        echo Chinese language pack OK.
    ) else (
        echo [WARNING] Chinese language pack download failed. Will retry on first use.
    )
) else (
    echo Chinese language pack already exists, skipping.
)

:: Download English language data if not exists
if not exist "tessdata\eng.traineddata" (
    echo Downloading English language pack (4MB)...
    powershell -Command "Invoke-WebRequest -Uri 'https://cdn.jsdelivr.net/gh/tesseract-ocr/tessdata_fast@main/eng.traineddata' -OutFile 'tessdata\eng.traineddata'" 2>nul
    if not exist "tessdata\eng.traineddata" (
        powershell -Command "Invoke-WebRequest -Uri 'https://raw.githubusercontent.com/tesseract-ocr/tessdata_fast/main/eng.traineddata' -OutFile 'tessdata\eng.traineddata'" 2>nul
    )
    if exist "tessdata\eng.traineddata" (
        echo English language pack OK.
    )
) else (
    echo English language pack already exists, skipping.
)

cd /d "%~dp0"
echo.
echo ========================================
echo   Install complete!
echo   Now double-click start.bat to launch.
echo ========================================
pause
