import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  users: {
    id: string;
    name: string;
    email: string;
    password_hash: string;
    income: number;
    gastos_essenciais: number;
    financial_goal_main: string;
    faixa_etaria: string;
    nivel_conhecimento: string;
    created_at: string;
  };
  transactions: {
    id: string;
    user_id: string;
    type: 'entrada' | 'saida';
    category: string;
    value: number;
    date: string;
    description: string;
    recurring: boolean;
    periodicity: string;
    created_at: string;
  };
  goals: {
    id: string;
    user_id: string;
    title: string;
    total_value: number;
    saved_value: number;
    deadline: string;
    priority: string;
    status: string;
  };
  diagnostics: {
    id: string;
    user_id: string;
    month: string;
    summary: string;
    insights: string;
    suggestions: string;
    economy_estimate: number;
    risk_level: string;
  };
  ai_context: {
    id: string;
    user_id: string;
    context_json: any;
    last_updated: string;
  };
  alerts: {
    id: string;
    user_id: string;
    type: string;
    message: string;
    severity: string;
    read: boolean;
  };
  chat_messages: {
    id: string;
    user_id: string;
    role: 'user' | 'assistant';
    message: string;
    created_at: string;
  };
};
