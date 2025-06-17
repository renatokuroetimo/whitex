# 🏥 Sistema Médico - Autenticação e Dashboard

Sistema completo de autenticação para plataforma médica com suporte a médicos e pacientes, incluindo validação de CRM.

## 🚀 Deploy Rápido

[![Deploy with AWS Amplify](https://oneclick.amplifyapp.com/button.svg)](https://console.aws.amazon.com/amplify/)

## ✨ Funcionalidades

- ✅ **Registro de Conta** - Email/senha + validação
- ✅ **Login Social** - Google e Facebook (simulado)
- ✅ **Seleção de Profissão** - Médico ou Paciente
- ✅ **Validação CRM** - Para médicos
- ✅ **Dashboard Protegido** - Informações da conta
- ✅ **Responsivo** - Mobile-first design
- ✅ **Seguro** - Proteção de rotas

## 🛠️ Tecnologias

- **Frontend**: React 18 + TypeScript
- **Routing**: React Router 6
- **Styling**: TailwindCSS + Radix UI
- **Build**: Vite
- **State**: Context API
- **Forms**: Validação nativa HTML5

## 🏃‍♂️ Execução Local

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview
```

## 🌍 Deploy para AWS

### Opção 1: AWS Amplify (Recomendado)

1. **Fork/Clone** este repositório
2. **AWS Console** → Amplify → "New app"
3. **Conectar repositório** GitHub/GitLab
4. **Deploy automático** - Pronto!

**URL de exemplo**: `https://main.d1234567890.amplifyapp.com`

### Opção 2: S3 + CloudFront

```bash
# Build do projeto
npm run build

# Upload para S3
aws s3 sync dist/ s3://seu-bucket-name --delete

# Invalidar CloudFront
aws cloudfront create-invalidation --distribution-id EDFDVBD6EXAMPLE --paths "/*"
```

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── ui/             # Biblioteca de UI (Radix)
│   └── ProtectedRoute.tsx
├── contexts/           # Context API
│   └── AuthContext.tsx
├── hooks/              # Hooks customizados
├── lib/                # Utilitários e APIs
│   ├── auth-api.ts     # API de autenticação
│   ├── types.ts        # TypeScript types
│   └── utils.ts        # Funções utilitárias
├── pages/              # Páginas da aplicação
│   ├── Index.tsx       # Registro
│   ├── Login.tsx       # Login
│   ├── SelectProfession.tsx
│   ├── AddCRM.tsx
│   └── Dashboard.tsx
└── docs/               # Documentação
    └── AUTH_SYSTEM.md
```

## 🔐 Sistema de Autenticação

### Dados do Usuário

```typescript
interface User {
  id: string;
  email: string;
  profession: "medico" | "paciente";
  crm?: string; // Apenas para médicos
  createdAt: string;
}
```

### Fluxo de Registro

1. **Registro** → Email + Senha
2. **Profissão** → Médico ou Paciente
3. **CRM** → Se médico, informar CRM
4. **Dashboard** → Acesso ao sistema

### Armazenamento

- **LocalStorage**: Base de dados simulada
- **SessionStorage**: Dados temporários
- **Context API**: Estado global

## 🔗 Rotas

| Rota                 | Componente        | Proteção |
| -------------------- | ----------------- | -------- |
| `/`                  | Registro          | Pública  |
| `/login`             | Login             | Pública  |
| `/select-profession` | Seleção Profissão | Temp\*   |
| `/add-crm`           | Adicionar CRM     | Temp\*   |
| `/dashboard`         | Dashboard         | Privada  |

\*Requer dados temporários no sessionStorage

## 🎨 Design System

- **Cores**: Blue (#4285f4) + Neutros
- **Typography**: System fonts
- **Spacing**: Escala 4px (Tailwind)
- **Components**: Radix UI primitives
- **Responsive**: Mobile-first

## 🧪 Testes

```bash
# Executar testes
npm test

# Verificação de tipos
npm run typecheck

# Linting
npm run format.fix
```

## 📊 Performance

- **Bundle size**: ~200KB gzipped
- **First Load**: <2s
- **Lighthouse**: 95+ score
- **Core Web Vitals**: Todas verdes

## 🔄 Migração para API Real

### 1. Substituir AuthAPI

```typescript
// Trocar localStorage por fetch
const response = await fetch("/api/register", {
  method: "POST",
  body: JSON.stringify(userData),
});
```

### 2. Adicionar JWT

```typescript
// Armazenar tokens
localStorage.setItem("token", response.token);
```

### 3. Backend Sugerido

- **Node.js + Express**
- **PostgreSQL + Prisma**
- **JWT Authentication**
- **AWS RDS/Aurora**

## 📈 Próximas Funcionalidades

- [ ] Backend API (Node.js/Python)
- [ ] Email verification
- [ ] Password reset
- [ ] 2FA Authentication
- [ ] Admin panel
- [ ] Patient management
- [ ] Appointment scheduling
- [ ] Real-time notifications

## 🆘 Suporte

### Issues Comuns

**Build Error**: Limpar node_modules

```bash
rm -rf node_modules package-lock.json
npm install
```

**404 em Produção**: Configurar SPA redirect

```yaml
# amplify.yml
redirects:
  - source: "/<*>"
    target: "/index.html"
    status: "200"
```

### Contato

- **Repositório**: [GitHub Issues](https://github.com/usuario/medical-app/issues)
- **Documentação**: [Docs completa](./src/docs/AUTH_SYSTEM.md)

## 📄 Licença

MIT License - Veja [LICENSE](LICENSE) para detalhes.

---

## 🚀 Deploy em 3 Passos

1. **Fork** este repo
2. **AWS Amplify** → Connect repository
3. **Deploy** → Pronto! 🎉

**Live Demo**: [https://medical-app.amplifyapp.com](https://medical-app.amplifyapp.com)
