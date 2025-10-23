# Exportação de Banco de Dados PostgreSQL

## Visão Geral

O sistema agora possui funcionalidade completa de exportação do banco de dados PostgreSQL em dois formatos:
- **SQL** - Scripts SQL com INSERT statements
- **JSON** - Dados estruturados em formato JSON

## 📍 Localização

A funcionalidade está disponível em:
**Painel Admin > Configurações > Banco de Dados > Exportar Backup**

## 🔐 Segurança

- ✅ **Acesso restrito**: Apenas administradores podem exportar o banco
- ✅ **Autenticação obrigatória**: Requer login válido
- ⚠️ **Dados sensíveis**: O backup SQL inclui senhas criptografadas (hashes)
- 🔒 **Guarde com segurança**: Backups contêm dados críticos do sistema

## 📊 Dados Exportados

Todas as tabelas do banco de dados são incluídas no backup:

### Tabelas Incluídas
1. **users** - Usuários do sistema (com senhas hash)
2. **categories** - Categorias de mídia
3. **media** - Arquivos de mídia
4. **system_settings** - Configurações do sistema

## 📥 Formatos de Exportação

### 1. SQL (.sql)
**Ideal para**: Restauração completa, migração de dados, backup de produção

**Características**:
- Scripts SQL prontos para executar
- Statements DELETE para limpar tabelas
- Statements INSERT para todos os registros
- Preserva tipos de dados PostgreSQL
- Inclui arrays e campos especiais

**Exemplo de conteúdo**:
```sql
-- Database Export
-- Generated: 2025-10-23T12:00:00.000Z
-- Database: PostgreSQL

-- Categories (6 records)
DELETE FROM categories;
INSERT INTO categories (id, name, description, color, created_at, updated_at) 
VALUES ('uuid-here', 'Natureza', 'Imagens de paisagens', '#22c55e', '2025-10-23T10:00:00.000Z', '2025-10-23T10:00:00.000Z');
```

**Nome do arquivo**: `database-backup-YYYY-MM-DD.sql`

### 2. JSON (.json)
**Ideal para**: Análise de dados, integração com outras ferramentas, backup estruturado

**Características**:
- Formato estruturado e legível
- Fácil de parsear programaticamente
- Inclui metadados do backup
- Senhas **não incluídas** (maior segurança)
- Dados organizados por tabela

**Estrutura do JSON**:
```json
{
  "metadata": {
    "exportDate": "2025-10-23T12:00:00.000Z",
    "database": "PostgreSQL",
    "version": "1.0",
    "totalRecords": 25
  },
  "data": {
    "categories": [...],
    "users": [...],  // sem campo password
    "media": [...],
    "systemSettings": [...]
  }
}
```

**Nome do arquivo**: `database-backup-YYYY-MM-DD.json`

## 🎯 Como Usar

### Exportar Banco de Dados

1. Faça login como **administrador**
2. Acesse **Configurações** no menu lateral
3. Role até o card **"Banco de Dados"**
4. Clique em um dos botões:
   - **Exportar SQL** - Para backup completo
   - **Exportar JSON** - Para análise de dados
5. O arquivo será baixado automaticamente

### Restaurar de Backup SQL

⚠️ **CUIDADO**: Restaurar um backup irá **sobrescrever** todos os dados atuais!

```bash
# 1. Conecte-se ao banco de dados
psql $DATABASE_URL

# 2. Execute o script SQL
\i database-backup-2025-10-23.sql

# 3. Verifique os dados
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM media;
```

### Usar Backup JSON

```javascript
// Ler e processar backup JSON
const fs = require('fs');
const backup = JSON.parse(fs.readFileSync('database-backup-2025-10-23.json', 'utf8'));

console.log(`Total de registros: ${backup.metadata.totalRecords}`);
console.log(`Usuários: ${backup.data.users.length}`);
console.log(`Mídias: ${backup.data.media.length}`);

// Analisar dados
const imageCount = backup.data.media.filter(m => m.type === 'image').length;
console.log(`Total de imagens: ${imageCount}`);
```

## 📋 Detalhes Técnicos

### Backend
- **Arquivo**: `server/db-export.ts`
- **Rotas**: 
  - `GET /api/database/export/sql`
  - `GET /api/database/export/json`
- **Autenticação**: `isAuthenticated + requireAdmin`

### Processamento
1. Query todas as tabelas do banco
2. Formata dados conforme o formato escolhido
3. Gera arquivo em memória
4. Envia como download via HTTP headers

### Headers HTTP
```javascript
Content-Type: application/sql (ou application/json)
Content-Disposition: attachment; filename="database-backup-YYYY-MM-DD.sql"
```

## ⚡ Performance

- ✅ Processamento eficiente em memória
- ✅ Streaming de resposta
- ⚠️ Para bases grandes (>10.000 registros), pode levar alguns segundos
- 💡 Recomendado fazer backups em horários de baixo tráfego

## 🔄 Automação (Futuro)

Possíveis melhorias futuras:
- [ ] Agendamento automático de backups
- [ ] Upload para cloud storage (S3, GCS)
- [ ] Backups incrementais
- [ ] Compressão de arquivos (.gz)
- [ ] Restauração via interface

## ⚠️ Avisos Importantes

1. **Senhas no SQL**: O backup SQL contém hashes de senha. Guarde com segurança!
2. **Senhas no JSON**: O backup JSON **não** inclui senhas (mais seguro para análise)
3. **Arquivos de mídia**: Apenas metadados são exportados, não os arquivos físicos
4. **Produção**: Este é o banco de **desenvolvimento**. Produção é separado.

## 📝 Exemplo de Uso Real

### Cenário: Backup Antes de Mudanças Importantes

```bash
# 1. Exportar backup de segurança
# Via interface: Configurações > Exportar SQL

# 2. Fazer mudanças no sistema
# ... desenvolvimento ...

# 3. Se algo der errado, restaurar:
psql $DATABASE_URL < database-backup-2025-10-23.sql
```

### Cenário: Migrar Dados para Outro Ambiente

```bash
# 1. Exportar do ambiente A (JSON para análise)
# Via interface

# 2. Validar estrutura
cat database-backup-2025-10-23.json | jq '.metadata'

# 3. Importar para ambiente B
# Usar script personalizado baseado no JSON
```

## 🆘 Troubleshooting

### Erro ao exportar
- Verifique se está logado como admin
- Verifique conexão com banco de dados
- Veja logs do servidor para detalhes

### Arquivo muito grande
- Considere exportar apenas tabelas específicas
- Use JSON (menor que SQL)
- Comprima o arquivo após download

### Restauração falhou
- Verifique sintaxe SQL
- Certifique-se que tabelas existem
- Limpe dados antes de importar
