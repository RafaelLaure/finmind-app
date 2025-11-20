'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Target, CheckSquare, Calendar, TrendingUp, Plus, Loader2 } from 'lucide-react';
import type { OnboardingData, Checklist } from '@/lib/types';
import { supabase } from '@/lib/supabase';

interface MetaCompleta {
  id: string;
  nome: string;
  valor_total: number;
  valor_mensal: number;
  prazo_ideal: string;
  justificativa: string;
  saved_value: number;
  progresso: number;
}

export default function MetasPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [metas, setMetas] = useState<MetaCompleta[]>([]);

  useEffect(() => {
    const savedData = localStorage.getItem('onboardingData');
    if (!savedData) {
      router.push('/onboarding');
      return;
    }

    carregarMetas();
  }, [router]);

  const carregarMetas = async () => {
    try {
      // Tentar carregar metas do Supabase
      const { data: metasSupabase, error } = await supabase
        .from('goals')
        .select('*')
        .eq('status', 'ativa')
        .order('created_at', { ascending: false });

      if (!error && metasSupabase && metasSupabase.length > 0) {
        // Converter dados do Supabase para formato da aplicação
        const metasFormatadas: MetaCompleta[] = metasSupabase.map((meta) => ({
          id: meta.id,
          nome: meta.title,
          valor_total: meta.total_value,
          valor_mensal: meta.total_value / calcularMesesRestantes(meta.deadline),
          prazo_ideal: formatarPrazo(meta.deadline),
          justificativa: `Meta criada para alcançar ${meta.title}`,
          saved_value: meta.saved_value || 0,
          progresso: calcularProgresso(meta.saved_value || 0, meta.total_value)
        }));

        setMetas(metasFormatadas);
        setLoading(false);
      } else {
        // Se não há metas no Supabase, gerar novas
        await gerarMetas();
      }
    } catch (error) {
      console.error('Erro ao carregar metas:', error);
      await gerarMetas();
    }
  };

  const gerarMetas = async () => {
    try {
      const savedData = localStorage.getItem('onboardingData');
      const diagnosticoData = localStorage.getItem('diagnosticoData');
      const planoData = localStorage.getItem('plano');
      
      if (!savedData) return;
      
      const userData: OnboardingData = JSON.parse(savedData);
      const diagnostico = diagnosticoData ? JSON.parse(diagnosticoData) : null;
      const planoFinanceiro = planoData ? JSON.parse(planoData) : null;

      // Gerar metas com IA
      const metasResponse = await fetch('/api/metas', {\n        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          renda: userData.renda,
          gastos: userData.gastos,
          dividas: userData.dividas,
          objetivo: userData.objetivo,
          prazo: userData.prazo,
          diagnostico: diagnostico,
          planoFinanceiro: planoFinanceiro,
          userId: 'demo-user'
        }),
      });
      
      if (!metasResponse.ok) {
        throw new Error('Erro ao gerar metas');
      }

      const metasResult = await metasResponse.json();

      if (metasResult.metas) {
        setMetas(metasResult.metas);
        localStorage.setItem('metas', JSON.stringify(metasResult.metas));
      }
    } catch (error) {
      console.error('Erro ao gerar metas:', error);
    } finally {
      setLoading(false);
    }
  };

  const calcularProgresso = (valorSalvo: number, valorTotal: number): number => {
    if (valorTotal === 0) return 0;
    return Math.min(Math.round((valorSalvo / valorTotal) * 100), 100);
  };

  const calcularMesesRestantes = (deadline: string): number => {
    const hoje = new Date();
    const prazo = new Date(deadline);
    const diffTime = prazo.getTime() - hoje.getTime();
    const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
    return Math.max(diffMonths, 1);
  };

  const formatarPrazo = (deadline: string): string => {
    const meses = calcularMesesRestantes(deadline);
    if (meses < 12) {
      return `${meses} ${meses === 1 ? 'mês' : 'meses'}`;
    } else {
      const anos = Math.floor(meses / 12);
      return `${anos} ${anos === 1 ? 'ano' : 'anos'}`;
    }
  };

  const atualizarValorSalvo = async (metaId: string, novoValor: number) => {
    try {
      const { error } = await supabase
        .from('goals')
        .update({ saved_value: novoValor })
        .eq('id', metaId);

      if (!error) {
        // Atualizar estado local
        setMetas(metas.map(meta => {
          if (meta.id === metaId) {
            return {
              ...meta,
              saved_value: novoValor,
              progresso: calcularProgresso(novoValor, meta.valor_total)
            };
          }
          return meta;
        }));
      }
    } catch (error) {
      console.error('Erro ao atualizar valor salvo:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1F1F1F] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-[#A78BFA] animate-spin mx-auto mb-4" />
          <p className="text-white/80 text-lg">Criando suas metas financeiras...</p>
          <p className="text-white/60 text-sm mt-2">Analisando seus dados com IA</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1F1F1F]">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#A78BFA] to-[#8B5CF6] p-6">
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
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Metas Financeiras</h1>
              <p className="text-white/80 text-sm">Acompanhe seu progresso rumo aos objetivos</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Metas */}
        <div>
          <h2 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
            <Target className="w-6 h-6 text-[#A78BFA]" />
            Suas Metas Financeiras
          </h2>
          <div className="space-y-4">
            {metas.map((meta) => (
              <div key={meta.id} className="bg-[#2A2A2A] rounded-3xl p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-white font-bold text-lg">{meta.nome}</h3>
                    <p className="text-white/60 text-sm">{meta.justificativa}</p>
                  </div>
                  <div className="bg-[#A78BFA]/20 rounded-full px-3 py-1">
                    <span className="text-[#A78BFA] text-sm font-semibold">{meta.prazo_ideal}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-white/60 text-xs mb-1">Valor Total</p>
                    <p className="text-white font-semibold">R$ {meta.valor_total.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-xs mb-1">Guardar por Mês</p>
                    <p className="text-[#4CCB92] font-semibold">R$ {meta.valor_mensal.toFixed(2)}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-xs text-white/60 mb-2">
                    <span>Progresso: R$ {meta.saved_value.toFixed(2)} de R$ {meta.valor_total.toFixed(2)}</span>
                    <span>{meta.progresso}%</span>
                  </div>
                  <div className="w-full bg-[#1F1F1F] rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-[#A78BFA] to-[#8B5CF6] h-3 rounded-full transition-all duration-500"
                      style={{ width: `${meta.progresso}%` }}
                    />
                  </div>
                </div>

                {/* Botão para adicionar valor */}
                <button
                  onClick={() => {
                    const novoValor = prompt(`Quanto você guardou para "${meta.nome}"?`, '0');
                    if (novoValor !== null) {
                      const valor = parseFloat(novoValor);
                      if (!isNaN(valor) && valor >= 0) {
                        atualizarValorSalvo(meta.id, meta.saved_value + valor);
                      }
                    }
                  }}
                  className="w-full bg-[#A78BFA]/20 hover:bg-[#A78BFA]/30 text-[#A78BFA] rounded-xl p-3 font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Valor Guardado
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Botões de Navegação */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => router.push('/checklist')}
            className="w-full bg-[#FF6B6B] text-white rounded-2xl p-4 font-semibold hover:bg-[#EE5A6F] transition-colors"
          >
            Ver Checklist Financeiro →
          </button>
          <button
            onClick={() => router.push('/chat')}
            className="w-full bg-[#246BFD] text-white rounded-2xl p-4 font-semibold hover:bg-[#1E5AE0] transition-colors"
          >
            Conversar com a IA →
          </button>
        </div>
      </main>
    </div>
  );
}
