# 🏥 Sistema Médico com Metapadrão de Indicadores

Sistema completo de autenticação médica com implementação de **Metapadrão para Descrição e Integração de Padrões de Metadados**, baseado na pesquisa acadêmica de Alcione Benacchio e Maria Salete Marcon Gomes Vaz (UFPR/UEPG).

## 📚 Fundamentação Acadêmica

Este projeto implementa os conceitos do artigo científico **"Metapadrão - Descrição e Integração de Padrões de Metadados"** (RUTI, 2008), seguindo as especificações da norma **ISO/IEC 11179** para gestão de metadados em organizações.

### 🎯 Objetivo do Metapadrão

> _"O objetivo é apresentar um padrão genérico para descrição de padrões de metadados que possibilita a integração dos dados comuns entre padrões distintos, proporcionando um repositório onde um único sistema possa gerenciar os metadados de vários padrões."_

## 🏗️ Arquitetura do Sistema

### 📊 Gestão de Indicadores Médicos

O sistema implementa um repositório centralizado de metadados para indicadores médicos, permitindo:

- **Padronização**: Descrição uniforme de indicadores
- **Reutilização**: Compartilhamento entre diferentes contextos
- **Integração**: Dados comuns entre padrões distintos
- **Flexibilidade**: Extensão constante dos padrões

### 🗄️ Estrutura de Metadados

Baseado no modelo conceitual do Metapadrão:

```
Padrão (Standard)
├── Classe (Categoria/Subcategoria)
│   ├── Contexto (Domínio de aplicação)
│   └── Propriedade (Indicador específico)
│       ├── Tipo de Dado
│       ├── Obrigatoriedade
│       └── Condições
```

## 📋 Especificações dos Metadados

Conforme definido no artigo, os metadados registrados possuem as seguintes especificações:

### ✅ Campos Obrigatórios

- **Identificador único** para cada elemento
- **Contexto** dos metadados
- **Definição** clara do significado

### 🔄 Classificação de Obrigatoriedade

Implementa as **três categorias** definidas no Metapadrão:

1. **📌 Obrigatórios**: Sempre necessários
2. **📋 Opcionais**: Não são necessários
3. **⚠️ Obrigatórios Condicionais**: Obrigatórios baseados em condições

### 🏷️ Propriedades Especiais

- **🔄 Repetíveis**: Um metadado pode ocorrer múltiplas vezes
- **📊 Tipados**: Tipos de valores específicos por metadado
- **🔗 Hierárquicos**: Relacionamentos entre metadados (removido por redundância)

## 🎨 Interface de Indicadores

### 📝 Formulário de Criação/Edição

#### **Seção 1: Informações Básicas**

- **Categoria Principal\*** - Classificação primária do indicador
  - _Exemplo_: Sinais Vitais, Exames Laboratoriais, Medidas Antropométricas
- **Subcategoria\*** - Refinamento da categoria
  - _Exemplo_: Pressão Arterial, Glicemia, Peso
- **Parâmetro\*** - Nome específico do indicador
  - _Exemplo_: Sistólica/Diastólica, Glicose em jejum, Peso corporal
- **Contexto** - Domínio de aplicação (dinâmico do banco)
  - _Exemplos_: Autoria, Paciente, Clínico, Administrativo, Técnico, Temporal

#### **Seção 2: Metadados**

- **Definição** - Descrição clara do significado
  - _Texto livre explicando o propósito do indicador_
- **Unidade de Medida\*** - Unidade física de medição
  - _Exemplo_: mmHg, mg/dL, kg, cm, °C, bpm
- **Tipo de Dado** - Classificação do valor (dinâmico do banco)
  - **Texto**: Campo de texto livre
  - **Número**: Valor numérico com validação
  - **Data**: Data no formato DD/MM/AAAA
  - **Data e Hora**: Data e hora completas
  - **Booleano**: Verdadeiro/falso ou sim/não
  - **Lista**: Lista de valores separados
  - **URL**: Endereço web válido
  - **Email**: Endereço de email válido
- **Standard ID** - Identificação do padrão origem
  - _Exemplo_: Dublin Core, MPEG-7, HL7
- **Fonte/Origem** - Proveniência do metadado

#### **Seção 3: Configurações**

**Requisitos de Dados:**

- **Requer Data** - Se o indicador necessita informação temporal
- **Requer Horário** - Se o indicador necessita hora específica

**Regras de Obrigatoriedade** (mutuamente exclusivas):

- **É Obrigatório** - Sempre necessário, não pode ser condicional
- **Obrigatório Condicional** - Obrigatório apenas sob certas condições
- **Repetível** - Pode ocorrer múltiplas vezes

### 🎯 Interface Dinâmica de Valores

Ao adicionar indicadores a pacientes, o sistema adapta-se automaticamente:

- **Label dinâmico**: "Valor - número", "Valor - email", etc.
- **Input adaptativo**: Tipo de campo baseado no data_type
- **Validação específica**: Regras conforme o tipo de dados
- **Componentes especiais**: Select para booleanos, date picker para datas

## 🗄️ Modelo de Dados

### 📊 Tabelas Principais

#### `indicators` - Repositório de Metadados

```sql
-- Campos básicos (existentes)
id, name, category, subcategory, parameter, unit, type, doctor_id

-- Campos de metadados (novos)
definition          -- Definição clara do significado
context            -- Contexto de aplicação
data_type          -- Tipo de dado (texto, numero, data, etc.)
is_required        -- Se é obrigatório
is_conditional     -- Se é obrigatório condicional
is_repeatable      -- Se pode repetir
standard_id        -- Padrão de origem (Dublin Core, HL7, etc.)
source             -- Fonte/origem do metadado
requires_date      -- Se requer informação de data
requires_time      -- Se requer informação de horário
```

#### `metadata_contexts` - Contextos Dinâmicos

```sql
id, name, description, is_active, display_order
```

#### `metadata_data_types` - Tipos de Dados Dinâmicos

```sql
id, name, value, input_type, validation_rules, is_active, display_order
```

### 🔄 Configurabilidade Dinâmica

Seguindo o princípio de **flexibilidade para constantes extensões**:

- **Contextos configuráveis** via banco de dados
- **Tipos de dados extensíveis** sem alteração de código
- **Validações personalizáveis** por tipo de dados
- **Padrões adicionáveis** conforme necessidade organizacional

## 🚀 Funcionalidades Implementadas

### ✅ Sistema Completo de Metapadrão

- **✅ Repositório Centralizado** - Metadados em local único
- **✅ Reutilização** - Compartilhamento entre padrões
- **✅ Tipagem Dinâmica** - Tipos configuráveis via banco
- **✅ Contextos Flexíveis** - Domínios configuráveis
- **✅ Validação Inteligente** - Regras baseadas em tipos
- **✅ Interface Adaptativa** - UI que se adapta aos metadados
- **✅ Obrigatoriedade Condicional** - Regras de negócio implementadas
- **✅ Padrões Extensíveis** - Suporte a múltiplos standards

### 👥 Sistema de Usuários

- **✅ Autenticação Médicos/Pacientes**
- **✅ Validação CRM**
- **✅ Dashboard Diferenciado**
- **✅ Proteção de Rotas**

### 📊 Gestão de Indicadores

- **✅ CRUD Completo** (Criar, Ler, Atualizar, Deletar)
- **✅ Indicadores Padrão e Personalizados**
- **✅ Categorização Hierárquica**
- **✅ Metadados Completos**
- **✅ Validação por Tipo de Dados**

### 🏥 Gestão de Pacientes

- **✅ Cadastro de Pacientes**
- **✅ Atribuição de Indicadores**
- **✅ Coleta de Valores**
- **✅ Histórico Temporal**
- **✅ Visualização Gráfica**

## 🛠️ Tecnologias

### Frontend

- **React 18** + TypeScript
- **React Router 6** - Roteamento SPA
- **TailwindCSS** + Radix UI - Design System
- **Vite** - Build e desenvolvimento

### Backend/Dados

- **Supabase** - PostgreSQL + Auth + API
- **LocalStorage** - Fallback offline

### Validação e Tipos

- **Zod** - Validação de schemas
- **React Hook Form** - Formulários
- **TypeScript** - Tipagem estática

## 🏃‍♂️ Execução Local

```bash
# 1. Instalar dependências
npm install

# 2. Executar migração do banco (apenas uma vez)
# Execute o script create_metadata_options_tables.sql no Supabase

# 3. Executar em desenvolvimento
npm run dev

# 4. Build para produção
npm run build
```

## 🗄️ Configuração do Banco

### 1. Scripts SQL Necessários

Execute na seguinte ordem no SQL Editor do Supabase:

```sql
-- 1. Criar tabelas de opções dinâmicas
-- Arquivo: create_metadata_options_tables.sql

-- 2. Adicionar campos de metadados
-- Arquivo: update_indicators_metadata_schema.sql

-- 3. (Opcional) Remover campos de hierarquia
-- Arquivo: remove_hierarchy_columns.sql
```

### 2. Variáveis de Ambiente

```bash
# .env.local
VITE_SUPABASE_URL=sua_url_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
```

## 📁 Estrutura do Projeto

```
src/
├── components/              # Componentes reutilizáveis
│   ├── ui/                 # Biblioteca Radix UI
│   ├── ProtectedRoute.tsx  # Proteção de rotas
│   └── Sidebar.tsx         # Navegação
├── contexts/               # Context API
│   └── AuthContextHybrid.tsx
├── lib/                    # APIs e utilitários
│   ├── indicator-api.ts    # CRUD de indicadores
│   ├── indicator-types.ts  # Tipos TypeScript
│   ├── metadata-options-api.ts  # API de opções dinâmicas
│   ├── patient-api.ts      # Gestão de pacientes
│   └── supabase.ts         # Cliente Supabase
├── pages/                  # Páginas da aplicação
│   ├── CreateIndicator.tsx # Formulário de metadados
│   ├── CreatedIndicators.tsx # Lista com edição
│   ├── AddIndicatorToPatient.tsx # Coleta de valores
│   ├── Dashboard.tsx       # Dashboard médico
│   └── PatientDashboard.tsx # Dashboard paciente
└── docs/                   # Documentação
    ├── METADATA_IMPLEMENTATION.md
    ├── DYNAMIC_METADATA_OPTIONS.md
    └── HIERARCHY_REMOVAL.md
```

## 🔧 APIs Implementadas

### `indicatorAPI`

- `getIndicators()` - Lista indicadores do médico
- `getStandardIndicators()` - Indicadores padrão do sistema
- `getIndicatorById(id)` - Busca indicador específico
- `createIndicator(data)` - Cria novo indicador
- `updateIndicator(id, data)` - Atualiza indicador
- `deleteIndicator(id)` - Remove indicador

### `metadataOptionsAPI`

- `getContexts()` - Lista contextos disponíveis
- `getDataTypes()` - Lista tipos de dados disponíveis
- `createContext(name, description)` - Adiciona contexto
- `createDataType(name, value, inputType)` - Adiciona tipo

### `patientAPI`

- `getPatients()` - Lista pacientes do médico
- `getPatientById(id)` - Busca paciente específico
- `createPatient(data)` - Cadastra paciente
- `updatePatient(id, data)` - Atualiza paciente

## 🎯 Casos de Uso

### 1. Criar Indicador Personalizado

```typescript
// Médico cria indicador seguindo metapadrão
const indicador = {
  // Informações Básicas
  categoryId: "cat1", // Sinais Vitais
  subcategoryId: "sub1", // Pressão Arterial
  parameter: "Pressão Sistólica",
  context: "Clínico", // Dinâmico do banco

  // Metadados
  definition: "Pressão exercida pelo sangue...",
  dataType: "numero", // Dinâmico do banco
  standardId: "HL7 FHIR",
  source: "Protocolo Clínico XYZ",

  // Configurações
  isRequired: true, // Mutuamente exclusivo
  isConditional: false, // com isConditional
  isRepeatable: false,
  requiresDate: true,
  requiresTime: false,
};
```

### 2. Coleta de Valores Dinâmica

```typescript
// Sistema adapta interface baseado no metadado
if (indicator.dataType === "numero") {
  // Input tipo number com validação numérica
  renderNumberInput();
} else if (indicator.dataType === "booleano") {
  // Select com opções Sim/Não
  renderBooleanSelect();
}

// Label dinâmico: "Valor - número", "Valor - email"
const label = `Valor - ${getDataTypeLabel(indicator.dataType)}`;
```

## 📊 Benefícios do Metapadrão

### 🎯 Padronização

- **Descrição uniforme** de dados médicos
- **Entendimento claro** através de elementos organizacionais
- **Consistência** na coleta e armazenamento

### 🔄 Reutilização

- **Compartilhamento** entre diferentes contextos
- **Reuso** através do tempo, espaço e aplicações
- **Evita duplicação** de metadados

### 🏗️ Integração

- **Dados comuns** entre padrões distintos
- **Crosswalking** automático entre standards
- **Repositório único** para múltiplos padrões

### 📈 Extensibilidade

- **Novos contextos** sem alteração de código
- **Tipos de dados** configuráveis via banco
- **Padrões adicionais** facilmente integrados

## 🔮 Roadmap

### Próximas Implementações

- [ ] **Condições Complexas** - Interface para regras condicionais
- [ ] **Versionamento** - Histórico de alterações de metadados
- [ ] **Importação/Exportação** - Dublin Core, HL7 FHIR
- [ ] **API RESTful** - Endpoints para integração externa
- [ ] **Múltiplos Padrões** - Suporte nativo a HL7, DICOM
- [ ] **Validação Avançada** - Regras JSON Schema
- [ ] **Auditoria** - Log de alterações de metadados

### Standards Futuros

- **HL7 FHIR** - Interoperabilidade em saúde
- **DICOM** - Imagens médicas
- **Dublin Core** - Metadados descritivos
- **MPEG-7** - Conteúdo multimídia

## 📚 Documentação Adicional

- **[Implementação de Metadados](METADATA_IMPLEMENTATION.md)** - Guia técnico completo
- **[Opções Dinâmicas](DYNAMIC_METADATA_OPTIONS.md)** - Sistema configurável
- **[Remoção de Hierarquia](HIERARCHY_REMOVAL.md)** - Decisões de design
- **[Análise de Compatibilidade LOINC](LOINC_COMPATIBILITY_ANALYSIS.md)** - Estudo completo sobre implementação de códigos LOINC no sistema

## 🎓 Referências Acadêmicas

1. **Benacchio, A.** & **Vaz, M.S.M.G.** (2008). _"Metapadrão - Descrição e Integração de Padrões de Metadados"_. RUTI | Revista Unieuro de Tecnologia da Informação, V1 N1.

2. **ISO/IEC 11179** - _Information Technology – Metadata registries (MDR)_

3. **Dublin Core Metadata Initiative** - Padrão de metadados descritivos

4. **HL7 FHIR** - Fast Healthcare Interoperability Resources

## 📄 Licença

MIT License - Sistema desenvolvido para fins acadêmicos e de pesquisa, implementando conceitos do metapadrão conforme especificação científica.

---

## 🔐 Paths de Acesso por Tipo de Usuário

### 👨‍⚕️ Médico

- **Login**: `/login` → Selecionar "Médico" → Inserir CRM
- **Dashboard**: `/dashboard`
- **Pacientes**: `/pacientes`
- **Indicadores**: `/indicadores`
- **Perfil**: `/profile`

### 🏥 Paciente

- **Login**: `/login` → Selecionar "Paciente"
- **Dashboard**: `/patient-dashboard`
- **Meus Indicadores**: `/patient/indicadores`
- **Buscar Médicos**: `/patient/buscar-medicos`
- **Gráficos**: `/patient/graficos`
- **Perfil**: `/patient-profile`

### 👥 Administrador

- **Login**: `/admin` ou `/admin/login`
- **Dashboard**: `/admin/dashboard`
- **Indicadores**: `/admin/indicators`
- **Hospitais**: `/admin/hospitals`

### 🏥 Hospital/Clínica

- **Login**: `/gerenciamento` ou `/gerenciamento/login`
- **Dashboard**: `/gerenciamento/dashboard`
- **Pacientes**: `/gerenciamento/patients`
- **Criar Médico**: `/gerenciamento/doctors/create`
- **Gráficos**: `/gerenciamento/patients/graphs`

## 🚀 Deploy e Implementação

### AWS Amplify (Recomendado)

1. Fork este repositório
2. AWS Console → Amplify ��� "New app"
3. Conectar ao repositório
4. Deploy automático

### Configuração Supabase

1. Criar projeto no [Supabase](https://supabase.com)
2. Executar scripts SQL da pasta raiz
3. Configurar variáveis de ambiente
4. Deploy!

**O sistema implementa completamente os conceitos de metapadrão para integração e gestão de metadados médicos** 🎉
