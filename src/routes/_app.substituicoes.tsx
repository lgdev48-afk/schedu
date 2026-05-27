import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AlertCircle, CheckCircle2, ArrowRight, Loader2, Trash2 } from "lucide-react";
import { useSchedu, DAYS } from "@/components/schedu/store";
import { PageShell } from "@/components/schedu/PageShell";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/_app/substituicoes")({
  head: () => ({ meta: [{ title: "Substituições — Schedu" }] }),
  component: SubsPage,
});

function SubsPage() {
  const { schedule, selectBlock, scheduleLoading, scheduleError, removeAbsence } = useSchedu();
  const navigate = useNavigate();

  const items = DAYS.flatMap((d) =>
    Object.entries(schedule[d.key] ?? {})
      .filter(([, b]) => b && (b.status === "absence" || b.status === "substituted"))
      .map(([time, b]) => ({ day: d.key, dayLabel: d.label, time, block: b! }))
  );

  const open = items.filter((i) => i.block.status === "absence");
  const covered = items.filter((i) => i.block.status === "substituted");

  function goToBlock(day: typeof DAYS[number]["key"], time: string) {
    selectBlock({ day, time });
    navigate({ to: "/" });
  }

  if (scheduleError) {
    return (
      <PageShell title="Substituições">
        <div className="bg-card border border-destructive/30 rounded-xl p-6 text-center">
          <p className="text-sm font-semibold text-destructive">Erro ao carregar substituições</p>
          <p className="text-xs text-muted-foreground mt-1">{scheduleError.message}</p>
        </div>
      </PageShell>
    );
  }

  if (scheduleLoading) {
    return (
      <PageShell title="Substituições">
        <div className="flex justify-center py-12 text-muted-foreground"><Loader2 className="size-5 animate-spin" /></div>
      </PageShell>
    );
  }

  return (
    <PageShell title="Substituições" description={`${open.length} em aberto · ${covered.length} cobertas`}>
      <section className="mb-8">
        <h2 className="text-[10px] font-bold uppercase tracking-widest text-accent mb-3">Em aberto</h2>
        {open.length === 0 ? (
          <p className="text-sm text-muted-foreground bg-card border border-border rounded-xl p-6">Nenhuma ausência em aberto.</p>
        ) : (
          <div className="grid gap-3">
            {open.map((i) => (
              <div key={i.day + i.time} className="bg-card border border-accent/30 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-lg bg-accent/10 text-accent grid place-items-center">
                    <AlertCircle className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{i.block.subject} · {i.block.className}</p>
                    <p className="text-xs text-muted-foreground">{i.dayLabel}, {i.time} · {i.block.room} · prof. {i.block.teacher}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => goToBlock(i.day, i.time)} className="text-xs font-semibold text-accent hover:underline flex items-center gap-1">
                    Buscar substituto <ArrowRight className="size-3.5" />
                  </button>
                  <RemoveAbsenceButton onConfirm={() => removeAbsence(i.block.id)} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-[10px] font-bold uppercase tracking-widest text-success-foreground mb-3">Cobertas</h2>
        {covered.length === 0 ? (
          <p className="text-sm text-muted-foreground bg-card border border-border rounded-xl p-6">Nenhuma substituição registrada ainda.</p>
        ) : (
          <div className="grid gap-3">
            {covered.map((i) => (
              <div key={i.day + i.time} className="bg-success-soft border border-success/20 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-lg bg-success/15 text-success-foreground grid place-items-center">
                    <CheckCircle2 className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{i.block.subject} · {i.block.className}</p>
                    <p className="text-xs text-muted-foreground">{i.dayLabel}, {i.time} · {i.block.substitute}</p>
                  </div>
                </div>
                <RemoveAbsenceButton onConfirm={() => removeAbsence(i.block.id)} />
              </div>
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}

function RemoveAbsenceButton({ onConfirm }: { onConfirm: () => void | Promise<void> }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          type="button"
          aria-label="Remover ausência"
          className="size-8 rounded-md grid place-items-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <Trash2 className="size-4" />
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remover ausência?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação remove o registro do bloco da grade. Não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={() => onConfirm()}>Remover</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
