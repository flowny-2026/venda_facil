@echo off
echo ========================================
echo   VENDA FACIL - INICIAR SISTEMAS
echo ========================================
echo.

echo [1/3] Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERRO: Node.js nao encontrado!
    echo Instale o Node.js em: https://nodejs.org
    pause
    exit /b 1
)
echo OK: Node.js instalado
echo.

echo [2/3] Iniciando Sistema Cliente (PDV)...
echo URL: http://localhost:5173
start cmd /k "cd /d %~dp0 && npm install && npm run dev"
timeout /t 3 >nul
echo.

echo [3/3] Iniciando Sistema Admin...
echo URL: http://localhost:5180
start cmd /k "cd /d %~dp0admin-system && npm install && npm run dev"
echo.

echo ========================================
echo   SISTEMAS INICIADOS!
echo ========================================
echo.
echo Sistema Cliente: http://localhost:5173
echo Sistema Admin:   http://localhost:5180
echo.
echo Pressione qualquer tecla para abrir os navegadores...
pause >nul

start http://localhost:5173
timeout /t 2 >nul
start http://localhost:5180

echo.
echo Sistemas abertos no navegador!
echo Feche esta janela quando terminar.
echo.
pause
