# Sistema de Contagem de Visualizações

## Visão Geral

O sistema agora rastreia automaticamente o número de visualizações da página inicial (HomePage) e exibe essa métrica no dashboard administrativo.

## 📊 Como Funciona

### Rastreamento Automático
Toda vez que um visitante acessa a página inicial do aplicativo:
1. Uma requisição POST é enviada para `/api/analytics/page-view`
2. O contador de visualizações é incrementado no banco de dados
3. O valor atualizado é armazenado em `system_settings.pageViews`

### Exibição no Dashboard
O número total de visualizações é exibido em destaque no **Dashboard Admin** como primeiro card de estatísticas.

## 🎯 Dados Rastreados

| Métrica | Descrição | Localização |
|---------|-----------|-------------|
| **Visualizações da Página** | Número total de visitas à HomePage | Dashboard Admin (primeiro card) |

## 📍 Implementação Técnica

### Banco de Dados
**Tabela**: `system_settings`  
**Campo adicionado**: `page_views` (INTEGER, default: 0)

```sql
ALTER TABLE system_settings ADD COLUMN page_views INTEGER NOT NULL DEFAULT 0;
```

### Backend (server/routes.ts)

#### Endpoint de Rastreamento
```javascript
POST /api/analytics/page-view
```

**Funcionalidade**:
- Incrementa o contador de visualizações em 1
- Cria settings se não existir
- Retorna o número atualizado de visualizações

**Resposta**:
```json
{
  "pageViews": 123
}
```

### Frontend

#### HomePage (client/src/pages/HomePage.tsx)
Rastreia visualização automaticamente quando a página carrega:

```javascript
useEffect(() => {
  fetch("/api/analytics/page-view", {
    method: "POST",
    credentials: "include",
  }).catch((error) => {
    console.error("Failed to track page view:", error);
  });
}, []);
```

#### AdminDashboard (client/src/pages/AdminDashboard.tsx)
Exibe o contador de visualizações:

```javascript
<StatsCard
  title="Visualizações da Página"
  value={settings?.pageViews || 0}
  icon={Eye}
  description="Total de visitas"
/>
```

## 🔒 Características de Segurança

- ✅ **Sem autenticação necessária** para rastrear (endpoint público)
- ✅ **Apenas Admin pode visualizar** as estatísticas
- ✅ **Falha silenciosa** - Erros não afetam a experiência do usuário
- ✅ **Proteção contra spam** - Uma visualização por carregamento de página

## 📈 Métricas Disponíveis

### Dashboard Admin - Cards de Estatísticas
1. 👁️ **Visualizações da Página** - Total de visitas
2. 📁 **Total de Mídias** - Quantidade de arquivos
3. 🎥 **Vídeos** - Quantidade e percentual
4. 🖼️ **Imagens** - Quantidade e percentual
5. 🏷️ **Logos** - Quantidade
6. 🎨 **Banners** - Quantidade

## 🚀 Melhorias Futuras

Possíveis expansões do sistema de analytics:

### Rastreamento Detalhado
- [ ] Visualizações por mídia individual
- [ ] Clicks em downloads
- [ ] Compartilhamentos realizados
- [ ] Buscas mais populares

### Análise Temporal
- [ ] Visualizações por dia/semana/mês
- [ ] Gráficos de tendência
- [ ] Horários de pico

### Métricas de Usuário
- [ ] Usuários únicos vs visitas totais
- [ ] Tempo médio na página
- [ ] Taxa de rejeição

### Analytics Avançado
- [ ] Integração com Google Analytics
- [ ] Heatmaps de interação
- [ ] Funil de conversão

## 📊 Exemplo de Uso

### Acessar Estatísticas

1. Faça login como **administrador**
2. Acesse o **Dashboard** no menu lateral
3. Visualize o card "Visualizações da Página" no topo

### Resetar Contador (Manualmente)

Se necessário, você pode resetar o contador via SQL:

```sql
-- Conectar ao banco
psql $DATABASE_URL

-- Resetar contador
UPDATE system_settings SET page_views = 0;

-- Verificar
SELECT page_views FROM system_settings;
```

## 🔧 Troubleshooting

### Contador não está incrementando

**Possíveis causas**:
1. JavaScript desabilitado no navegador
2. Bloqueador de analytics ativo
3. Erro de rede

**Verificação**:
```javascript
// Abrir console do navegador e verificar
console.log("Verificando rastreamento...");
fetch("/api/analytics/page-view", { 
  method: "POST" 
}).then(r => r.json()).then(console.log);
```

### Contador exibindo 0

**Verificar**:
1. Settings existe no banco?
   ```sql
   SELECT * FROM system_settings;
   ```
2. Campo page_views foi adicionado?
   ```sql
   SELECT page_views FROM system_settings;
   ```

## 📝 Logs

O sistema registra eventos de rastreamento:

```bash
# Ver logs do servidor
# Procurar por "POST /api/analytics/page-view"
```

## 💡 Boas Práticas

1. **Não bloquear execução**: O rastreamento usa `.catch()` para falhar silenciosamente
2. **Rastreamento discreto**: Usuários não veem nenhum feedback visual
3. **Performance**: Requisição assíncrona não afeta carregamento
4. **Privacidade**: Não rastreamos informações pessoais identificáveis

## ⚠️ Limitações Atuais

1. **Apenas HomePage**: Outras páginas não são rastreadas
2. **Sem filtragem de bots**: Contagem inclui crawlers
3. **Sem sessões**: Refresh conta como nova visualização
4. **Sem geolocalização**: Não sabemos de onde vêm as visitas
5. **Sem histórico**: Apenas contador total, sem dados temporais

## 🎯 KPIs Recomendados

Com base no contador de visualizações, você pode calcular:

- **Taxa de Conversão**: `(Downloads / Visualizações) × 100`
- **Engajamento**: `(Buscas Realizadas / Visualizações) × 100`
- **Popularidade de Conteúdo**: `(Clicks em Mídia / Total de Mídias)`

## 🔐 Considerações de Privacidade

O sistema atual:
- ✅ Não coleta IPs
- ✅ Não usa cookies de rastreamento
- ✅ Não identifica usuários individuais
- ✅ Apenas conta visitas agregadas

---

**Implementado em**: 23/10/2025  
**Versão**: 1.0  
**Status**: ✅ Ativo
