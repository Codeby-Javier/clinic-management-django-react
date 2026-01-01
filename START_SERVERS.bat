@echo off
echo ========================================
echo STARTING KLINIK KESEHATAN SERVERS
echo ========================================
echo.

echo [1/2] Starting Django Backend...
echo.
start "Django Backend" cmd /k "python manage.py runserver"
timeout /t 3 /nobreak >nul

echo [2/2] Starting React Frontend...
echo.
start "React Frontend" cmd /k "cd frontend && npm run dev"
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo SERVERS STARTED!
echo ========================================
echo.
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
echo.
echo Tekan tombol apapun untuk menutup window ini...
echo (Server akan tetap berjalan di window terpisah)
pause >nul
