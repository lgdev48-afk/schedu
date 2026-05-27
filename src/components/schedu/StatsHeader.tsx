import { Download, ChevronRight, PanelRightOpen } from "lucide-react";
import { toast } from "sonner";
import { NewAbsenceDialog } from "./NewAbsenceDialog";
import { useSchedu, DAYS } from "./store";

export function StatsHeader({ onOpenRightPanel }: { onOpenRightPanel?: () => void }) {
  const { blocks, classes, scheduleLoading } = useSchedu();

  // Stats computed from real data
  const absencesOpen = blocks.filter((b) => b.status === "absence").length;
  const substituted = blocks.filter((b) => b.status === "substituted").length;
  const totalAbsences = absencesOpen + substituted;
  const coveragePct = totalAbsences > 0 ? Math.round((substituted / totalAbsences) * 100) : 0;
  const activeClasses = classes.length;

  const stats = [
    { label: "Ausências abertas", value: scheduleLoading ? "—" : String(absencesOpen).padStart(2, "0"), hint: `${totalAbsences} no total`, tone: "accent" as const },
    { label: "Substituições", value: scheduleLoading ? "—" : String(substituted).padStart(2, "0"), hint: totalAbsences ? `${coveragePct}% preenchidas` : "Sem ausências", tone: "success" as const },
    { label: "Aulas planejadas", value: scheduleLoading ? "—" : String(blocks.length), hint: `${DAYS.length} dias`, tone: "muted" as const },
    { label: "Turmas ativas", value: scheduleLoading ? "—" : String(activeClasses), hint: activeClasses ? "Cadastradas" : "Nenhuma cadastrada", tone: "muted" as const },
  ];

  function handleExport() {
    toast.info("Exportar PDF em breve", { description: "Por enquanto, exporte CSV em Relatórios." });
  }

  return (
    <>
      <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0 gap-2">
        <div className="flex items-center gap-2 sm:gap-3 text-sm min-w-0">
          <h1 className="text-sm sm:text-base font-semibold truncate">Quadro acadêmico</h1>
          <ChevronRight className="size-4 text-muted-foreground shrink-0 hidden sm:block" />
          <span className="text-muted-foreground text-xs sm:text-sm truncate hidden sm:inline">Semana atual</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleExport}
            className="hidden sm:flex h-9 px-3 lg:px-4 text-xs sm:text-sm border border-border rounded-lg hover:bg-muted transition-colors items-center gap-2"
          >
            <Download className="size-4" />
            <span className="hidden lg:inline">Exportar PDF</span>
          </button>
          <NewAbsenceDialog />
          {onOpenRightPanel ? (
            <button
              type="button"
              onClick={onOpenRightPanel}
              aria-label="Abrir match rápido"
              className="size-9 rounded-md border border-border flex items-center justify-center hover:bg-muted transition-colors"
            >
              <PanelRightOpen className="size-4" />
            </button>
          ) : null}
        </div>
      </header>

      <div className="px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-3 sm:p-4 shadow-xs flex flex-col">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2 truncate">
              {s.label}
            </p>
            <div className="flex items-end justify-between gap-2 mt-auto">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight leading-none tabular-nums">
                {s.value}
              </span>
              <span
                className={
                  "text-[10px] sm:text-[11px] font-medium text-right leading-tight pb-0.5 " +
                  (s.tone === "accent"
                    ? "text-accent"
                    : s.tone === "success"
                      ? "text-success-foreground"
                      : "text-muted-foreground")
                }
              >
                {s.hint}
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
