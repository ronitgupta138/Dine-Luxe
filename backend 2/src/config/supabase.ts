import { createClient } from '@supabase/supabase-js';
import { config } from './env';

export const supabaseAdmin = createClient<any>(
  config.SUPABASE_URL,
  config.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);
