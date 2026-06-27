import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 환경변수가 없으면 (예: .env 미설정) 계정 기능을 비활성화하고 게임은 그대로 동작
export const supabaseEnabled = Boolean(url && anon && !url.includes('YOUR-PROJECT'));

export const supabase = supabaseEnabled
  ? createClient(url, anon, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;
