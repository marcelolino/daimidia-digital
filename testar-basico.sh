#!/bin/bash

echo "========================================="
echo "  Teste Básico de Conectividade"
echo "========================================="
echo ""

echo "1️⃣ IP deste servidor:"
SERVER_IP=$(curl -s ifconfig.me)
echo "   $SERVER_IP"
echo ""

echo "2️⃣ Nginx está rodando?"
docker-compose -f docker-compose.prod.yml ps nginx
echo ""

echo "3️⃣ Testando localmente (dentro do servidor):"
echo "   curl http://localhost:80"
curl -s -o /dev/null -w "   Status: %{http_code}\n" http://localhost:80
echo ""

echo "4️⃣ Verificando portas abertas no servidor:"
echo "   Porta 80:"
sudo netstat -tulpn | grep :80 || echo "   ❌ Nada escutando na porta 80"
echo ""
echo "   Porta 443:"
sudo netstat -tulpn | grep :443 || echo "   ❌ Nada escutando na porta 443"
echo ""

echo "5️⃣ Verificando firewall (UFW):"
sudo ufw status
echo ""

echo "6️⃣ Logs do Nginx:"
docker logs nginx-proxy --tail 20 2>/dev/null || echo "   Container nginx-proxy não encontrado"
echo ""

echo "========================================="
echo "  Recomendações"
echo "========================================="
echo ""
echo "Se o Nginx não está rodando:"
echo "   docker-compose -f docker-compose.prod.yml up -d nginx"
echo ""
echo "Se as portas não estão liberadas:"
echo "   sudo ufw allow 80/tcp"
echo "   sudo ufw allow 443/tcp"
echo ""
