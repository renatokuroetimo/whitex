# Como Diagnosticar o Problema das Imagens

## Problema

As imagens de perfil não aparecem nem em produção nem em desenvolvimento, mesmo com o banco sendo o mesmo.

## Diagnóstico Rápido

### 1. Abra o Console do Navegador

- **Chrome/Edge**: F12 → Console
- **Firefox**: F12 → Console
- **Safari**: Cmd+Option+I → Console

### 2. Execute este script para diagnóstico:

```javascript
// Diagnóstico completo do sistema de imagens
(async function () {
  // Importar a API (ajuste o caminho se necessário)
  const { profileImageAPI } = await import("/src/lib/profile-image-api.ts");

  // Executar diagnóstico
  await profileImageAPI.debugImageSystem();

  // Se você souber seu user ID, pode testar especificamente:
  // await profileImageAPI.debugImageSystem('SEU_USER_ID_AQUI');
})();
```

### 3. Para migrar imagens do localStorage para Supabase:

```javascript
// Migrar imagens existentes
(async function () {
  const { profileImageAPI } = await import("/src/lib/profile-image-api.ts");

  const result = await profileImageAPI.migrateLocalImagesToSupabase();
  console.log("Resultado da migração:", result);
})();
```

### 4. Para verificar se a tabela existe:

```javascript
// Verificar tabela
(async function () {
  const { profileImageAPI } = await import("/src/lib/profile-image-api.ts");

  const exists = await profileImageAPI.checkTableExists();
  console.log("Tabela profile_images existe:", exists);
})();
```

## Problemas Comuns e Soluções

### ❌ Problema: Tabela não existe

**Solução**: Execute o SQL em `create_profile_images_table.sql` no Supabase

### ❌ Problema: Usuário não autenticado

**Solução**: Verifique se o login está funcionando e se o usuário está autenticado no Supabase

### ❌ Problema: Imagens no localStorage, não no Supabase

**Solução**: Execute a migração com o script acima

### ❌ Problema: Feature flag desabilitada

**Solução**: Verifique se `useSupabaseIndicators` está habilitada

### ❌ Problema: RLS Policy bloqueando

**Solução**: Execute o SQL em `fix_profile_images_rls.sql`

## Scripts SQL Necessários

### Se a tabela não existir:

```sql
-- Execute em Supabase > SQL Editor
-- Conteúdo do arquivo: create_profile_images_table.sql
```

### Se houver problemas de RLS:

```sql
-- Execute em Supabase > SQL Editor
-- Conteúdo do arquivo: fix_profile_images_rls.sql
```

## Verificação Manual no Supabase

1. Acesse seu Supabase Dashboard
2. Vá em **Table Editor**
3. Procure a tabela `profile_images`
4. Verifique se há registros
5. Verifique se o `user_id` corresponde aos usuários logados

## Passos para Resolver

1. **Execute o diagnóstico** no console
2. **Verifique a saída** do diagnóstico
3. **Siga as recomendações** mostradas
4. **Execute a migração** se necessário
5. **Teste** salvando uma nova imagem
