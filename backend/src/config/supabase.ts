import { createClient } from '@supabase/supabase-js';
import { config } from './env';
import type { Database } from '../types/supabase';

export const supabaseAdmin = createClient<Database>(
  config.SUPABASE_URL,
  config.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);
