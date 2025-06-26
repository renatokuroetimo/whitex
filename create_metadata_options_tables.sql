-- Script para criar tabelas de opções de metadados
-- Execute este script no SQL Editor do Supabase Dashboard

-- Tabela para contextos de metadados
CREATE TABLE IF NOT EXISTS public.metadata_contexts (
  id text NOT NULL PRIMARY KEY DEFAULT (gen_random_uuid())::text,
  name text NOT NULL UNIQUE,
  description text,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Tabela para tipos de dados de metadados
CREATE TABLE IF NOT EXISTS public.metadata_data_types (
  id text NOT NULL PRIMARY KEY DEFAULT (gen_random_uuid())::text,
  name text NOT NULL UNIQUE,
  value text NOT NULL UNIQUE, -- valor usado no código (ex: 'numero', 'texto')
  description text,
  input_type text NOT NULL DEFAULT 'text', -- tipo de input HTML (ex: 'number', 'text', 'email')
  validation_rules jsonb, -- regras de validação específicas
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Inserir contextos padrão
INSERT INTO public.metadata_contexts (name, description, display_order) VALUES
('Autoria', 'Contexto relacionado à autoria e criação', 1),
('Paciente', 'Contexto relacionado ao paciente', 2),
('Clínico', 'Contexto relacionado ao ambiente clínico', 3),
('Administrativo', 'Contexto administrativo e de gestão', 4),
('Técnico', 'Contexto técnico e de sistema', 5),
('Temporal', 'Contexto relacionado a tempo e cronologia', 6)
ON CONFLICT (name) DO NOTHING;

-- Inserir tipos de dados padrão
INSERT INTO public.metadata_data_types (name, value, description, input_type, validation_rules, display_order) VALUES
('Texto', 'texto', 'Campo de texto livre', 'text', '{"minLength": 0, "maxLength": 1000}', 1),
('Número', 'numero', 'Valor numérico', 'number', '{"type": "number", "step": "any"}', 2),
('Data', 'data', 'Data (DD/MM/AAAA)', 'date', '{"type": "date"}', 3),
('Data e Hora', 'data_hora', 'Data e hora completas', 'datetime-local', '{"type": "datetime-local"}', 4),
('Booleano', 'booleano', 'Valor verdadeiro/falso ou sim/não', 'select', '{"options": ["sim", "não", "true", "false"]}', 5),
('Lista', 'lista', 'Lista de valores separados por vírgula', 'text', '{"type": "list", "separator": ","}', 6),
('URL', 'url', 'Endereço web válido', 'url', '{"type": "url", "pattern": "https?://.+"}', 7),
('Email', 'email', 'Endereço de email válido', 'email', '{"type": "email", "pattern": "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$"}', 8)
ON CONFLICT (value) DO NOTHING;

-- Adicionar índices para performance
CREATE INDEX IF NOT EXISTS idx_metadata_contexts_active ON public.metadata_contexts(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_metadata_contexts_name ON public.metadata_contexts(name);
CREATE INDEX IF NOT EXISTS idx_metadata_data_types_active ON public.metadata_data_types(is_active, display_order);
CREATE INDEX IF NOT EXISTS idx_metadata_data_types_value ON public.metadata_data_types(value);

-- Adicionar comentários para documentação
COMMENT ON TABLE public.metadata_contexts IS 'Contextos disponíveis para metadados de indicadores';
COMMENT ON TABLE public.metadata_data_types IS 'Tipos de dados disponíveis para metadados de indicadores';

COMMENT ON COLUMN public.metadata_contexts.name IS 'Nome do contexto exibido na interface';
COMMENT ON COLUMN public.metadata_contexts.description IS 'Descrição do contexto';
COMMENT ON COLUMN public.metadata_contexts.is_active IS 'Se o contexto está ativo/disponível';
COMMENT ON COLUMN public.metadata_contexts.display_order IS 'Ordem de exibição na interface';

COMMENT ON COLUMN public.metadata_data_types.name IS 'Nome do tipo exibido na interface';
COMMENT ON COLUMN public.metadata_data_types.value IS 'Valor usado no código e banco de dados';
COMMENT ON COLUMN public.metadata_data_types.input_type IS 'Tipo de input HTML correspondente';
COMMENT ON COLUMN public.metadata_data_types.validation_rules IS 'Regras de validação em formato JSON';

-- Verificar se as tabelas foram criadas com sucesso
SELECT 'metadata_contexts' as table_name, count(*) as records FROM public.metadata_contexts
UNION ALL
SELECT 'metadata_data_types' as table_name, count(*) as records FROM public.metadata_data_types;
