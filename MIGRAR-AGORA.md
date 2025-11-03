# ⚡ Guia Rápido: Migrar para Login Simplificado

## 📋 Checklist Rápido

Execute estes comandos no seu servidor com PM2:

### 1️⃣ Atualizar código (1 min)

```bash
cd /caminho/do/projeto
git pull
```

### 2️⃣ Instalar dependências (1 min)

```bash
npm ci
```

### 3️⃣ Rebuild (2 min)

```bash
npm run build
```

### 4️⃣ Criar admin (30 seg)

```bash
# Certifique-se que DATABASE_URL está no .env
tsx scripts/create-admin.ts
```

Isso criará:
- **Email:** admin@daimidia.com  
- **Senha:** admin123

### 5️⃣ Reiniciar PM2 (10 seg)

```bash
pm2 restart all
pm2 save
```

### 6️⃣ Verificar logs (10 seg)

```bash
pm2 logs --lines 20
```

Não deve ter erros!

### 7️⃣ Testar login

Acesse: `https://seudominio.com`

Login com:
- Email: admin@daimidia.com
- Senha: admin123

---

## ✅ Pronto!

Se funcionar, **ALTERE A SENHA** nas configurações!

---

## 🐛 Se der erro "tsx: command not found"

Use este comando alternativo:

```bash
node --loader tsx scripts/create-admin.ts
```

Ou instale tsx globalmente:

```bash
npm install -g tsx
tsx scripts/create-admin.ts
```

---

## 📊 O que mudou?

- ✅ Login agora usa **Passport.js** (como seu app que funciona)
- ✅ Hash de senha usa **scrypt** (ao invés de bcrypt)  
- ✅ Sessões usam **MemoryStore** (mais simples)
- ✅ **Funciona com OpenLiteSpeed** sem configuração especial

---

## ⚠️ Importante

**Usuários antigos com senhas bcrypt NÃO funcionarão!**

Você precisará:
1. Criar novo admin (passo 4)
2. Pedir para usuários resetarem senhas

Ou posso adicionar compatibilidade híbrida se precisar.

---

**Tempo total: ~5 minutos** ⏱️

Qualquer dúvida, veja: [SIMPLIFICADO-LOGIN.md](./SIMPLIFICADO-LOGIN.md)
