#!/bin/bash

echo "========================================="
echo "  Rebuild da Aplicação"
echo "========================================="
echo ""

echo "🛑 Parando containers..."
docker-compose -f docker-compose.prod.yml down

echo ""
echo "🗑️  Limpando build cache..."
docker system prune -f

echo ""
echo "🏗️  Reconstruindo imagem SEM cache..."
docker-compose -f docker-compose.prod.yml build --no-cache app

echo ""
echo "✅ Build concluído!"
echo ""
echo "🚀 Iniciando PostgreSQL..."
docker-compose -f docker-compose.prod.yml up -d postgres

echo ""
echo "⏳ Aguardando PostgreSQL (10 segundos)..."
sleep 10

echo ""
echo "🚀 Iniciando aplicação..."
docker-compose -f docker-compose.prod.yml up -d app

echo ""
echo "⏳ Aguardando aplicação (5 segundos)..."
sleep 5

echo ""
echo "📊 Status dos containers:"
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "📋 Logs da aplicação:"
docker logs app-server

echo ""
echo "========================================="
echo "✅ Se não houver erros acima, execute:"
echo "   docker-compose -f docker-compose.prod.yml exec app npm run db:push"
echo "========================================="
