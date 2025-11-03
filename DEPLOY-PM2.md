# 🚀 Deploy com PM2 no Ubuntu

Guia completo para fazer deploy da aplicação usando PM2 (Process Manager 2) no Ubuntu.

## 📋 Vantagens do PM2

- ✅ Mais simples que Docker
- ✅ Menos recursos de memória
- ✅ Reinício automático em caso de crash
- ✅ Logs integrados
- ✅ Modo cluster (multi-core)
- ✅ Monitoramento em tempo real

---

## 🚀 Deploy Automático (Recomendado)

### Passo Único:

```bash
chmod +x deploy-pm2.sh
./deploy-pm2.sh
```

Este script faz TUDO automaticamente:
1. ✅ Instala Node.js 20
2. ✅ Instala PM2
3. ✅ Instala PostgreSQL
4. ✅ Cria banco de dados
5. ✅ Cria arquivo .env
6. ✅ Instala dependências
7. ✅ Faz build da aplicação
8. ✅ Executa migrações
9. ✅ Inicia com PM2
10. ✅ Configura inicialização automática

---

## 📝 Deploy Manual (Passo a Passo)

### 1. Instalar Node.js 20

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v
```

### 2. Instalar PM2

```bash
sudo npm install -g pm2
pm2 -v
```

### 3. Instalar PostgreSQL

```bash
sudo apt update
sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

### 4. Criar Banco de Dados

```bash
sudo -u postgres psql
```

Dentro do PostgreSQL:
```sql
CREATE USER appuser WITH PASSWORD 'sua_senha_segura';
CREATE DATABASE appdb OWNER appuser;
GRANT ALL PRIVILEGES ON DATABASE appdb TO appuser;
\q
```

### 5. Configurar Variáveis de Ambiente

```bash
nano .env
```

Conteúdo:
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://appuser:sua_senha_segura@localhost:5432/appdb
```

### 6. Instalar Dependências e Build

```bash
npm ci
npm run build
```

### 7. Executar Migrações

```bash
npm run db:push
```

### 8. Iniciar com PM2

```bash
mkdir -p logs
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

Copie e execute o comando que aparecer.

---

## 🔧 aaPanel: Configuração Especial

Se você está usando **aaPanel**, siga estas instruções adicionais:

### Configurar Proxy Reverso

1. No aaPanel: **Websites** → [Seu Site] → **Proxy Reverso**
2. Configure:
   - URL de Destino: `http://127.0.0.1:5000`
   - ☑️ Enviar Host Header

3. **CRÍTICO:** Adicione na configuração personalizada:

```nginx
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header Host $http_host;
```

4. Reinicie:
```bash
sudo systemctl restart nginx
pm2 restart all
```

**📖 Guia completo aaPanel:** [AAPANEL-NGINX-CONFIG.md](./AAPANEL-NGINX-CONFIG.md)

**⚠️ Problema "Não Autorizado"?** Veja: [TROUBLESHOOTING-LOGIN.md](./TROUBLESHOOTING-LOGIN.md)

---

## 🌐 Adicionar Domínio com HTTPS (Opcional)

### Passo 1: Configure o DNS

No painel do seu provedor de domínio:
```
Tipo: A    Nome: @      Valor: IP_DO_SERVIDOR
Tipo: A    Nome: www    Valor: IP_DO_SERVIDOR
```

### Passo 2: Execute o script

```bash
chmod +x setup-nginx-pm2.sh
./setup-nginx-pm2.sh seudominio.com seu@email.com
```

**Exemplo:**
```bash
./setup-nginx-pm2.sh meusite.com.br contato@meusite.com.br
```

Isso vai:
- ✅ Instalar Nginx
- ✅ Instalar Certbot
- ✅ Configurar proxy reverso
- ✅ Obter certificado SSL
- ✅ Configurar renovação automática

---

## 📊 Comandos PM2 Úteis

### Gerenciar Aplicação

```bash
# Ver status
pm2 status

# Ver logs em tempo real
pm2 logs

# Ver logs apenas da app
pm2 logs app

# Monitor em tempo real (muito útil!)
pm2 monit

# Reiniciar
pm2 restart app

# Parar
pm2 stop app

# Remover
pm2 delete app

# Informações detalhadas
pm2 show app
```

### Logs

```bash
# Ver últimos logs
pm2 logs app --lines 100

# Limpar logs
pm2 flush

# Logs de erro
tail -f logs/err.log

# Logs de saída
tail -f logs/out.log
```

---

## 🔄 Atualizar a Aplicação

### Método 1: Script Automático

Crie um arquivo `atualizar.sh`:

```bash
#!/bin/bash
echo "🔄 Atualizando aplicação..."
git pull
npm ci
npm run build
npm run db:push
pm2 restart app
echo "✅ Atualização concluída!"
pm2 logs app --lines 50
```

Execute:
```bash
chmod +x atualizar.sh
./atualizar.sh
```

### Método 2: Manual

```bash
# 1. Baixar código
git pull

# 2. Instalar dependências
npm ci

# 3. Build
npm run build

# 4. Migrações (se houver)
npm run db:push

# 5. Reiniciar
pm2 restart app

# 6. Verificar
pm2 logs app
```

---

## 🔒 Configurar Firewall

```bash
# Habilitar firewall
sudo ufw enable

# Permitir SSH (IMPORTANTE!)
sudo ufw allow 22/tcp

# Permitir HTTP e HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Se não usar Nginx, permitir porta 5000
sudo ufw allow 5000/tcp

# Ver status
sudo ufw status
```

---

## 🗄️ Gerenciar PostgreSQL

### Backup

```bash
# Criar backup
pg_dump -U appuser appdb > backup_$(date +%Y%m%d).sql

# Com senha
PGPASSWORD=sua_senha pg_dump -U appuser appdb > backup.sql
```

### Restaurar

```bash
# Restaurar backup
psql -U appuser appdb < backup.sql

# Com senha
PGPASSWORD=sua_senha psql -U appuser appdb < backup.sql
```

### Conectar ao banco

```bash
# Como usuário postgres
sudo -u postgres psql

# Como appuser
psql -U appuser -d appdb

# Ver tabelas
\dt

# Sair
\q
```

---

## 📈 Monitoramento

### PM2 Plus (Opcional - Grátis)

```bash
# Criar conta em https://pm2.io
pm2 plus

# Seguir instruções para vincular
```

Você terá:
- Dashboard web
- Monitoramento em tempo real
- Alertas
- Análise de performance

---

## ❓ Troubleshooting

### Aplicação não inicia

```bash
# Ver logs de erro
pm2 logs app --err

# Verificar se o build existe
ls -la dist/index.js

# Testar manualmente
node dist/index.js
```

### Erro de conexão com banco

```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Testar conexão
psql -U appuser -d appdb

# Ver variável de ambiente
pm2 env 0
```

### Porta 5000 já em uso

```bash
# Ver o que está usando a porta
sudo lsof -i :5000

# Matar processo
sudo kill -9 $(sudo lsof -t -i:5000)
```

### PM2 não inicia no boot

```bash
# Reconfigurar startup
pm2 unstartup
pm2 startup

# Executar comando que aparecer
pm2 save
```

---

## 🎯 Estrutura de Arquivos

```
projeto/
├── dist/              # Build da aplicação
├── logs/              # Logs do PM2
│   ├── err.log
│   ├── out.log
│   └── combined.log
├── node_modules/
├── server/
├── client/
├── shared/
├── .env              # Variáveis de ambiente
├── ecosystem.config.js  # Configuração PM2
├── package.json
└── deploy-pm2.sh     # Script de deploy
```

---

## ✅ Checklist Final

- [ ] Node.js 20 instalado
- [ ] PM2 instalado
- [ ] PostgreSQL rodando
- [ ] Banco de dados criado
- [ ] Arquivo .env configurado
- [ ] Build concluído (dist/index.js existe)
- [ ] Migrações executadas
- [ ] PM2 iniciado e rodando
- [ ] PM2 configurado para boot
- [ ] Firewall configurado
- [ ] (Opcional) Nginx + SSL configurado

---

## 📞 Comparação: PM2 vs Docker

| Característica | PM2 | Docker |
|---|---|---|
| Simplicidade | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Uso de memória | Baixo | Médio |
| Isolamento | Não | Sim |
| Portabilidade | Média | Alta |
| Aprendizado | Fácil | Médio |
| Multi-servidor | Difícil | Fácil |

**PM2 é melhor quando:**
- Você tem um único servidor
- Quer algo simples e direto
- Recursos limitados
- Precisa de setup rápido

**Docker é melhor quando:**
- Múltiplos servidores
- Precisa de isolamento completo
- Ambiente replicável
- Microserviços

---

Pronto! Sua aplicação está rodando com PM2. 🚀
