# Guia Rápido: Deploy no Render com Vercel Postgres

## 🚀 Resumo em 5 Passos

### 1️⃣ Criar Banco na Vercel (5 min)
```bash
1. Acesse vercel.com → Storage → Create Database → Postgres
2. Copie a variável POSTGRES_URL (ex: postgres://user:pass@host:5432/db?sslmode=require)
```

### 2️⃣ Aplicar Migrações (1 min)
```bash
# No seu terminal local:
export DATABASE_URL="cole_aqui_a_POSTGRES_URL_da_vercel"
npm run db:push
```

### 3️⃣ Preparar o Repositório (2 min)
```bash
# Certifique-se de que está tudo commitado
git add .
git commit -m "Preparado para deploy no Render"
git push origin main
```

### 4️⃣ Criar Web Service no Render (3 min)
```bash
1. Acesse render.com → New → Web Service
2. Conecte seu repositório Git
3. Configure:
   - Build Command: npm install && npm run build
   - Start Command: npm start
```

### 5️⃣ Adicionar Variáveis de Ambiente (2 min)
No Render, adicione estas variáveis em Environment:

```bash
DATABASE_URL = cole_aqui_a_POSTGRES_URL_da_vercel
NODE_ENV = production
SESSION_SECRET = gere_uma_chave_forte (veja abaixo)
```

**Gerar SESSION_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### ✅ Pronto!
- Clique em "Create Web Service"
- Aguarde o deploy (2-5 min)
- Acesse: `https://seu-app.onrender.com`

---

## 📋 Checklist Rápido

- [ ] Banco Vercel criado
- [ ] POSTGRES_URL copiada
- [ ] Migrações executadas localmente (`npm run db:push`)
- [ ] Código no Git (commitado e pushed)
- [ ] Web Service criado no Render
- [ ] 3 variáveis de ambiente adicionadas
- [ ] Deploy concluído
- [ ] App funcionando na URL do Render

---

## 🆘 Problemas Comuns

**Erro: DATABASE_URL must be set**
→ Verifique se adicionou a variável no Render

**Build falha**
→ Verifique os logs no Render, pode ser falta de memória (upgrade para plano pago)

**App não conecta ao banco**
→ Certifique-se que copiou a URL completa incluindo `?sslmode=require`

**Mudei variáveis mas não funcionou**
→ Render redeploya automaticamente, aguarde 2-3 minutos

---

## 📖 Documentação Completa

Para mais detalhes, consulte: [DEPLOY-RENDER.md](./DEPLOY-RENDER.md)

---

**Tempo Total: ~15 minutos** ⏱️
