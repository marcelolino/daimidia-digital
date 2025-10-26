#!/bin/bash

echo "========================================="
echo "  Configuração de Domínio com SSL"
echo "========================================="
echo ""

# Verificar se o usuário forneceu o domínio
if [ -z "$1" ] || [ -z "$2" ]; then
    echo "❌ Uso incorreto!"
    echo ""
    echo "Como usar:"
    echo "  ./setup-domain.sh SEU_DOMINIO.com seu@email.com"
    echo ""
    echo "Exemplo:"
    echo "  ./setup-domain.sh meusite.com contato@meusite.com"
    echo ""
    exit 1
fi

DOMAIN=$1
EMAIL=$2

echo "🌐 Domínio: $DOMAIN"
echo "📧 Email: $EMAIL"
echo ""

# Verificar se o domínio já está apontando para este servidor
echo "🔍 Verificando DNS do domínio..."
DOMAIN_IP=$(dig +short $DOMAIN | tail -n1)
SERVER_IP=$(curl -s ifconfig.me)

if [ -z "$DOMAIN_IP" ]; then
    echo "⚠️  AVISO: Não foi possível resolver o DNS do domínio $DOMAIN"
    echo ""
    echo "Certifique-se de que:"
    echo "  1. O domínio está registrado"
    echo "  2. Você configurou um registro A apontando para: $SERVER_IP"
    echo ""
    echo "No seu provedor de DNS, adicione:"
    echo "  Tipo: A"
    echo "  Nome: @"
    echo "  Valor: $SERVER_IP"
    echo ""
    echo "  Tipo: A"
    echo "  Nome: www"
    echo "  Valor: $SERVER_IP"
    echo ""
    read -p "Deseja continuar mesmo assim? (s/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        exit 1
    fi
else
    echo "✅ Domínio resolve para: $DOMAIN_IP"
    echo "✅ IP deste servidor: $SERVER_IP"
    
    if [ "$DOMAIN_IP" != "$SERVER_IP" ]; then
        echo "⚠️  AVISO: O domínio NÃO aponta para este servidor!"
        echo "   O certificado SSL pode falhar."
        echo ""
        read -p "Deseja continuar mesmo assim? (s/N): " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Ss]$ ]]; then
            exit 1
        fi
    else
        echo "✅ Domínio configurado corretamente!"
    fi
fi

echo ""
echo "📝 Configurando Nginx..."

# Substituir o domínio no arquivo de configuração do Nginx
sed -i "s/SEU_DOMINIO.com/$DOMAIN/g" nginx/nginx.conf

echo "✅ Nginx configurado!"
echo ""

# Criar diretórios necessários
echo "📁 Criando diretórios..."
mkdir -p certbot/conf
mkdir -p certbot/www

echo "✅ Diretórios criados!"
echo ""

# Parar containers antigos se existirem
echo "🛑 Parando containers antigos..."
docker-compose -f docker-compose.prod.yml down 2>/dev/null || true

echo ""
echo "🏗️  Iniciando containers..."
docker-compose -f docker-compose.prod.yml up -d postgres app nginx

echo ""
echo "⏳ Aguardando serviços iniciarem (10 segundos)..."
sleep 10

echo ""
echo "📊 Executando migrações do banco de dados..."
docker-compose -f docker-compose.prod.yml exec app npm run db:push

echo ""
echo "🔒 Obtendo certificado SSL do Let's Encrypt..."
docker-compose -f docker-compose.prod.yml run --rm certbot certonly \
    --webroot \
    --webroot-path /var/www/certbot \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    --force-renewal \
    -d $DOMAIN \
    -d www.$DOMAIN

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Certificado SSL obtido com sucesso!"
    echo ""
    echo "🔄 Reiniciando Nginx..."
    docker-compose -f docker-compose.prod.yml restart nginx
    
    echo ""
    echo "========================================="
    echo "✅ Configuração concluída com sucesso!"
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
    echo "   Ver logs:           docker-compose -f docker-compose.prod.yml logs -f"
    echo "   Parar:              docker-compose -f docker-compose.prod.yml down"
    echo "   Reiniciar:          docker-compose -f docker-compose.prod.yml restart"
    echo "   Status:             docker-compose -f docker-compose.prod.yml ps"
    echo ""
    echo "🔐 Testar SSL:"
    echo "   https://www.ssllabs.com/ssltest/analyze.html?d=$DOMAIN"
    echo ""
else
    echo ""
    echo "❌ Falha ao obter certificado SSL!"
    echo ""
    echo "Possíveis causas:"
    echo "  1. O domínio não aponta para este servidor"
    echo "  2. Portas 80/443 não estão abertas no firewall"
    echo "  3. Já existe um certificado recente (aguarde 1 hora)"
    echo ""
    echo "Verifique os logs:"
    echo "  docker-compose -f docker-compose.prod.yml logs certbot"
    echo ""
    exit 1
fi
