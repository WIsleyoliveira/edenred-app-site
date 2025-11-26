#!/bin/bash
# Script para importar dados via Railway CLI

echo "🚀 Importando dados para Railway PostgreSQL..."
echo ""

# Usar railway run para executar dentro do ambiente Railway
railway run --service Postgres bash -c "psql \$DATABASE_URL < railway-import-full.sql"

echo ""
echo "✅ Importação concluída!"
