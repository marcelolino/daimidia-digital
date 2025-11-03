# ⚡ Correção Rápida: Login "Não Autorizado" no aaPanel

## 🎯 Solução em 2 Minutos

### 1️⃣ Atualizar o código (já feito automaticamente)

O arquivo `server/auth.ts` foi atualizado com a configuração correta:
- ✅ `proxy: true` adicionado
- ✅ `sameSite: "lax"` configurado

### 2️⃣ Configurar Nginx no aaPanel

**No painel do aaPanel:**

1. Vá em **Websites** → [Seu Site] → **Proxy Reverso** ou **Reverse Proxy**

2. Configure:
   ```
   URL de Destino: http://127.0.0.1:5000
   ☑️ Enviar Host Header
   ```

3. Na seção **"Configuração Personalizada"** ou **"Custom Config"**, adicione estas linhas:

   ```nginx
   proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
   proxy_set_header X-Forwarded-Proto $scheme;
   proxy_set_header X-Real-IP $remote_addr;
   proxy_set_header Host $http_host;
   ```

4. Clique em **Salvar**

### 3️⃣ Verificar variável SESSION_SECRET

```bash
# Gere uma chave forte
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Adicione ao arquivo .env
nano .env
```

No arquivo `.env`, adicione ou verifique:
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://usuario:senha@localhost:5432/banco
SESSION_SECRET=cole_aqui_a_chave_gerada_acima
```

### 4️⃣ Atualizar aplicação

```bash
# Faça pull do código atualizado
git pull

# Ou copie o arquivo server/auth.ts atualizado

# Reinstale dependências
npm ci

# Rebuild
npm run build

# Reinicie PM2
pm2 restart all

# Reinicie Nginx
sudo systemctl restart nginx
```

### 5️⃣ Testar

Acesse seu site e tente fazer login!

---

## 🔍 Verificar se funcionou

### Teste 1: Headers

```bash
curl -I https://seudominio.com
```

Deve aparecer:
```
x-forwarded-proto: https
```

### Teste 2: Cookies

1. Abra DevTools (F12)
2. **Application** → **Cookies**
3. Veja se `connect.sid` aparece com:
   - ✅ Secure
   - ✅ HttpOnly
   - ✅ SameSite: Lax

### Teste 3: PM2 Logs

```bash
pm2 logs --lines 20
```

Não deve ter erros de sessão ou autenticação.

---

## ❌ Ainda não funciona?

Veja o guia completo de troubleshooting:
- [TROUBLESHOOTING-LOGIN.md](./TROUBLESHOOTING-LOGIN.md)
- [AAPANEL-NGINX-CONFIG.md](./AAPANEL-NGINX-CONFIG.md)

---

## 📋 Resumo do que foi alterado

**Arquivo `server/auth.ts`:**
```typescript
// ANTES (não funcionava com proxy)
app.use(expressSession({
  // ...
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000,
  },
}));

// DEPOIS (funciona com proxy)
app.use(expressSession({
  // ...
  proxy: true, // ← ADICIONADO
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000,
    sameSite: "lax", // ← ADICIONADO
  },
}));
```

**Nginx (aaPanel):**
```nginx
# Headers CRÍTICOS adicionados:
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;  # ← Este é o mais importante!
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header Host $http_host;
```

---

**Pronto! Após seguir estes passos, o login deve funcionar perfeitamente.** 🎉
