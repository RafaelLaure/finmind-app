'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, DollarSign, PieChart, TrendingDown, Target, AlertCircle, XCircle, Loader2 } from 'lucide-react';
import type { OnboardingData, PlanoFinanceiro, Diagnostico } from '@/lib/types';

export default function PlanoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [plano, setPlano] = useState<PlanoFinanceiro | null>(null);

  useEffect(() => {
    const savedData = localStorage.getItem('onboardingData');
    if (!savedData) {
      router.push('/onboarding');
      return;
    }

    const parsedData: OnboardingData = JSON.parse(savedData);

    // Verificar se já existe plano salvo
    const savedPlano = localStorage.getItem('plano');
    if (savedPlano) {
      setPlano(JSON.parse(savedPlano));
      setLoading(false);
    } else {
      generatePlano(parsedData);
    }
  }, [router]);

  const generatePlano = async (userData: OnboardingData) => {
    try {
      // Buscar diagnóstico salvo para usar como contexto
      const savedDiagnostico = localStorage.getItem('diagnosticoData');
      const diagnostico: Diagnostico | null = savedDiagnostico ? JSON.parse(savedDiagnostico) : null;

      // Chamar API para gerar plano com IA (Prompt 2)
      const response = await fetch('/api/plano', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          renda: userData.renda,
          gastos: userData.gastos,
          dividas: userData.dividas,
          objetivo: userData.objetivo,
          prazo: userData.prazo,
          diagnostico: diagnostico,
          userId: '00000000-0000-0000-0000-000000000000' // Desenvolvimento
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao gerar plano');
      }

      const result = await response.json();
      
      // Salvar no localStorage e state
      setPlano(result);
      localStorage.setItem('plano', JSON.stringify(result));
    } catch (error) {
      console.error('Erro ao gerar plano:', error);
      
      // Fallback com dados mock caso a API falhe
      const mockPlano: PlanoFinanceiro = {
        orcamento_ideal: {
          essenciais: userData.renda * 0.5,
          lazer: userData.renda * 0.3,
          investimento: userData.renda * 0.2,
        },
        gastos_categoria: {
          essenciais: userData.gastos * 0.6,
          lazer: userData.gastos * 0.3,
          investimento: userData.gastos * 0.1,
        },
        valor_guardar: userData.renda * 0.2,
        acoes_reducao: [
          'Revisar assinaturas e serviços não utilizados',
          'Planejar refeições e reduzir delivery',
          'Comparar preços antes de compras grandes'
        ],
        plano_objetivo: `Para alcançar ${userData.objetivo} em ${userData.prazo}, você precisa guardar aproximadamente R$ ${(userData.renda * 0.2).toFixed(2)} por mês. Mantenha o foco e discipline.`,
        estrategia_dividas: userData.dividas > 0 
          ? `Com R$ ${userData.dividas} em dívidas, priorize pagar as de maior juros primeiro. Destine pelo menos 30% da sua economia mensal para quitação.`
          : 'Parabéns! Sem dívidas, você pode focar 100% em seus objetivos e investimentos.',
        erros_evitar: [
          'Não criar uma reserva de emergência antes de investir',
          'Gastar mais quando a renda aumentar (inflação de estilo de vida)',
          'Ignorar pequenos gastos recorrentes que somam muito'
        ],
        mensagem_final: 'Lembre-se: consistência é mais importante que perfeição. Pequenas mudanças diárias levam a grandes resultados!'
      };
      setPlano(mockPlano);
      localStorage.setItem('plano', JSON.stringify(mockPlano));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1F1F1F] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-[#4CCB92] animate-spin mx-auto mb-4" />
          <p className="text-white/80 text-lg">Criando seu plano financeiro personalizado...</p>
          <p className="text-white/60 text-sm mt-2">Analisando seus dados com IA</p>
        </div>
      </div>
    );
  }

  if (!plano) return null;

  return (
    <div className="min-h-screen bg-[#1F1F1F]">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#4CCB92] to-[#3BA876] p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </button>
          
          <div className="flex items-center gap-3">
            <div className="bg-white/20 rounded-full w-12 h-12 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Plano Financeiro</h1>
              <p className="text-white/80 text-sm">Seu roteiro personalizado para o sucesso</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto p-6 space-y-6 pb-20">
        {/* Valor a Guardar - Destaque Principal */}
        <div className="bg-gradient-to-br from-[#246BFD] to-[#A78BFA] rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-white/20 rounded-full p-3">
              <DollarSign className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-white font-bold text-2xl">Meta de Economia Mensal</h2>
          </div>
          <p className="text-white text-5xl font-bold mb-3">R$ {plano.valor_guardar.toFixed(2)}</p>
          <p className="text-white/90 text-base">Guarde este valor todo mês para atingir seus objetivos financeiros</p>
        </div>

        {/* Orçamento Ideal */}
        <div className="bg-[#2A2A2A] rounded-3xl p-6 shadow-lg">
          <h2 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
            <PieChart className="w-6 h-6 text-[#246BFD]" />
            Orçamento Ideal (Regra 50/30/20)
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-white/80">Essenciais (50%)</span>
                <span className="text-white font-semibold">R$ {plano.orcamento_ideal.essenciais.toFixed(2)}</span>
              </div>
              <div className="w-full bg-[#1F1F1F] rounded-full h-3">
                <div className="bg-[#246BFD] h-3 rounded-full transition-all duration-500" style={{ width: '50%' }} />
              </div>
              <p className="text-white/60 text-xs mt-1">Moradia, alimentação, transporte, contas</p>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-white/80">Lazer (30%)</span>
                <span className="text-white font-semibold">R$ {plano.orcamento_ideal.lazer.toFixed(2)}</span>
              </div>
              <div className="w-full bg-[#1F1F1F] rounded-full h-3">
                <div className="bg-[#A78BFA] h-3 rounded-full transition-all duration-500" style={{ width: '30%' }} />
              </div>
              <p className="text-white/60 text-xs mt-1">Entretenimento, hobbies, saídas</p>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-white/80">Investimento (20%)</span>
                <span className="text-white font-semibold">R$ {plano.orcamento_ideal.investimento.toFixed(2)}</span>
              </div>
              <div className="w-full bg-[#1F1F1F] rounded-full h-3">
                <div className="bg-[#4CCB92] h-3 rounded-full transition-all duration-500" style={{ width: '20%' }} />
              </div>
              <p className="text-white/60 text-xs mt-1">Poupança, investimentos, reserva de emergência</p>
            </div>
          </div>
        </div>

        {/* Gastos Sugeridos por Categoria */}
        <div className="bg-[#2A2A2A] rounded-3xl p-6 shadow-lg">
          <h2 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
            <PieChart className="w-6 h-6 text-[#4CCB92]" />
            Gastos Sugeridos por Categoria
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-[#1F1F1F] rounded-xl">
              <span className="text-white/80">Essenciais</span>
              <span className="text-white font-semibold">R$ {plano.gastos_categoria.essenciais.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-[#1F1F1F] rounded-xl">
              <span className="text-white/80">Lazer</span>
              <span className="text-white font-semibold">R$ {plano.gastos_categoria.lazer.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-[#1F1F1F] rounded-xl">
              <span className="text-white/80">Investimento</span>
              <span className="text-white font-semibold">R$ {plano.gastos_categoria.investimento.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Ações para Reduzir Gastos */}
        <div className="bg-[#2A2A2A] rounded-3xl p-6 shadow-lg">
          <h2 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
            <TrendingDown className="w-6 h-6 text-[#4CCB92]" />
            Três Ações Práticas para Reduzir Gastos
          </h2>
          <ul className="space-y-3">
            {plano.acoes_reducao.map((acao, index) => (
              <li key={index} className="flex items-start gap-3 p-3 bg-[#1F1F1F] rounded-xl hover:bg-[#252525] transition-colors">
                <div className="bg-[#4CCB92]/20 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                  <span className="text-[#4CCB92] font-bold">{index + 1}</span>
                </div>
                <span className="text-white/80 leading-relaxed">{acao}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Plano para Atingir o Objetivo */}
        <div className="bg-[#2A2A2A] rounded-3xl p-6 shadow-lg">
          <h2 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
            <Target className="w-6 h-6 text-[#A78BFA]" />
            Plano para Atingir Seu Objetivo
          </h2>
          <p className="text-white/80 leading-relaxed text-base">{plano.plano_objetivo}</p>
        </div>

        {/* Estratégia para Dívidas */}
        <div className="bg-[#2A2A2A] rounded-3xl p-6 shadow-lg">
          <h2 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-yellow-500" />
            Estratégia para Dívidas
          </h2>
          <p className="text-white/80 leading-relaxed text-base">{plano.estrategia_dividas}</p>
        </div>

        {/* Três Erros a Evitar */}
        <div className="bg-[#2A2A2A] rounded-3xl p-6 shadow-lg">
          <h2 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
            <XCircle className="w-6 h-6 text-red-500" />
            Três Erros a Evitar
          </h2>
          <ul className="space-y-3">
            {plano.erros_evitar.map((erro, index) => (
              <li key={index} className="flex items-start gap-3 p-3 bg-[#1F1F1F] rounded-xl">
                <div className="bg-red-500/20 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <XCircle className="w-4 h-4 text-red-500" />
                </div>
                <span className="text-white/80 leading-relaxed">{erro}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Mensagem Motivadora Final */}
        <div className="bg-gradient-to-r from-[#4CCB92] to-[#3BA876] rounded-3xl p-6 shadow-2xl">
          <h2 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
            ✨ Mensagem Motivadora
          </h2>
          <p className="text-white leading-relaxed text-lg">{plano.mensagem_final}</p>
        </div>

        {/* Botão para Metas */}
        <button
          onClick={() => router.push('/metas')}
          className="w-full bg-[#246BFD] text-white rounded-2xl p-4 font-semibold hover:bg-[#1E5AE0] transition-all hover:scale-[1.02] shadow-lg"
        >
          Ver Metas & Checklist →
        </button>
      </main>
    </div>
  );
}
