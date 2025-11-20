import { NextRequest, NextResponse } from 'next/server';
import { generateChecklist } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { renda, gastos, dividas, objetivo, prazo, diagnostico, planoFinanceiro, metas } = body;

    if (!renda || !gastos || !objetivo) {
      return NextResponse.json(
        { error: 'Dados incompletos' },
        { status: 400 }
      );
    }

    // Gerar checklist com IA usando Prompt 4
    const checklist = await generateChecklist({
      renda,
      gastos,
      dividas: dividas || 0,
      objetivo,
      prazo: prazo || '1 ano',
      diagnostico,
      planoFinanceiro,
      metas,
    });

    return NextResponse.json(checklist);
  } catch (error) {
    console.error('Erro ao gerar checklist:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar checklist' },
      { status: 500 }
    );
  }
}
