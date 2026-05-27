export type Day = "Seg" | "Ter" | "Qua" | "Qui" | "Sex";

export const DAYS: { key: Day; label: string }[] = [
  { key: "Seg", label: "Segunda" },
  { key: "Ter", label: "Terça" },
  { key: "Qua", label: "Quarta" },
  { key: "Qui", label: "Quinta" },
  { key: "Sex", label: "Sexta" },
];

export const TIMES = ["07:30", "08:30", "09:30", "10:45", "11:45"];

export type BlockStatus = "normal" | "absence" | "substituted";

export interface ScheduleBlock {
  id: string;
  day: Day;
  time: string;
  subject: string;
  className: string;
  teacher: string;
  room: string;
  status: BlockStatus;
  substitute: string | null;
}

export type BlockKey = { day: Day; time: string };

export interface Teacher {
  id: string;
  name: string;
  subject: string;
  email: string;
}

export interface ClassRoom {
  id: string;
  name: string;
  grade: string;
  students: number;
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
  type: string;
}

export interface ActivityLog {
  id: string;
  color: string;
  title: string;
  createdAt: string;
}

export interface Settings {
  schoolName: string;
  autoMatch: boolean;
  notifyEmail: boolean;
  notifyPush: boolean;
}
