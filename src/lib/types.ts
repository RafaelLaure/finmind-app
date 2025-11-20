export interface OnboardingData {
  renda: number;
  gastos: number;
  dividas: number;
  objetivo: string;
  guardaMes: number;
  dificuldade: string;
  prazo: string;
}

export interface Diagnostico {
  situacao_atual: string;
  pontos_fortes: string[];
  pontos_fracos: string[];
  risco: 'baixo' | 'médio' | 'alto';
  oportunidades: string[];
  conclusao: string;
}

export interface PlanoFinanceiro {
  orcamento_ideal: {
    essenciais: number;
    lazer: number;
    investimento: number;
  };
  gastos_categoria: {
    essenciais: number;
    lazer: number;
    investimento: number;
  };
  valor_guardar: number;
  acoes_reducao: string[];
  plano_objetivo: string;
  estrategia_dividas: string;
  erros_evitar: string[];
  mensagem_final: string;
}

export interface Meta {
  id: string;
  nome: string;
  valor_total: number;
  valor_mensal: number;
  prazo_ideal: string;
  justificativa: string;
  saved_value: number;
  progresso: number;
}

export interface Checklist {
  diarias: string[];
  semanais: string[];
  mensais: string[];
  acao_unica: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  message: string;
  created_at: string;
}
