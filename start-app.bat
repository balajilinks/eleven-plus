@echo off
echo.
echo ===================================
echo  Starting 11+ AI Tutoring App
echo ===================================
echo.

cd /d "c:\Users\a912347\Downloads\eleven-plus-app-full\eleven-plus-app-full"

echo Checking dependencies...
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
)

echo.
echo Starting the application...
echo.
echo The app will open in your browser at:
echo http://localhost:3000
echo.
echo To configure AI:
echo 1. Click "AI Settings" in the navigation
echo 2. Choose your AI provider (LM Studio, OpenAI, or Ollama)
echo 3. Test the connection
echo 4. Start chatting with your AI tutor!
echo.
echo Press Ctrl+C to stop the server
echo.

npm start
