# 🔧 Configuração aaPanel + Nginx + PM2

## Problema: "Não Autorizado" ao fazer login

Se você está recebendo erro "não autorizado" ao tentar fazer login como admin no aaPanel com PM2, o problema está na configuração do proxy reverso Nginx.

---

## ✅ Solução Completa

### 1️⃣ Configurar Proxy Reverso no aaPanel

1. **Acesse o aaPanel:**
   - Websites → [Seu Site] → **Configurações de Proxy Reverso**

2. **Configure o Proxy:**
   ```
   URL de Destino: http://127.0.0.1:5000
   ☑️ Enviar Host Header
   ```

3. **Adicione Headers Personalizados:**

   Na seção "Configuração Personalizada" ou "Custom Config", adicione:

   ```nginx
   # CRÍTICO: Headers para funcionar com Express sessions
   proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
   proxy_set_header X-Forwarded-Proto $scheme;
   proxy_set_header X-Real-IP $remote_addr;
   proxy_set_header Host $http_host;
   
   # Suporte para WebSocket (se necessário)
   proxy_http_version 1.1;
   proxy_set_header Upgrade $http_upgrade;
   proxy_set_header Connection "upgrade";
   ```

### 2️⃣ Configuração SSL/HTTPS

1. **No aaPanel:**
   - SSL → Let's Encrypt
   - Aplicar certificado SSL
   - ☑️ Forçar HTTPS

2. **Ou configuração manual:**
   ```nginx
   # Redirecionar HTTP para HTTPS
   server {
       listen 80;
       server_name seudominio.com;
       return 301 https://$server_name$request_uri;
   }
   ```

### 3️⃣ Verificar Variáveis de Ambiente

No seu arquivo `.env`:

```bash
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://usuario:senha@localhost:5432/banco
SESSION_SECRET=sua_chave_muito_forte_aqui_gerada_aleatoriamente
```

**IMPORTANTE:** Gere um SESSION_SECRET forte:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4️⃣ Reiniciar PM2

```bash
pm2 restart all
pm2 save
```

---

## 🔍 Verificação

### Teste 1: Headers do Nginx

```bash
curl -I https://seudominio.com
```

Você deve ver:
```
HTTP/2 200
x-forwarded-proto: https
```

### Teste 2: Logs do PM2

```bash
pm2 logs --lines 50
```

Procure por erros relacionados a sessões ou cookies.

### Teste 3: Browser DevTools

1. Abra DevTools (F12)
2. Vá em **Application** → **Cookies**
3. Verifique se o cookie `connect.sid` tem:
   - ☑️ Secure (em HTTPS)
   - ☑️ HttpOnly
   - ☑️ SameSite: Lax

---

## 🐛 Problemas Comuns

### Problema 1: "Unauthorized" ao fazer login

**Causa:** Headers do proxy não configurados

**Solução:**
1. Adicione os headers no aaPanel (veja passo 1)
2. Reinicie Nginx: `sudo systemctl restart nginx`
3. Reinicie PM2: `pm2 restart all`

### Problema 2: Cookie não persiste

**Causa:** `SESSION_SECRET` não definido ou domain incorreto

**Solução:**
```bash
# No .env, adicione:
SESSION_SECRET=cole_aqui_resultado_do_comando_abaixo

# Gere uma nova:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Problema 3: Funciona em HTTP mas não em HTTPS

**Causa:** Cookie `secure: true` mas Nginx não envia `X-Forwarded-Proto`

**Solução:**
- Verifique se adicionou `proxy_set_header X-Forwarded-Proto $scheme;`
- Reinicie Nginx

### Problema 4: "502 Bad Gateway"

**Causa:** PM2 não está rodando ou porta errada

**Solução:**
```bash
pm2 status  # Verifica se está rodando
pm2 logs    # Vê os erros
pm2 restart all
```

---

## 📝 Configuração Completa do Nginx (aaPanel)

Se você tem acesso ao arquivo de configuração Nginx completo:

```nginx
upstream nodejs_backend {
    server 127.0.0.1:5000;
    keepalive 64;
}

server {
    listen 80;
    server_name seudominio.com www.seudominio.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name seudominio.com www.seudominio.com;
    
    # Certificados SSL (aaPanel gerencia automaticamente)
    ssl_certificate /www/server/panel/vhost/cert/seudominio/fullchain.pem;
    ssl_certificate_key /www/server/panel/vhost/cert/seudominio/privkey.pem;
    
    # Configurações SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # Limite de upload
    client_max_body_size 50M;
    
    location / {
        # CRÍTICO: Headers para Express sessions
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header Host $http_host;
        
        # WebSocket
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # Forward para Node.js
        proxy_pass http://nodejs_backend/;
        proxy_redirect off;
        proxy_read_timeout 240s;
        
        # Cache (opcional)
        proxy_buffering off;
    }
    
    # Logs
    access_log /www/wwwlogs/seudominio.log;
    error_log /www/wwwlogs/seudominio.error.log;
}
```

---

## ✅ Checklist de Deploy

Antes de testar o login:

- [ ] Nginx configurado com headers corretos
- [ ] SSL/HTTPS habilitado e funcionando
- [ ] SESSION_SECRET definido no .env
- [ ] NODE_ENV=production no .env
- [ ] PM2 rodando (`pm2 status` mostra online)
- [ ] Banco de dados acessível
- [ ] Migrações executadas (`npm run db:push`)
- [ ] Nginx reiniciado
- [ ] PM2 reiniciado

---

## 🆘 Debug Avançado

### Ver requisições em tempo real:

```bash
# Logs do PM2
pm2 logs --lines 100

# Logs do Nginx (acesso)
tail -f /www/wwwlogs/seudominio.log

# Logs do Nginx (erros)
tail -f /www/wwwlogs/seudominio.error.log
```

### Adicionar logging no código:

Adicione temporariamente em `server/auth.ts` após `setupAuth`:

```typescript
app.use((req: any, res, next) => {
  console.log('🔍 Debug Session:');
  console.log('  Protocol:', req.protocol);
  console.log('  Secure:', req.secure);
  console.log('  Headers:', {
    'x-forwarded-proto': req.get('x-forwarded-proto'),
    'x-forwarded-for': req.get('x-forwarded-for'),
    host: req.get('host')
  });
  console.log('  Session ID:', req.sessionID);
  console.log('  User ID:', req.session?.userId);
  next();
});
```

Depois reinicie PM2 e veja os logs:
```bash
pm2 restart all
pm2 logs
```

---

## 📞 Suporte

Se ainda tiver problemas:

1. **Verifique os logs:** `pm2 logs`
2. **Teste o endpoint:** `curl -v https://seudominio.com/api/auth/user`
3. **Verifique cookies no browser:** DevTools → Application → Cookies

---

**Após seguir este guia, seu login deve funcionar perfeitamente!** 🎉
