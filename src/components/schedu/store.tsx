import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { BlockKey, ScheduleBlock, Settings, Teacher, ClassRoom, Room, ActivityLog, Day } from "@/types/schedu";
import { DAYS, TIMES } from "@/types/schedu";
import * as teachersSvc from "@/services/supabase/teachers.service";
import * as classesSvc from "@/services/supabase/classes.service";
import * as roomsSvc from "@/services/supabase/rooms.service";
import * as scheduleSvc from "@/services/supabase/schedule.service";
import * as logsSvc from "@/services/supabase/logs.service";
import * as settingsSvc from "@/services/supabase/settings.service";

export { DAYS, TIMES };
export type { BlockKey, ScheduleBlock, Settings, Teacher, ClassRoom, Room, ActivityLog, Day };

type ScheduleMap = Record<Day, Record<string, ScheduleBlock | undefined>>;

function toMap(blocks: ScheduleBlock[]): ScheduleMap {
  const map: ScheduleMap = { Seg: {}, Ter: {}, Qua: {}, Qui: {}, Sex: {} };
  for (const b of blocks) {
    if (map[b.day]) map[b.day][b.time] = b;
  }
  return map;
}

interface Ctx {
  // schedule
  schedule: ScheduleMap;
  blocks: ScheduleBlock[];
  scheduleLoading: boolean;
  scheduleError: Error | null;
  selected: BlockKey | null;
  selectBlock: (k: BlockKey | null) => void;
  assignSubstitute: (k: BlockKey, substituteName: string) => Promise<void>;
  addAbsence: (k: BlockKey, data: { subject: string; className: string; teacher: string; room: string }) => Promise<void>;
  removeAbsence: (blockId: string) => Promise<void>;

  // logs
  logs: ActivityLog[];
  logsLoading: boolean;
  pushLog: (l: { color: string; title: string }) => Promise<void>;

  // entities
  teachers: Teacher[];
  teachersLoading: boolean;
  teachersError: Error | null;
  addTeacher: (t: Omit<Teacher, "id">) => Promise<void>;
  removeTeacher: (id: string) => Promise<void>;

  classes: ClassRoom[];
  classesLoading: boolean;
  classesError: Error | null;
  addClass: (c: Omit<ClassRoom, "id">) => Promise<void>;
  removeClass: (id: string) => Promise<void>;

  rooms: Room[];
  roomsLoading: boolean;
  roomsError: Error | null;
  addRoom: (r: Omit<Room, "id">) => Promise<void>;
  removeRoom: (id: string) => Promise<void>;

  settings: Settings;
  settingsLoading: boolean;
  updateSettings: (s: Partial<Settings>) => Promise<void>;
}

const ScheduCtx = createContext<Ctx | null>(null);

const DEFAULT_SETTINGS: Settings = {
  schoolName: "Minha escola",
  autoMatch: true,
  notifyEmail: true,
  notifyPush: false,
};

export function ScheduProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<BlockKey | null>(null);

  const teachersQ = useQuery({ queryKey: ["teachers"], queryFn: teachersSvc.listTeachers });
  const classesQ = useQuery({ queryKey: ["classes"], queryFn: classesSvc.listClasses });
  const roomsQ = useQuery({ queryKey: ["rooms"], queryFn: roomsSvc.listRooms });
  const scheduleQ = useQuery({ queryKey: ["schedule"], queryFn: scheduleSvc.listBlocks });
  const logsQ = useQuery({ queryKey: ["logs"], queryFn: () => logsSvc.listLogs(8) });
  const settingsQ = useQuery({ queryKey: ["settings"], queryFn: settingsSvc.getSettings });

  const schedule = useMemo(() => toMap(scheduleQ.data ?? []), [scheduleQ.data]);

  function handleError(action: string) {
    return (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      toast.error(`Erro ao ${action}`, { description: msg });
    };
  }

  // Mutations -- entities
  const addTeacherM = useMutation({
    mutationFn: teachersSvc.createTeacher,
    onSuccess: (t) => { toast.success("Professor adicionado", { description: t.name }); qc.invalidateQueries({ queryKey: ["teachers"] }); },
    onError: handleError("adicionar professor"),
  });
  const removeTeacherM = useMutation({
    mutationFn: teachersSvc.deleteTeacher,
    onSuccess: () => { toast.success("Professor removido"); qc.invalidateQueries({ queryKey: ["teachers"] }); },
    onError: handleError("remover professor"),
  });

  const addClassM = useMutation({
    mutationFn: classesSvc.createClass,
    onSuccess: (c) => { toast.success("Turma adicionada", { description: c.name }); qc.invalidateQueries({ queryKey: ["classes"] }); },
    onError: handleError("adicionar turma"),
  });
  const removeClassM = useMutation({
    mutationFn: classesSvc.deleteClass,
    onSuccess: () => { toast.success("Turma removida"); qc.invalidateQueries({ queryKey: ["classes"] }); },
    onError: handleError("remover turma"),
  });

  const addRoomM = useMutation({
    mutationFn: roomsSvc.createRoom,
    onSuccess: (r) => { toast.success("Sala adicionada", { description: r.name }); qc.invalidateQueries({ queryKey: ["rooms"] }); },
    onError: handleError("adicionar sala"),
  });
  const removeRoomM = useMutation({
    mutationFn: roomsSvc.deleteRoom,
    onSuccess: () => { toast.success("Sala removida"); qc.invalidateQueries({ queryKey: ["rooms"] }); },
    onError: handleError("remover sala"),
  });

  const updateSettingsM = useMutation({
    mutationFn: settingsSvc.saveSettings,
    onSuccess: () => { toast.success("Configurações salvas"); qc.invalidateQueries({ queryKey: ["settings"] }); },
    onError: handleError("salvar configurações"),
  });

  const value = useMemo<Ctx>(() => ({
    schedule,
    blocks: scheduleQ.data ?? [],
    scheduleLoading: scheduleQ.isLoading,
    scheduleError: (scheduleQ.error as Error | null) ?? null,
    selected,
    selectBlock: setSelected,

    assignSubstitute: async (k, name) => {
      const block = schedule[k.day]?.[k.time];
      if (!block) return;
      try {
        await scheduleSvc.setBlockSubstitute(block.id, name, block.teacher);
        await logsSvc.pushLog({ color: "bg-success", title: `${name} aceitou substituição` });
        toast.success("Substituto convocado", { description: `${name} foi notificado(a).` });
        qc.invalidateQueries({ queryKey: ["schedule"] });
        qc.invalidateQueries({ queryKey: ["logs"] });
      } catch (err) {
        handleError("convocar substituto")(err);
      }
    },

    addAbsence: async (k, data) => {
      try {
        await scheduleSvc.upsertBlock({ key: k, data: { ...data, status: "absence" } });
        await logsSvc.pushLog({ color: "bg-accent", title: `Nova ausência: ${data.subject} (${data.className})` });
        toast.success("Ausência registrada", { description: `${data.teacher} · ${k.day} ${k.time}` });
        setSelected(k);
        qc.invalidateQueries({ queryKey: ["schedule"] });
        qc.invalidateQueries({ queryKey: ["logs"] });
      } catch (err) {
        handleError("registrar ausência")(err);
      }
    },

    removeAbsence: async (blockId) => {
      try {
        await scheduleSvc.deleteBlock(blockId);
        await logsSvc.pushLog({ color: "bg-muted-foreground", title: "Ausência removida" });
        toast.success("Ausência removida");
        setSelected(null);
        qc.invalidateQueries({ queryKey: ["schedule"] });
        qc.invalidateQueries({ queryKey: ["logs"] });
      } catch (err) {
        handleError("remover ausência")(err);
      }
    },

    logs: logsQ.data ?? [],
    logsLoading: logsQ.isLoading,
    pushLog: async (l) => {
      try {
        await logsSvc.pushLog(l);
        qc.invalidateQueries({ queryKey: ["logs"] });
      } catch (err) {
        handleError("registrar atividade")(err);
      }
    },

    teachers: teachersQ.data ?? [],
    teachersLoading: teachersQ.isLoading,
    teachersError: (teachersQ.error as Error | null) ?? null,
    addTeacher: async (t) => { await addTeacherM.mutateAsync(t); },
    removeTeacher: async (id) => { await removeTeacherM.mutateAsync(id); },

    classes: classesQ.data ?? [],
    classesLoading: classesQ.isLoading,
    classesError: (classesQ.error as Error | null) ?? null,
    addClass: async (c) => { await addClassM.mutateAsync(c); },
    removeClass: async (id) => { await removeClassM.mutateAsync(id); },

    rooms: roomsQ.data ?? [],
    roomsLoading: roomsQ.isLoading,
    roomsError: (roomsQ.error as Error | null) ?? null,
    addRoom: async (r) => { await addRoomM.mutateAsync(r); },
    removeRoom: async (id) => { await removeRoomM.mutateAsync(id); },

    settings: settingsQ.data ?? DEFAULT_SETTINGS,
    settingsLoading: settingsQ.isLoading,
    updateSettings: async (s) => { await updateSettingsM.mutateAsync(s); },
  }), [
    schedule, scheduleQ.data, scheduleQ.isLoading, scheduleQ.error,
    selected, qc,
    logsQ.data, logsQ.isLoading,
    teachersQ.data, teachersQ.isLoading, teachersQ.error,
    classesQ.data, classesQ.isLoading, classesQ.error,
    roomsQ.data, roomsQ.isLoading, roomsQ.error,
    settingsQ.data, settingsQ.isLoading,
    addTeacherM, removeTeacherM, addClassM, removeClassM, addRoomM, removeRoomM, updateSettingsM,
  ]);

  return <ScheduCtx.Provider value={value}>{children}</ScheduCtx.Provider>;
}

export function useSchedu() {
  const ctx = useContext(ScheduCtx);
  if (!ctx) throw new Error("useSchedu must be used inside ScheduProvider");
  return ctx;
}
