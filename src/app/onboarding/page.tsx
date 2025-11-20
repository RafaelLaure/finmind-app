'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Brain, ArrowRight, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const questions = [
  { id: 1, question: 'Quanto você ganha por mês?', placeholder: 'Ex: 5000', type: 'number', key: 'renda' },
  { id: 2, question: 'Quanto você gasta por mês?', placeholder: 'Ex: 4000', type: 'number', key: 'gastos' },
  { id: 3, question: 'Você tem dívidas? Quanto?', placeholder: 'Ex: 2000 (ou 0)', type: 'number', key: 'dividas' },
  { id: 4, question: 'Seu objetivo financeiro principal?', placeholder: 'Ex: Comprar um carro', type: 'text', key: 'objetivo' },
  { id: 5, question: 'Quanto você guarda por mês?', placeholder: 'Ex: 500 (ou 0)', type: 'number', key: 'guardaMes' },
  { id: 6, question: 'Qual sua maior dificuldade financeira?', placeholder: 'Ex: Controlar gastos', type: 'text', key: 'dificuldade' },
  { id: 7, question: 'Em quanto tempo quer atingir seu objetivo?', placeholder: 'Ex: 2 anos', type: 'text', key: 'prazo' },
];

export default function Onboarding() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleChange = (value: string) => {
    setAnswers({
      ...answers,
      [currentQuestion.key]: currentQuestion.type === 'number' ? parseFloat(value) || 0 : value,
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    
    try {
      // 1. Chamar API para gerar diagnóstico com IA
      const diagnosticoResponse = await fetch('/api/diagnostico', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          renda: answers.renda,
          gastos: answers.gastos,
          dividas: answers.dividas,
          objetivo: answers.objetivo,
          dificuldade: answers.dificuldade,
          prazo: answers.prazo,
        }),
      });

      if (!diagnosticoResponse.ok) {
        throw new Error('Erro ao gerar diagnóstico');
      }

      const diagnosticoData = await diagnosticoResponse.json();

      // 2. Salvar diagnóstico no Supabase
      const { data: savedDiagnostico, error: supabaseError } = await supabase
        .from('diagnostics')
        .insert({
          user_id: 'demo-user', // Temporário até implementar autenticação
          month: new Date().toISOString().slice(0, 7), // YYYY-MM
          summary: diagnosticoData.situacao_atual || '',
          insights: JSON.stringify({
            pontos_fortes: diagnosticoData.pontos_fortes || [],
            pontos_fracos: diagnosticoData.pontos_fracos || [],
            oportunidades: diagnosticoData.oportunidades || [],
          }),
          suggestions: JSON.stringify(diagnosticoData.oportunidades || []),
          risk_level: diagnosticoData.risco || 'médio',
          economy_estimate: 0, // Pode ser calculado depois
        })
        .select()
        .single();

      if (supabaseError) {
        console.error('Erro ao salvar no Supabase:', supabaseError);
        throw new Error('Erro ao salvar diagnóstico');
      }

      // 3. Salvar dados do onboarding no localStorage para uso posterior
      localStorage.setItem('onboardingData', JSON.stringify(answers));
      localStorage.setItem('diagnosticoData', JSON.stringify(diagnosticoData));
      localStorage.setItem('diagnosticoId', savedDiagnostico.id);

      // 4. Navegar para a tela de Diagnóstico Financeiro
      router.push('/diagnostico');
      
    } catch (err) {
      console.error('Erro no processo:', err);
      setError('Erro ao gerar análise. Tente novamente.');
      setLoading(false);
    }
  };

  // Verificar se a resposta atual é válida
  const isCurrentAnswerValid = () => {
    const answer = answers[currentQuestion.key];
    
    // Para campos de texto, apenas verificar se não está vazio
    if (currentQuestion.type === 'text') {
      return answer !== undefined && answer !== '';
    }
    
    // Para campos numéricos, aceitar 0 ou qualquer número positivo
    if (currentQuestion.type === 'number') {
      return answer !== undefined && answer !== '' && !isNaN(Number(answer));
    }
    
    return false;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#246BFD] to-[#A78BFA] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-lg rounded-full px-4 py-2 mb-4">
            <Brain className="w-5 h-5 text-white" />
            <span className="text-white font-semibold">FinMind</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Vamos conhecer você
          </h1>
          <p className="text-white/80">
            Pergunta {currentStep + 1} de {questions.length}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/20 rounded-full h-2 mb-8">
          <div
            className="bg-white h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1F1F1F] mb-6">
            {currentQuestion.question}
          </h2>
          <input
            type={currentQuestion.type}
            placeholder={currentQuestion.placeholder}
            value={answers[currentQuestion.key] || ''}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl text-lg focus:border-[#246BFD] focus:outline-none transition-colors"
            autoFocus
            min={currentQuestion.type === 'number' ? '0' : undefined}
          />
          {currentQuestion.type === 'number' && (
            <p className="text-sm text-gray-500 mt-2">
              💡 Você pode digitar 0 se não tiver valor para esta pergunta
            </p>
          )}
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-4">
          {currentStep > 0 && (
            <button
              onClick={handleBack}
              disabled={loading}
              className="flex items-center gap-2 bg-white/10 backdrop-blur-lg text-white px-6 py-3 rounded-full hover:bg-white/20 transition-all disabled:opacity-50"
            >
              <ArrowLeft className="w-5 h-5" />
              Voltar
            </button>
          )}
          
          {currentStep < questions.length - 1 ? (
            <button
              onClick={handleNext}
              disabled={!isCurrentAnswerValid()}
              className="flex-1 flex items-center justify-center gap-2 bg-white text-[#246BFD] px-6 py-3 rounded-full font-semibold hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Próxima
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!isCurrentAnswerValid() || loading}
              className="flex-1 flex items-center justify-center gap-2 bg-[#4CCB92] text-white px-6 py-3 rounded-full font-semibold hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Gerando análise...
                </>
              ) : (
                <>
                  Gerar minha análise
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
