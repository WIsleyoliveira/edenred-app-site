#!/bin/bash

# Script para migrar dados locais para Railway

echo "🔄 Migrando dados para Railway..."
echo ""

# 1. Exportar banco local
echo "📤 Exportando banco de dados local..."
pg_dump -h localhost -U postgres -d cnpj_consultation -f backup-local.sql

if [ $? -eq 0 ]; then
    echo "✅ Backup local criado: backup-local.sql"
else
    echo "❌ Erro ao exportar banco local"
    exit 1
fi

echo ""
echo "📋 Próximos passos:"
echo ""
echo "1. Vá no Railway → PostgreSQL → Data"
echo "2. Clique em 'Connect' e copie a DATABASE_URL"
echo "3. Execute este comando (substitua pela sua URL):"
echo ""
echo "   psql 'postgresql://usuario:senha@host:porta/database' < backup-local.sql"
echo ""
echo "Exemplo:"
echo "   psql 'postgresql://postgres:abc123@monorail.proxy.rlwy.net:12345/railway' < backup-local.sql"
echo ""
