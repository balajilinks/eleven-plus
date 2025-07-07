@echo off
echo ===============================================
echo    Eleven Plus App - AI Services Starter
echo ===============================================
echo.

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

:: Check if we're in the correct directory
if not exist "package.json" (
    echo ERROR: package.json not found
    echo Please run this script from the app directory
    pause
    exit /b 1
)

echo [1/4] Checking Node.js installation...
echo Node.js version: 
node --version

echo.
echo [2/4] Installing/updating dependencies...
call npm install

echo.
echo [3/4] Starting the main application...
echo Opening in browser at: http://localhost:3000
echo.
echo INSTRUCTIONS:
echo 1. The app will start automatically
echo 2. Go to Settings to configure AI services
echo 3. For AI test generation, configure one of:
echo    - LM Studio (local): http://localhost:1234/v1
echo    - OpenAI (cloud): https://api.openai.com/v1
echo    - Ollama (local): http://localhost:11434/v1
echo.
echo [4/4] Launching application...
echo.
echo Press Ctrl+C to stop the application
echo ===============================================

:: Start the app
start "" "http://localhost:3000"
call npm start

pause
