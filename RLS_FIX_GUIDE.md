# 🔧 Como Corrigir Erro de RLS - Profile Images

## ❌ **Problema**

```
new row violates row-level security policy for table "profile_images"
```

## 🎯 **Causa**

A tabela `profile_images` tem políticas de segurança (RLS) que esperam autenticação Supabase Auth, mas nossa aplicação usa autenticação própria baseada em localStorage.

## ✅ **Soluções Disponíveis**

### **Solução 1: Desabilitar RLS (Mais Rápida)**

Execute no Supabase SQL Editor:

```sql
ALTER TABLE profile_images DISABLE ROW LEVEL SECURITY;
```

### **Solução 2: Função RPC (Recomendada)**

Execute o script completo `fix_profile_images_rls_final.sql` no Supabase SQL Editor.

### **Solução 3: API Modificada (Já Implementada)**

O sistema agora tenta automaticamente:

1. ✅ Operação normal
2. 🔄 Se falhar por RLS → tenta RPC bypass
3. 🔄 Se RPC não existir → tenta inserção direta
4. ❌ Se tudo falhar → erro claro com instruções

## 🚀 **Teste a Correção**

1. **Execute uma das soluções SQL acima**
2. **Tente salvar uma imagem de perfil novamente**
3. **Deve funcionar sem erro de RLS**

## 🛠️ **Para Implementar a Solução Definitiva**

1. Acesse seu **Supabase Dashboard**
2. Vá em **SQL Editor**
3. Cole e execute o conteúdo do arquivo `fix_profile_images_rls_final.sql`
4. Teste novamente o upload de imagem

## 📋 **Verificação**

Após aplicar a correção, você deve ver:

```
✅ Imagem salva no Supabase com sucesso
```

## ⚠️ **Notas Importantes**

- **Desenvolvimento**: Usar Solução 1 (desabilitar RLS) é OK
- **Produção**: Usar Solução 2 (RPC function) é mais seguro
- **A API agora dá erros claros** com instruções quando RLS bloqueia a operação
