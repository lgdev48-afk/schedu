import { createFileRoute } from "@tanstack/react-router";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useSchedu, DAYS } from "@/components/schedu/store";
import { PageShell } from "@/components/schedu/PageShell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/relatorios")({
  head: () => ({ meta: [{ title: "Relatórios — Schedu" }] }),
  component: ReportsPage,
});

function ReportsPage() {
  const { blocks, teachers, classes, rooms, scheduleLoading, scheduleError } = useSchedu();

  const total = blocks.length;
  const absences = blocks.filter((b) => b.status === "absence").length;
  const substituted = blocks.filter((b) => b.status === "substituted").length;
  const coverage = absences + substituted > 0 ? Math.round((substituted / (absences + substituted)) * 100) : 0;

  // Absences by teacher
  const byTeacher = new Map<string, number>();
  blocks.forEach((b) => {
    if (b.status === "absence" || b.status === "substituted") {
      byTeacher.set(b.teacher, (byTeacher.get(b.teacher) || 0) + 1);
    }
  });
  const teacherRank = [...byTeacher.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxCount = teacherRank[0]?.[1] || 1;

  function exportCsv() {
    if (blocks.length === 0) {
      toast.info("Sem dados para exportar");
      return;
    }
    const rows = [["Dia", "Horário", "Disciplina", "Turma", "Professor", "Sala", "Status"]];
    const dayLabel = Object.fromEntries(DAYS.map((d) => [d.key, d.label]));
    blocks.forEach((b) => {
      rows.push([dayLabel[b.day] ?? b.day, b.time, b.subject, b.className, b.teacher, b.room, b.status]);
    });
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "schedu-relatorio.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Relatório exportado");
  }

  if (scheduleError) {
    return (
      <PageShell title="Relatórios">
        <div className="bg-card border border-destructive/30 rounded-xl p-6 text-center">
          <p className="text-sm font-semibold text-destructive">Erro ao carregar relatórios</p>
          <p className="text-xs text-muted-foreground mt-1">{scheduleError.message}</p>
        </div>
      </PageShell>
    );
  }

  const kpis = [
    { label: "Aulas na semana", value: total },
    { label: "Ausências", value: absences + substituted },
    { label: "Cobertura", value: `${coverage}%` },
    { label: "Professores", value: teachers.length },
    { label: "Turmas", value: classes.length },
    { label: "Salas", value: rooms.length },
  ];

  return (
    <PageShell
      title="Relatórios"
      description="Indicadores da semana atual"
      action={<Button variant="outline" onClick={exportCsv}><Download className="size-4" /> Exportar CSV</Button>}
    >
      {scheduleLoading ? (
        <div className="flex justify-center py-12 text-muted-foreground"><Loader2 className="size-5 animate-spin" /></div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {kpis.map((k) => (
              <div key={k.label} className="bg-card border border-border rounded-xl p-4">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1">{k.label}</p>
                <p className="text-2xl font-bold tracking-tight tabular-nums">{k.value}</p>
              </div>
            ))}
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-semibold mb-1">Professores com mais ausências</h3>
            <p className="text-xs text-muted-foreground mb-5">Top 5 na semana</p>
            {teacherRank.length === 0 ? (
              <p className="text-sm text-muted-foreground">Ainda não há informações.</p>
            ) : (
              <div className="space-y-3">
                {teacherRank.map(([name, count]) => (
                  <div key={name}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium">{name}</span>
                      <span className="text-xs text-muted-foreground font-semibold tabular-nums">{count}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(count / maxCount) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </PageShell>
  );
}
