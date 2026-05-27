import { useState } from "react";
import { Plus } from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useSchedu, DAYS, TIMES, type Day } from "./store";

export function NewAbsenceDialog() {
  const { addAbsence } = useSchedu();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    day: "Seg" as Day, time: "07:30",
    subject: "", className: "", teacher: "", room: "",
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.subject || !form.teacher) return;
    setSubmitting(true);
    try {
      await addAbsence(
        { day: form.day, time: form.time },
        { subject: form.subject, className: form.className, teacher: form.teacher, room: form.room },
      );
      setOpen(false);
      setForm({ day: "Seg", time: "07:30", subject: "", className: "", teacher: "", room: "" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg font-medium shadow-card hover:bg-primary/90 transition-all flex items-center gap-2">
          <Plus className="size-4" />
          Nova ausência
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar ausência</DialogTitle>
          <DialogDescription>
            Marque um horário como ausência aberta para iniciar o matching de substitutos.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Dia</Label>
              <select
                className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                value={form.day}
                onChange={(e) => setForm({ ...form, day: e.target.value as Day })}
              >
                {DAYS.map((d) => <option key={d.key} value={d.key}>{d.label}</option>)}
              </select>
            </div>
            <div className="grid gap-1.5">
              <Label>Horário</Label>
              <select
                className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
              >
                {TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label>Disciplina</Label>
            <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Ex.: Matemática" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Turma</Label>
              <Input value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value })} placeholder="9º A" />
            </div>
            <div className="grid gap-1.5">
              <Label>Sala</Label>
              <Input value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} placeholder="Sala 204" />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label>Professor ausente</Label>
            <Input value={form.teacher} onChange={(e) => setForm({ ...form, teacher: e.target.value })} placeholder="Nome" required />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={submitting}>{submitting ? "Salvando..." : "Registrar ausência"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
