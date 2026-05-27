import { supabase } from "./client";

export async function getCurrentUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!data.user) throw new Error("Usuário não autenticado");
  return data.user.id;
}
