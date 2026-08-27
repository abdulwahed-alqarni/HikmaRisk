@echo off
TITLE HikmaRisk - University of Bisha Graduation Project
COLOR 0A

echo ============================================================
echo    HikmaRisk - Diabetes Risk Screening ^& AI Medical Consultation
echo    Graduation Project - Artificial Intelligence Major
echo    College of Computer Science - University of Bisha
echo ============================================================
echo.

node -v
if errorlevel 1 (
    echo.
    echo ERROR: Node.js is not installed.
    pause
    exit /b 1
)

echo.
echo Starting HikmaRisk Server...
echo.

start "" http://localhost:3000

npm run dev

echo.
echo Server stopped.
pause