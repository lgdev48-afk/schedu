import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2, Search, Loader2 } from "lucide-react";
import { useSchedu } from "@/components/schedu/store";
import { PageShell } from "@/components/schedu/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/_app/professores")({
  head: () => ({ meta: [{ title: "Professores — Schedu" }] }),
  component: TeachersPage,
});

function TeachersPage() {
  const { teachers, teachersLoading, teachersError, addTeacher, removeTeacher } = useSchedu();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", subject: "", email: "" });

  const filtered = teachers.filter((t) =>
    `${t.name} ${t.subject} ${t.email}`.toLowerCase().includes(q.toLowerCase())
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name) return;
    setSubmitting(true);
    try {
      await addTeacher(form);
      setForm({ name: "", subject: "", email: "" });
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageShell
      title="Professores"
      description={teachersLoading ? "Carregando..." : `${teachers.length} cadastrados`}
      action={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="size-4" /> Novo professor</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cadastrar professor</DialogTitle>
              <DialogDescription>Adicione um novo professor ao corpo docente.</DialogDescription>
            </DialogHeader>
            <form onSubmit={submit} className="grid gap-4">
              <div className="grid gap-1.5">
                <Label>Nome</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nome completo" required />
              </div>
              <div className="grid gap-1.5">
                <Label>Disciplina principal</Label>
                <Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Matemática" />
              </div>
              <div className="grid gap-1.5">
                <Label>E-mail</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@escola.edu" />
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
      <div className="mb-4 relative max-w-sm">
        <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar professor..." className="pl-9" />
      </div>

      {teachersError ? (
        <div className="bg-card border border-destructive/30 rounded-xl p-6 text-center">
          <p className="text-sm font-semibold text-destructive">Erro ao carregar professores</p>
          <p className="text-xs text-muted-foreground mt-1">{teachersError.message}</p>
        </div>
      ) : teachersLoading ? (
        <div className="bg-card border border-border rounded-xl p-12 flex justify-center text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr className="text-left text-[10px] uppercase tracking-widest text-muted-foreground">
                <th className="px-4 py-3 font-semibold">Nome</th>
                <th className="px-4 py-3 font-semibold">Disciplina</th>
                <th className="px-4 py-3 font-semibold">E-mail</th>
                <th className="px-4 py-3 w-20" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-full bg-primary-soft text-primary grid place-items-center text-[11px] font-bold">
                        {t.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                      </div>
                      {t.name}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{t.subject || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{t.email || "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <button type="button" onClick={() => removeTeacher(t.id)} className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  {teachers.length === 0 ? "Nenhum professor cadastrado ainda." : "Nenhum professor encontrado."}
                </td></tr>
              ) : null}
            </tbody>
          </table>
        </div>
      )}
    </PageShell>
  );
}
