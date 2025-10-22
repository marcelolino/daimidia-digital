# Scripts de Migração de Dados

## Script de Seed

O script `seed.ts` popula o banco de dados com dados iniciais para desenvolvimento e testes.

### Dados criados

1. **Usuário Admin**
   - Email: `admin@example.com`
   - Senha: `admin123`
   - Role: `admin`

2. **Categorias** (6 categorias)
   - Natureza
   - Tecnologia
   - Pessoas
   - Arquitetura
   - Arte
   - Negócios

3. **Mídias** (13 imagens)
   - Imagens reais do Unsplash
   - Distribuídas entre todas as categorias
   - Com thumbnails, tags e metadados completos

### Como executar

#### 1. Sincronizar o schema com o banco de dados
```bash
npm run db:push
```

#### 2. Executar o seed
```bash
tsx scripts/seed.ts
```

### Notas importantes

- O script usa `onConflictDoNothing()` para evitar duplicação de dados
- Pode ser executado múltiplas vezes sem problemas
- Todas as imagens são URLs reais do Unsplash
- As senhas são criptografadas com bcrypt

### Variáveis de ambiente necessárias

- `DATABASE_URL` - URL de conexão com PostgreSQL (já configurada automaticamente no Replit)
