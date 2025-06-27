-- Script para atualizar categorias e subcategorias dos indicadores
-- Demonstrando oscilações clínicas por sistemas médicos

-- =====================================================
-- SISTEMA CARDIOVASCULAR
-- =====================================================

-- Pressão Arterial Sistólica
UPDATE patient_indicator_values
SET category_name = 'Sistema Cardiovascular', subcategory_name = 'Pressão Arterial'
WHERE indicator_id = 'pressao-arterial-sistolica';

-- Pressão Arterial Diastólica
UPDATE patient_indicator_values
SET category_name = 'Sistema Cardiovascular', subcategory_name = 'Pressão Arterial'
WHERE indicator_id = 'pressao-arterial-diastolica';

-- Frequência Cardíaca
UPDATE patient_indicator_values
SET category_name = 'Sistema Cardiovascular', subcategory_name = 'Frequência Cardíaca'
WHERE indicator_id = 'frequencia-cardiaca';

-- Frequência Cardíaca de Repouso
UPDATE patient_indicator_values
SET category_name = 'Sistema Cardiovascular', subcategory_name = 'Frequência Cardíaca'
WHERE indicator_id = 'frequencia-cardiaca-repouso';

-- Colesterol Total
UPDATE patient_indicator_values
SET category_name = 'Sistema Cardiovascular', subcategory_name = 'Lipidograma'
WHERE indicator_id = 'colesterol-total';

-- HDL Colesterol
UPDATE patient_indicator_values
SET category_name = 'Sistema Cardiovascular', subcategory_name = 'Lipidograma'
WHERE indicator_id = 'colesterol-hdl';

-- LDL Colesterol
UPDATE patient_indicator_values
SET category_name = 'Sistema Cardiovascular', subcategory_name = 'Lipidograma'
WHERE indicator_id = 'colesterol-ldl';

-- Triglicérides
UPDATE patient_indicator_values
SET category_name = 'Sistema Cardiovascular', subcategory_name = 'Lipidograma'
WHERE indicator_id = 'triglicerides';

-- Troponina
UPDATE patient_indicator_values
SET category_name = 'Sistema Cardiovascular', subcategory_name = 'Marcadores Cardíacos'
WHERE indicator_id = 'troponina';

-- =====================================================
-- SISTEMA ENDÓCRINO E METABÓLICO
-- =====================================================

-- Glicemia de Jejum
UPDATE patient_indicator_values
SET category_name = 'Sistema Endócrino', subcategory_name = 'Controle Glicêmico'
WHERE indicator_id = 'glicemia-jejum';

-- Hemoglobina Glicada (HbA1c)
UPDATE patient_indicator_values
SET category_name = 'Sistema Endócrino', subcategory_name = 'Controle Glicêmico'
WHERE indicator_id = 'hba1c';

-- Teste de Tolerância à Glicose
UPDATE patient_indicator_values
SET category_name = 'Sistema Endócrino', subcategory_name = 'Testes Funcionais'
WHERE indicator_id = 'teste-tolerancia-glicose';

-- Vitamina D
UPDATE patient_indicator_values
SET category_name = 'Sistema Endócrino', subcategory_name = 'Vitaminas e Hormônios'
WHERE indicator_id = 'vitamina-d';

-- =====================================================
-- ANTROPOMETRIA E COMPOSIÇÃO CORPORAL
-- =====================================================

-- Peso Corporal
UPDATE patient_indicator_values
SET category_name = 'Antropometria', subcategory_name = 'Peso e Massa Corporal'
WHERE indicator_id = 'peso';

-- Índice de Massa Corporal
UPDATE patient_indicator_values
SET category_name = 'Antropometria', subcategory_name = 'Índices Corporais'
WHERE indicator_id = 'imc';

-- Circunferência Abdominal
UPDATE patient_indicator_values
SET category_name = 'Antropometria', subcategory_name = 'Medidas Corporais'
WHERE indicator_id = 'circunferencia-abdominal';

-- Percentual de Gordura
UPDATE patient_indicator_values
SET category_name = 'Antropometria', subcategory_name = 'Composição Corporal'
WHERE indicator_id = 'percentual-gordura';

-- =====================================================
-- SISTEMA RESPIRATÓRIO
-- =====================================================

-- Peak Flow (Pico de Fluxo Expiratório)
UPDATE patient_indicator_values
SET category_name = 'Sistema Respiratório', subcategory_name = 'Função Pulmonar'
WHERE indicator_id = 'peak-flow';

-- Saturação de Oxigênio
UPDATE patient_indicator_values
SET category_name = 'Sistema Respiratório', subcategory_name = 'Oxigenação Sanguínea'
WHERE indicator_id = 'saturacao-oxigenio';

-- Uso de Broncodilatador
UPDATE patient_indicator_values
SET category_name = 'Sistema Respiratório', subcategory_name = 'Controle Medicamentoso'
WHERE indicator_id = 'uso-broncodilatador';

-- =====================================================
-- SISTEMA HEMATOLÓGICO
-- =====================================================

-- Hemoglobina
UPDATE patient_indicator_values
SET category_name = 'Sistema Hematológico', subcategory_name = 'Hemograma Básico'
WHERE indicator_id = 'hemoglobina';

-- Ferritina
UPDATE patient_indicator_values
SET category_name = 'Sistema Hematológico', subcategory_name = 'Metabolismo do Ferro'
WHERE indicator_id = 'ferritina';

-- =====================================================
-- SISTEMA IMUNOLÓGICO E INFLAMATÓRIO
-- =====================================================

-- Proteína C Reativa (PCR)
UPDATE patient_indicator_values
SET category_name = 'Sistema Imunológico', subcategory_name = 'Marcadores Inflamatórios'
WHERE indicator_id = 'pcr';

-- IgE Total
UPDATE patient_indicator_values
SET category_name = 'Sistema Imunológico', subcategory_name = 'Perfil Alérgico'
WHERE indicator_id = 'ige-total';

-- =====================================================
-- REUMATOLOGIA E ARTICULAÇ��ES
-- =====================================================

-- Escala Visual Analógica de Dor (VAS)
UPDATE patient_indicator_values
SET category_name = 'Reumatologia', subcategory_name = 'Avaliação da Dor'
WHERE indicator_id = 'vas-dor';

-- Rigidez Matinal
UPDATE patient_indicator_values
SET category_name = 'Reumatologia', subcategory_name = 'Sintomas Articulares'
WHERE indicator_id = 'rigidez-matinal';

-- =====================================================
-- SISTEMA RENAL E URINÁRIO
-- =====================================================

-- Creatinina Sérica
UPDATE patient_indicator_values
SET category_name = 'Sistema Renal', subcategory_name = 'Função Renal'
WHERE indicator_id = 'creatinina';

-- =====================================================
-- PERFORMANCE FÍSICA E ESPORTIVA
-- =====================================================

-- VO2 Máximo
UPDATE patient_indicator_values
SET category_name = 'Performance Física', subcategory_name = 'Capacidade Aeróbica'
WHERE indicator_id = 'vo2-max';

-- Lactato Sanguíneo
UPDATE patient_indicator_values
SET category_name = 'Performance Física', subcategory_name = 'Metabolismo Anaeróbico'
WHERE indicator_id = 'lactato';

-- =====================================================
-- SISTEMA MUSCULAR
-- =====================================================

-- Creatina Quinase (CK)
UPDATE patient_indicator_values
SET category_name = 'Sistema Muscular', subcategory_name = 'Enzimas Musculares'
WHERE indicator_id = 'creatina-quinase';

-- =====================================================
-- GINECOLOGIA E OBSTETRÍCIA
-- =====================================================

-- Altura Uterina
UPDATE patient_indicator_values
SET category_name = 'Ginecologia/Obstetrícia', subcategory_name = 'Acompanhamento Gestacional'
WHERE indicator_id = 'altura-uterina';

-- =====================================================
-- VERIFICAR RESULTADOS
-- =====================================================

-- Verificar quantos indicadores foram atualizados por categoria
SELECT
    category,
    subcategory,
    COUNT(*) as total_indicadores
FROM patient_indicator_values
WHERE patient_id IN (
    SELECT id FROM patients
    WHERE doctor_id = '94e784dd-797a-4962-81ae-825e7060352e'
)
GROUP BY category, subcategory
ORDER BY category, subcategory;

-- Verificar exemplos de oscilações por categoria
SELECT
    p.name as paciente,
    piv.category,
    piv.subcategory,
    piv.indicator_id,
    piv.value,
    piv.created_at
FROM patients p
JOIN patient_indicator_values piv ON p.id = piv.patient_id
WHERE p.doctor_id = '94e784dd-797a-4962-81ae-825e7060352e'
  AND piv.category IS NOT NULL
ORDER BY piv.category, piv.subcategory, p.name, piv.created_at
LIMIT 50;

-- Mostrar evolução temporal de um indicador específico (exemplo: pressão arterial)
SELECT
    p.name as paciente,
    piv.category,
    piv.subcategory,
    piv.indicator_id,
    piv.value,
    piv.created_at,
    LAG(piv.value::numeric) OVER (
        PARTITION BY piv.patient_id, piv.indicator_id
        ORDER BY piv.created_at
    ) as valor_anterior,
    (piv.value::numeric - LAG(piv.value::numeric) OVER (
        PARTITION BY piv.patient_id, piv.indicator_id
        ORDER BY piv.created_at
    )) as variacao
FROM patients p
JOIN patient_indicator_values piv ON p.id = piv.patient_id
WHERE p.doctor_id = '94e784dd-797a-4962-81ae-825e7060352e'
  AND piv.indicator_id = 'pressao-arterial-sistolica'
  AND piv.value ~ '^[0-9]+\.?[0-9]*$'  -- Apenas valores numéricos
ORDER BY p.name, piv.created_at;

-- Categorias e subcategorias atualizadas com sucesso!
-- Total de sistemas médicos organizados: 11
-- Demonstrando oscilações clínicas por especialidade médica
