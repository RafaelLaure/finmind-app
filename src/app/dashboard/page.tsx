'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Brain, TrendingUp, Target, CheckSquare, MessageCircle, Plus, DollarSign, AlertCircle, Home } from 'lucide-react';
import type { OnboardingData } from '@/lib/types';

export default function Dashboard() {
  const router = useRouter();
  const [data, setData] = useState<OnboardingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedData = localStorage.getItem('onboardingData');
    if (!savedData) {
      router.push('/onboarding');
      return;
    }
    setData(JSON.parse(savedData));
    setLoading(false);
  }, [router]);

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-[#1F1F1F] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#246BFD] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const saldoMensal = data.renda - data.gastos;
  const percentualGasto = (data.gastos / data.renda) * 100;

  return (
    <div className="min-h-screen bg-[#1F1F1F]">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#246BFD] to-[#A78BFA] p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Brain className="w-8 h-8 text-white" />
              <h1 className="text-2xl font-bold text-white">FinMind</h1>
            </div>
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 bg-white/10 backdrop-blur-lg text-white px-4 py-2 rounded-full hover:bg-white/20 transition-colors"
            >
              <Home className="w-4 h-4" />
              <span className="text-sm">Início</span>
            </button>
          </div>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6">
            <h2 className="text-white/80 text-sm mb-2">Saldo Mensal</h2>
            <p className={`text-4xl font-bold mb-4 ${saldoMensal >= 0 ? 'text-[#4CCB92]' : 'text-red-400'}`}>
              R$ {saldoMensal.toFixed(2)}
            </p>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-white/60 text-xs mb-1">Receita</p>
                <p className="text-white font-semibold">R$ {data.renda.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-white/60 text-xs mb-1">Gastos</p>
                <p className="text-white font-semibold">R$ {data.gastos.toFixed(2)}</p>
              </div>
            </div>

            {/* Barra de progresso de gastos */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-white/60 mb-2">
                <span>Gastos do mês</span>
                <span>{percentualGasto.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    percentualGasto > 90 ? 'bg-red-400' : percentualGasto > 70 ? 'bg-yellow-400' : 'bg-[#4CCB92]'
                  }`}
                  style={{ width: `${Math.min(percentualGasto, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        {/* Alertas */}
        {data.dividas > 0 && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-yellow-500 font-semibold">Atenção às dívidas</p>
              <p className="text-white/70 text-sm">Você tem R$ {data.dividas.toFixed(2)} em dívidas. Veja seu plano financeiro para estratégias.</p>
            </div>
          </div>
        )}

        {/* Cards de Navegação */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {/* Diagnóstico */}
          <button
            onClick={() => router.push('/diagnostico')}
            className="bg-gradient-to-br from-[#246BFD] to-[#4169E1] rounded-3xl p-6 text-left hover:scale-105 transition-transform"
          >
            <div className="bg-white/20 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Diagnóstico</h3>
            <p className="text-white/80 text-sm">Veja sua análise financeira completa</p>
          </button>

          {/* Plano Financeiro */}
          <button
            onClick={() => router.push('/plano')}
            className="bg-gradient-to-br from-[#4CCB92] to-[#3BA876] rounded-3xl p-6 text-left hover:scale-105 transition-transform"
          >
            <div className="bg-white/20 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Plano Financeiro</h3>
            <p className="text-white/80 text-sm">Seu roteiro para o sucesso</p>
          </button>

          {/* Metas */}
          <button
            onClick={() => router.push('/metas')}
            className="bg-gradient-to-br from-[#A78BFA] to-[#8B5CF6] rounded-3xl p-6 text-left hover:scale-105 transition-transform"
          >
            <div className="bg-white/20 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Target className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Metas Financeiras</h3>
            <p className="text-white/80 text-sm">Acompanhe seu progresso</p>
          </button>

          {/* Checklist */}
          <button
            onClick={() => router.push('/checklist')}
            className="bg-gradient-to-br from-[#FF6B6B] to-[#EE5A6F] rounded-3xl p-6 text-left hover:scale-105 transition-transform"
          >
            <div className="bg-white/20 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <CheckSquare className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Checklist</h3>
            <p className="text-white/80 text-sm">Ações diárias, semanais e mensais</p>
          </button>

          {/* Chat de IA */}
          <button
            onClick={() => router.push('/chat')}
            className="bg-gradient-to-br from-[#246BFD] to-[#A78BFA] rounded-3xl p-6 text-left hover:scale-105 transition-transform md:col-span-2"
          >
            <div className="bg-white/20 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Converse com a IA</h3>
            <p className="text-white/80 text-sm">Tire suas dúvidas financeiras com o FinMind Assistant</p>
          </button>
        </div>

        {/* Objetivo Principal */}
        <div className="bg-[#2A2A2A] rounded-3xl p-6 mb-6">
          <h3 className="text-white font-bold text-lg mb-4">Seu Objetivo Principal</h3>
          <div className="bg-[#1F1F1F] rounded-2xl p-4">
            <p className="text-[#4CCB92] font-semibold mb-2">{data.objetivo}</p>
            <p className="text-white/60 text-sm">Prazo: {data.prazo}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
