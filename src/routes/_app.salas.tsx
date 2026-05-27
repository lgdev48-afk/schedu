import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2, DoorOpen, Loader2 } from "lucide-react";
import { useSchedu } from "@/components/schedu/store";
import { PageShell } from "@/components/schedu/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/_app/salas")({
  head: () => ({ meta: [{ title: "Salas — Schedu" }] }),
  component: RoomsPage,
});

const TYPES = ["Sala comum", "Laboratório", "Auditório", "Esportiva", "Especial"];

function RoomsPage() {
  const { rooms, roomsLoading, roomsError, addRoom, removeRoom } = useSchedu();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", capacity: 30, type: "Sala comum" });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name) return;
    setSubmitting(true);
    try {
      await addRoom({ ...form, capacity: Number(form.capacity) });
      setForm({ name: "", capacity: 30, type: "Sala comum" });
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageShell
      title="Salas"
      description={roomsLoading ? "Carregando..." : `${rooms.length} espaços cadastrados`}
      action={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="size-4" /> Nova sala</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cadastrar sala</DialogTitle>
              <DialogDescription>Adicione um espaço físico.</DialogDescription>
            </DialogHeader>
            <form onSubmit={submit} className="grid gap-4">
              <div className="grid gap-1.5">
                <Label>Identificação</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Sala 305" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label>Tipo</Label>
                  <select className="h-9 rounded-md border border-input bg-background px-2 text-sm" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    {TYPES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div className="grid gap-1.5">
                  <Label>Capacidade</Label>
                  <Input type="number" min={1} value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={submitting}>{submitting ? "Salvando..." : "Salvar"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      }
    >
      {roomsError ? (
        <div className="bg-card border border-destructive/30 rounded-xl p-6 text-center">
          <p className="text-sm font-semibold text-destructive">Erro ao carregar salas</p>
          <p className="text-xs text-muted-foreground mt-1">{roomsError.message}</p>
        </div>
      ) : roomsLoading ? (
        <div className="bg-card border border-border rounded-xl p-12 flex justify-center text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
        </div>
      ) : rooms.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-xl p-12 text-center text-sm text-muted-foreground">
          Nenhuma sala cadastrada ainda.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {rooms.map((r) => (
            <div key={r.id} className="bg-card border border-border rounded-xl p-5 hover:shadow-card transition-shadow group">
              <div className="flex items-start justify-between mb-3">
                <div className="size-10 rounded-lg bg-primary-soft text-primary grid place-items-center">
                  <DoorOpen className="size-5" />
                </div>
                <button type="button" onClick={() => removeRoom(r.id)} className="p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all">
                  <Trash2 className="size-4" />
                </button>
              </div>
              <p className="font-bold tracking-tight">{r.name}</p>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">{r.type}</p>
              <p className="text-xs text-muted-foreground mt-3">Capacidade: <span className="font-semibold text-foreground">{r.capacity}</span></p>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}
