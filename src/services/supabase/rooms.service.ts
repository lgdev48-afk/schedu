import { supabase } from "./client";
import { getCurrentUserId } from "./auth.service";
import type { Room } from "@/types/schedu";

export async function listRooms(): Promise<Room[]> {
  const { data, error } = await supabase
    .from("rooms")
    .select("id,name,capacity,type")
    .order("name", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createRoom(input: Omit<Room, "id">): Promise<Room> {
  const owner_id = await getCurrentUserId();
  const { data, error } = await supabase
    .from("rooms")
    .insert({ ...input, owner_id })
    .select("id,name,capacity,type")
    .single();
  if (error) throw error;
  return data;
}

export async function deleteRoom(id: string): Promise<void> {
  const { error } = await supabase.from("rooms").delete().eq("id", id);
  if (error) throw error;
}
