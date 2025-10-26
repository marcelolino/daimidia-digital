# 🌐 Como Configurar um Domínio com HTTPS

Este guia mostra como configurar seu próprio domínio com certificado SSL gratuito (Let's Encrypt).

## 📋 Pré-requisitos

1. ✅ Um domínio registrado (exemplo: meusite.com)
2. ✅ Acesso ao painel DNS do seu domínio
3. ✅ Servidor Ubuntu com IP público
4. ✅ Portas 80 e 443 abertas no firewall

---

## 🎯 Passo 1: Configurar DNS do Domínio

No painel de controle do seu provedor de domínio (GoDaddy, Namecheap, Registro.br, etc.), adicione dois registros DNS:

### Registro A (domínio principal)
```
Tipo: A
Nome: @
Valor: SEU_IP_DO_SERVIDOR
TTL: 3600
```

### Registro A (www)
```
Tipo: A
Nome: www
Valor: SEU_IP_DO_SERVIDOR
TTL: 3600
```

**💡 Como descobrir o IP do seu servidor:**
```bash
curl ifconfig.me
```

**⏰ Aguarde a propagação do DNS** (pode levar de 5 minutos a 48 horas, geralmente 15-30 minutos)

**🔍 Verificar se o DNS propagou:**
```bash
# No seu computador ou servidor
dig +short seudominio.com
ping seudominio.com
```

---

## 🎯 Passo 2: Abrir Portas no Firewall

### No Ubuntu (UFW):
```bash
# Habilitar firewall (se ainda não estiver)
sudo ufw enable

# Permitir SSH (IMPORTANTE para não perder acesso!)
sudo ufw allow 22/tcp

# Permitir HTTP e HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Verificar status
sudo ufw status
```

### Na nuvem (AWS, DigitalOcean, etc.):
Certifique-se de que as portas **80** e **443** estão abertas no **Security Group** ou **Firewall** do painel da sua nuvem.

---

## 🎯 Passo 3: Configurar Domínio (Automático)

Agora execute o script de configuração automática:

```bash
# Dar permissão de execução
chmod +x setup-domain.sh

# Executar (substitua pelos seus dados)
./setup-domain.sh seudominio.com seu@email.com
```

**Exemplo:**
```bash
./setup-domain.sh meusite.com.br contato@meusite.com.br
```

O script vai:
1. ✅ Verificar se o DNS está configurado corretamente
2. ✅ Configurar o Nginx com seu domínio
3. ✅ Iniciar os containers Docker
4. ✅ Obter certificado SSL do Let's Encrypt
5. ✅ Configurar renovação automática

---

## 🎯 Alternativa: Configuração Manual

Se preferir fazer manualmente:

### 1. Editar configuração do Nginx
```bash
nano nginx/nginx.conf
```

Substitua **todas** as ocorrências de `SEU_DOMINIO.com` pelo seu domínio real.

### 2. Criar diretórios
```bash
mkdir -p certbot/conf
mkdir -p certbot/www
```

### 3. Iniciar containers
```bash
docker-compose -f docker-compose.prod.yml up -d postgres app nginx
```

### 4. Executar migrações
```bash
docker-compose -f docker-compose.prod.yml exec app npm run db:push
```

### 5. Obter certificado SSL
```bash
docker-compose -f docker-compose.prod.yml run --rm certbot certonly \
    --webroot \
    --webroot-path /var/www/certbot \
    --email seu@email.com \
    --agree-tos \
    --no-eff-email \
    -d seudominio.com \
    -d www.seudominio.com
```

### 6. Reiniciar Nginx
```bash
docker-compose -f docker-compose.prod.yml restart nginx
```

---

## ✅ Verificar se Está Funcionando

1. **Acessar seu site:**
   - https://seudominio.com
   - https://www.seudominio.com

2. **Verificar redirecionamento HTTP → HTTPS:**
   - http://seudominio.com (deve redirecionar para https://)

3. **Testar a qualidade do SSL:**
   - https://www.ssllabs.com/ssltest/

4. **Ver o certificado no navegador:**
   - Clique no cadeado 🔒 ao lado da URL

---

## 🔄 Renovação Automática do Certificado

O certificado SSL do Let's Encrypt é válido por **90 dias** e renova automaticamente.

O container `certbot` no `docker-compose.prod.yml` já está configurado para renovar automaticamente a cada 12 horas.

**Testar renovação manualmente:**
```bash
docker-compose -f docker-compose.prod.yml run --rm certbot renew --dry-run
```

**Forçar renovação (se necessário):**
```bash
docker-compose -f docker-compose.prod.yml run --rm certbot renew --force-renewal
docker-compose -f docker-compose.prod.yml restart nginx
```

---

## 📊 Comandos Úteis

### Ver logs do Nginx
```bash
docker-compose -f docker-compose.prod.yml logs -f nginx
```

### Ver logs do Certbot
```bash
docker-compose -f docker-compose.prod.yml logs certbot
```

### Ver todos os certificados
```bash
docker-compose -f docker-compose.prod.yml run --rm certbot certificates
```

### Reiniciar serviços
```bash
# Reiniciar tudo
docker-compose -f docker-compose.prod.yml restart

# Reiniciar apenas o Nginx
docker-compose -f docker-compose.prod.yml restart nginx
```

### Parar tudo
```bash
docker-compose -f docker-compose.prod.yml down
```

---

## ❓ Problemas Comuns

### ❌ "Erro ao obter certificado SSL"

**Causas possíveis:**
1. DNS não propagou ainda → Aguarde mais tempo
2. Portas 80/443 bloqueadas → Verifique firewall
3. Domínio não aponta para o servidor → Verifique DNS
4. Tentativa muito recente → Aguarde 1 hora

**Solução:**
```bash
# Verificar DNS
dig +short seudominio.com

# Verificar portas
sudo netstat -tulpn | grep -E ':(80|443)'

# Ver logs do certbot
docker-compose -f docker-compose.prod.yml logs certbot
```

### ❌ "Site não carrega com HTTPS"

**Verificar se o Nginx está rodando:**
```bash
docker-compose -f docker-compose.prod.yml ps nginx
```

**Ver logs:**
```bash
docker-compose -f docker-compose.prod.yml logs nginx
```

**Reiniciar:**
```bash
docker-compose -f docker-compose.prod.yml restart nginx
```

### ❌ "ERR_SSL_PROTOCOL_ERROR"

O certificado pode não ter sido gerado corretamente.

**Remover e recriar:**
```bash
sudo rm -rf certbot/conf/*
./setup-domain.sh seudominio.com seu@email.com
```

### ❌ "DNS_PROBE_FINISHED_NXDOMAIN"

O DNS não está configurado corretamente.

**Verificar registros DNS:**
```bash
dig +short seudominio.com
nslookup seudominio.com
```

Aguarde a propagação do DNS (pode levar até 48h).

---

## 🔐 Segurança

### Headers de Segurança
O arquivo `nginx/nginx.conf` já inclui:
- ✅ HSTS (Strict-Transport-Security)
- ✅ X-Frame-Options
- ✅ X-Content-Type-Options
- ✅ X-XSS-Protection

### Protocolos SSL
Configurado para usar apenas:
- ✅ TLS 1.2
- ✅ TLS 1.3

### Limite de Upload
Configurado para 100MB. Para alterar:
```nginx
client_max_body_size 100M;  # Altere aqui
```

---

## 📞 Subdomínios (Opcional)

Para adicionar subdomínios (ex: api.seudominio.com):

### 1. Adicionar registro DNS
```
Tipo: A
Nome: api
Valor: SEU_IP_DO_SERVIDOR
```

### 2. Adicionar ao certificado
```bash
docker-compose -f docker-compose.prod.yml run --rm certbot certonly \
    --webroot \
    --webroot-path /var/www/certbot \
    --email seu@email.com \
    --agree-tos \
    -d seudominio.com \
    -d www.seudominio.com \
    -d api.seudominio.com
```

### 3. Atualizar nginx.conf
Adicione `api.seudominio.com` na linha `server_name`.

---

## 🎉 Pronto!

Agora você tem:
- ✅ Domínio personalizado funcionando
- ✅ HTTPS com certificado SSL válido
- ✅ Renovação automática de certificado
- ✅ Redirecionamento HTTP → HTTPS
- ✅ Headers de segurança configurados

**Acesse:** https://seudominio.com 🚀

---

**Precisa de ajuda?** Verifique os logs:
```bash
docker-compose -f docker-compose.prod.yml logs -f
```
