import { NextResponse } from 'next/server';
import { chatWithAI } from '@/lib/openai';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { mensagem, userId, onboarding, diagnostico, planoFinanceiro, metas, checklist } = body;

    // Gerar resposta da IA com contexto completo
    const response = await chatWithAI({
      mensagem,
      onboarding,
      diagnostico,
      planoFinanceiro,
      metas,
      checklist,
    });

    // Salvar mensagem do usuário no Supabase
    if (userId) {
      await supabase.from('chat_messages').insert({
        user_id: userId,
        role: 'user',
        message: mensagem,
      });

      // Salvar resposta da IA no Supabase
      await supabase.from('chat_messages').insert({
        user_id: userId,
        role: 'assistant',
        message: response,
      });
    }

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Erro no chat:', error);
    return NextResponse.json(
      { error: 'Erro ao processar mensagem' },
      { status: 500 }
    );
  }
}

// Endpoint para buscar histórico de mensagens
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId é obrigatório' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ messages: data || [] });
  } catch (error) {
    console.error('Erro ao buscar mensagens:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar histórico' },
      { status: 500 }
    );
  }
}
