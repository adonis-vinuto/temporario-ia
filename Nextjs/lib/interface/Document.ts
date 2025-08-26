import { AgentType } from "../enums/agentType";

export const documentosComerciais = [
  {
    titulo: "Política Comercial",
    descricao: "Descreve produtos, serviços, preços e condições contratuais.",
    tooltip:
      "Essencial para agentes de Vendas explicarem os modelos comerciais.",
    agent_type: AgentType.Sales,
  },
  {
    titulo: "Termos e Condições de Venda",
    descricao: "Define cláusulas contratuais, penalidades e responsabilidades.",
    tooltip: "Garante clareza jurídica nas propostas comerciais.",
    agent_type: AgentType.Sales,
  },

  {
    titulo: "Procedimentos Internos e Fluxos Comerciais",
    descricao: "Guia os processos de venda, ativação e upgrade.",
    tooltip: "Facilita a operação dos agentes comerciais e administrativos.",
    agent_type: AgentType.Sales,
  },
];

export const documentosSuporte = [
  {
    titulo: "Políticas de Suporte e Atendimento",
    descricao: "Define canais, escopo e níveis de suporte (N1 a N3).",
    tooltip: "Base para times de suporte estruturarem o atendimento técnico.",
    agent_type: AgentType.Support,
  },
  {
    titulo: "Diretrizes de Integração",
    descricao: "Explica como integrar sistemas via API e Webservice.",
    tooltip: "Útil para suporte técnico resolver problemas com integrações.",
    agent_type: AgentType.Support,
  },
  {
    titulo: "Modelos de Contrato ou SLA",
    descricao: "Define prazos de atendimento, escopo e obrigações.",
    tooltip: "Ajuda o suporte a alinhar expectativas com o cliente.",
    agent_type: AgentType.Support,
  },
  {
    titulo: "Manuais Técnicos ou Catálogo de Funcionalidades",
    descricao: "Lista funcionalidades e pré-requisitos das soluções.",
    tooltip: "Essencial para o suporte e implantação entenderem os produtos.",
    agent_type: AgentType.Support,
  },
];

export const documentosRH = [
  {
    titulo: "Documentos de Treinamento e Capacitação",
    descricao: "Catálogo de cursos e políticas de uso das plataformas.",
    tooltip: "Base para agentes de RH estruturarem programas de capacitação.",
    agent_type: AgentType.RH,
  },
  {
    titulo: "Políticas e Normas Internas",
    descricao: "Manual do Colaborador, Políticas de Recursos Humanos",
    tooltip:
      "Fornece à IA conhecimento sobre o funcionamento geral da empresa para orientar novos colaboradores. Essencial para que a IA responda dúvidas sobre condutas, direitos e deveres dos colaboradores",
    agent_type: AgentType.RH,
  },
  {
    titulo: "Processos e Fluxos de RH",
    descricao: "Mapas de Processo (BPMN, fluxogramas), Checklists Operacionais",
    tooltip:
      "Permite à IA orientar corretamente sobre procedimentos internos. Garante que a IA possa validar se todos os passos foram seguidos em determinado processo.",
    agent_type: AgentType.RH,
  },
  {
    titulo: "Modelos e Documentos Padrão",
    descricao:
      "Modelos de Documentos e Formulários, Templates de Comunicação Interna",
    tooltip:
      "A IA pode auxiliar na geração ou localização de documentos utilizados rotineiramente pelo RH. Permite à IA ajudar na criação de comunicados, e-mails, convites para eventos etc.",
    agent_type: AgentType.RH,
  },
  {
    titulo: "FAQs e Histórico de Atendimento",
    descricao:
      "Banco de Perguntas Frequentes (FAQ), Logs ou registros de atendimentos anteriores",
    tooltip:
      "Acelera a preparação da IA para responder dúvidas comuns de forma assertiva. Ajuda a IA a identificar padrões e melhorar a relevância das respostas.",
    agent_type: AgentType.RH,
  },
  {
    titulo: "Calendário Corporativo e Eventos de RH",
    descricao: "Calendário de Eventos Internos",
    tooltip: "A IA pode informar colaboradores sobre datas importantes.",
    agent_type: AgentType.RH,
  },
];

export const documentosFinance = [
  {
    titulo: "Tabela de Preços Oficial",
    descricao: "Lista valores de serviços e licenças, com pacotes e descontos.",
    tooltip: "Permite ao time financeiro estruturar orçamentos com precisão.",
    agent_type: AgentType.Finance,
  },
];
