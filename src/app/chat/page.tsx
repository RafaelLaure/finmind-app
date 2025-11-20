'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, Brain, Sparkles } from 'lucide-react';
import type { OnboardingData, ChatMessage, Diagnostico, PlanoFinanceiro, Meta, Checklist } from '@/lib/types';

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<OnboardingData | null>(null);
  const [userId, setUserId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Carregar dados do usuário
    const savedData = localStorage.getItem('onboardingData');
    if (!savedData) {
      router.push('/onboarding');
      return;
    }

    const parsedData = JSON.parse(savedData);
    setUserData(parsedData);

    // Gerar userId único baseado nos dados do usuário
    const generatedUserId = `user_${parsedData.renda}_${parsedData.objetivo.substring(0, 10)}`;
    setUserId(generatedUserId);

    // Carregar histórico do Supabase
    loadChatHistory(generatedUserId);
  }, [router]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatHistory = async (uid: string) => {
    try {
      const response = await fetch(`/api/chat?userId=${uid}`);
      const data = await response.json();

      if (data.messages && data.messages.length > 0) {
        setMessages(data.messages);
      } else {
        // Mensagem de boas-vindas inicial
        const welcomeMessage: ChatMessage = {
          id: '1',
          role: 'assistant',
          message: `Olá! 👋 Sou o FinMind, seu assistente financeiro pessoal.\n\nEstou aqui para te ajudar com qualquer dúvida sobre suas finanças. Posso te ajudar a:\n\n✅ Entender melhor seu diagnóstico financeiro\n✅ Tirar dúvidas sobre seu plano financeiro\n✅ Acompanhar suas metas\n✅ Dar dicas práticas personalizadas\n\nComo posso te ajudar hoje?`,
          created_at: new Date().toISOString(),
        };
        setMessages([welcomeMessage]);
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      // Mensagem de boas-vindas em caso de erro
      const welcomeMessage: ChatMessage = {
        id: '1',
        role: 'assistant',
        message: `Olá! 👋 Sou o FinMind, seu assistente financeiro pessoal.\n\nEstou aqui para te ajudar com qualquer dúvida sobre suas finanças. Como posso te ajudar hoje?`,
        created_at: new Date().toISOString(),
      };
      setMessages([welcomeMessage]);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!input.trim() || loading || !userData) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      message: input,
      created_at: new Date().toISOString(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      // Carregar todos os dados do usuário do localStorage
      const diagnostico: Diagnostico | null = JSON.parse(localStorage.getItem('diagnostico') || 'null');
      const planoFinanceiro: PlanoFinanceiro | null = JSON.parse(localStorage.getItem('planoFinanceiro') || 'null');
      const metas: Meta[] = JSON.parse(localStorage.getItem('metas') || '[]');
      const checklist: Checklist | null = JSON.parse(localStorage.getItem('checklist') || 'null');

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mensagem: input,
          userId,
          onboarding: userData,
          diagnostico,
          planoFinanceiro,
          metas,
          checklist,
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        message: data.response,
        created_at: new Date().toISOString(),
      };

      const updatedMessages = [...newMessages, assistantMessage];
      setMessages(updatedMessages);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        message: 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.',
        created_at: new Date().toISOString(),
      };
      const updatedMessages = [...newMessages, errorMessage];
      setMessages(updatedMessages);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1A2E] via-[#16213E] to-[#0F3460] flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#246BFD] to-[#A78BFA] p-4 flex-shrink-0 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          
          <div className="bg-white/20 backdrop-blur-sm rounded-full w-12 h-12 flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white">FinMind Assistant</h1>
              <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
            </div>
            <p className="text-white/80 text-xs">Assistente financeiro inteligente</p>
          </div>

          <div className="flex items-center gap-2 bg-green-500/20 px-3 py-1 rounded-full">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-white text-xs font-medium">Online</span>
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto p-4 pb-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 shadow-lg ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-[#246BFD] to-[#1E5AE0] text-white'
                    : 'bg-white/10 backdrop-blur-md text-white border border-white/20'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/20">
                    <div className="bg-gradient-to-br from-[#4CCB92] to-[#3BA876] rounded-full p-1">
                      <Brain className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm text-white/90 font-semibold">FinMind</span>
                  </div>
                )}
                <div className="whitespace-pre-wrap leading-relaxed text-sm sm:text-base">
                  {message.message}
                </div>
                <p className="text-xs text-white/50 mt-3 text-right">
                  {new Date(message.created_at).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start animate-fadeIn">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-[#4CCB92] to-[#3BA876] rounded-full p-1">
                    <Brain className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-white/70 text-sm">Pensando...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input */}
      <div className="flex-shrink-0 bg-[#1A1A2E]/80 backdrop-blur-md border-t border-white/10 p-4 shadow-2xl">
        <div className="max-w-4xl mx-auto flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua pergunta sobre finanças..."
            className="flex-1 bg-white/10 backdrop-blur-sm text-white placeholder-white/50 rounded-full px-6 py-3 focus:outline-none focus:ring-2 focus:ring-[#246BFD] border border-white/20 transition-all"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="bg-gradient-to-r from-[#246BFD] to-[#A78BFA] text-white rounded-full w-12 h-12 flex items-center justify-center hover:scale-105 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
