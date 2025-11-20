'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Circle, Sparkles, Calendar, Clock, Target, Loader2, ArrowLeft } from 'lucide-react';

interface ChecklistData {
  diarias: string[];
  semanais: string[];
  mensais: string[];
  acao_unica: string;
}

export default function ChecklistPage() {
  const router = useRouter();
  const [checklist, setChecklist] = useState<ChecklistData | null>(null);
  const [loading, setLoading] = useState(false);
  const [completedItems, setCompletedItems] = useState<string[]>([]);

  useEffect(() => {
    // Carregar checklist do localStorage
    const savedChecklist = localStorage.getItem('checklist');
    if (savedChecklist) {
      setChecklist(JSON.parse(savedChecklist));
    }

    // Carregar itens completados
    const savedCompleted = localStorage.getItem('checklist_completed');
    if (savedCompleted) {
      setCompletedItems(JSON.parse(savedCompleted));
    }
  }, []);

  const handleGenerateChecklist = async () => {
    setLoading(true);
    try {
      // Buscar dados necessários do localStorage
      const onboardingData = JSON.parse(localStorage.getItem('onboardingData') || '{}');
      const diagnosticoData = JSON.parse(localStorage.getItem('diagnosticoData') || '{}');
      const planoData = JSON.parse(localStorage.getItem('plano') || '{}');
      const metasData = JSON.parse(localStorage.getItem('metas') || '[]');

      // Chamar API para gerar checklist
      const response = await fetch('/api/checklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          renda: onboardingData.renda,
          gastos: onboardingData.gastos,
          dividas: onboardingData.dividas,
          objetivo: onboardingData.objetivo,
          prazo: onboardingData.prazo,
          diagnostico: diagnosticoData,
          planoFinanceiro: planoData,
          metas: metasData,
        }),
      });

      if (!response.ok) throw new Error('Erro ao gerar checklist');

      const data = await response.json();
      setChecklist(data);
      localStorage.setItem('checklist', JSON.stringify(data));
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao gerar checklist. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (item: string) => {
    const newCompleted = completedItems.includes(item)
      ? completedItems.filter(i => i !== item)
      : [...completedItems, item];
    
    setCompletedItems(newCompleted);
    localStorage.setItem('checklist_completed', JSON.stringify(newCompleted));
  };

  const isCompleted = (item: string) => completedItems.includes(item);

  if (!checklist) {
    return (
      <div className="min-h-screen bg-[#1F1F1F]">
        <header className="bg-gradient-to-r from-[#FF6B6B] to-[#EE5A6F] p-6">
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
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Checklist Financeiro</h1>
                <p className="text-white/80 text-sm">Sua rotina financeira personalizada</p>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-[#2A2A2A] rounded-3xl p-8 text-center">
            <Sparkles className="w-12 h-12 text-[#FF6B6B] mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-3">
              Gerar Checklist Personalizado
            </h2>
            <p className="text-white/60 mb-6">
              Vamos criar um checklist financeiro baseado no seu perfil, diagnóstico, plano e metas
            </p>
            <button
              onClick={handleGenerateChecklist}
              disabled={loading}
              className="bg-gradient-to-r from-[#FF6B6B] to-[#EE5A6F] hover:from-[#EE5A6F] hover:to-[#FF6B6B] text-white px-8 py-4 text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Gerando checklist...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Gerar Meu Checklist
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1F1F1F]">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#FF6B6B] to-[#EE5A6F] p-6">
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
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Seu Checklist Financeiro</h1>
              <p className="text-white/80 text-sm">Siga essas ações para manter suas finanças organizadas</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Ação Única Importante */}
        <div className="bg-gradient-to-br from-[#4CCB92] to-[#3BA876] rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white/20 rounded-full p-3">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-xl">Ação Única Importante</h2>
              <p className="text-white/80 text-sm">Faça uma vez e transforme suas finanças</p>
            </div>
          </div>
          <div
            onClick={() => toggleItem('acao-unica')}
            className="flex items-start gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-2xl hover:bg-white/20 transition-all cursor-pointer group"
          >
            {isCompleted('acao-unica') ? (
              <CheckCircle2 className="w-6 h-6 text-white flex-shrink-0 mt-0.5" />
            ) : (
              <Circle className="w-6 h-6 text-white/60 group-hover:text-white flex-shrink-0 mt-0.5 transition-colors" />
            )}
            <span className={`text-white font-medium ${isCompleted('acao-unica') ? 'line-through opacity-60' : ''}`}>
              {checklist.acao_unica}
            </span>
          </div>
        </div>

        {/* Ações Diárias */}
        <div className="bg-[#2A2A2A] rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-xl p-2">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-xl">Ações Diárias</h2>
              <p className="text-white/60 text-sm">Faça todos os dias</p>
            </div>
          </div>
          <div className="space-y-3">
            {checklist.diarias.map((acao, index) => (
              <div
                key={`diaria-${index}`}
                onClick={() => toggleItem(`diaria-${index}`)}
                className="flex items-start gap-3 p-4 bg-[#1F1F1F] rounded-xl hover:bg-[#252525] transition-all cursor-pointer group"
              >
                {isCompleted(`diaria-${index}`) ? (
                  <CheckCircle2 className="w-6 h-6 text-[#4CCB92] flex-shrink-0 mt-0.5" />
                ) : (
                  <Circle className="w-6 h-6 text-white/30 group-hover:text-orange-400 flex-shrink-0 mt-0.5 transition-colors" />
                )}
                <span className={`text-white/80 ${isCompleted(`diaria-${index}`) ? 'line-through text-white/40' : ''}`}>
                  {acao}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Ações Semanais */}
        <div className="bg-[#2A2A2A] rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl p-2">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-xl">Ações Semanais</h2>
              <p className="text-white/60 text-sm">Faça toda semana</p>
            </div>
          </div>
          <div className="space-y-3">
            {checklist.semanais.map((acao, index) => (
              <div
                key={`semanal-${index}`}
                onClick={() => toggleItem(`semanal-${index}`)}
                className="flex items-start gap-3 p-4 bg-[#1F1F1F] rounded-xl hover:bg-[#252525] transition-all cursor-pointer group"
              >
                {isCompleted(`semanal-${index}`) ? (
                  <CheckCircle2 className="w-6 h-6 text-[#4CCB92] flex-shrink-0 mt-0.5" />
                ) : (
                  <Circle className="w-6 h-6 text-white/30 group-hover:text-blue-400 flex-shrink-0 mt-0.5 transition-colors" />
                )}
                <span className={`text-white/80 ${isCompleted(`semanal-${index}`) ? 'line-through text-white/40' : ''}`}>
                  {acao}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Ações Mensais */}
        <div className="bg-[#2A2A2A] rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl p-2">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-xl">Ações Mensais</h2>
              <p className="text-white/60 text-sm">Faça todo mês</p>
            </div>
          </div>
          <div className="space-y-3">
            {checklist.mensais.map((acao, index) => (
              <div
                key={`mensal-${index}`}
                onClick={() => toggleItem(`mensal-${index}`)}
                className="flex items-start gap-3 p-4 bg-[#1F1F1F] rounded-xl hover:bg-[#252525] transition-all cursor-pointer group"
              >
                {isCompleted(`mensal-${index}`) ? (
                  <CheckCircle2 className="w-6 h-6 text-[#4CCB92] flex-shrink-0 mt-0.5" />
                ) : (
                  <Circle className="w-6 h-6 text-white/30 group-hover:text-purple-400 flex-shrink-0 mt-0.5 transition-colors" />
                )}
                <span className={`text-white/80 ${isCompleted(`mensal-${index}`) ? 'line-through text-white/40' : ''}`}>
                  {acao}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Botão para Chat */}
        <button
          onClick={() => router.push('/chat')}
          className="w-full bg-[#246BFD] text-white rounded-2xl p-4 font-semibold hover:bg-[#1E5AE0] transition-colors"
        >
          Conversar com a IA →
        </button>
      </main>
    </div>
  );
}
