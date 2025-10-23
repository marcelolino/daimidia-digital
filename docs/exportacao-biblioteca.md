# Funcionalidade de Exportação da Biblioteca de Mídia

## Visão Geral

A biblioteca de mídia agora possui funcionalidade completa de exportação de dados em dois formatos:
- **CSV** (Comma-Separated Values)
- **Excel** (.xls)

## Recursos

### 📊 Dados Exportados

Cada exportação inclui as seguintes informações sobre as mídias:

| Campo | Descrição |
|-------|-----------|
| ID | Identificador único da mídia |
| Título | Nome/título da mídia |
| Descrição | Descrição detalhada |
| Tipo | Tipo de mídia (image, video, logo, banner) |
| Categoria | Nome da categoria associada |
| Tags | Lista de tags separadas por vírgula |
| Arquivo | Nome do arquivo original |
| Tamanho | Tamanho do arquivo |
| Formato | Tipo MIME do arquivo |
| Data de Criação | Data e hora de upload |

### 🎯 Filtros Aplicados

A exportação respeita os filtros ativos na biblioteca:
- **Tipo de mídia**: Se você filtrar por "Imagens", apenas imagens serão exportadas
- **Busca**: Se houver uma busca ativa, apenas os resultados da busca serão exportados

### 📥 Como Usar

1. Acesse a **Biblioteca de Mídia** no painel admin
2. (Opcional) Aplique filtros por tipo ou busca
3. Clique no botão **"Exportar"**
4. Escolha o formato desejado:
   - **Exportar CSV** - Para análise em ferramentas de dados
   - **Exportar Excel** - Para edição em planilhas

### 📁 Nome dos Arquivos

Os arquivos exportados seguem o padrão:
- `biblioteca-midia_YYYY-MM-DD.csv`
- `biblioteca-midia_YYYY-MM-DD.xls`

Exemplo: `biblioteca-midia_2025-10-23.csv`

## Detalhes Técnicos

### Biblioteca Utilizada
- **PapaParse**: Para geração de CSV
- Encoding UTF-8 com BOM para compatibilidade com Excel

### Formato CSV
- Delimitador: vírgula (`,`)
- Encoding: UTF-8 com BOM (`\uFEFF`)
- Cabeçalhos em português

### Formato Excel
- Delimitador: tabulação (`\t`)
- Extensão: `.xls`
- Compatível com Microsoft Excel e LibreOffice Calc

## Vantagens

✅ **Exportação instantânea** - Processamento no cliente  
✅ **Filtros inteligentes** - Exporta apenas o que você vê  
✅ **Nomes de categorias** - Mostra nomes, não IDs  
✅ **Compatibilidade** - Funciona em qualquer navegador moderno  
✅ **Formato adequado** - CSV para dados, Excel para planilhas  

## Exemplo de Uso

```javascript
// A exportação acontece automaticamente ao clicar no botão
// Os dados são preparados com:
const exportData = prepareMediaForExport(filteredMedia, categories);
downloadCSV(exportData); // ou downloadExcel(exportData);
```

## Notificações

Ao exportar, você receberá uma notificação de sucesso informando:
- ✅ "Exportado com sucesso"
- Quantidade de itens exportados

## Limitações

- A exportação é feita no navegador (client-side)
- Não há limite de registros, mas navegadores podem ter restrições de memória para datasets muito grandes (>10.000 registros)
- URLs de arquivos não são incluídas na exportação (apenas nomes)
