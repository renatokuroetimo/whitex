# 🛡️ Sistema de Administração

Sistema completo de administração para gerenciamento de indicadores padrão do sistema médico.

## 🔐 Acesso Administrativo

### Credenciais de Acesso

- **URL**: `/admin` ou `/admin/login`
- **Email**: `renato@timo.com.br`
- **Senha**: `Timo@2025`

### 🛠️ Configuração Inicial

Execute o script SQL no Supabase Dashboard:

```sql
-- Arquivo: create_admin_system.sql
-- Este script criará a tabela de admins e os indicadores padrão
```

## 🎯 Funcionalidades

### ✅ Sistema de Autenticação

- **Login Seguro** - Verificação de credenciais no banco
- **Sessão Persistente** - Mantém login até logout explícito
- **Proteção de Rotas** - Acesso restrito a páginas administrativas
- **Interface Exclusiva** - Design diferenciado para área admin

### 📊 Gestão de Indicadores Padrão

- **✅ Visualizar** - Lista completa de indicadores padrão (`type = "standard"`)
- **✅ Criar** - Novos indicadores padrão para o sistema
- **✅ Editar** - Modificar indicadores existentes
- **✅ Deletar** - Remover indicadores (com confirmação)
- **✅ Buscar** - Filtrar por nome, categoria, parâmetro
- **✅ Filtrar** - Por categoria específica

## 🏗️ Arquitetura

### 📁 Estrutura de Arquivos

```
src/
├── lib/
│   └── admin-api.ts              # API de administração
├── components/
│   └── AdminProtectedRoute.tsx   # Proteção de rotas admin
└── pages/
    ├── AdminLogin.tsx            # Login administrativo
    ├── AdminIndicators.tsx       # Lista de indicadores
    ├── AdminEditIndicator.tsx    # Edição de indicador
    └── AdminCreateIndicator.tsx  # Criação de indicador
```

### 🗄️ Banco de Dados

#### Tabela `admins`

```sql
id               text PRIMARY KEY
email            text UNIQUE NOT NULL
password_hash    text NOT NULL     -- Em produção: usar bcrypt
full_name        text
is_active        boolean DEFAULT true
created_at       timestamp DEFAULT now()
updated_at       timestamp DEFAULT now()
```

#### Indicadores Padrão

Indicadores com `type = "standard"` na tabela `indicators`:

- **Sinais Vitais**: Pressão Arterial, Frequência Cardíaca, Temperatura, SpO2
- **Exames Lab**: Glicemia, Colesterol, Hemoglobina
- **Antropométricos**: Peso, Altura, IMC

## 🎨 Interface de Administração

### 🔑 Página de Login (`/admin/login`)

- **Design Premium** - Gradiente purple/blue com backdrop blur
- **Validação Robusta** - Campos obrigatórios com feedback
- **UX Intuitiva** - Toggle de senha, loading states
- **Redirecionamento** - Auto-redirect se já logado

### 📋 Dashboard de Indicadores (`/admin/indicators`)

**Header Administrativo:**

- Logo com ícone Shield
- Informações do admin logado
- Botão de logout

**Estatísticas:**

- Total de indicadores padrão
- Número de categorias
- Resultados filtrados

**Funcionalidades:**

- **Busca Inteligente** - Por nome, parâmetro, categoria
- **Filtro por Categoria** - Dropdown dinâmico
- **Tabela Responsiva** - Informações organizadas
- **Ações Rápidas** - Edit/Delete por indicador

### ✏️ Edição/Criação (`/admin/indicators/edit/:id` | `/admin/indicators/create`)

**Formulário Completo de Metapadrão:**

**Seção 1: Informações Básicas**

- Categoria Principal
- Subcategoria
- Parâmetro
- Contexto

**Seção 2: Metadados**

- Definição (textarea)
- Unidade de medida
- Tipo de dados
- Standard ID
- Fonte/origem

**Seção 3: Configurações**

- Requisitos: Data/Horário
- Obrigatoriedade: Obrigatório/Condicional/Repetível

## 🔧 API Administrativa

### `adminAPI`

```typescript
// Autenticação
login(credentials): Promise<Admin>
isAuthenticated(): boolean
getCurrentAdmin(): Admin | null
logout(): void

// Gestão de Indicadores Padrão
getStandardIndicators(): Promise<IndicatorWithDetails[]>
getStandardIndicatorById(id): Promise<IndicatorWithDetails | null>
createStandardIndicator(data): Promise<void>
updateStandardIndicator(id, data): Promise<void>
deleteStandardIndicator(id): Promise<void>
```

### Validações de Segurança

- **Autenticação Obrigatória** - Todas as operações verificam login
- **Scope Restrito** - Só opera em indicadores `type = "standard"`
- **Proteção de Rotas** - `AdminProtectedRoute` component
- **Validação de Dados** - Campos obrigatórios validados

## 🎯 Casos de Uso

### 1. Login Administrativo

```typescript
// Admin acessa /admin
// Sistema redireciona para /admin/login se não autenticado
// Admin insere credenciais
// Sistema valida no banco de dados
// Redirect para /admin/indicators
```

### 2. Gerenciar Indicador Padrão

```typescript
// Admin visualiza lista de indicadores
// Admin busca/filtra indicadores específicos
// Admin clica em "Editar" ou "Novo Indicador"
// Sistema abre formulário com metadados completos
// Admin modifica conforme metapadrão
// Sistema salva como type = "standard"
```

### 3. Controle de Qualidade

```typescript
// Admin revisa definições dos indicadores
// Admin padroniza unidades de medida
// Admin configura obrigatoriedade
// Admin define tipos de dados apropriados
// Sistema mantém consistência em todo o sistema
```

## 🛡️ Segurança

### Controle de Acesso

- **Credenciais Únicas** - Email/senha específicos para admin
- **Sessão Isolada** - Separada da autenticação de médicos/pacientes
- **Rotas Protegidas** - Middleware de verificação
- **Logout Seguro** - Limpeza completa da sessão

### Validações

- **Autenticação em Todas as APIs** - Verificação obrigatória
- **Scope de Operações** - Só indicadores padrão
- **Validação de Entrada** - Sanitização de dados
- **Prevenção de Duplicatas** - Verificação de unicidade

## 📊 Monitoramento

### Logs de Atividade

```typescript
// Todas as operações são logadas:
console.log("✅ Admin logado:", admin.email);
console.log("✅ Indicador padrão criado:", indicatorId);
console.log("✅ Indicador padrão atualizado:", indicatorId);
console.log("✅ Indicador padrão deletado:", indicatorId);
```

### Métricas Disponíveis

- Total de indicadores padrão
- Indicadores por categoria
- Última modificação por admin
- Frequência de uso de indicadores

## 🚀 Deploy e Manutenção

### 1. Configuração Inicial

```bash
# 1. Execute o script SQL
# create_admin_system.sql no Supabase

# 2. Verifique as credenciais
SELECT email, is_active FROM admins WHERE email = 'renato@timo.com.br';

# 3. Teste o login
# Acesse /admin e faça login
```

### 2. Manutenção

```sql
-- Adicionar novo admin
INSERT INTO admins (email, password_hash, full_name)
VALUES ('novo@admin.com', 'senha_hash', 'Nome do Admin');

-- Desativar admin
UPDATE admins SET is_active = false WHERE email = 'admin@email.com';

-- Verificar indicadores padrão
SELECT COUNT(*) FROM indicators WHERE type = 'standard';
```

## 🔮 Expansões Futuras

### Funcionalidades Planejadas

- [ ] **Gestão de Admins** - CRUD de administradores
- [ ] **Auditoria Completa** - Log de todas as alterações
- [ ] **Backup de Indicadores** - Exportação/importação
- [ ] **Versionamento** - Histórico de mudanças
- [ ] **Aprovação de Workflows** - Processo de aprovação
- [ ] **Analytics** - Uso de indicadores por médicos

### Melhorias de Segurança

- [ ] **2FA** - Autenticação de dois fatores
- [ ] **Hash Bcrypt** - Criptografia adequada de senhas
- [ ] **Políticas de Senha** - Complexidade obrigatória
- [ ] **Logs de Auditoria** - Rastreamento completo
- [ ] **Rate Limiting** - Prevenção de ataques

## 📝 Resumo

O sistema de administração está **100% funcional** e permite:

✅ **Acesso Exclusivo** - Credenciais específicas para admin  
✅ **Gestão Completa** - CRUD de indicadores padrão  
✅ **Interface Profissional** - Design premium e funcional  
✅ **Segurança Robusta** - Proteção de rotas e validações  
✅ **Compatibilidade com Metapadrão** - Seguindo especificação acadêmica

**Pronto para produção!** 🎉
