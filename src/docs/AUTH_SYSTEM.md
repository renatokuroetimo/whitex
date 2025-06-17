# Sistema de Autenticação - Documentação

## Visão Geral

O sistema de autenticação implementado permite:

- ✅ Criação de conta (médicos e pacientes)
- ✅ Login com email/senha
- ✅ Armazenamento de dados de usuário
- ✅ Proteção de rotas
- ✅ Gerenciamento de estado global

## Fluxo de Registro

### 1. Página de Registro (`/`)

- Usuário preenche email e senha
- Opções de login social (Google/Facebook) - simuladas
- Dados são armazenados temporariamente no sessionStorage
- Redirecionamento para seleção de profissão

### 2. Seleção de Profissão (`/select-profession`)

- Usuário escolhe entre "Médico" ou "Paciente"
- **Médico**: Redirecionamento para página de CRM
- **Paciente**: Registro é completado imediatamente

### 3. Adição de CRM (`/add-crm`) - Apenas Médicos

- Médico informa número do CRM
- Registro é finalizado
- Redirecionamento para dashboard

## Fluxo de Login

### 1. Página de Login (`/login`)

- Usuário informa email e senha
- Sistema valida credenciais
- Redirecionamento para dashboard

## Armazenamento de Dados

### LocalStorage (Simulando Banco de Dados)

```typescript
// Estrutura dos usuários armazenados
{
  id: string,
  email: string,
  profession: "medico" | "paciente",
  crm?: string, // apenas para médicos
  createdAt: string
}
```

### SessionStorage (Dados Temporários)

```typescript
// Dados temporários durante registro
{
  email: string,
  password: string,
  profession?: "medico" | "paciente",
  provider?: string // para login social
}
```

## Componentes Principais

### 1. AuthContext (`/src/contexts/AuthContext.tsx`)

- Gerencia estado global de autenticação
- Provê funções: `login`, `register`, `logout`
- Controla loading states e erros

### 2. AuthAPI (`/src/lib/auth-api.ts`)

- Simula chamadas para API real
- Funções: registro, login, logout
- Validação de email único

### 3. ProtectedRoute (`/src/components/ProtectedRoute.tsx`)

- Protege rotas que requerem autenticação
- Redireciona usuários não autenticados para login

## Rotas do Sistema

| Rota                 | Descrição               | Proteção  |
| -------------------- | ----------------------- | --------- |
| `/`                  | Registro de conta       | Pública   |
| `/login`             | Login                   | Pública   |
| `/select-profession` | Seleção médico/paciente | Pública\* |
| `/add-crm`           | Adição de CRM           | Pública\* |
| `/dashboard`         | Painel principal        | Protegida |

\*Estas rotas verificam dados temporários no sessionStorage

## Como Expandir para API Real

### 1. Substituir AuthAPI

```typescript
// Em vez de localStorage, fazer chamadas HTTP
const response = await fetch("/api/register", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(userData),
});
```

### 2. Adicionar JWT/Tokens

```typescript
// Armazenar tokens de autenticação
localStorage.setItem("auth_token", response.token);
```

### 3. Middleware de Autenticação

```typescript
// Interceptar requisições para adicionar headers
axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
```

## Funcionalidades Implementadas

✅ **Registro completo** - Email/senha + profissão + CRM  
✅ **Login funcional** - Validação e redirecionamento  
✅ **Proteção de rotas** - Dashboard protegido  
✅ **Estado global** - Context API para auth  
✅ **Validação de forms** - Campos obrigatórios  
✅ **Loading states** - Feedback visual  
✅ **Toast notifications** - Mensagens de sucesso/erro  
✅ **Responsivo** - Funciona em todos os dispositivos

## Próximos Passos

1. **Backend Integration**: Conectar com API real
2. **Password Security**: Hash das senhas
3. **Email Verification**: Verificação por email
4. **Password Reset**: Recuperação de senha
5. **2FA**: Autenticação de dois fatores
6. **Social Login**: Integração real com Google/Facebook
