import { supabase } from "./client";
import { getCurrentUserId } from "./auth.service";
import type { ActivityLog } from "@/types/schedu";

export async function listLogs(limit = 8): Promise<ActivityLog[]> {
  const { data, error } = await supabase
    .from("activity_logs")
    .select("id,color,title,created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    color: r.color,
    title: r.title,
    createdAt: r.created_at,
  }));
}

export async function pushLog(input: { color: string; title: string }): Promise<void> {
  const owner_id = await getCurrentUserId();
  const { error } = await supabase.from("activity_logs").insert({ ...input, owner_id });
  if (error) throw error;
}
