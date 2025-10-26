#!/bin/bash

echo "========================================="
echo "  Script de Correção Docker"
echo "========================================="
echo ""

echo "🛑 Parando todos os containers..."
docker-compose -f docker-compose.prod.yml down

echo ""
echo "🗑️  Removendo volumes órfãos..."
docker volume prune -f

echo ""
echo "🏗️  Reconstruindo a imagem da aplicação..."
docker-compose -f docker-compose.prod.yml build --no-cache app

echo ""
echo "🚀 Iniciando apenas o PostgreSQL primeiro..."
docker-compose -f docker-compose.prod.yml up -d postgres

echo ""
echo "⏳ Aguardando PostgreSQL inicializar (15 segundos)..."
sleep 15

echo ""
echo "🔍 Verificando se PostgreSQL está saudável..."
docker-compose -f docker-compose.prod.yml exec postgres pg_isready -U appuser

if [ $? -eq 0 ]; then
    echo "✅ PostgreSQL está funcionando!"
    
    echo ""
    echo "🚀 Iniciando a aplicação..."
    docker-compose -f docker-compose.prod.yml up -d app
    
    echo ""
    echo "⏳ Aguardando aplicação inicializar (10 segundos)..."
    sleep 10
    
    echo ""
    echo "📊 Verificando status..."
    docker-compose -f docker-compose.prod.yml ps app
    
    echo ""
    echo "📋 Últimos logs da aplicação:"
    docker-compose -f docker-compose.prod.yml logs app --tail 30
    
    echo ""
    APP_STATUS=$(docker-compose -f docker-compose.prod.yml ps app | grep -c "Up")
    
    if [ "$APP_STATUS" -gt 0 ]; then
        echo "✅ Aplicação está rodando!"
        echo ""
        echo "📊 Executando migrações do banco..."
        docker-compose -f docker-compose.prod.yml exec app npm run db:push
        
        echo ""
        echo "🚀 Iniciando Nginx e Certbot..."
        docker-compose -f docker-compose.prod.yml up -d nginx certbot
        
        echo ""
        echo "========================================="
        echo "✅ Correção concluída!"
        echo "========================================="
        docker-compose -f docker-compose.prod.yml ps
    else
        echo "❌ Aplicação ainda está com problemas."
        echo "Execute: ./diagnostico.sh"
    fi
else
    echo "❌ PostgreSQL não está funcionando corretamente!"
    echo ""
    echo "Ver logs do PostgreSQL:"
    docker-compose -f docker-compose.prod.yml logs postgres
fi
