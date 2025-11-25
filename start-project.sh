#!/bin/bash

# Script para iniciar todo o projeto Edenred
# Este script inicia o frontend, backend e visualizador do banco de dados

echo "🚀 Iniciando Projeto Edenred - Sistema de Consulta CNPJ"
echo "======================================================"

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ] || [ ! -d "backend" ]; then
    echo "❌ Erro: Execute este script do diretório raiz do projeto"
    exit 1
fi

# Função para verificar se uma porta está em uso
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "⚠️  Porta $1 já está em uso"
        return 1
    else
        return 0
    fi
}

# Verificar portas disponíveis
echo "📋 Verificando portas disponíveis..."
check_port 5173 && FRONTEND_OK=true || FRONTEND_OK=false
check_port 5001 && BACKEND_OK=true || BACKEND_OK=false
check_port 3001 && VIEWER_OK=true || VIEWER_OK=false

if [ "$FRONTEND_OK" = false ] || [ "$BACKEND_OK" = false ] || [ "$VIEWER_OK" = false ]; then
    echo ""
    echo "⚠️  Algumas portas já estão em uso. Você pode:"
    echo "   1. Fechar os processos que estão usando essas portas"
    echo "   2. Ou continuar e alguns serviços podem não iniciar"
    echo ""
    read -p "Deseja continuar? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""
echo "🔧 Instalando dependências (se necessário)..."

# Instalar dependências do frontend
if [ -f "package.json" ]; then
    echo "📦 Instalando dependências do frontend..."
    npm install
fi

# Instalar dependências do backend
if [ -f "backend/package.json" ]; then
    echo "📦 Instalando dependências do backend..."
    cd backend && npm install && cd ..
fi

echo ""
echo "🎯 Iniciando serviços..."

# Iniciar backend em background
if [ "$BACKEND_OK" = true ]; then
    echo "🔧 Iniciando backend (porta 5001)..."
    cd backend && node src/server.js &
    BACKEND_PID=$!
    cd ..
    echo "✅ Backend iniciado (PID: $BACKEND_PID)"
else
    echo "⚠️  Pulando backend - porta 5001 em uso"
fi

# Aguardar um pouco para o backend inicializar
sleep 3

# Iniciar visualizador do banco de dados em background
if [ "$VIEWER_OK" = true ]; then
    echo "🗄️  Iniciando visualizador do banco (porta 3001)..."
    cd backend && node db-viewer.js &
    VIEWER_PID=$!
    cd ..
    echo "✅ Visualizador iniciado (PID: $VIEWER_PID)"
else
    echo "⚠️  Pulando visualizador - porta 3001 em uso"
fi

# Aguardar um pouco para os serviços inicializarem
sleep 2

# Iniciar frontend
if [ "$FRONTEND_OK" = true ]; then
    echo "🌐 Iniciando frontend (porta 5173)..."
    npm run dev &
    FRONTEND_PID=$!
    echo "✅ Frontend iniciado (PID: $FRONTEND_PID)"

    # Aguardar frontend ficar disponível
    echo "⏳ Aguardando frontend ficar disponível..."
    MAX_WAIT=30
    WAIT_COUNT=0
    while ! curl -s http://localhost:5173 > /dev/null && [ $WAIT_COUNT -lt $MAX_WAIT ]; do
        sleep 1
        WAIT_COUNT=$((WAIT_COUNT + 1))
        echo -n "."
    done
    echo ""

    if [ $WAIT_COUNT -ge $MAX_WAIT ]; then
        echo "⚠️  Timeout aguardando frontend. Continuando..."
    else
        echo "✅ Frontend pronto!"
    fi
else
    echo "⚠️  Pulando frontend - porta 5173 em uso"
fi

echo ""
echo "🎉 Projeto iniciado com sucesso!"
echo ""
echo "📋 Serviços disponíveis:"
echo "   🌐 Frontend:     http://localhost:5173"
echo "   🔧 Backend:      http://localhost:5001"
echo "   🗄️  DB Viewer:    http://localhost:3001"
echo ""
echo "📊 API Endpoints:"
echo "   🔐 Auth:         http://localhost:5001/api/auth"
echo "   🏢 Empresas:     http://localhost:5001/api/companies"
echo "   🔍 Consultas:    http://localhost:5001/api/consultations"
echo "   👥 Usuários:     http://localhost:5001/api/users"
echo ""

if [ "$FRONTEND_OK" = true ]; then
    echo "🌐 Abrindo aplicação no navegador..."
    open http://localhost:5173
    echo ""
fi

echo "🛑 Para parar todos os serviços, pressione Ctrl+C"
echo ""

# Função para limpar processos ao sair
cleanup() {
    echo ""
    echo "🛑 Parando serviços..."

    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
        echo "✅ Frontend parado"
    fi

    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
        echo "✅ Backend parado"
    fi

    if [ ! -z "$VIEWER_PID" ]; then
        kill $VIEWER_PID 2>/dev/null
        echo "✅ Visualizador parado"
    fi

    echo "👋 Até logo!"
    exit 0
}

# Capturar sinais de interrupção
trap cleanup SIGINT SIGTERM

# Manter script rodando
echo "💡 Pressione Ctrl+C para parar todos os serviços"
wait
