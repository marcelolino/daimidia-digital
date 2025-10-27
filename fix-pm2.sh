#!/bin/bash

echo "========================================="
echo "  Correção Deploy PM2"
echo "========================================="
echo ""

if [ ! -f .env ]; then
    echo "❌ Arquivo .env não encontrado!"
    echo "Execute primeiro: ./deploy-pm2.sh"
    exit 1
fi

echo "📊 Carregando variáveis de ambiente..."
export $(cat .env | grep -v '^#' | xargs)

echo "✅ DATABASE_URL carregado"
echo ""

echo "📊 Executando migrações..."
npm run db:push

if [ $? -ne 0 ]; then
    echo "❌ Erro nas migrações!"
    exit 1
fi

echo ""
echo "🚀 Iniciando aplicação com PM2..."
pm2 delete app 2>/dev/null || true
pm2 start ecosystem.config.cjs

echo ""
echo "💾 Salvando configuração PM2..."
pm2 save

echo ""
echo "📊 Status:"
pm2 status

echo ""
echo "📋 Logs (pressione Ctrl+C para sair):"
pm2 logs app --lines 50
