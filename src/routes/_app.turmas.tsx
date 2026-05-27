import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2, Users, Loader2 } from "lucide-react";
import { useSchedu } from "@/components/schedu/store";
import { PageShell } from "@/components/schedu/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/_app/turmas")({
  head: () => ({ meta: [{ title: "Turmas — Schedu" }] }),
  component: ClassesPage,
});

function ClassesPage() {
  const { classes, classesLoading, classesError, addClass, removeClass } = useSchedu();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", grade: "Fundamental II", students: 25 });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name) return;
    setSubmitting(true);
    try {
      await addClass({ ...form, students: Number(form.students) });
      setForm({ name: "", grade: "Fundamental II", students: 25 });
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageShell
      title="Turmas"
      description={classesLoading ? "Carregando..." : `${classes.length} turmas ativas`}
      action={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="size-4" /> Nova turma</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cadastrar turma</DialogTitle>
              <DialogDescription>Adicione uma nova turma ao quadro.</DialogDescription>
            </DialogHeader>
            <form onSubmit={submit} className="grid gap-4">
              <div className="grid gap-1.5">
                <Label>Nome</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="9º C" required />
              </div>
              <div className="grid gap-1.5">
                <Label>Segmento</Label>
                <select
                  className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                  value={form.grade}
                  onChange={(e) => setForm({ ...form, grade: e.target.value })}
                >
                  <option>Fundamental I</option>
                  <option>Fundamental II</option>
                  <option>Ensino Médio</option>
                </select>
              </div>
              <div className="grid gap-1.5">
                <Label>Quantidade de alunos</Label>
                <Input type="number" min={1} value={form.students} onChange={(e) => setForm({ ...form, students: Number(e.target.value) })} />
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
      {classesError ? (
        <div className="bg-card border border-destructive/30 rounded-xl p-6 text-center">
          <p className="text-sm font-semibold text-destructive">Erro ao carregar turmas</p>
          <p className="text-xs text-muted-foreground mt-1">{classesError.message}</p>
        </div>
      ) : classesLoading ? (
        <div className="bg-card border border-border rounded-xl p-12 flex justify-center text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
        </div>
      ) : classes.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-xl p-12 text-center text-sm text-muted-foreground">
          Nenhuma turma cadastrada ainda.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {classes.map((c) => (
            <div key={c.id} className="bg-card border border-border rounded-xl p-5 hover:shadow-card transition-shadow group">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-2xl font-bold tracking-tight">{c.name}</p>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">{c.grade}</p>
                </div>
                <button type="button" onClick={() => removeClass(c.id)} className="p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all">
                  <Trash2 className="size-4" />
                </button>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Users className="size-3.5" />
                {c.students} alunos
              </div>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}
