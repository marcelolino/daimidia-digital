#!/bin/bash

echo "========================================="
echo "  Deploy com PM2 no Ubuntu"
echo "========================================="
echo ""

# Verificar se está rodando como root
if [ "$EUID" -eq 0 ]; then 
    echo "❌ Não execute como root! Use seu usuário normal."
    exit 1
fi

echo "📦 Passo 1: Verificando Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não instalado!"
    echo ""
    echo "Instalando Node.js 20..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
fi

NODE_VERSION=$(node -v)
echo "✅ Node.js instalado: $NODE_VERSION"
echo ""

echo "📦 Passo 2: Verificando PM2..."
if ! command -v pm2 &> /dev/null; then
    echo "Instalando PM2 globalmente..."
    sudo npm install -g pm2
fi

PM2_VERSION=$(pm2 -v)
echo "✅ PM2 instalado: $PM2_VERSION"
echo ""

echo "📦 Passo 3: Verificando PostgreSQL..."
if ! command -v psql &> /dev/null; then
    echo "Instalando PostgreSQL..."
    sudo apt update
    sudo apt install -y postgresql postgresql-contrib
    sudo systemctl enable postgresql
    sudo systemctl start postgresql
fi

PG_VERSION=$(psql --version)
echo "✅ PostgreSQL: $PG_VERSION"
echo ""

echo "🗄️  Passo 4: Configurando banco de dados..."
if [ ! -f .env ]; then
    echo ""
    read -p "Nome do banco de dados [appdb]: " DB_NAME
    DB_NAME=${DB_NAME:-appdb}
    
    read -p "Usuário do banco [appuser]: " DB_USER
    DB_USER=${DB_USER:-appuser}
    
    read -sp "Senha do banco: " DB_PASS
    echo ""
    
    if [ -z "$DB_PASS" ]; then
        DB_PASS="senha$(date +%s)"
        echo "⚠️  Senha gerada automaticamente: $DB_PASS"
    fi
    
    echo ""
    echo "Criando banco de dados..."
    
    sudo -u postgres psql << EOF
CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';
CREATE DATABASE $DB_NAME OWNER $DB_USER;
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
\q
EOF
    
    if [ $? -eq 0 ]; then
        echo "✅ Banco de dados criado!"
        
        cat > .env << EOF
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://$DB_USER:$DB_PASS@localhost:5432/$DB_NAME
EOF
        echo "✅ Arquivo .env criado!"
    else
        echo "⚠️  Erro ao criar banco. Pode ser que já exista."
    fi
else
    echo "✅ Arquivo .env já existe"
fi

echo ""
echo "📦 Passo 5: Instalando dependências..."
npm ci

echo ""
echo "🏗️  Passo 6: Construindo aplicação..."
npm run build

if [ ! -f "dist/index.js" ]; then
    echo "❌ Erro no build! Arquivo dist/index.js não foi criado."
    exit 1
fi

echo "✅ Build concluído!"
echo ""

echo "📊 Passo 7: Executando migrações..."
# Carregar variáveis de ambiente
export $(cat .env | grep -v '^#' | xargs)
npm run db:push

echo ""
echo "📁 Criando diretório de logs..."
mkdir -p logs

echo ""
echo "🚀 Passo 8: Iniciando aplicação com PM2..."
pm2 delete app 2>/dev/null || true
pm2 start ecosystem.config.cjs

echo ""
echo "💾 Salvando configuração PM2..."
pm2 save

echo ""
echo "🔄 Configurando PM2 para iniciar no boot..."
pm2 startup systemd -u $USER --hp $HOME

echo ""
echo "========================================="
echo "✅ Deploy concluído com sucesso!"
echo "========================================="
echo ""

SERVER_IP=$(curl -s ifconfig.me)
echo "🌐 Acesse sua aplicação:"
echo "   http://localhost:5000"
echo "   http://$SERVER_IP:5000"
echo ""

echo "📊 Comandos úteis PM2:"
echo "   pm2 status          - Ver status"
echo "   pm2 logs            - Ver logs em tempo real"
echo "   pm2 logs app        - Logs apenas da app"
echo "   pm2 restart app     - Reiniciar"
echo "   pm2 stop app        - Parar"
echo "   pm2 delete app      - Remover"
echo "   pm2 monit           - Monitor em tempo real"
echo ""

echo "🔄 Atualizar aplicação:"
echo "   git pull"
echo "   npm ci"
echo "   npm run build"
echo "   npm run db:push"
echo "   pm2 restart app"
echo ""
