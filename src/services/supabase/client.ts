// Re-export do cliente Supabase já gerenciado pelo Lovable Cloud.
// Não importe diretamente de "@supabase/supabase-js" — use este client
// para garantir a configuração padrão (auth, persistência, env vars).
export { supabase } from "@/integrations/supabase/client";
