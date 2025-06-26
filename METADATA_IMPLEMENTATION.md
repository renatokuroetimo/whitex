# Implementação de Metadados para Indicadores

Este documento descreve a implementação dos campos de metadados solicitados para o formulário de criação de indicadores.

## Campos Implementados

### Campos Básicos (já existiam)

- `id` – Identificador único do indicador
- `name` – Nome do indicador
- `created_at` / `updated_at` – Datas de criação e atualização

### Novos Campos de Metadados

- `definition` – Definição clara do significado do metadado
- `context` – Contexto em que o metadado se aplica (Autoria, Paciente, Clínico, etc.)
- `data_type` – Tipo de dado (texto, número, data, etc.)
- `is_required` – Se é obrigatório
- `is_conditional` – Se é obrigatório com condição
- `is_repeatable` – Se o metadado pode ocorrer múltiplas vezes
- `parent_metadata_id` – Hierarquia entre metadados (referência a outro indicador)
- `extends_metadata_id` – Herança de metadado existente (referência a outro indicador)
- `standard_id` – Identifica a qual padrão o metadado pertence (ex: Dublin Core, MPEG-7)
- `source` – Fonte/origem do metadado

## Arquivos Modificados

### 1. Esquema do Banco de Dados

**Arquivo**: `update_indicators_metadata_schema.sql`

- Script SQL para adicionar as novas colunas na tabela `indicators`
- Inclui foreign keys para hierarquia entre metadados
- Adiciona índices para melhor performance
- Inclui comentários de documentação

### 2. Tipos TypeScript

**Arquivo**: `src/lib/indicator-types.ts`

- Atualizada interface `Indicator` com novos campos
- Atualizada interface `IndicatorFormData` com novos campos
- Mantida compatibilidade com código existente

### 3. API Layer

**Arquivo**: `src/lib/indicator-api.ts`

- Atualizada função `createIndicator` para processar novos campos
- Mapeamento correto dos campos do formulário para o banco de dados
- Mantida compatibilidade com indicadores existentes

### 4. Interface do Usuário

**Arquivo**: `src/pages/CreateIndicator.tsx`

- Formulário expandido com seções organizadas:
  - **Informações Básicas**: Categoria, subcategoria, parâmetro, unidade
  - **Metadados**: Definição, contexto, tipo de dado, standard ID, fonte
  - **Hierarquia e Herança**: Metadado pai, herança
  - **Configurações**: Obrigatoriedade e requisitos
- Validações adicionais para prevenir referências circulares
- Interface responsiva mantida

## Como Usar

### 1. Executar Migração do Banco

Execute o script SQL no Supabase Dashboard:

```sql
-- Conteúdo do arquivo update_indicators_metadata_schema.sql
```

### 2. Formulário Expandido

O formulário agora inclui:

**Metadados**:

- Campo de texto longo para definição
- Dropdown para contexto (Autoria, Paciente, Clínico, etc.)
- Dropdown para tipo de dado (texto, número, data, etc.)
- Campos de texto para Standard ID e Fonte

**Hierarquia**:

- Seleção de metadado pai (dropdown com indicadores existentes)
- Seleção de herança (dropdown com indicadores existentes)

**Configurações**:

- Checkboxes para obrigatoriedade (básica, condicional, repetível)
- Checkboxes para requisitos (data, horário)

### 3. Validações

- Validações básicas mantidas (campos obrigatórios)
- Nova validação: prevenção de referências circulares na hierarquia
- Validação de tipos de dados

## Opções de Contexto

- Autoria
- Paciente
- Clínico
- Administrativo
- Técnico
- Temporal

## Tipos de Dados Suportados

- Texto
- Número
- Data
- Data e Hora
- Booleano
- Lista
- URL
- Email

## Próximos Passos

1. **Execute a migração do banco**: Rode o script `update_indicators_metadata_schema.sql`
2. **Teste o formulário**: Acesse a página de criação de indicadores
3. **Valide os dados**: Verifique se os novos campos estão sendo salvos corretamente
4. **Ajustes de UI**: Personalize estilos se necessário

## Notas Técnicas

- Todos os novos campos são opcionais para manter compatibilidade
- Foreign keys permitem hierarquia entre metadados
- Índices foram adicionados para otimizar consultas
- Código mantém fallbacks para casos de erro
- Interface responsiva preservada
