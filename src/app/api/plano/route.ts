import { NextResponse } from 'next/server';
import { generatePlanoFinanceiro } from '@/lib/openai';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Buscar diagnóstico do localStorage se disponível
    const diagnostico = data.diagnostico || null;
    
    // Gerar plano financeiro com IA usando Prompt 2
    const plano = await generatePlanoFinanceiro({
      renda: data.renda,
      gastos: data.gastos,
      dividas: data.dividas,
      objetivo: data.objetivo,
      prazo: data.prazo,
      diagnostico: diagnostico
    });

    // Salvar na coleção financial_plans do Supabase
    // Nota: Para desenvolvimento, usando user_id fixo
    // Em produção, use auth.uid() do Supabase Auth
    const userId = data.userId || '00000000-0000-0000-0000-000000000000';
    
    const { data: savedPlan, error } = await supabase
      .from('financial_plans')
      .insert({
        user_id: userId,
        orcamento_ideal: plano.orcamento_ideal,
        gastos_categoria: plano.gastos_categoria,
        valor_guardar: plano.valor_guardar,
        acoes_reducao: plano.acoes_reducao,
        plano_objetivo: plano.plano_objetivo,
        estrategia_dividas: plano.estrategia_dividas,
        erros_evitar: plano.erros_evitar,
        mensagem_final: plano.mensagem_final,
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao salvar plano no Supabase:', error);
      // Retorna o plano mesmo se falhar ao salvar
      return NextResponse.json(plano);
    }

    return NextResponse.json(plano);
  } catch (error) {
    console.error('Erro ao gerar plano:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar plano financeiro' },
      { status: 500 }
    );
  }
}

// Endpoint para buscar plano existente
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || '00000000-0000-0000-0000-000000000000';

    const { data: plans, error } = await supabase
      .from('financial_plans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      return NextResponse.json({ error: 'Plano não encontrado' }, { status: 404 });
    }

    return NextResponse.json(plans);
  } catch (error) {
    console.error('Erro ao buscar plano:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar plano financeiro' },
      { status: 500 }
    );
  }
}
