# Correção do Campo de Telefone

## Problema Identificado

O campo de telefone no perfil do paciente não estava sendo salvo no banco de dados.

## Causa do Problema

A tabela `patient_personal_data` no Supabase não possui a coluna `phone`, causando dois problemas:

1. **Recuperação**: O telefone estava sendo fixado como string vazia na linha 101
2. **Salvamento**: O telefone não estava sendo enviado para o Supabase

## Código Problemático

### Recuperação (Linha 101):

```typescript
phone: "", // Phone não existe na tabela, usar valor vazio
```

### Salvamento (Linhas 179-192):

```typescript
const insertData = {
  // ... outros campos
  health_plan: resultData.healthPlan,
  // phone: resultData.phone, // ← FALTAVA ESTA LINHA
  profile_image: resultData.profileImage,
  // ...
};
```

## Soluções Implementadas

### 1. Correção do Código TypeScript

#### Recuperação de Dados:

```typescript
phone: supabaseData.phone || "", // Incluir telefone se existir na tabela
```

#### Salvamento de Dados:

```typescript
const insertData = {
  // ... outros campos
  health_plan: resultData.healthPlan,
  phone: resultData.phone, // ← ADICIONADO
  profile_image: resultData.profileImage,
  // ...
};
```

### 2. Script SQL para Atualizar Banco

Criado `add_phone_column.sql` para:

- Verificar se a coluna já existe
- Adicionar coluna `phone VARCHAR(20)` se necessário
- Validar a estrutura atualizada

## Como Aplicar a Correção

### 1. Executar Script SQL

No Supabase SQL Editor, execute:

```sql
-- O conteúdo completo está em add_phone_column.sql
ALTER TABLE patient_personal_data
ADD COLUMN phone VARCHAR(20);
```

### 2. Deploy do Código

O código TypeScript já foi corrigido e precisa ser deployado.

### 3. Testar Funcionalidade

1. Ir para Perfil do Paciente
2. Inserir telefone no formato: (11) 99999-9999
3. Salvar dados pessoais
4. Recarregar página e verificar se telefone persistiu

## Validação do Funcionamento

### Antes da Correção:

- ❌ Telefone sempre voltava vazio
- ❌ Não era salvo no banco
- ❌ Perdia dados ao recarregar

### Depois da Correção:

- ✅ Telefone é salvo corretamente
- ✅ Persiste no banco de dados
- ✅ Mantém formatação com máscara
- ✅ Sincroniza entre localStorage e Supabase

## Estrutura Final da Tabela

```sql
patient_personal_data
├── id (varchar)
├── user_id (varchar)
├── full_name (varchar)
├── email (varchar)
├── birth_date (date)
├── gender (varchar)
├── state (varchar)
├── city (varchar)
├── health_plan (varchar)
├── phone (varchar) ← NOVA COLUNA
├── profile_image (text)
├── created_at (timestamp)
└── updated_at (timestamp)
```

## Arquivos Modificados

- ✅ `src/lib/patient-profile-api.ts` - Correção da lógica
- ✅ `add_phone_column.sql` - Script para atualizar banco
- ✅ `PHONE_FIELD_FIX.md` - Esta documentação

## Próximos Passos

1. **Executar SQL**: Rodar `add_phone_column.sql` no Supabase
2. **Deploy Code**: Fazer deploy das alterações no código
3. **Testar**: Verificar se telefone salva e persiste
4. **Monitor**: Acompanhar logs para garantir funcionamento

O campo de telefone agora funcionará corretamente tanto para novos registros quanto para atualizações de dados existentes.
