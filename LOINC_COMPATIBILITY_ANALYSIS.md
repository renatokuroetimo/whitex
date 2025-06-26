# 📋 Análise de Compatibilidade com LOINC

## 🎯 Objetivo

Documentação completa sobre os requisitos e etapas necessárias para tornar o sistema de indicadores médicos compatível com LOINC (Logical Observation Identifiers Names and Codes).

## 📚 O que é LOINC?

**LOINC (Logical Observation Identifiers Names and Codes)** é um sistema de códigos padrão internacional usado para identificar:

- Observações médicas
- Resultados de laboratório
- Medições vitais
- Dados clínicos em geral

### Estrutura do LOINC

Os códigos LOINC consistem em:

- **Formato**: 1-7 dígitos + hífen + dígito verificador (ex: "33747-0")
- **6 Componentes principais**:
  1. **Component** (Componente): O que está sendo medido
  2. **Property** (Propriedade): Característica do componente
  3. **Time Aspect** (Aspecto Temporal): Quando foi coletado
  4. **System** (Sistema): Onde foi coletado
  5. **Scale** (Escala): Como é medido
  6. **Method** (Método): Como foi realizado

## 🔍 Análise do Sistema Atual

### ✅ O que já temos:

- Sistema de indicadores com metadados (definition, context, data_type, etc.)
- Campo `standard_id` que pode ser usado para códigos LOINC
- Estrutura flexível de categorias e subcategorias
- Sistema de tipos de dados dinâmicos
- Tabelas: `indicators`, `metadata_contexts`, `metadata_data_types`

### ⚠️ O que falta:

- Mapeamento direto para códigos LOINC
- Estrutura dos 6 componentes LOINC
- Validação de códigos LOINC
- Sistema de busca por códigos
- Base de dados LOINC oficial

## 🗄️ Modificações Necessárias no Banco de Dados

### 1. Adicionar Campos LOINC à Tabela `indicators`

```sql
-- Campos específicos do LOINC
ALTER TABLE indicators ADD COLUMN IF NOT EXISTS loinc_code VARCHAR(10); -- Ex: "33747-0"
ALTER TABLE indicators ADD COLUMN IF NOT EXISTS loinc_long_name TEXT; -- Nome completo LOINC
ALTER TABLE indicators ADD COLUMN IF NOT EXISTS loinc_display_name TEXT; -- Nome de exibição
ALTER TABLE indicators ADD COLUMN IF NOT EXISTS loinc_component TEXT; -- Ex: "Hemoglobin"
ALTER TABLE indicators ADD COLUMN IF NOT EXISTS loinc_property TEXT; -- Ex: "MCnc" (Mass concentration)
ALTER TABLE indicators ADD COLUMN IF NOT EXISTS loinc_time_aspect TEXT; -- Ex: "Pt" (Point in time)
ALTER TABLE indicators ADD COLUMN IF NOT EXISTS loinc_system TEXT; -- Ex: "Bld" (Blood)
ALTER TABLE indicators ADD COLUMN IF NOT EXISTS loinc_scale_type TEXT; -- Ex: "Qn" (Quantitative)
ALTER TABLE indicators ADD COLUMN IF NOT EXISTS loinc_method_type TEXT; -- Ex: "High performance liquid chromatography"
ALTER TABLE indicators ADD COLUMN IF NOT EXISTS is_loinc_mapped BOOLEAN DEFAULT false;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_indicators_loinc_code ON indicators(loinc_code);
CREATE INDEX IF NOT EXISTS idx_indicators_loinc_mapped ON indicators(is_loinc_mapped);
```

### 2. Criar Tabela de Códigos LOINC (Base de Dados LOINC)

```sql
CREATE TABLE loinc_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  loinc_num VARCHAR(10) NOT NULL UNIQUE, -- Código LOINC completo
  component TEXT NOT NULL,
  property TEXT NOT NULL,
  time_aspect TEXT NOT NULL,
  system TEXT NOT NULL,
  scale_type TEXT NOT NULL,
  method_type TEXT,
  long_common_name TEXT NOT NULL,
  short_name TEXT,
  display_name TEXT,
  status TEXT DEFAULT 'ACTIVE', -- ACTIVE, DEPRECATED, etc.
  version_first_released TEXT,
  version_last_changed TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para busca
CREATE INDEX idx_loinc_codes_num ON loinc_codes(loinc_num);
CREATE INDEX idx_loinc_codes_component ON loinc_codes(component);
CREATE INDEX idx_loinc_codes_long_name ON loinc_codes(long_common_name);
CREATE INDEX idx_loinc_codes_status ON loinc_codes(status);
```

### 3. Tabela de Mapeamento (Histórico)

```sql
CREATE TABLE loinc_mappings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  indicator_id UUID REFERENCES indicators(id) ON DELETE CASCADE,
  loinc_code VARCHAR(10) NOT NULL,
  mapping_confidence DECIMAL(3,2), -- 0.00 a 1.00
  mapped_by UUID REFERENCES users(id),
  mapping_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 💻 Modificações no Código (TypeScript/React)

### 1. Atualizar Interfaces

```typescript
// Adicionar ao indicator-types.ts
export interface LoincMapping {
  loincCode?: string;
  loincLongName?: string;
  loincDisplayName?: string;
  component?: string;
  property?: string;
  timeAspect?: string;
  system?: string;
  scaleType?: string;
  methodType?: string;
  isLoincMapped?: boolean;
}

export interface LoincCode {
  id: string;
  loincNum: string;
  component: string;
  property: string;
  timeAspect: string;
  system: string;
  scaleType: string;
  methodType?: string;
  longCommonName: string;
  shortName?: string;
  displayName?: string;
  status: "ACTIVE" | "DEPRECATED" | "DISCOURAGED";
  versionFirstReleased?: string;
  versionLastChanged?: string;
}

export interface Indicator extends LoincMapping {
  // ... campos existentes
}
```

### 2. API para Códigos LOINC

```typescript
// Criar loinc-api.ts
class LoincAPI {
  async searchLoincCodes(searchTerm: string): Promise<LoincCode[]> {
    // Busca em component, long_common_name, display_name
  }

  async getLoincByCode(code: string): Promise<LoincCode | null> {
    // Busca por código específico
  }

  async mapIndicatorToLoinc(
    indicatorId: string,
    loincCode: string,
    confidence: number,
  ): Promise<void> {
    // Associa indicador a código LOINC
  }

  async validateLoincCode(code: string): Promise<boolean> {
    // Valida formato e dígito verificador
  }

  async getUnmappedIndicators(): Promise<Indicator[]> {
    // Lista indicadores sem mapeamento LOINC
  }

  async getMappingStatistics(): Promise<MappingStats> {
    // Estatísticas de mapeamento
  }
}
```

### 3. Validador de Códigos LOINC

```typescript
// Validador de códigos LOINC
export function validateLoincCode(code: string): boolean {
  // Verificar formato: 1-7 dígitos + hífen + dígito verificador
  const pattern = /^\d{1,7}-\d$/;
  if (!pattern.test(code)) return false;

  return validateCheckDigit(code);
}

function validateCheckDigit(code: string): boolean {
  const [mainPart, checkDigit] = code.split("-");
  // Algoritmo de validação do dígito verificador LOINC
  // ... implementação específica
  return true; // simplificado
}
```

## 🖥️ Modificações na Interface

### 1. Adicionar Campos LOINC ao Formulário de Indicadores

- Campo de busca de códigos LOINC com autocomplete
- Seletor de códigos LOINC com preview dos 6 componentes
- Exibição visual dos componentes LOINC selecionados
- Validação em tempo real de códigos LOINC

### 2. Nova Tela: "Mapeamento LOINC"

- Lista de indicadores não mapeados
- Interface de busca avançada por componentes LOINC
- Ferramenta de mapeamento em lote
- Relatório de progresso de mapeamento

### 3. Dashboard de Conformidade LOINC

- Porcentagem de indicadores mapeados
- Gráficos de progresso
- Lista de pendências
- Exportação de relatórios

## 🔄 Integração com Base de Dados LOINC

### 1. Download da Base LOINC

```bash
# Scripts de importação
npm run loinc:download  # Baixa arquivos oficiais do LOINC.org
npm run loinc:import    # Importa para tabela loinc_codes
npm run loinc:update    # Atualização incremental
```

### 2. Sistema de Busca

- Busca por texto livre em todos os campos
- Filtros por componente, propriedade, sistema
- Busca fonética para nomes similares
- Ranking por relevância

### 3. Atualização Regular

- Job automático para verificar atualizações (bi-anual)
- Notificação de novas versões LOINC
- Processo de migração de códigos depreciados

## 📊 Funcionalidades Adicionais

### 1. Relatórios de Conformidade

- **Relatório de Mapeamento**:

  - Total de indicadores: X
  - Mapeados: Y (Z%)
  - Pendentes: A
  - Com conflitos: B

- **Relatório de Qualidade**:
  - Códigos LOINC inválidos
  - Mapeamentos duplicados
  - Códigos depreciados em uso

### 2. Ferramentas de Mapeamento

- **Sugestão Automática**: IA para sugerir códigos baseado no nome
- **Mapeamento em Lote**: Para categorias similares
- **Validação Cruzada**: Verificação de consistência

### 3. Exportação e Interoperabilidade

- Exportação em formato HL7 FHIR
- Integração com sistemas HL7
- API RESTful para códigos LOINC

## 🚀 Estratégia de Migração

### Fase 1: Preparação (1 semana)

- [ ] Criar campos LOINC na tabela indicators
- [ ] Criar tabela loinc_codes
- [ ] Implementar validador de códigos
- [ ] Criar interfaces TypeScript

### Fase 2: Base de Dados (2 semanas)

- [ ] Baixar e importar base LOINC oficial
- [ ] Implementar sistema de busca
- [ ] Criar APIs básicas
- [ ] Testes de performance

### Fase 3: Interface (2 semanas)

- [ ] Adicionar campos LOINC ao formulário
- [ ] Criar interface de busca
- [ ] Implementar mapeamento manual
- [ ] Dashboard de progresso

### Fase 4: Mapeamento (2-3 semanas)

- [ ] Análise manual dos indicadores existentes
- [ ] Mapeamento dos indicadores mais comuns
- [ ] Validação dos mapeamentos
- [ ] Documentação dos mapeamentos

### Fase 5: Automação (1 semana)

- [ ] Sistema de sugestões automáticas
- [ ] Ferramentas de mapeamento em lote
- [ ] Processo de atualização automática

### Fase 6: Compliance (1 semana)

- [ ] Relatórios de conformidade
- [ ] Exportação HL7/FHIR
- [ ] Testes de interoperabilidade
- [ ] Documentação final

## 📈 Benefícios Esperados

### Técnicos

- ✅ **Interoperabilidade** com outros sistemas de saúde
- ✅ **Padronização internacional** dos dados médicos
- ✅ **Facilita integração** com sistemas HL7/FHIR
- ✅ **Melhora qualidade** dos dados clínicos

### Negócio

- ✅ **Compliance** com regulamentações internacionais
- ✅ **Facilita certificações** médicas
- ✅ **Melhora confiabilidade** do sistema
- ✅ **Abre possibilidades** de integração com grandes sistemas

### Usuário

- ✅ **Dados mais consistentes** entre sistemas
- ✅ **Facilita transferência** de pacientes
- ✅ **Melhora comunicação** entre profissionais
- ✅ **Reduz erros** de interpretação

## ⏱️ Cronograma Estimado

| Fase       | Duração     | Descrição                                  | Prioridade |
| ---------- | ----------- | ------------------------------------------ | ---------- |
| **Fase 1** | 1 semana    | Modificações no banco e estruturas básicas | Alta       |
| **Fase 2** | 2 semanas   | APIs e base de dados LOINC                 | Alta       |
| **Fase 3** | 2 semanas   | Interface de busca e mapeamento            | Média      |
| **Fase 4** | 2-3 semanas | Mapeamento dos indicadores existentes      | Média      |
| **Fase 5** | 1 semana    | Automação e ferramentas avançadas          | Baixa      |
| **Fase 6** | 1 semana    | Testes, compliance e documentação          | Alta       |

**Total estimado: 9-10 semanas**

## 🔧 Considerações Técnicas

### Performance

- Índices apropriados nas tabelas LOINC
- Cache de buscas frequentes
- Paginação para listas grandes
- Busca assíncrona com debounce

### Segurança

- Validação rigorosa de códigos LOINC
- Auditoria de mapeamentos
- Backup da base LOINC
- Controle de acesso às funcionalidades

### Manutenção

- Processo automatizado de atualização
- Monitoramento de códigos depreciados
- Logs detalhados de mapeamentos
- Documentação para novos desenvolvedores

## 📚 Recursos e Referências

### Documentação Oficial

- [LOINC.org](https://loinc.org/) - Site oficial
- [LOINC User Guide](https://loinc.org/kb/users-guide/) - Guia do usuário
- [LOINC Database](https://loinc.org/downloads/) - Downloads oficiais

### Padrões de Interoperabilidade

- [HL7 FHIR](https://www.hl7.org/fhir/) - Padrão de interoperabilidade
- [FHIR Observation](https://www.hl7.org/fhir/observation.html) - Recurso de observação

### Ferramentas

- [LOINC Search](https://search.loinc.org/) - Ferramenta de busca oficial
- [RELMA](https://loinc.org/relma/) - Ferramenta de mapeamento oficial

---

**Status**: 📋 Documentado - Aguardando implementação  
**Última atualização**: 2025-01-17  
**Responsável**: Equipe de Desenvolvimento
