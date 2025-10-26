# 🐳 Deploy com Docker no Ubuntu

Este guia explica como fazer o deploy manual desta aplicação usando Docker e PostgreSQL no Ubuntu.

## 📋 Pré-requisitos

- Ubuntu 20.04 ou superior
- Acesso root ou sudo
- Git instalado

## 🚀 Instalação Rápida

### 1. Instalar Docker e Docker Compose

```bash
# Atualizar pacotes
sudo apt update

# Instalar Docker
sudo apt install -y docker.io docker-compose

# Habilitar Docker para iniciar no boot
sudo systemctl enable --now docker

# Adicionar seu usuário ao grupo docker (para não precisar de sudo)
sudo usermod -aG docker $USER

# Fazer logout e login novamente para aplicar as mudanças
```

### 2. Clonar o Repositório

```bash
git clone <seu-repositorio>
cd <nome-do-projeto>
```

### 3. Configurar Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar e configurar suas senhas
nano .env
```

**Exemplo de .env:**
```env
POSTGRES_USER=meuusuario
POSTGRES_PASSWORD=SenhaSegura123!
POSTGRES_DB=meubanco
NODE_ENV=production
PORT=5000
```

### 4. Deploy Automático

```bash
# Dar permissão de execução ao script
chmod +x deploy.sh

# Executar o script de deploy
./deploy.sh
```

## 📝 Deploy Manual (Passo a Passo)

Se preferir fazer manualmente:

```bash
# 1. Construir a imagem
docker-compose build

# 2. Iniciar os containers
docker-compose up -d

# 3. Executar migrações do banco
docker-compose exec app npm run db:push
```

## 🔧 Comandos Úteis

### Gerenciar Containers

```bash
# Ver status dos containers
docker-compose ps

# Ver logs em tempo real
docker-compose logs -f

# Ver logs apenas da aplicação
docker-compose logs -f app

# Ver logs apenas do PostgreSQL
docker-compose logs -f postgres

# Parar os containers
docker-compose down

# Reiniciar os containers
docker-compose restart

# Reiniciar apenas a aplicação
docker-compose restart app
```

### Atualizar a Aplicação

```bash
# 1. Baixar últimas alterações
git pull

# 2. Parar containers
docker-compose down

# 3. Reconstruir a imagem
docker-compose build

# 4. Iniciar novamente
docker-compose up -d

# 5. Executar migrações (se houver)
docker-compose exec app npm run db:push
```

### Acessar o Banco de Dados

```bash
# Conectar ao PostgreSQL via psql
docker-compose exec postgres psql -U <seu_usuario> -d <seu_banco>

# Exemplo:
docker-compose exec postgres psql -U appuser -d appdb
```

### Backup do Banco de Dados

```bash
# Criar backup
docker-compose exec postgres pg_dump -U appuser appdb > backup.sql

# Restaurar backup
cat backup.sql | docker-compose exec -T postgres psql -U appuser -d appdb
```

## 🌐 Configurar Nginx (Opcional mas Recomendado)

Para usar um domínio e ter SSL:

### 1. Instalar Nginx

```bash
sudo apt install -y nginx
```

### 2. Criar Configuração

```bash
sudo nano /etc/nginx/sites-available/minha-app
```

**Conteúdo:**
```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 3. Ativar Site

```bash
# Criar link simbólico
sudo ln -s /etc/nginx/sites-available/minha-app /etc/nginx/sites-enabled/

# Testar configuração
sudo nginx -t

# Recarregar Nginx
sudo systemctl reload nginx

# Permitir HTTP/HTTPS no firewall
sudo ufw allow 'Nginx Full'
```

### 4. Configurar SSL com Let's Encrypt

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obter certificado SSL
sudo certbot --nginx -d seu-dominio.com

# O certificado será renovado automaticamente
```

## 🔒 Segurança

### Configurar Firewall

```bash
# Habilitar firewall
sudo ufw enable

# Permitir SSH
sudo ufw allow 22/tcp

# Permitir HTTP e HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Ver status
sudo ufw status
```

### Proteger PostgreSQL

O PostgreSQL está configurado para aceitar conexões apenas de dentro do Docker. Se quiser expô-lo externamente, remova a seção `ports` do `docker-compose.yml`:

```yaml
# Comentar ou remover esta seção:
# ports:
#   - "5432:5432"
```

## 📊 Monitoramento

### Ver Uso de Recursos

```bash
# Ver uso de recursos dos containers
docker stats

# Ver espaço em disco
docker system df
```

### Limpar Recursos Não Utilizados

```bash
# Limpar containers parados, redes e imagens não utilizadas
docker system prune -a

# Cuidado: isso removerá todas as imagens não utilizadas
```

## ❓ Troubleshooting

### Container não inicia

```bash
# Ver logs de erro
docker-compose logs

# Verificar se a porta 5000 está em uso
sudo lsof -i :5000

# Verificar se o PostgreSQL está saudável
docker-compose exec postgres pg_isready
```

### Erro de conexão com banco de dados

```bash
# Verificar se o PostgreSQL está rodando
docker-compose ps postgres

# Testar conexão
docker-compose exec app sh -c 'echo $DATABASE_URL'

# Reiniciar o PostgreSQL
docker-compose restart postgres
```

### Porta 5000 já em uso

Edite o `docker-compose.yml` e altere a porta:

```yaml
ports:
  - "8080:5000"  # Usar porta 8080 externamente
```

## 🎯 Acesso à Aplicação

Após o deploy:

- **Local:** http://localhost:5000
- **Servidor:** http://seu-ip-ou-dominio:5000
- **Com Nginx:** http://seu-dominio.com

## 📞 Suporte

Se tiver problemas:

1. Verifique os logs: `docker-compose logs -f`
2. Verifique o status: `docker-compose ps`
3. Reinicie os containers: `docker-compose restart`

---

**Pronto!** Sua aplicação está rodando com Docker no Ubuntu. 🎉
