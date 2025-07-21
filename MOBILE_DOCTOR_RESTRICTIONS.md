# Restrições de Médicos na Versão Mobile

## Alterações Implementadas

### 1. Correção da Detecção Mobile (`src/lib/mobile-utils.ts`)

- **Problema**: A função `isMobileApp()` sempre retornava `false`
- **Solução**: Modificada para usar `import.meta.env.VITE_APP_MODE`
- **Resultado**: Agora detecta corretamente quando está rodando a versão mobile

```typescript
export const isMobileApp = (): boolean => {
  const appMode = import.meta.env.VITE_APP_MODE;
  return appMode === "mobile";
};
```

### 2. Bloqueio de Cadastro Mobile (`src/pages/AddCRM.tsx`)

- **Adicionado**: Verificação mobile que redireciona para página inicial
- **Resultado**: Médicos não conseguem acessar a página de cadastro com CRM no mobile

### 3. Componente de Acesso Restrito (`src/components/MobileAccessRestricted.tsx`)

- **Criado**: Componente reutilizável para mostrar mensagens de restrição
- **Benefício**: Interface consistente e melhor experiência do usuário
- **Usado em**: `ProtectedRouteMobile`, `SelectProfession`

### 4. Melhorias nas Mensagens de Erro

- **Padronizadas**: Todas as mensagens agora são consistentes
- **Informativas**: Explicam claramente que médicos devem usar a versão web
- **Design**: Interface visual atrativa com logo e cores do app

## Como Funciona

### Versão Web (VITE_APP_MODE ≠ "mobile")

- ✅ Médicos podem fazer login
- ✅ Médicos podem se cadastrar
- ✅ Pacientes podem fazer login
- ✅ Pacientes podem se cadastrar

### Versão Mobile (VITE_APP_MODE = "mobile")

- ❌ Médicos NÃO podem fazer login (bloqueado com toast)
- ❌ Médicos NÃO podem se cadastrar (rota não disponível)
- ✅ Pacientes podem fazer login normalmente
- ✅ Pacientes podem se cadastrar automaticamente

## Pontos de Bloqueio

1. **Login**: Verificação prévia no localStorage antes do login
2. **Pós-login**: Verificação adicional após login bem-sucedido
3. **Rotas**: `AddCRM` e `SelectProfession` redirecionam no mobile
4. **Proteção**: `ProtectedRouteMobile` bloqueia usuários não-pacientes
5. **Auth Context**: Limpa sessões de médicos automaticamente

## Mensagens Exibidas

- **Login Bloqueado**: "Este aplicativo é exclusivo para pacientes. Médicos devem acessar através da versão web."
- **Rota Protegida**: "Este aplicativo é exclusivo para pacientes."
- **Seleção Profissão**: "Este aplicativo cria automaticamente contas de paciente. Médicos devem acessar a versão web."

## Builds

- **Web**: `npm run build` (permite médicos e pacientes)
- **Mobile**: `npm run mobile:build` (apenas pacientes)

## Teste

Execute `npm run mobile:dev` para testar a versão mobile localmente.
