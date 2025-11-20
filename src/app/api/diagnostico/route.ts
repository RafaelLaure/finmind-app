import { NextResponse } from 'next/server';
import { generateDiagnostico } from '@/lib/openai';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const diagnostico = await generateDiagnostico(data);
    return NextResponse.json(diagnostico);
  } catch (error) {
    console.error('Erro ao gerar diagnóstico:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar diagnóstico' },
      { status: 500 }
    );
  }
}
