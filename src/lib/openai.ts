import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateDiagnostico(data: {
  renda: number;
  gastos: number;
  dividas: number;
  objetivo: string;
  dificuldade: string;
  prazo: string;
}) {
  const prompt = `Com base nos dados a seguir, gere um diagnóstico financeiro totalmente personalizado.

Dados:
Renda: R$ ${data.renda}
Gastos: R$ ${data.gastos}
Dívidas: R$ ${data.dividas}
Objetivo: ${data.objetivo}
Dificuldade principal: ${data.dificuldade}
Prazo: ${data.prazo}

Crie:
1) Resumo da situação atual
2) Pontos fortes
3) Pontos fracos
4) Risco financeiro (baixo/médio/alto)
5) 3 oportunidades práticas
6) Conclusão motivadora

Use linguagem simples e direta.

Retorne em formato JSON com as chaves: situacao_atual, pontos_fortes, pontos_fracos, risco, oportunidades (array), conclusao`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  });

  return JSON.parse(response.choices[0].message.content || '{}');
}

export async function generatePlanoFinanceiro(data: {
  renda: number;
  gastos: number;
  dividas: number;
  objetivo: string;
  prazo: string;
  diagnostico?: any;
}) {
  const diagnosticoContext = data.diagnostico 
    ? `\n\nDiagnóstico anterior:\nSituação: ${data.diagnostico.situacao_atual}\nRisco: ${data.diagnostico.risco}\nOportunidades: ${data.diagnostico.oportunidades?.join(', ')}`
    : '';

  const prompt = `PROMPT 2 - PLANO FINANCEIRO PERSONALIZADO

Você é um consultor financeiro experiente. Com base nos dados abaixo, crie um plano financeiro completo e prático.

DADOS DO USUÁRIO:
- Renda mensal: R$ ${data.renda}
- Gastos mensais: R$ ${data.gastos}
- Dívidas totais: R$ ${data.dividas}
- Objetivo principal: ${data.objetivo}
- Prazo desejado: ${data.prazo}${diagnosticoContext}

CRIE UM PLANO FINANCEIRO COMPLETO COM:

1) ORÇAMENTO IDEAL (baseado na regra 50/30/20):
   - Essenciais (50%): moradia, alimentação, transporte, contas
   - Lazer (30%): entretenimento, hobbies, saídas
   - Investimento (20%): poupança, investimentos, reserva

2) GASTOS SUGERIDOS POR CATEGORIA:
   - Distribua os gastos atuais de forma otimizada
   - Considere a realidade financeira do usuário

3) QUANTO GUARDAR POR MÊS:
   - Valor realista baseado na renda e gastos
   - Considere as dívidas existentes

4) TRÊS AÇÕES PRÁTICAS PARA REDUZIR GASTOS:
   - Ações específicas e aplicáveis imediatamente
   - Foque em impacto real no orçamento

5) PLANO PARA ATINGIR O OBJETIVO:
   - Estratégia clara e passo a passo
   - Considere o prazo desejado
   - Seja motivador mas realista

6) ESTRATÉGIA PARA DÍVIDAS:
   - Se houver dívidas: priorização e método de pagamento
   - Se não houver: parabenize e oriente sobre prevenção

7) TRÊS ERROS A EVITAR:
   - Erros comuns que podem comprometer o plano
   - Específicos para o perfil do usuário

8) MENSAGEM MOTIVADORA:
   - Encoraje o usuário
   - Reforce que é possível alcançar os objetivos

IMPORTANTE:
- Use linguagem simples e acessível
- Seja prático e objetivo
- Considere a realidade brasileira
- Valores em reais (R$)

Retorne OBRIGATORIAMENTE em formato JSON com as seguintes chaves:
{
  "orcamento_ideal": {
    "essenciais": number,
    "lazer": number,
    "investimento": number
  },
  "gastos_categoria": {
    "essenciais": number,
    "lazer": number,
    "investimento": number
  },
  "valor_guardar": number,
  "acoes_reducao": [string, string, string],
  "plano_objetivo": string,
  "estrategia_dividas": string,
  "erros_evitar": [string, string, string],
  "mensagem_final": string
}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  });

  return JSON.parse(response.choices[0].message.content || '{}');
}

export async function generateMetas(data: {
  renda: number;
  gastos: number;
  dividas: number;
  objetivo: string;
  prazo: string;
  diagnostico?: any;
  planoFinanceiro?: any;
}) {
  const diagnosticoContext = data.diagnostico 
    ? `\n\nDIAGNÓSTICO ANTERIOR:\n- Situação: ${data.diagnostico.situacao_atual}\n- Risco: ${data.diagnostico.risco}\n- Oportunidades: ${data.diagnostico.oportunidades?.join(', ')}`
    : '';

  const planoContext = data.planoFinanceiro
    ? `\n\nPLANO FINANCEIRO:\n- Valor para guardar: R$ ${data.planoFinanceiro.valor_guardar}\n- Orçamento ideal: Essenciais R$ ${data.planoFinanceiro.orcamento_ideal?.essenciais}, Lazer R$ ${data.planoFinanceiro.orcamento_ideal?.lazer}, Investimento R$ ${data.planoFinanceiro.orcamento_ideal?.investimento}\n- Estratégia: ${data.planoFinanceiro.plano_objetivo}`
    : '';

  const prompt = `PROMPT 3 - METAS FINANCEIRAS PERSONALIZADAS

Você é um consultor financeiro especializado em planejamento de metas. Com base nos dados abaixo, crie metas financeiras SMART (Específicas, Mensuráveis, Atingíveis, Relevantes e Temporais).

DADOS DO USUÁRIO:
- Renda mensal: R$ ${data.renda}
- Gastos mensais: R$ ${data.gastos}
- Dívidas totais: R$ ${data.dividas}
- Objetivo principal: ${data.objetivo}
- Prazo desejado: ${data.prazo}${diagnosticoContext}${planoContext}

CRIE 3 A 4 METAS FINANCEIRAS PRIORITÁRIAS:

REGRAS IMPORTANTES:
1. A primeira meta SEMPRE deve ser "Reserva de Emergência" (3 a 6 meses de gastos essenciais)
2. A segunda meta deve estar relacionada ao objetivo principal do usuário
3. Inclua metas de curto, médio e longo prazo
4. Valores devem ser realistas considerando a renda disponível
5. Prazo deve ser alcançável e motivador

PARA CADA META, FORNEÇA:
1. NOME DA META: Título claro e motivador
2. VALOR TOTAL: Quanto precisa juntar no total (em reais)
3. VALOR MENSAL RECOMENDADO: Quanto guardar por mês para atingir a meta no prazo (em reais)
4. PRAZO IDEAL: Tempo estimado para atingir a meta (ex: "6 meses", "1 ano", "2 anos")
5. JUSTIFICATIVA: Por que essa meta é importante e como ela ajuda o usuário (1-2 frases)

IMPORTANTE:
- Use linguagem simples e motivadora
- Seja realista com os valores e prazos
- Considere a capacidade financeira atual do usuário
- Priorize segurança financeira antes de objetivos de longo prazo
- Valores em reais (R$)

Retorne OBRIGATORIAMENTE em formato JSON com a seguinte estrutura:
{
  "metas": [
    {
      "nome": string,
      "valor_total": number,
      "valor_mensal": number,
      "prazo_ideal": string,
      "justificativa": string
    }
  ]
}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  });

  return JSON.parse(response.choices[0].message.content || '{}');
}

export async function generateChecklist(data: {
  renda: number;
  gastos: number;
  dividas: number;
  objetivo: string;
  prazo: string;
  diagnostico?: any;
  planoFinanceiro?: any;
  metas?: any[];
}) {
  const diagnosticoContext = data.diagnostico 
    ? `\n\nDIAGNÓSTICO:\n- Situação: ${data.diagnostico.situacao_atual}\n- Risco: ${data.diagnostico.risco}`
    : '';

  const planoContext = data.planoFinanceiro
    ? `\n\nPLANO FINANCEIRO:\n- Valor para guardar: R$ ${data.planoFinanceiro.valor_guardar}\n- Estratégia: ${data.planoFinanceiro.plano_objetivo}`
    : '';

  const metasContext = data.metas && data.metas.length > 0
    ? `\n\nMETAS:\n${data.metas.map(m => `- ${m.nome}: R$ ${m.valor_total}`).join('\n')}`
    : '';

  const prompt = `PROMPT 4 - CHECKLIST FINANCEIRO PERSONALIZADO

Você é um consultor financeiro especializado em criar rotinas práticas. Com base nos dados abaixo, crie um checklist financeiro personalizado e acionável.

DADOS DO USUÁRIO:
- Renda mensal: R$ ${data.renda}
- Gastos mensais: R$ ${data.gastos}
- Dívidas totais: R$ ${data.dividas}
- Objetivo principal: ${data.objetivo}
- Prazo desejado: ${data.prazo}${diagnosticoContext}${planoContext}${metasContext}

CRIE UM CHECKLIST FINANCEIRO COMPLETO COM:

1) AÇÕES DIÁRIAS (2 ações):
   - Hábitos simples que podem ser feitos todos os dias
   - Foco em controle e consciência financeira
   - Exemplos: registrar gastos, revisar saldo, evitar compras impulsivas

2) AÇÕES SEMANAIS (3 ações):
   - Tarefas de revisão e planejamento semanal
   - Foco em organização e ajustes
   - Exemplos: revisar gastos da semana, planejar compras, comparar preços

3) AÇÕES MENSAIS (3 ações):
   - Tarefas estratégicas de fim de mês
   - Foco em análise e planejamento de longo prazo
   - Exemplos: fechar orçamento, revisar metas, analisar investimentos

4) AÇÃO ÚNICA IMPORTANTE (1 ação):
   - Uma ação transformadora que o usuário deve fazer UMA VEZ
   - Algo que terá impacto duradouro nas finanças
   - Exemplos: criar reserva de emergência, renegociar dívidas, automatizar investimentos

IMPORTANTE:
- Todas as ações devem ser ESPECÍFICAS e PRÁTICAS
- Use linguagem simples e direta
- Considere a realidade financeira do usuário
- Ações devem ser alcançáveis e motivadoras
- Personalize baseado no diagnóstico, plano e metas

Retorne OBRIGATORIAMENTE em formato JSON com a seguinte estrutura:
{
  "diarias": [string, string],
  "semanais": [string, string, string],
  "mensais": [string, string, string],
  "acao_unica": string
}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  });

  return JSON.parse(response.choices[0].message.content || '{}');
}

export async function chatWithAI(data: {
  mensagem: string;
  onboarding?: any;
  diagnostico?: any;
  planoFinanceiro?: any;
  metas?: any[];
  checklist?: any;
}) {
  // Construir contexto completo do usuário
  let contexto = 'CONTEXTO DO USUÁRIO:\n\n';

  if (data.onboarding) {
    contexto += `DADOS FINANCEIROS:\n`;
    contexto += `- Renda mensal: R$ ${data.onboarding.renda}\n`;
    contexto += `- Gastos mensais: R$ ${data.onboarding.gastos}\n`;
    contexto += `- Dívidas totais: R$ ${data.onboarding.dividas}\n`;
    contexto += `- Objetivo principal: ${data.onboarding.objetivo}\n`;
    contexto += `- Prazo desejado: ${data.onboarding.prazo}\n`;
    contexto += `- Dificuldade principal: ${data.onboarding.dificuldade}\n`;
    contexto += `- Guarda por mês: R$ ${data.onboarding.guardaMes}\n\n`;
  }

  if (data.diagnostico) {
    contexto += `DIAGNÓSTICO FINANCEIRO:\n`;
    contexto += `- Situação atual: ${data.diagnostico.situacao_atual}\n`;
    contexto += `- Nível de risco: ${data.diagnostico.risco}\n`;
    contexto += `- Pontos fortes: ${data.diagnostico.pontos_fortes?.join(', ')}\n`;
    contexto += `- Pontos fracos: ${data.diagnostico.pontos_fracos?.join(', ')}\n`;
    contexto += `- Oportunidades: ${data.diagnostico.oportunidades?.join(', ')}\n\n`;
  }

  if (data.planoFinanceiro) {
    contexto += `PLANO FINANCEIRO:\n`;
    contexto += `- Valor para guardar por mês: R$ ${data.planoFinanceiro.valor_guardar}\n`;
    contexto += `- Orçamento ideal: Essenciais R$ ${data.planoFinanceiro.orcamento_ideal?.essenciais}, Lazer R$ ${data.planoFinanceiro.orcamento_ideal?.lazer}, Investimento R$ ${data.planoFinanceiro.orcamento_ideal?.investimento}\n`;
    contexto += `- Estratégia para objetivo: ${data.planoFinanceiro.plano_objetivo}\n`;
    contexto += `- Estratégia para dívidas: ${data.planoFinanceiro.estrategia_dividas}\n\n`;
  }

  if (data.metas && data.metas.length > 0) {
    contexto += `METAS FINANCEIRAS:\n`;
    data.metas.forEach((meta, index) => {
      contexto += `${index + 1}. ${meta.nome} - R$ ${meta.valor_total} (R$ ${meta.valor_mensal}/mês)\n`;
    });
    contexto += '\n';
  }

  if (data.checklist) {
    contexto += `CHECKLIST ATIVO:\n`;
    contexto += `- Ações diárias: ${data.checklist.diarias?.join(', ')}\n`;
    contexto += `- Ações semanais: ${data.checklist.semanais?.join(', ')}\n`;
    contexto += `- Ações mensais: ${data.checklist.mensais?.join(', ')}\n`;
    contexto += `- Ação única: ${data.checklist.acao_unica}\n\n`;
  }

  const prompt = `PROMPT 5 - CHAT PERSONALIZADO COM IA (FinMind Assistant)

Você é o FinMind, um assistente financeiro pessoal inteligente, amigável e motivador. Sua missão é ajudar o usuário a tomar decisões financeiras melhores através de conversas naturais e personalizadas.

${contexto}

PERGUNTA DO USUÁRIO:
"${data.mensagem}"

INSTRUÇÕES PARA SUA RESPOSTA:

1. SEJA DIRETO E PERSONALIZADO:
   - Responda diretamente à pergunta do usuário
   - Use o nome do usuário se disponível
   - Faça referência aos dados específicos dele (renda, gastos, metas, etc)
   - Seja empático e motivador

2. FORNEÇA 3 PASSOS PRÁTICOS:
   - Dê 3 ações concretas que o usuário pode fazer AGORA
   - Seja específico e aplicável à situação dele
   - Numere os passos claramente (Passo 1, Passo 2, Passo 3)
   - Cada passo deve ser simples e acionável

3. FINALIZE COM UMA PERGUNTA ENGAJADORA:
   - Faça uma pergunta que incentive o usuário a continuar a conversa
   - A pergunta deve ser relevante ao tópico discutido
   - Mostre interesse genuíno em ajudar mais

FORMATO DA RESPOSTA:
[Resposta direta e personalizada à pergunta]

**3 Passos Práticos:**

**Passo 1:** [Ação específica]
**Passo 2:** [Ação específica]
**Passo 3:** [Ação específica]

[Pergunta engajadora para continuar a conversa]

IMPORTANTE:
- Use linguagem simples e acessível
- Seja positivo e motivador
- Evite jargões financeiros complexos
- Considere a realidade financeira brasileira
- Valores sempre em reais (R$)
- Seja breve mas completo (máximo 200 palavras)

Responda agora:`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
  });

  return response.choices[0].message.content || '';
}
