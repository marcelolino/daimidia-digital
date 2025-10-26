#!/bin/bash

echo "========================================="
echo "  Diagnóstico de Problemas Docker"
echo "========================================="
echo ""

echo "📊 Status dos containers:"
docker-compose -f docker-compose.prod.yml ps
echo ""

echo "----------------------------------------"
echo "📋 Logs do PostgreSQL (últimas 30 linhas):"
echo "----------------------------------------"
docker-compose -f docker-compose.prod.yml logs postgres --tail 30
echo ""

echo "----------------------------------------"
echo "📋 Logs da Aplicação (últimas 50 linhas):"
echo "----------------------------------------"
docker-compose -f docker-compose.prod.yml logs app --tail 50
echo ""

echo "----------------------------------------"
echo "🔍 Verificando conexão com banco:"
echo "----------------------------------------"
docker-compose -f docker-compose.prod.yml exec -T postgres pg_isready -U appuser
if [ $? -eq 0 ]; then
    echo "✅ PostgreSQL está respondendo"
else
    echo "❌ PostgreSQL não está respondendo"
fi
echo ""

echo "----------------------------------------"
echo "🔍 Testando se o container da app consegue ser executado:"
echo "----------------------------------------"
docker-compose -f docker-compose.prod.yml run --rm app node --version 2>&1
echo ""

echo "----------------------------------------"
echo "💡 Diagnóstico completo!"
echo "----------------------------------------"
