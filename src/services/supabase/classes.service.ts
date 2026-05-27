import { supabase } from "./client";
import { getCurrentUserId } from "./auth.service";
import type { ClassRoom } from "@/types/schedu";

export async function listClasses(): Promise<ClassRoom[]> {
  const { data, error } = await supabase
    .from("classes")
    .select("id,name,grade,students")
    .order("name", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createClass(input: Omit<ClassRoom, "id">): Promise<ClassRoom> {
  const owner_id = await getCurrentUserId();
  const { data, error } = await supabase
    .from("classes")
    .insert({ ...input, owner_id })
    .select("id,name,grade,students")
    .single();
  if (error) throw error;
  return data;
}

export async function deleteClass(id: string): Promise<void> {
  const { error } = await supabase.from("classes").delete().eq("id", id);
  if (error) throw error;
}
