#!/bin/bash

echo "========================================="
echo "  Diagnóstico SSL / Let's Encrypt"
echo "========================================="
echo ""

if [ -z "$1" ]; then
    echo "❌ Informe seu domínio!"
    echo "Uso: ./diagnostico-ssl.sh seudominio.com"
    exit 1
fi

DOMAIN=$1

echo "🌐 Domínio: $DOMAIN"
echo ""

echo "----------------------------------------"
echo "1️⃣ Verificando IP do servidor:"
echo "----------------------------------------"
SERVER_IP=$(curl -s ifconfig.me)
echo "   IP deste servidor: $SERVER_IP"
echo ""

echo "----------------------------------------"
echo "2️⃣ Verificando DNS do domínio:"
echo "----------------------------------------"
DOMAIN_IP=$(dig +short $DOMAIN | tail -n1)
if [ -z "$DOMAIN_IP" ]; then
    echo "   ❌ Domínio não resolve (DNS não configurado)"
else
    echo "   Domínio aponta para: $DOMAIN_IP"
    if [ "$DOMAIN_IP" == "$SERVER_IP" ]; then
        echo "   ✅ DNS configurado corretamente!"
    else
        echo "   ❌ DNS aponta para IP diferente do servidor!"
        echo "   Configure o registro A para: $SERVER_IP"
    fi
fi
echo ""

echo "----------------------------------------"
echo "3️⃣ Verificando portas abertas:"
echo "----------------------------------------"
echo "   Porta 80 (HTTP):"
if nc -zv -w3 $SERVER_IP 80 2>&1 | grep -q succeeded; then
    echo "   ✅ Porta 80 está aberta"
else
    echo "   ❌ Porta 80 está fechada ou bloqueada"
fi

echo "   Porta 443 (HTTPS):"
if nc -zv -w3 $SERVER_IP 443 2>&1 | grep -q succeeded; then
    echo "   ✅ Porta 443 está aberta"
else
    echo "   ❌ Porta 443 está fechada ou bloqueada"
fi
echo ""

echo "----------------------------------------"
echo "4️⃣ Verificando Nginx:"
echo "----------------------------------------"
NGINX_STATUS=$(docker-compose -f docker-compose.prod.yml ps nginx 2>/dev/null | grep -c "Up")
if [ "$NGINX_STATUS" -gt 0 ]; then
    echo "   ✅ Nginx está rodando"
else
    echo "   ❌ Nginx não está rodando"
fi
echo ""

echo "----------------------------------------"
echo "5️⃣ Testando acesso HTTP ao domínio:"
echo "----------------------------------------"
HTTP_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://$DOMAIN/.well-known/acme-challenge/test 2>/dev/null)
echo "   Código HTTP: $HTTP_RESPONSE"
if [ "$HTTP_RESPONSE" == "404" ] || [ "$HTTP_RESPONSE" == "301" ]; then
    echo "   ✅ Nginx está respondendo (404/301 é esperado)"
elif [ -z "$HTTP_RESPONSE" ]; then
    echo "   ❌ Sem resposta - verifique firewall ou DNS"
else
    echo "   ⚠️  Resposta: $HTTP_RESPONSE"
fi
echo ""

echo "----------------------------------------"
echo "6️⃣ Verificando firewall (UFW):"
echo "----------------------------------------"
if command -v ufw &> /dev/null; then
    sudo ufw status | grep -E "(80|443)" || echo "   ⚠️  Portas 80/443 podem não estar liberadas"
else
    echo "   ℹ️  UFW não instalado"
fi
echo ""

echo "----------------------------------------"
echo "7️⃣ Verificando certificados existentes:"
echo "----------------------------------------"
if [ -d "certbot/conf/live/$DOMAIN" ]; then
    echo "   ✅ Já existe certificado para $DOMAIN"
    ls -la certbot/conf/live/$DOMAIN/
else
    echo "   ℹ️  Nenhum certificado encontrado"
fi
echo ""

echo "========================================="
echo "  Resumo do Diagnóstico"
echo "========================================="
echo ""
echo "Para o Let's Encrypt funcionar, você precisa:"
echo "✓ DNS apontando para o IP correto"
echo "✓ Portas 80 e 443 abertas no firewall"
echo "✓ Nginx rodando e respondendo"
echo ""
