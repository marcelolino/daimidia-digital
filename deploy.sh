#!/bin/bash

echo "========================================="
echo "  Deploy com Docker - Guia de Instalação"
echo "========================================="
echo ""

if [ ! -f .env ]; then
    echo "⚠️  Arquivo .env não encontrado!"
    echo "📝 Criando .env a partir do .env.example..."
    cp .env.example .env
    echo "✅ Arquivo .env criado!"
    echo ""
    echo "⚠️  IMPORTANTE: Edite o arquivo .env e altere as senhas antes de continuar!"
    echo "   Execute: nano .env"
    echo ""
    read -p "Pressione ENTER depois de editar o .env..."
fi

echo "🔍 Verificando Docker..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não está instalado!"
    echo ""
    echo "Para instalar o Docker no Ubuntu, execute:"
    echo "  sudo apt update"
    echo "  sudo apt install -y docker.io docker-compose"
    echo "  sudo systemctl enable --now docker"
    echo "  sudo usermod -aG docker \$USER"
    echo ""
    echo "Depois, faça logout e login novamente."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose não está instalado!"
    echo ""
    echo "Para instalar, execute:"
    echo "  sudo apt install -y docker-compose"
    exit 1
fi

echo "✅ Docker está instalado!"
echo ""

echo "🛑 Parando containers antigos (se existirem)..."
docker-compose down

echo ""
echo "🏗️  Construindo imagem Docker..."
docker-compose build

echo ""
echo "🚀 Iniciando containers..."
docker-compose up -d

echo ""
echo "⏳ Aguardando PostgreSQL inicializar..."
sleep 5

echo ""
echo "📊 Executando migrações do banco de dados..."
docker-compose exec app npm run db:push

echo ""
echo "========================================="
echo "✅ Deploy concluído com sucesso!"
echo "========================================="
echo ""
echo "📍 Sua aplicação está rodando em:"
echo "   http://localhost:5000"
echo ""
echo "📝 Comandos úteis:"
echo "   Ver logs:           docker-compose logs -f"
echo "   Ver logs da app:    docker-compose logs -f app"
echo "   Parar:              docker-compose down"
echo "   Reiniciar:          docker-compose restart"
echo "   Status:             docker-compose ps"
echo ""
echo "🗄️  PostgreSQL:"
echo "   Host: localhost"
echo "   Porta: 5432"
echo "   Usuário: (veja no .env)"
echo "   Senha: (veja no .env)"
echo "   Banco: (veja no .env)"
echo ""
