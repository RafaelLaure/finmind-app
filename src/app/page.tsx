'use client';

import { Brain, TrendingUp, Target, Shield } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#246BFD] via-[#A78BFA] to-[#4CCB92]">
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-screen">
        {/* Logo */}
        <div className="mb-8 flex items-center gap-3">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-2xl">
            <Brain className="w-10 h-10 text-[#246BFD]" />
          </div>
        </div>

        {/* Título */}
        <h1 className="text-4xl md:text-6xl font-bold text-white text-center mb-4 font-[family-name:var(--font-geist-sans)]">
          FinMind
        </h1>
        <p className="text-xl md:text-2xl text-white/90 text-center mb-3 font-medium">
          O cérebro da sua vida financeira
        </p>
        <p className="text-lg text-white/80 text-center mb-12 max-w-md">
          Organize sua vida financeira em minutos com IA.
        </p>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl w-full">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center">
            <TrendingUp className="w-10 h-10 text-white mx-auto mb-3" />
            <h3 className="text-white font-semibold mb-2">Diagnóstico IA</h3>
            <p className="text-white/80 text-sm">Análise completa da sua situação financeira</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center">
            <Target className="w-10 h-10 text-white mx-auto mb-3" />
            <h3 className="text-white font-semibold mb-2">Metas Inteligentes</h3>
            <p className="text-white/80 text-sm">Planos personalizados para seus objetivos</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 text-center">
            <Shield className="w-10 h-10 text-white mx-auto mb-3" />
            <h3 className="text-white font-semibold mb-2">Assistente 24/7</h3>
            <p className="text-white/80 text-sm">Chat com IA para suas dúvidas financeiras</p>
          </div>
        </div>

        {/* CTA Button */}
        <Link
          href="/onboarding"
          className="bg-white text-[#246BFD] px-12 py-4 rounded-full text-lg font-semibold shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300"
        >
          Começar agora
        </Link>

        {/* Footer */}
        <p className="text-white/60 text-sm mt-12">
          Simples • Rápido • Intuitivo
        </p>
      </div>
    </div>
  );
}
