@echo off
echo ===================================================
echo   Starting RAGAssist Docker Infrastructure Dependencies
echo ===================================================
echo.
echo Launching Redis, MongoDB, and Qdrant in the background...
echo.

docker-compose up -d redis mongodb qdrant

echo.
echo ===================================================
echo   Infrastructure services started successfully!
echo.
echo   - MongoDB: localhost:27017
echo   - Qdrant Vector Console: http://localhost:6333
echo   - Redis: localhost:6379
echo.
echo   You can now run:
echo   1. Backend: cd backend && .venv\Scripts\python.exe main.py
echo   2. Frontend: cd frontend && npm run dev
echo ===================================================
pause
