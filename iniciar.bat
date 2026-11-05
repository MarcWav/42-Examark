@echo off
setlocal
cd /d "%~dp0"
title 42 Exam Trainer
where node >nul 2>nul
if errorlevel 1 (
  echo [ERRO] Node.js nao encontrado. Instale Node.js 22 LTS ou superior em https://nodejs.org/
  pause
  exit /b 1
)
where npm >nul 2>nul
if errorlevel 1 (
  echo [ERRO] npm nao encontrado. Reinstale Node.js com a opcao npm.
  pause
  exit /b 1
)
echo 42 Exam Trainer - estudo local de Python
if not exist "node_modules\vite\bin\vite.js" (
  echo Instalando dependencias. Esta primeira etapa precisa de internet...
  call npm install
  if errorlevel 1 (
    echo [ERRO] A instalacao falhou. Confira sua conexao e tente novamente.
    pause
    exit /b 1
  )
)
call npm run setup:runtime
if errorlevel 1 (
  echo [ERRO] Nao foi possivel preparar o runtime Python local.
  pause
  exit /b 1
)
echo Abrindo http://127.0.0.1:5173/
echo Mantenha esta janela aberta durante o estudo. Ctrl+C encerra o servidor.
call npm run dev -- --open
if errorlevel 1 (
  echo [ERRO] Nao foi possivel iniciar. A porta 5173 pode estar ocupada.
  echo Se o aplicativo ja estiver aberto, visite http://127.0.0.1:5173/
  pause
)
