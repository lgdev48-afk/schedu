import { supabase } from "./client";
import { getCurrentUserId } from "./auth.service";
import type { BlockKey, BlockStatus, Day, ScheduleBlock } from "@/types/schedu";

type Row = {
  id: string;
  day: Day;
  time: string;
  subject: string;
  class_name: string;
  teacher: string;
  room: string;
  status: BlockStatus;
  substitute: string | null;
};

function fromRow(r: Row): ScheduleBlock {
  return {
    id: r.id,
    day: r.day,
    time: r.time,
    subject: r.subject,
    className: r.class_name,
    teacher: r.teacher,
    room: r.room,
    status: r.status,
    substitute: r.substitute,
  };
}

export async function listBlocks(): Promise<ScheduleBlock[]> {
  const { data, error } = await supabase
    .from("schedule_blocks")
    .select("id,day,time,subject,class_name,teacher,room,status,substitute");
  if (error) throw error;
  return (data ?? []).map((r) => fromRow(r as Row));
}

export async function upsertBlock(input: {
  key: BlockKey;
  data: { subject: string; className: string; teacher: string; room: string; status?: BlockStatus; substitute?: string | null };
}): Promise<ScheduleBlock> {
  const owner_id = await getCurrentUserId();
  const payload = {
    owner_id,
    day: input.key.day,
    time: input.key.time,
    subject: input.data.subject,
    class_name: input.data.className,
    teacher: input.data.teacher,
    room: input.data.room,
    status: input.data.status ?? "normal",
    substitute: input.data.substitute ?? null,
  };
  const { data, error } = await supabase
    .from("schedule_blocks")
    .upsert(payload, { onConflict: "owner_id,day,time" })
    .select("id,day,time,subject,class_name,teacher,room,status,substitute")
    .single();
  if (error) throw error;
  return fromRow(data as Row);
}

export async function setBlockSubstitute(blockId: string, substituteName: string, originalTeacher: string): Promise<ScheduleBlock> {
  const { data, error } = await supabase
    .from("schedule_blocks")
    .update({ status: "substituted", substitute: `${substituteName} (sub. de ${originalTeacher})` })
    .eq("id", blockId)
    .select("id,day,time,subject,class_name,teacher,room,status,substitute")
    .single();
  if (error) throw error;
  return fromRow(data as Row);
}

export async function deleteBlock(blockId: string): Promise<void> {
  const { error } = await supabase.from("schedule_blocks").delete().eq("id", blockId);
  if (error) throw error;
}

export async function clearBlockAbsence(blockId: string): Promise<ScheduleBlock> {
  const { data, error } = await supabase
    .from("schedule_blocks")
    .update({ status: "normal", substitute: null })
    .eq("id", blockId)
    .select("id,day,time,subject,class_name,teacher,room,status,substitute")
    .single();
  if (error) throw error;
  return fromRow(data as Row);
}
