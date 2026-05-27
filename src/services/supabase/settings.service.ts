import { supabase } from "./client";
import { getCurrentUserId } from "./auth.service";
import type { Settings } from "@/types/schedu";

const DEFAULTS: Settings = {
  schoolName: "Minha escola",
  autoMatch: true,
  notifyEmail: true,
  notifyPush: false,
};

export async function getSettings(): Promise<Settings> {
  const user_id = await getCurrentUserId();
  const { data, error } = await supabase
    .from("user_settings")
    .select("school_name,auto_match,notify_email,notify_push")
    .eq("user_id", user_id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return DEFAULTS;
  return {
    schoolName: data.school_name,
    autoMatch: data.auto_match,
    notifyEmail: data.notify_email,
    notifyPush: data.notify_push,
  };
}

export async function saveSettings(patch: Partial<Settings>): Promise<Settings> {
  const user_id = await getCurrentUserId();
  const current = await getSettings();
  const merged = { ...current, ...patch };
  const { error } = await supabase.from("user_settings").upsert({
    user_id,
    school_name: merged.schoolName,
    auto_match: merged.autoMatch,
    notify_email: merged.notifyEmail,
    notify_push: merged.notifyPush,
  });
  if (error) throw error;
  return merged;
}
