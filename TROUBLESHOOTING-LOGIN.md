# 🔧 Solução de Problemas: Login "Não Autorizado"

## Problema

Você está recebendo erro **"Não Autorizado"** ou **"Unauthorized"** ao tentar fazer login como admin.

---

## 🎯 Soluções Rápidas (em ordem de prioridade)

### 1. aaPanel + PM2 com Nginx

**O problema mais comum!** Se você está usando aaPanel com PM2:

#### ✅ Solução em 3 Passos:

**Passo 1:** Configure o proxy reverso no aaPanel

1. Vá em **Websites** → [Seu Site] → **Proxy Reverso**
2. Configure:
   - URL: `http://127.0.0.1:5000`
   - Marque "Enviar Host Header"

**Passo 2:** Adicione os headers CRÍTICOS na configuração personalizada:

```nginx
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header Host $http_host;
```

**Passo 3:** Reinicie tudo

```bash
sudo systemctl restart nginx
pm2 restart all
```

**📖 Guia completo:** [AAPANEL-NGINX-CONFIG.md](./AAPANEL-NGINX-CONFIG.md)

---

### 2. SESSION_SECRET não definido

#### Verificar:

```bash
# Veja se existe SESSION_SECRET no .env
cat .env | grep SESSION_SECRET
```

#### Solução:

```bash
# Gere uma chave forte
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Adicione ao .env
echo "SESSION_SECRET=cole_aqui_a_chave_gerada" >> .env

# Reinicie
pm2 restart all
```

---

### 3. Banco de Dados não acessível

#### Verificar:

```bash
# Teste a conexão
psql $DATABASE_URL -c "SELECT 1;"
```

#### Solução:

```bash
# Verifique se o PostgreSQL está rodando
sudo systemctl status postgresql

# Se não estiver, inicie
sudo systemctl start postgresql

# Verifique a DATABASE_URL no .env
cat .env | grep DATABASE_URL
```

---

### 4. Usuário admin não existe

#### Verificar:

```bash
# Liste usuários do banco
psql $DATABASE_URL -c "SELECT email, role FROM users;"
```

#### Solução:

Se não houver usuários admin, crie um manualmente:

```bash
# Entre no psql
psql $DATABASE_URL

# Crie um usuário admin
INSERT INTO users (email, password, role, "firstName", "lastName", "createdAt", "updatedAt")
VALUES (
  'admin@seusite.com',
  '$2a$10$YourHashedPasswordHere',  -- Use hashPassword primeiro
  'admin',
  'Admin',
  'Sistema',
  NOW(),
  NOW()
);

# Saia
\q
```

**Ou use o script Node.js:**

```javascript
// create-admin.js
const bcrypt = require('bcryptjs');
const { Client } = require('pg');

async function createAdmin() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  
  const hashedPassword = await bcrypt.hash('SuaSenhaForte123!', 10);
  
  await client.query(`
    INSERT INTO users (email, password, role, "firstName", "lastName", "createdAt", "updatedAt")
    VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
    ON CONFLICT (email) DO NOTHING
  `, ['admin@seusite.com', hashedPassword, 'admin', 'Admin', 'Sistema']);
  
  console.log('✅ Admin criado com sucesso!');
  await client.end();
}

createAdmin();
```

Execute:
```bash
node create-admin.js
```

---

### 5. Cookies bloqueados (HTTPS/HTTP mismatch)

#### Verificar:

1. Abra DevTools (F12) → **Application** → **Cookies**
2. Verifique se `connect.sid` existe e tem flag `Secure`
3. Veja se está acessando via HTTPS

#### Solução:

**Se estiver usando HTTP localmente:**
```bash
# No .env, mude para:
NODE_ENV=development
```

**Se estiver em produção com HTTPS:**
```bash
# No .env:
NODE_ENV=production

# E configure Nginx com headers corretos (veja solução 1)
```

---

### 6. CORS ou Domain incorreto

#### Solução:

No arquivo `server/auth.ts`, certifique-se de que NÃO tem `domain` definido no cookie:

```typescript
cookie: {
  secure: process.env.NODE_ENV === "production",
  httpOnly: true,
  maxAge: 30 * 24 * 60 * 60 * 1000,
  sameSite: "lax",
  // NÃO DEFINA domain: 'seusite.com' - deixe automático
}
```

---

## 🔍 Debug Detalhado

### Ver logs do PM2:

```bash
# Logs em tempo real
pm2 logs --lines 100

# Apenas erros
pm2 logs --err
```

### Adicionar debug temporário:

Adicione em `server/routes.ts` na rota de login:

```typescript
app.post("/api/auth/login", async (req: any, res) => {
  console.log('🔍 Login attempt:');
  console.log('  Email:', req.body.email);
  console.log('  Protocol:', req.protocol);
  console.log('  Secure:', req.secure);
  console.log('  Session ID:', req.sessionID);
  
  // ... resto do código
});
```

Reinicie e veja os logs:
```bash
pm2 restart all
pm2 logs
```

---

## ✅ Checklist Completo

Antes de reportar um problema, verifique:

- [ ] **Nginx** está configurado com headers corretos
- [ ] **SSL/HTTPS** está funcionando (ou NODE_ENV=development para HTTP)
- [ ] **SESSION_SECRET** está definido no `.env`
- [ ] **DATABASE_URL** está correto no `.env`
- [ ] **Banco de dados** está rodando e acessível
- [ ] **Migrações** foram executadas (`npm run db:push`)
- [ ] **Usuário admin** existe no banco
- [ ] **PM2** está rodando (`pm2 status`)
- [ ] **Nginx** foi reiniciado após mudanças
- [ ] **Cookies** estão sendo aceitos no navegador

---

## 🆘 Ainda com problemas?

### Teste manual da API:

```bash
# Teste de login direto
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@seusite.com","password":"suasenha"}' \
  -v
```

Se funcionar no localhost mas não no domínio, é problema de Nginx!

### Comandos de diagnóstico:

```bash
# 1. Status do PM2
pm2 status

# 2. Status do Nginx
sudo systemctl status nginx

# 3. Status do PostgreSQL
sudo systemctl status postgresql

# 4. Teste de conexão DB
psql $DATABASE_URL -c "SELECT 1;"

# 5. Logs do Nginx
tail -f /var/log/nginx/error.log

# 6. Logs do PM2
pm2 logs --lines 50
```

---

## 📚 Guias Relacionados

- [AAPANEL-NGINX-CONFIG.md](./AAPANEL-NGINX-CONFIG.md) - Configuração completa aaPanel
- [DEPLOY-PM2.md](./DEPLOY-PM2.md) - Deploy com PM2
- [DEPLOY-RENDER.md](./DEPLOY-RENDER.md) - Deploy no Render

---

**Na maioria dos casos, o problema 1 (configuração Nginx no aaPanel) resolve!** 🎉
