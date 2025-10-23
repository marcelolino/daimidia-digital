# Restauração de Banco de Dados

## Visão Geral

O sistema agora possui funcionalidade completa de restauração do banco de dados PostgreSQL a partir de arquivos de backup em formato JSON ou SQL.

## ⚠️ ATENÇÃO - Operação Crítica!

A restauração do banco de dados é uma **operação DESTRUTIVA** que irá:
- 🗑️ **Deletar TODOS os dados atuais**
- ♻️ **Substituir com os dados do backup**
- ❌ **NÃO PODE SER DESFEITA**

**SEMPRE** faça um backup dos dados atuais antes de restaurar!

## 📍 Localização

A funcionalidade está disponível em:
**Painel Admin > Configurações > Banco de Dados > Restaurar Backup**

## 🔒 Segurança

- ✅ **Apenas administradores** podem restaurar
- ✅ **Confirmação obrigatória** com diálogo de aviso
- ✅ **Validação de formato** (apenas .json ou .sql)
- ⚠️ **Usuários admin existentes são preservados** (não deletados)
- 🔐 **Requer autenticação** válida

## 📥 Formatos Suportados

### 1. JSON (.json) - RECOMENDADO ✅

**Vantagens**:
- ✅ Processamento rápido e confiável
- ✅ Validação de estrutura
- ✅ Menos propenso a erros
- ✅ Mais seguro

**Limitações**:
- ⚠️ Senhas não incluídas no backup JSON
- 🔑 Usuários restaurados recebem senha padrão: `changeme123`
- 📝 Usuários precisarão redefinir senhas após restauração

### 2. SQL (.sql) - NÃO IMPLEMENTADO ❌

**Status**: Em desenvolvimento

Por razões de segurança, a restauração via SQL ainda não está implementada. Use arquivos JSON para restauração.

## 🎯 Como Usar

### Passo 1: Fazer Backup Atual

**IMPORTANTE**: Sempre faça um backup antes de restaurar!

1. Vá para **Configurações > Banco de Dados**
2. Clique em **Exportar JSON**
3. Salve o arquivo com nome descritivo:
   - `backup-antes-restauracao-2025-10-23.json`

### Passo 2: Preparar Arquivo de Restauração

Certifique-se de que você tem um arquivo de backup válido:
- Formato: `.json`
- Origem: Exportado do próprio sistema Daimidia
- Integridade: Arquivo completo, não corrompido

### Passo 3: Restaurar

1. Faça login como **administrador**
2. Acesse **Configurações** no menu lateral
3. Role até o card **"Banco de Dados"**
4. Na seção **"Restaurar Backup"**:
   - Clique em **"Escolher arquivo"**
   - Selecione seu arquivo `.json`
5. Clique no botão **"Restaurar Banco de Dados"** (vermelho)
6. Leia o **aviso de confirmação** cuidadosamente
7. Clique em **"Sim, Restaurar Agora"**
8. Aguarde o processamento
9. A página será recarregada automaticamente

## 📊 Processo de Restauração

### Ordem de Operações

1. **Validação**
   - Verifica formato do arquivo
   - Valida estrutura JSON
   - Confirma permissões do usuário

2. **Limpeza** (em ordem de dependências)
   ```
   1. Deletar todas as mídias
   2. Deletar todas as categorias  
   3. Deletar configurações do sistema
   4. Deletar usuários visitantes (mantém admins)
   ```

3. **Restauração** (em ordem de dependências)
   ```
   1. Restaurar categorias
   2. Restaurar usuários
   3. Restaurar mídias
   4. Restaurar configurações do sistema
   ```

4. **Finalização**
   - Retornar número de registros restaurados
   - Recarregar interface

### Dados Restaurados

| Tabela | O que é restaurado | Observações |
|--------|-------------------|-------------|
| **categories** | Todas as categorias | IDs, nomes, cores, descrições |
| **users** | Todos os usuários | ⚠️ Senhas padrão para JSON |
| **media** | Todas as mídias | Metadados, URLs, tags |
| **system_settings** | Configurações | Logo, visualizações, etc |

## ⚠️ Avisos Importantes

### Sobre Senhas

**Backup JSON**:
- ❌ Não contém senhas por segurança
- 🔑 Usuários restaurados recebem senha: `changeme123`
- 📧 Informe os usuários para alterarem suas senhas

**Backup SQL**:
- ✅ Contém hashes de senhas originais
- 🔒 Usuários mantêm senhas antigas
- ⚠️ Ainda não implementado

### Sobre Arquivos de Mídia

- 📁 **Apenas metadados** são restaurados
- 🖼️ **Arquivos físicos NÃO** são incluídos no backup
- 💾 URLs de arquivos são restauradas mas podem estar quebradas
- ☁️ Certifique-se que os arquivos físicos existem nos caminhos corretos

### Preservação de Admins

- 👤 Usuários admin **existentes** são preservados
- 🔐 Senha do admin atual **não muda**
- ✅ Você não perderá acesso ao sistema

## 🔧 Troubleshooting

### Erro: "Invalid file format"

**Causa**: Arquivo não é .json ou .sql  
**Solução**: Use apenas backups exportados pelo sistema

### Erro: "SQL restore not implemented"

**Causa**: Tentando restaurar arquivo .sql  
**Solução**: Converta para JSON ou aguarde implementação

### Erro: "Failed to restore from JSON"

**Causas possíveis**:
- Arquivo JSON corrompido
- Estrutura inválida
- Dados incompatíveis

**Soluções**:
1. Verifique se o arquivo não está corrompido
2. Certifique-se de usar backup do Daimidia
3. Tente exportar novamente do sistema original

### Restauração demora muito

**Normal para**:
- Backups com >1000 registros
- Muitas mídias e categorias

**Aguarde**: O processamento pode levar até 30 segundos

### Página não recarrega

**Causa**: Erro durante restauração  
**Solução**:
1. Verifique os logs do servidor
2. Recarregue manualmente
3. Verifique se dados foram restaurados

## 📝 Exemplo Prático

### Cenário: Migrar de Ambiente de Teste para Produção

```bash
# 1. No ambiente de TESTE
# - Acesse Configurações
# - Exportar JSON
# - Arquivo baixado: database-backup-2025-10-23.json

# 2. No ambiente de PRODUÇÃO
# - Acesse Configurações
# - PRIMEIRO: Exportar JSON (backup de segurança!)
# - Arquivo: backup-producao-antes-migracao.json

# 3. Restaurar
# - Escolher arquivo: database-backup-2025-10-23.json
# - Confirmar restauração
# - Aguardar processamento
# - Recarregar automático

# 4. Validar
# - Conferir número de registros
# - Testar funcionalidades
# - Verificar mídias
```

## 📋 Checklist de Restauração

Antes de restaurar, certifique-se:

- [ ] Fiz backup dos dados atuais
- [ ] Tenho arquivo de backup válido (.json)
- [ ] Avisei usuários sobre mudanças
- [ ] Estou logado como administrador
- [ ] Entendo que dados serão sobrescritos
- [ ] Tenho tempo para processar (até 30s)
- [ ] Usuários saberão que precisam redefinir senhas (JSON)

## 🔄 Recuperação de Desastres

Se algo der errado durante a restauração:

1. **Não entre em pânico!**
2. Verifique se tem backup anterior
3. Tente restaurar o backup anterior
4. Se falhar, contate suporte técnico
5. Logs estão em `/tmp/logs/`

## 🆘 Casos de Uso

### Restaurar Estado Anterior
```
Problema: Mudanças erradas foram feitas
Solução: Restaurar backup de ontem
```

### Migrar Entre Ambientes
```
Problema: Copiar dados de teste para produção
Solução: Exportar de teste, restaurar em produção
```

### Recuperar de Erro
```
Problema: Dados deletados acidentalmente
Solução: Restaurar último backup bom
```

### Sincronizar Sistemas
```
Problema: Dois ambientes dessincronizados
Solução: Exportar do principal, restaurar no secundário
```

## 📈 Métricas de Sucesso

Após restauração bem-sucedida, você verá:

- ✅ Mensagem: "Banco restaurado com sucesso!"
- 📊 Número de registros restaurados
- ♻️ Página recarrega automaticamente
- 🎯 Todos os dados visíveis no dashboard

## 💡 Dicas Profissionais

1. **Backup Frequente**: Faça backups diários
2. **Nomenclatura Clara**: Use datas nos nomes
3. **Teste Primeiro**: Restaure em ambiente de teste
4. **Comunique**: Avise usuários antes de restaurar
5. **Valide Sempre**: Confira dados após restauração

---

**Implementado em**: 23/10/2025  
**Versão**: 1.0  
**Formato Suportado**: JSON ✅ | SQL ❌  
**Status**: ✅ Ativo
