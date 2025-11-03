# ✅ Login Simplificado - Pronto para OpenLiteSpeed + PM2

## 🎯 O que foi alterado?

Simplifiquei completamente o sistema de autenticação para usar **Passport.js** (igual ao seu app que funciona):

### 1. **Novo `server/auth.ts`** 
- ✅ Usa **Passport.js** com LocalStrategy
- ✅ Usa **scrypt** para hash (ao invés de bcrypt)
- ✅ **MemoryStore** para sessões (mais simples que PostgreSQL)
- ✅ Configuração simplificada compatível com OpenLiteSpeed

### 2. **Rotas atualizadas** (`server/routes.ts`)
- ✅ Login usa `passport.authenticate()`
- ✅ Logout usa `req.logout()`
- ✅ User check usa `req.isAuthenticated()`

### 3. **Script para criar admin**
- ✅ Novo comando: `npm run create-admin`

---

## 🚀 Como usar no servidor PM2

### Passo 1: Atualizar o código

```bash
# Faça pull das alterações
git pull

# Ou copie manualmente os arquivos atualizados:
# - server/auth.ts
# - server/routes.ts
# - scripts/create-admin.ts
```

### Passo 2: Instalar dependências

```bash
npm ci
```

### Passo 3: Rebuild

```bash
npm run build
```

### Passo 4: Criar usuário admin

```bash
# Com banco externo Neon, configure DATABASE_URL primeiro:
export DATABASE_URL="sua_connection_string_neon"

# Execute o script:
npm run create-admin
```

Isso criará:
- **Email:** admin@daimidia.com
- **Senha:** admin123

### Passo 5: Reiniciar PM2

```bash
pm2 restart all
pm2 logs
```

---

## 🔧 Configuração OpenLiteSpeed

O código já está otimizado para OpenLiteSpeed. **Não precisa configurar headers especiais** como no Nginx, pois o sistema de sessão agora usa **MemoryStore** ao invés de PostgreSQL.

### Configuração mínima no .env:

```bash
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://usuario:senha@host.neon.tech/banco?sslmode=require
SESSION_SECRET=sua_chave_forte_aqui
```

**Gerar SESSION_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## ✨ Vantagens do novo sistema

### 1. **Mais Simples**
- Usa MemoryStore (sem dependência de PostgreSQL para sessões)
- Menos configuração necessária
- Funciona out-of-the-box com OpenLiteSpeed

### 2. **Mais Compatível**
- Usa o mesmo padrão do seu app que funciona
- Passport.js é battle-tested e confiável
- Scrypt é nativo do Node.js (sem dependências externas)

### 3. **Melhor para Deploy**
- Não precisa criar tabela de sessões
- Não precisa configurar headers especiais de proxy
- Sessões são limpas automaticamente a cada 24h

---

## 🔑 Gerenciar Usuários Admin

### Criar novo admin:

```bash
npm run create-admin
```

### Ou criar manualmente via psql:

```bash
# Conecte ao banco Neon
psql "sua_connection_string_neon"

# Gere hash da senha primeiro (em outro terminal):
node -e "
const crypto = require('crypto');
const scrypt = crypto.promisify(crypto.scrypt);
(async () => {
  const salt = crypto.randomBytes(16).toString('hex');
  const buf = await scrypt('suasenha', salt, 64);
  console.log(buf.toString('hex') + '.' + salt);
})();
"

# Depois insira no banco (substitua o hash):
INSERT INTO users (email, password, role, \"firstName\", \"lastName\", \"createdAt\", \"updatedAt\")
VALUES (
  'admin@seusite.com',
  'hash_gerado_acima',
  'admin',
  'Admin',
  'Sistema',
  NOW(),
  NOW()
);
```

---

## 🧪 Testar localmente

```bash
# Inicie o servidor
npm run dev

# Em outro terminal, teste o login:
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@daimidia.com","password":"admin123"}'
```

Deve retornar:
```json
{
  "id": "...",
  "email": "admin@daimidia.com",
  "role": "admin",
  ...
}
```

---

## ⚠️ IMPORTANTE: Migração de Senhas

Se você já tem usuários no banco com senhas em **bcrypt**, eles **NÃO vão funcionar** com o novo sistema que usa **scrypt**.

### Solução 1: Resetar senhas
```bash
# Execute o script create-admin para criar novo admin
npm run create-admin

# Peça aos usuários para resetarem suas senhas
```

### Solução 2: Manter compatibilidade (avançado)

Se precisar manter usuários antigos, posso criar um sistema híbrido que aceita tanto bcrypt quanto scrypt.

---

## 📊 Diferenças Técnicas

| Aspecto | Sistema Antigo | Sistema Novo |
|---------|---------------|--------------|
| Hash | bcrypt | scrypt (nativo) |
| Sessões | PostgreSQL | MemoryStore |
| Auth | Manual | Passport.js |
| Proxy Config | Necessária | Não necessária |
| Dependencies | bcryptjs, connect-pg-simple | passport, passport-local |

---

## 🐛 Troubleshooting

### "Email ou senha incorretos"

1. Verifique se o admin foi criado:
```bash
psql $DATABASE_URL -c "SELECT email, role FROM users WHERE role='admin';"
```

2. Verifique os logs:
```bash
pm2 logs --lines 50
```

### Sessão não persiste

Isso é esperado com MemoryStore. Se reiniciar o servidor, as sessões são perdidas. Para sessões persistentes, posso adicionar Redis ou voltar ao PostgreSQL.

### Cookies não funcionam

Verifique se está usando HTTPS em produção:
```bash
# No .env:
NODE_ENV=production
```

---

## 🎉 Pronto!

Após seguir estes passos, o login deve funcionar perfeitamente no OpenLiteSpeed com PM2 e banco Neon externo!

**Teste:** Acesse `https://seudominio.com` e faça login com:
- Email: admin@daimidia.com
- Senha: admin123

**Depois altere a senha nas configurações do usuário!**
