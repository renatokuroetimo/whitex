import React from 'react';
import { FormattedChatGPTText } from '@/lib/markdown-formatter';

const testText = `# Resultado do Diagnóstico

## Análise dos Dados

Com base nos indicadores analisados, posso observar:

### Principais Observações:

1. **Tendência de Aumento de Peso**: O paciente apresentou ganho de peso progressivo nos últimos meses
2. **Pressão Arterial**: Valores consistentemente elevados
3. **Glicemia**: Oscilações significativas foram detectadas

### Recomendações:

- Monitoramento *contínuo* da pressão arterial
- Ajuste na medicação conforme protocolo
- Acompanhamento nutricional especializado

#### Código de Exemplo:

\`\`\`
// Exemplo de monitoramento
const pressao = {
  sistolica: 140,
  diastolica: 90
};
\`\`\`

**Observação importante**: Este diagnóstico deve ser \`validado\` por um médico especialista.

*Consulte sempre um profissional de saúde qualificado.*`;

export function MarkdownTest() {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <h2 className="text-2xl font-bold mb-4">Teste de Formatação Markdown</h2>
      <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
        <FormattedChatGPTText text={testText} />
      </div>
    </div>
  );
}
