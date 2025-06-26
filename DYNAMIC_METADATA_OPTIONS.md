# Sistema Dinâmico de Opções de Metadados

## Problema Resolvido

As opções para **Contexto** e **Tipo de Dados** estavam hardcoded no código, impedindo configuração dinâmica. Agora essas opções são carregadas do banco de dados e podem ser facilmente gerenciadas.

## Implementação

### 1. Banco de Dados

**Novas Tabelas:**

- `metadata_contexts` - Contextos disponíveis
- `metadata_data_types` - Tipos de dados disponíveis

**Execute o script:** `create_metadata_options_tables.sql`

### 2. API (metadata-options-api.ts)

**Funções disponíveis:**

- `getContexts()` - Busca contextos ativos
- `getDataTypes()` - Busca tipos de dados ativos
- `createContext()` - Cria novo contexto
- `createDataType()` - Cria novo tipo de dados

**Fallbacks:** Se o Supabase não estiver disponível, usa opções padrão.

### 3. Componentes Atualizados

**CreateIndicator.tsx:**

- Carrega contextos e tipos de dados dinamicamente
- Dropdowns populados com dados do banco
- Suporte a descrições nos tipos de dados

**AddIndicatorToPatient.tsx:**

- Usa tipos dinâmicos para validação
- Labels e inputs adaptam-se aos tipos configurados

## Estrutura das Tabelas

### metadata_contexts

| Campo         | Tipo    | Descrição          |
| ------------- | ------- | ------------------ |
| id            | text    | ID único           |
| name          | text    | Nome exibido       |
| description   | text    | Descrição opcional |
| is_active     | boolean | Se está ativo      |
| display_order | integer | Ordem de exibição  |

### metadata_data_types

| Campo            | Tipo    | Descrição             |
| ---------------- | ------- | --------------------- |
| id               | text    | ID único              |
| name             | text    | Nome exibido          |
| value            | text    | Valor usado no código |
| input_type       | text    | Tipo de input HTML    |
| validation_rules | jsonb   | Regras de validação   |
| is_active        | boolean | Se está ativo         |
| display_order    | integer | Ordem de exibição     |

## Opções Padrão Inseridas

### Contextos

1. **Autoria** - Contexto relacionado à autoria
2. **Paciente** - Contexto relacionado ao paciente
3. **Clínico** - Contexto relacionado ao ambiente clínico
4. **Administrativo** - Contexto administrativo
5. **Técnico** - Contexto técnico
6. **Temporal** - Contexto relacionado a tempo

### Tipos de Dados

1. **Texto** (`texto`) - Campo de texto livre
2. **Número** (`numero`) - Valor numérico
3. **Data** (`data`) - Data (DD/MM/AAAA)
4. **Data e Hora** (`data_hora`) - Data e hora completas
5. **Booleano** (`booleano`) - Verdadeiro/falso
6. **Lista** (`lista`) - Lista de valores
7. **URL** (`url`) - Endereço web válido
8. **Email** (`email`) - Endereço de email válido

## Benefícios

✅ **Configurável** - Administradores podem adicionar/remover opções  
✅ **Escalável** - Fácil adicionar novos tipos sem alterar código  
✅ **Consistente** - Mesmas opções em todos os componentes  
✅ **Robusto** - Fallbacks para quando banco não está disponível  
✅ **Validação** - Regras de validação configuráveis por tipo

## Como Usar

### Adicionar Novo Contexto

```sql
INSERT INTO metadata_contexts (name, description, display_order)
VALUES ('Novo Contexto', 'Descrição do contexto', 10);
```

### Adicionar Novo Tipo de Dados

```sql
INSERT INTO metadata_data_types (name, value, input_type, description, display_order)
VALUES ('Telefone', 'telefone', 'tel', 'Número de telefone', 9);
```

### Desativar Opção

```sql
UPDATE metadata_contexts SET is_active = false WHERE name = 'Contexto Antigo';
```

## Arquivos Modificados

1. **create_metadata_options_tables.sql** - Script de criação das tabelas
2. **src/lib/metadata-options-api.ts** - Nova API
3. **src/pages/CreateIndicator.tsx** - Carregamento dinâmico
4. **src/pages/AddIndicatorToPatient.tsx** - Validação dinâmica

O sistema agora é totalmente configurável e não requer alterações de código para adicionar novas opções! 🎉
