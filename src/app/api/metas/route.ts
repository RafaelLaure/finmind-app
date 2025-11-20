import { NextResponse } from 'next/server';
import { generateMetas } from '@/lib/openai';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Buscar diagnóstico e plano financeiro do localStorage (passados pelo cliente)
    const diagnostico = data.diagnostico || null;
    const planoFinanceiro = data.planoFinanceiro || null;
    
    // Gerar metas com IA usando Prompt 3
    const resultado = await generateMetas({
      renda: data.renda,
      gastos: data.gastos,
      dividas: data.dividas,
      objetivo: data.objetivo,
      prazo: data.prazo,
      diagnostico,
      planoFinanceiro
    });

    // Salvar cada meta no Supabase na coleção 'goals'
    const metasSalvas = [];
    
    if (resultado.metas && Array.isArray(resultado.metas)) {
      for (const meta of resultado.metas) {
        const { data: metaSalva, error } = await supabase
          .from('goals')
          .insert({
            user_id: data.userId || '00000000-0000-0000-0000-000000000000', // ID temporário para desenvolvimento
            title: meta.nome,
            total_value: meta.valor_total,
            saved_value: 0, // Começa em 0
            deadline: calcularDeadline(meta.prazo_ideal),
            priority: 'alta',
            status: 'ativa'
          })
          .select()
          .single();

        if (error) {
          console.error('Erro ao salvar meta no Supabase:', error);
        } else {
          metasSalvas.push({
            id: metaSalva.id,
            nome: meta.nome,
            valor_total: meta.valor_total,
            valor_mensal: meta.valor_mensal,
            prazo_ideal: meta.prazo_ideal,
            justificativa: meta.justificativa,
            saved_value: 0,
            progresso: 0
          });
        }
      }
    }

    return NextResponse.json({ 
      metas: metasSalvas.length > 0 ? metasSalvas : resultado.metas 
    });
  } catch (error) {
    console.error('Erro ao gerar metas:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar metas' },
      { status: 500 }
    );
  }
}

// Função auxiliar para calcular deadline baseado no prazo
function calcularDeadline(prazoIdeal: string): string {
  const hoje = new Date();
  let meses = 12; // padrão 1 ano

  // Extrair número de meses do prazo
  if (prazoIdeal.includes('mês') || prazoIdeal.includes('mes')) {
    const match = prazoIdeal.match(/(\d+)/);
    if (match) meses = parseInt(match[1]);
  } else if (prazoIdeal.includes('ano')) {
    const match = prazoIdeal.match(/(\d+)/);
    if (match) meses = parseInt(match[1]) * 12;
  }

  hoje.setMonth(hoje.getMonth() + meses);
  return hoje.toISOString().split('T')[0];
}
