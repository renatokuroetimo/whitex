import React from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const TermsOfService = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-brand-primary text-white p-4 flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="text-white hover:bg-white/20 p-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">Termos de Uso</h1>
      </div>

      {/* Content */}
      <div className="p-6 max-w-4xl mx-auto">
        <div className="prose prose-sm max-w-none">
          <h1 className="text-2xl font-bold text-brand-primary mb-6">Termos de Uso - WhiteX</h1>
          
          <h2 className="text-lg font-semibold text-brand-primary mt-6 mb-3">1. Informações da Empresa</h2>
          <p>Razão Social: Timo Soluções Web e Mobile LTDA</p>
          <p>CNPJ: 17.902.232/0001-38</p>

          <h2 className="text-lg font-semibold text-brand-primary mt-6 mb-3">2. Escopo do Serviço</h2>
          <p>O WhiteX é uma plataforma digital voltada para o acompanhamento de indicadores clínicos e informações de saúde, disponível nas versões Web, iOS e Android.</p>
          <p>A versão Web oferece acesso para médicos e pacientes. Os aplicativos móveis (iOS e Android) são destinados exclusivamente aos pacientes.</p>

          <h2 className="text-lg font-semibold text-brand-primary mt-6 mb-3">3. Funcionalidades e Perfis de Usuário</h2>
          <p>Médicos cadastrados mediante verificação de CRM podem registrar diagnósticos e indicadores clínicos.</p>
          <p>Pacientes podem inserir dados de saúde e optar por compartilhá-los com médicos de sua confiança.</p>
          <p>Não há funcionalidades de comunicação direta entre pacientes e médicos na plataforma.</p>

          <h2 className="text-lg font-semibold text-brand-primary mt-6 mb-3">4. Dados Pessoais e Proteção de Dados</h2>
          <p>O WhiteX armazena dados pessoais e sensíveis de saúde de acordo com a Lei Geral de Proteção de Dados (LGPD - Lei 13.709/18).</p>
          <p>Esses dados são criptografados e armazenados com segurança nos servidores da AWS e Supabase, ambos em conformidade com padrões internacionais de proteção de dados.</p>
          <p>O usuário poderá, a qualquer momento, solicitar a exclusão de sua conta e dados, conforme previsto por lei.</p>

          <h2 className="text-lg font-semibold text-brand-primary mt-6 mb-3">5. Inteligência Artificial e Limitações</h2>
          <p>A plataforma utiliza inteligência artificial para auxiliar na organização e análise de dados clínicos. Essa funcionalidade não substitui o diagnóstico presencial ou a consulta médica formal.</p>
          <p>A Timo Soluções Web e Mobile LTDA não se responsabiliza por decisões clínicas tomadas exclusivamente com base nos dados ou sugestões geradas pela IA.</p>

          <h2 className="text-lg font-semibold text-brand-primary mt-6 mb-3">6. Compartilhamento e Consentimento</h2>
          <p>O compartilhamento de dados com médicos se dá única e exclusivamente por iniciativa do paciente, mediante consentimento ativo.</p>
          <p>A plataforma poderá futuramente integrar-se com parceiros comerciais ou operadoras de saúde, com aviso prévio e aceite explícito do usuário.</p>

          <h2 className="text-lg font-semibold text-brand-primary mt-6 mb-3">7. Condições de Uso</h2>
          <p>O sistema é gratuito até segunda ordem. Futuras versões poderão incluir planos pagos mediante comunicação prévia aos usuários.</p>
          <p>É proibido o uso do WhiteX para fins ilícitos, falsificação de dados, envio de conteúdo ofensivo, racista, discriminatório ou que infrinja direitos de terceiros.</p>
          <p>O não cumprimento destas regras poderá resultar na suspensão imediata da conta e em responsabilização civil e penal.</p>

          <h2 className="text-lg font-semibold text-brand-primary mt-6 mb-3">8. Limitação de Responsabilidade</h2>
          <p>O WhiteX não realiza diagnóstico médico e não substitui o atendimento clínico presencial.</p>
          <p>A responsabilidade da Timo Soluções Web e Mobile LTDA limita-se à disponibilização da plataforma tecnológica conforme descrita nestes termos.</p>
          <p>A empresa não se responsabiliza por indisponibilidades momentâneas do serviço causadas por fatores externos como quedas de energia, ataques cibernéticos, falhas de terceiros ou problemas técnicos fora do seu controle.</p>

          <h2 className="text-lg font-semibold text-brand-primary mt-6 mb-3">9. Suporte Técnico e SLA</h2>
          <p>Nos casos de falhas críticas, a equipe de suporte da WhiteX se compromete a atuar na correção em até 2 (dois) dias úteis após a notificação do problema.</p>

          <h2 className="text-lg font-semibold text-brand-primary mt-6 mb-3">10. Propriedade Intelectual</h2>
          <p>Todos os direitos sobre o código-fonte, marca, logotipo, layout, funcionalidades e demais elementos do sistema WhiteX pertencem exclusivamente à Timo Soluções Web e Mobile LTDA.</p>
          <p>É expressamente proibido copiar, reproduzir, distribuir, modificar ou explorar comercialmente, no todo ou em parte, qualquer conteúdo da plataforma sem autorização prévia por escrito.</p>

          <h2 className="text-lg font-semibold text-brand-primary mt-6 mb-3">11. Disposições Gerais</h2>
          <p>O uso da plataforma implica aceitação total dos presentes Termos de Uso.</p>
          <p>A Timo Soluções Web e Mobile LTDA reserva-se o direito de alterar estes termos a qualquer momento, mediante aviso na própria plataforma.</p>
          <p>Caso alguma cláusula seja considerada inválida ou inexequível, as demais disposições permanecerão em pleno vigor.</p>

          <h2 className="text-lg font-semibold text-brand-primary mt-6 mb-3">Política de Privacidade (Integrada)</h2>
          <p>Coletamos apenas os dados essenciais para o funcionamento da plataforma e a segurança do usuário.</p>
          <p>Nenhum dado é vendido ou cedido sem o devido consentimento.</p>
          <p>Utilizamos criptografia, backups automáticos e práticas modernas de segurança da informação para proteger os dados dos usuários.</p>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
