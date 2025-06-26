# Remoção da Seção "Hierarquia e Herança"

## Motivo da Remoção

A seção "Hierarquia e Herança" foi removida do formulário de criação/edição de indicadores por ser redundante com a estrutura já existente de **Categoria Principal** e **Subcategoria**.

## Campos Removidos

### Do Formulário (CreateIndicator.tsx)

- **Metadado Pai** (`parentMetadataId`)
- **Estende Metadado** (`extendsMetadataId`)
- Seção completa "Hierarquia e Herança"

### Dos Tipos TypeScript (indicator-types.ts)

- `parentMetadataId?: string`
- `extendsMetadataId?: string`

### Da API (indicator-api.ts)

- Campos removidos de:
  - `getIndicatorById()`
  - `createIndicator()`
  - `updateIndicator()`

### Do Banco de Dados

Execute o script `remove_hierarchy_columns.sql` para:

- Remover foreign keys
- Remover índices
- Remover colunas `parent_metadata_id` e `extends_metadata_id`

## Estrutura Atual de Hierarquia

A hierarquia é mantida através da estrutura existente:

```
Categoria Principal
└── Subcategoria
    └── Parâmetro específico
```

**Exemplo:**

- **Categoria**: Sinais Vitais
- **Subcategoria**: Pressão Arterial
- **Parâmetro**: Sistólica/Diastólica

## Arquivos Modificados

1. **src/pages/CreateIndicator.tsx**

   - Removida seção "Hierarquia e Herança"
   - Removidos campos do estado do formulário
   - Removida validação específica
   - Removido carregamento de indicadores existentes

2. **src/lib/indicator-types.ts**

   - Removidos campos das interfaces `Indicator` e `IndicatorFormData`

3. **src/lib/indicator-api.ts**

   - Removidos campos de todas as funções CRUD

4. **remove_hierarchy_columns.sql**
   - Script SQL para limpeza do banco de dados

## Benefícios

✅ **Interface mais limpa** - Menos campos confusos para o usuário  
✅ **Estrutura simplificada** - Categoria/subcategoria são suficientes  
✅ **Menos redundância** - Evita duplicação de conceitos  
✅ **Melhor UX** - Formulário mais direto e intuitivo

## Próximos Passos

1. **Execute o script SQL**: `remove_hierarchy_columns.sql`
2. **Teste o formulário**: Verifique criação e edição de indicadores
3. **Valide os dados**: Confirme que não há erros de campo ausente

A funcionalidade de hierarquia agora é totalmente baseada na estrutura Categoria → Subcategoria, que é mais intuitiva e adequada para o domínio médico.
