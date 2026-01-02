@echo off
echo ========================================
echo Lanka Vacations - Starting All Services
echo ========================================
echo.

echo Building and starting all containers...
docker-compose up --build -d

echo.
echo Waiting for services to be ready...
timeout /t 10 /nobreak >nul

echo.
echo ========================================
echo Services Status:
echo ========================================
docker-compose ps

echo.
echo ========================================
echo Access URLs:
echo ========================================
echo Frontend: http://localhost:8080
echo Backend:  http://localhost:5000
echo MySQL:    localhost:3307
echo ========================================
echo.
echo To view logs: docker-compose logs -f
echo To stop: docker-compose down
echo.
pause
