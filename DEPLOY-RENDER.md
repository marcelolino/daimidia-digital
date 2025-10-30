# Deploy no Render.com com Banco de Dados Vercel

Este guia explica como fazer deploy da sua aplicação no Render.com usando o banco de dados PostgreSQL da Vercel.

## 📋 Pré-requisitos

1. Conta no [Render.com](https://render.com)
2. Conta na [Vercel](https://vercel.com)
3. Repositório Git (GitHub, GitLab ou Bitbucket)
4. Código da aplicação commitado no repositório

## 🗄️ Configurando o Banco de Dados na Vercel

### Passo 1: Criar o Banco de Dados

1. Acesse o [Dashboard da Vercel](https://vercel.com/dashboard)
2. Clique em **Storage** no menu lateral
3. Clique em **Create Database**
4. Selecione **Postgres**
5. Escolha um nome para o banco (ex: `meu-app-db`)
6. Selecione a região mais próxima dos seus usuários
7. Clique em **Create**

### Passo 2: Obter a Connection String

1. Após criar o banco, vá para a aba **Settings** do banco de dados
2. Na seção **Connection String**, você verá várias variáveis de ambiente
3. Copie a variável **POSTGRES_URL** - ela será usada no Render

A connection string tem este formato:
```
postgres://usuario:senha@host:5432/database?sslmode=require
```

### Passo 3: Aplicar as Migrações

Para criar as tabelas no banco Vercel, execute localmente:

```bash
# 1. Copie a connection string da Vercel
export DATABASE_URL="postgres://usuario:senha@host:5432/database?sslmode=require"

# 2. Execute as migrações
npm run db:push
```

## 🚀 Deploy no Render.com

### Passo 1: Criar Web Service

1. Acesse o [Dashboard do Render](https://dashboard.render.com)
2. Clique em **New +** → **Web Service**
3. Conecte seu repositório Git
4. Configure o serviço:
   - **Name**: Nome da sua aplicação (ex: `meu-app`)
   - **Region**: Escolha a região mais próxima
   - **Branch**: `main` ou `master`
   - **Root Directory**: (deixe vazio)
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

### Passo 2: Configurar Variáveis de Ambiente

Na seção **Environment Variables**, adicione as seguintes variáveis:

#### Variáveis Obrigatórias:

```bash
# Banco de Dados (copie da Vercel)
DATABASE_URL=postgres://usuario:senha@host:5432/database?sslmode=require

# Ambiente
NODE_ENV=production

# Porta (Render define automaticamente, mas pode adicionar)
PORT=10000

# Segurança da Sessão (gere uma string aleatória segura)
SESSION_SECRET=sua_chave_secreta_muito_forte_aqui_123456
```

#### Como Gerar SESSION_SECRET Seguro:

Execute no terminal:
```bash
# Opção 1: usando Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Opção 2: usando OpenSSL
openssl rand -hex 32
```

### Passo 3: Configurações Avançadas

1. **Auto-Deploy**: Deixe habilitado para deploy automático a cada push
2. **Health Check Path**: `/` (opcional)
3. **Disk**: Se sua app faz upload de arquivos, adicione um disco persistente

### Passo 4: Deploy

1. Clique em **Create Web Service**
2. O Render iniciará o build e deploy automaticamente
3. Acompanhe os logs em tempo real
4. Quando concluído, seu app estará disponível em: `https://seu-app.onrender.com`

## 🔄 Atualizações Automáticas

Após a configuração inicial:
- Cada `git push` para a branch configurada dispara um deploy automático
- Se você alterar variáveis de ambiente, o Render redeploya automaticamente

## 📊 Monitoramento

### Ver Logs:
1. No dashboard do Render, clique no seu serviço
2. Vá para a aba **Logs**
3. Veja logs em tempo real ou filtre por data

### Métricas:
- **Metrics**: CPU, memória, requisições
- **Events**: Histórico de deploys

## 🔧 Solução de Problemas

### Erro: "DATABASE_URL must be set"
- Verifique se a variável `DATABASE_URL` está configurada no Render
- Certifique-se de que copiou a connection string completa da Vercel

### Erro: "Port already in use"
- Não configure `PORT=5000` - use `PORT=10000` ou deixe o Render definir automaticamente
- O código já usa `process.env.PORT` corretamente

### App não inicia após deploy:
1. Verifique os logs no Render
2. Confirme que o build foi concluído com sucesso
3. Verifique se todas as variáveis de ambiente estão corretas

### Erro de conexão com banco de dados:
1. Teste a connection string localmente primeiro
2. Verifique se o formato está correto: `postgres://` (não `postgresql://`)
3. Certifique-se de que `?sslmode=require` está no final da URL
4. Verifique se as migrações foram executadas (`npm run db:push`)

### Build falha com erro TypeScript:
- Certifique-se de que todos os tipos estão corretos
- Execute `npm run check` localmente para verificar erros

## 📝 Variáveis de Ambiente - Referência Completa

Crie um arquivo `.env.example` no seu repositório com este conteúdo (SEM valores reais):

```bash
# Banco de Dados
DATABASE_URL=

# Ambiente
NODE_ENV=production

# Porta (Render define automaticamente)
PORT=10000

# Segurança
SESSION_SECRET=
```

## 🔐 Segurança

### Boas Práticas:

1. **Nunca commite** arquivos `.env` com valores reais
2. **Sempre use** variáveis de ambiente para dados sensíveis
3. **Gere** SESSION_SECRET forte e único
4. **Mantenha** a connection string do banco em segredo
5. **Use SSL/HTTPS** (Render fornece automaticamente)

### Adicione ao .gitignore:

```gitignore
.env
.env.local
.env.production
.env.development
```

## 🌐 Domínio Personalizado (Opcional)

1. No Render, vá para **Settings** → **Custom Domain**
2. Adicione seu domínio
3. Configure os registros DNS conforme instruções do Render
4. O SSL é configurado automaticamente

## 💡 Dicas

- **Logs em Tempo Real**: Use `console.log()` e veja no dashboard do Render
- **Deploy Manual**: No dashboard, clique em **Manual Deploy** → **Deploy latest commit**
- **Rollback**: Vá para **Events** e faça rollback para um deploy anterior
- **Escalonamento**: Planos pagos permitem múltiplas instâncias

## 📚 Recursos

- [Documentação do Render](https://render.com/docs)
- [Documentação Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
- [Node.js no Render](https://render.com/docs/deploy-node-express-app)

## ✅ Checklist de Deploy

- [ ] Banco de dados Vercel criado
- [ ] Connection string copiada
- [ ] Migrações executadas (`npm run db:push`)
- [ ] Código commitado no Git
- [ ] Web Service criado no Render
- [ ] Variáveis de ambiente configuradas
- [ ] Build completado com sucesso
- [ ] App acessível via URL do Render
- [ ] Logs verificados
- [ ] Domínio personalizado configurado (opcional)

---

**Pronto!** Sua aplicação está rodando no Render.com com banco de dados na Vercel! 🎉
