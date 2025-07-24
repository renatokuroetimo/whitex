import React from "react";
import { FormattedChatGPTText } from "@/lib/markdown-formatter";

const testText = `# Resultado do Diagnóstico Médico

## Análise dos Dados do Paciente

Com base nos indicadores analisados durante o período de monitoramento, posso observar os seguintes padrões:

### Principais Observações:

1. **Tendência de Aumento de Peso**: O paciente apresentou ganho de peso progressivo nos últimos 3 meses, com *variação* de aproximadamente 5kg
2. **Pressão Arterial**: Valores consistentemente elevados, especialmente no período matutino
3. **Glicemia**: Oscilações significativas foram detectadas, com picos após as refeições
4. **Frequência Cardíaca**: Padrão *irregular* durante exercícios físicos

### Recomendações Médicas:

- Monitoramento **contínuo** da pressão arterial (3x ao dia)
- Ajuste na medicação conforme protocolo estabelecido
- Acompanhamento nutricional especializado com \`dieta hipossódica\`
- Exercícios físicos moderados sob supervisão
- Controle glicêmico rigoroso

#### Parâmetros de Referência:

\`\`\`
Pressão Arterial Normal:
- Sistólica: < 120 mmHg
- Diastólica: < 80 mmHg

Glicemia de Jejum:
- Normal: 70-99 mg/dL
- Pré-diabetes: 100-125 mg/dL
\`\`\`

### Próximas Consultas:

- **Cardiologia**: Em 15 dias
- **Endocrinologia**: Em 30 dias
- **Nutrição**: Semanal por 1 mês

**Observação importante**: Este diagnóstico deve ser \`validado\` por um médico especialista. Não interrompa medicações sem orientação médica.

*Consulte sempre um profissional de saúde qualificado para esclarecimentos adicionais.*`;

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
