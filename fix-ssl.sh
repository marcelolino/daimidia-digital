#!/bin/bash

echo "========================================="
echo "  Correção de Problemas SSL"
echo "========================================="
echo ""

if [ -z "$1" ] || [ -z "$2" ]; then
    echo "❌ Uso incorreto!"
    echo "   ./fix-ssl.sh seudominio.com seu@email.com"
    exit 1
fi

DOMAIN=$1
EMAIL=$2

echo "🌐 Domínio: $DOMAIN"
echo "📧 Email: $EMAIL"
echo ""

echo "1️⃣ Parando containers..."
docker-compose -f docker-compose.prod.yml down

echo ""
echo "2️⃣ Removendo certificados antigos (se existirem)..."
sudo rm -rf certbot/conf/live/$DOMAIN
sudo rm -rf certbot/conf/archive/$DOMAIN
sudo rm -rf certbot/conf/renewal/$DOMAIN.conf

echo ""
echo "3️⃣ Recriando diretórios..."
mkdir -p certbot/conf
mkdir -p certbot/www

echo ""
echo "4️⃣ Atualizando nginx.conf com o domínio..."
sed -i "s/SEU_DOMINIO.com/$DOMAIN/g" nginx/nginx.conf

echo ""
echo "5️⃣ Iniciando PostgreSQL e App..."
docker-compose -f docker-compose.prod.yml up -d postgres app

echo ""
echo "⏳ Aguardando serviços (15 segundos)..."
sleep 15

echo ""
echo "6️⃣ Iniciando Nginx..."
docker-compose -f docker-compose.prod.yml up -d nginx

echo ""
echo "⏳ Aguardando Nginx (5 segundos)..."
sleep 5

echo ""
echo "7️⃣ Testando se o Nginx está acessível..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://$DOMAIN/ 2>/dev/null)
echo "   Código HTTP: $HTTP_CODE"

if [ "$HTTP_CODE" == "301" ] || [ "$HTTP_CODE" == "404" ] || [ "$HTTP_CODE" == "200" ]; then
    echo "   ✅ Nginx está respondendo!"
    
    echo ""
    echo "8️⃣ Obtendo certificado SSL (modo verboso)..."
    docker-compose -f docker-compose.prod.yml run --rm certbot certonly \
        --webroot \
        --webroot-path /var/www/certbot \
        --email $EMAIL \
        --agree-tos \
        --no-eff-email \
        --verbose \
        -d $DOMAIN \
        -d www.$DOMAIN
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Certificado obtido com sucesso!"
        echo ""
        echo "9️⃣ Reiniciando Nginx..."
        docker-compose -f docker-compose.prod.yml restart nginx
        
        echo ""
        echo "========================================="
        echo "✅ HTTPS configurado com sucesso!"
        echo "========================================="
        echo ""
        echo "Acesse: https://$DOMAIN"
    else
        echo ""
        echo "❌ Falha ao obter certificado!"
        echo ""
        echo "Execute o diagnóstico:"
        echo "   ./diagnostico-ssl.sh $DOMAIN"
    fi
else
    echo "   ❌ Nginx não está acessível pela internet!"
    echo ""
    echo "Verifique:"
    echo "   1. DNS está configurado? (dig +short $DOMAIN)"
    echo "   2. Firewall liberado? (sudo ufw status)"
    echo "   3. Servidor tem IP público?"
    echo ""
    echo "Execute o diagnóstico:"
    echo "   ./diagnostico-ssl.sh $DOMAIN"
fi
