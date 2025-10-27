#!/bin/bash

echo "========================================="
echo "  Executar Aplicação SEM SSL (HTTP)"
echo "========================================="
echo ""
echo "Esta opção roda a aplicação sem Nginx/HTTPS"
echo "Útil para testar ou usar apenas com IP"
echo ""

read -p "Deseja continuar? (s/N): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    exit 0
fi

echo "🛑 Parando configuração com Nginx..."
docker-compose -f docker-compose.prod.yml down

echo ""
echo "🚀 Iniciando com configuração simples..."
docker-compose up -d

echo ""
echo "⏳ Aguardando (10 segundos)..."
sleep 10

echo ""
echo "📊 Status:"
docker-compose ps

echo ""
echo "📋 Executando migrações:"
docker-compose exec app npm run db:push

echo ""
SERVER_IP=$(curl -s ifconfig.me)
echo "========================================="
echo "✅ Aplicação rodando!"
echo "========================================="
echo ""
echo "🌐 Acesse via HTTP (sem HTTPS):"
echo "   http://$SERVER_IP:5000"
echo ""
echo "⚠️  Sem Nginx = Sem HTTPS = Sem domínio"
echo ""
echo "📝 Para adicionar HTTPS depois:"
echo "   1. Configure o DNS corretamente"
echo "   2. Libere portas 80/443 no firewall"
echo "   3. Execute: ./setup-domain.sh seudominio.com email@exemplo.com"
echo ""
