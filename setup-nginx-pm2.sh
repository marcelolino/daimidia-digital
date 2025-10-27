#!/bin/bash

echo "========================================="
echo "  Configurar Nginx + SSL com PM2"
echo "========================================="
echo ""

if [ -z "$1" ] || [ -z "$2" ]; then
    echo "❌ Uso incorreto!"
    echo ""
    echo "Como usar:"
    echo "  ./setup-nginx-pm2.sh SEU_DOMINIO.com seu@email.com"
    echo ""
    echo "Exemplo:"
    echo "  ./setup-nginx-pm2.sh meusite.com contato@meusite.com"
    exit 1
fi

DOMAIN=$1
EMAIL=$2

echo "🌐 Domínio: $DOMAIN"
echo "📧 Email: $EMAIL"
echo ""

echo "📦 Verificando se Nginx está instalado..."
if ! command -v nginx &> /dev/null; then
    echo "Instalando Nginx..."
    sudo apt update
    sudo apt install -y nginx
fi

echo "✅ Nginx instalado"
echo ""

echo "📦 Verificando se Certbot está instalado..."
if ! command -v certbot &> /dev/null; then
    echo "Instalando Certbot..."
    sudo apt install -y certbot python3-certbot-nginx
fi

echo "✅ Certbot instalado"
echo ""

echo "📝 Criando configuração do Nginx..."
sudo tee /etc/nginx/sites-available/$DOMAIN > /dev/null << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    client_max_body_size 100M;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF

echo "✅ Configuração criada"
echo ""

echo "🔗 Ativando site..."
sudo ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/

echo ""
echo "🧪 Testando configuração do Nginx..."
sudo nginx -t

if [ $? -ne 0 ]; then
    echo "❌ Erro na configuração do Nginx!"
    exit 1
fi

echo ""
echo "🔄 Recarregando Nginx..."
sudo systemctl reload nginx

echo ""
echo "🔒 Obtendo certificado SSL..."
sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --email $EMAIL --agree-tos --no-eff-email --redirect

if [ $? -eq 0 ]; then
    echo ""
    echo "========================================="
    echo "✅ HTTPS configurado com sucesso!"
    echo "========================================="
    echo ""
    echo "🌐 Seu site está disponível em:"
    echo "   https://$DOMAIN"
    echo "   https://www.$DOMAIN"
    echo ""
    echo "🔒 Certificado SSL:"
    echo "   ✅ Válido por 90 dias"
    echo "   ✅ Renovação automática configurada"
    echo ""
    echo "📝 Comandos úteis:"
    echo "   sudo systemctl status nginx    - Status do Nginx"
    echo "   sudo nginx -t                  - Testar configuração"
    echo "   sudo systemctl reload nginx    - Recarregar Nginx"
    echo "   sudo certbot renew --dry-run   - Testar renovação SSL"
    echo ""
else
    echo ""
    echo "❌ Falha ao obter certificado SSL!"
    echo ""
    echo "Verifique:"
    echo "  1. DNS está apontando para este servidor"
    echo "  2. Portas 80/443 estão abertas no firewall"
    echo "  3. Não há outro serviço usando as portas"
    echo ""
fi
