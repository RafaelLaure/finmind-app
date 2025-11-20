'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Brain, ArrowLeft, TrendingUp, AlertTriangle, CheckCircle, Lightbulb } from 'lucide-react';

interface DiagnosticoData {
  situacao_atual: string;
  pontos_fortes: string[];
  pontos_fracos: string[];
  risco: string;
  oportunidades: string[];
  conclusao: string;
}

export default function DiagnosticoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [diagnostico, setDiagnostico] = useState<DiagnosticoData | null>(null);

  useEffect(() => {
    // Carregar diagnóstico do localStorage
    const savedDiagnostico = localStorage.getItem('diagnosticoData');
    
    if (!savedDiagnostico) {
      // Se não houver diagnóstico, redirecionar para onboarding
      router.push('/onboarding');
      return;
    }

    try {
      const parsedDiagnostico = JSON.parse(savedDiagnostico);
      setDiagnostico(parsedDiagnostico);
    } catch (error) {
      console.error('Erro ao carregar diagnóstico:', error);
      router.push('/onboarding');
    } finally {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1F1F1F] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#246BFD] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/80">Carregando seu diagnóstico...</p>
        </div>
      </div>
    );
  }

  if (!diagnostico) return null;

  const getRiscoColor = (risco: string) => {
    const riscoLower = risco.toLowerCase();
    switch (riscoLower) {
      case 'baixo': return 'text-[#4CCB92] bg-[#4CCB92]/10';
      case 'médio': return 'text-yellow-500 bg-yellow-500/10';
      case 'alto': return 'text-red-500 bg-red-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  return (
    <div className="min-h-screen bg-[#1F1F1F]">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#246BFD] to-[#4169E1] p-6">
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
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Diagnóstico Financeiro</h1>
              <p className="text-white/80 text-sm">Análise completa da sua situação</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Situação Atual */}
        <div className="bg-[#2A2A2A] rounded-3xl p-6">
          <h2 className="text-white font-bold text-xl mb-4">📊 Situação Atual</h2>
          <p className="text-white/80 leading-relaxed">{diagnostico.situacao_atual}</p>
        </div>

        {/* Nível de Risco */}
        <div className="bg-[#2A2A2A] rounded-3xl p-6">
          <h2 className="text-white font-bold text-xl mb-4">⚠️ Nível de Risco</h2>
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${getRiscoColor(diagnostico.risco)}`}>
            <AlertTriangle className="w-5 h-5" />
            <span className="font-semibold capitalize">{diagnostico.risco}</span>
          </div>
        </div>

        {/* Pontos Fortes */}
        <div className="bg-[#2A2A2A] rounded-3xl p-6">
          <h2 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-[#4CCB92]" />
            Pontos Fortes
          </h2>
          <ul className="space-y-3">
            {diagnostico.pontos_fortes.map((ponto, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="bg-[#4CCB92]/20 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle className="w-4 h-4 text-[#4CCB92]" />
                </div>
                <span className="text-white/80">{ponto}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Pontos Fracos */}
        <div className="bg-[#2A2A2A] rounded-3xl p-6">
          <h2 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-yellow-500" />
            Pontos de Atenção
          </h2>
          <ul className="space-y-3">
            {diagnostico.pontos_fracos.map((ponto, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="bg-yellow-500/20 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                </div>
                <span className="text-white/80">{ponto}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Oportunidades */}
        <div className="bg-gradient-to-br from-[#246BFD] to-[#A78BFA] rounded-3xl p-6">
          <h2 className="text-white font-bold text-xl mb-4 flex items-center gap-2">
            <Lightbulb className="w-6 h-6" />
            Oportunidades de Melhoria
          </h2>
          <ul className="space-y-3">
            {diagnostico.oportunidades.map((oportunidade, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="bg-white/20 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">{index + 1}</span>
                </div>
                <span className="text-white">{oportunidade}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Conclusão */}
        <div className="bg-[#4CCB92] rounded-3xl p-6">
          <h2 className="text-white font-bold text-xl mb-4">💪 Mensagem Final</h2>
          <p className="text-white leading-relaxed">{diagnostico.conclusao}</p>
        </div>

        {/* Botão para Plano */}
        <button
          onClick={() => router.push('/plano')}
          className="w-full bg-[#246BFD] text-white rounded-2xl p-4 font-semibold hover:bg-[#1E5AE0] transition-colors"
        >
          Ver Plano Financeiro Completo →
        </button>
      </main>
    </div>
  );
}
