import { supabase } from "./client";
import { getCurrentUserId } from "./auth.service";
import type { Teacher } from "@/types/schedu";

export async function listTeachers(): Promise<Teacher[]> {
  const { data, error } = await supabase
    .from("teachers")
    .select("id,name,subject,email")
    .order("name", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createTeacher(input: Omit<Teacher, "id">): Promise<Teacher> {
  const owner_id = await getCurrentUserId();
  const { data, error } = await supabase
    .from("teachers")
    .insert({ ...input, owner_id })
    .select("id,name,subject,email")
    .single();
  if (error) throw error;
  return data;
}

export async function deleteTeacher(id: string): Promise<void> {
  const { error } = await supabase.from("teachers").delete().eq("id", id);
  if (error) throw error;
}
