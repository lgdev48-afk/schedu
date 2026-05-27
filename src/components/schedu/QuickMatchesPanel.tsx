import { Zap, CheckCircle2, Clock, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useMemo } from "react";
import { useSchedu } from "./store";

function initialsOf(name: string) {
  return name.split(" ").map((p) => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "agora mesmo";
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h} h`;
  const d = Math.floor(h / 24);
  return `há ${d} d`;
}

export function QuickMatchesPanel({ onClose }: { onClose?: () => void } = {}) {
  const { schedule, selected, assignSubstitute, logs, logsLoading, pushLog, teachers } = useSchedu();
  const block = selected ? schedule[selected.day]?.[selected.time] : undefined;
  const isOpenAbsence = block?.status === "absence";

  // Real candidates: teachers from DB whose subject matches the absence, falling back to all others.
  const candidates = useMemo(() => {
    if (!block) return [];
    const sameSubject = teachers.filter((t) => t.subject && t.subject.toLowerCase() === block.subject.toLowerCase());
    const others = teachers.filter((t) => !sameSubject.includes(t) && t.name !== block.teacher);
    return [...sameSubject, ...others].slice(0, 5);
  }, [teachers, block]);

  function handleDispatchAll() {
    if (!selected || !block || candidates.length === 0) return;
    pushLog({ color: "bg-accent", title: `Notificação enviada para ${candidates.length} professores` });
    toast.success("Convocação enviada", {
      description: `${candidates.length} candidatos notificados para ${block.subject} · ${block.className}.`,
    });
  }

  return (
    <aside className="w-full h-full flex flex-col bg-card lg:border-l lg:border-border">
      <div className="flex items-center justify-between px-6 pt-6 pb-4 shrink-0">
        <h2 className="font-bold text-base tracking-tight">Match Rápido</h2>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-[10px] text-success-foreground bg-success-soft px-2 py-0.5 rounded-full uppercase font-bold tracking-wide">
            <span className="size-1.5 rounded-full bg-success animate-pulse" />
            Ao vivo
          </span>
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar painel"
              className="size-7 rounded-md flex items-center justify-center hover:bg-muted transition-colors"
            >
              <X className="size-4" />
            </button>
          ) : null}
        </div>
      </div>

      <div className="px-6 pb-6 overflow-y-auto scrollbar-thin flex-1">
        {isOpenAbsence && block && selected ? (
          <div className="p-4 rounded-xl border border-accent/20 bg-accent/5 relative overflow-hidden mb-6">
            <div className="absolute top-0 right-0 w-20 h-1 bg-accent" />
            <h3 className="text-[10px] font-bold text-accent uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Zap className="size-3" /> Substituição urgente
            </h3>
            <div className="mb-4">
              <p className="text-sm font-bold">{block.subject} · {block.className}</p>
              <p className="text-[11px] text-muted-foreground">{selected.day}, {selected.time} · {block.room}</p>
            </div>

            <p className="text-[11px] text-muted-foreground mb-3 uppercase tracking-wide font-semibold">
              Professores disponíveis
            </p>

            {candidates.length === 0 ? (
              <div className="p-4 rounded-lg border border-dashed border-border bg-muted/30 text-center">
                <p className="text-xs font-semibold">Nenhum professor cadastrado</p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Adicione professores em <strong>Professores</strong> para habilitar o matching.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {candidates.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-2.5 bg-card rounded-lg border border-border hover:border-primary/40 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="size-8 rounded-full grid place-items-center text-[10px] font-bold bg-primary-soft text-primary">
                        {initialsOf(c.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold truncate">{c.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{c.subject || "Sem disciplina"}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => assignSubstitute(selected, c.name)}
                      className="text-[10px] text-primary font-bold uppercase tracking-tight hover:underline cursor-pointer ml-2"
                    >
                      Convocar
                    </button>
                  </div>
                ))}
              </div>
            )}

            {candidates.length > 0 ? (
              <button
                type="button"
                onClick={handleDispatchAll}
                className="mt-3 w-full py-2 bg-accent text-accent-foreground text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity"
              >
                Disparar para todos
              </button>
            ) : null}
          </div>
        ) : (
          <div className="p-4 rounded-xl border border-dashed border-border bg-muted/30 mb-6 text-center">
            <p className="text-xs font-semibold mb-1">Nenhuma ausência selecionada</p>
            <p className="text-[11px] text-muted-foreground">
              Clique em um bloco tracejado no quadro para ver candidatos a substituição.
            </p>
          </div>
        )}

        <div>
          <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">
            Atividade recente
          </h4>
          {logsLoading ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="size-3 animate-spin" /> Carregando...
            </div>
          ) : logs.length === 0 ? (
            <p className="text-[11px] text-muted-foreground">Ainda não há atividades registradas.</p>
          ) : (
            <div className="space-y-3">
              {logs.map((log, i) => (
                <div key={log.id} className="flex gap-3">
                  <div className="relative flex flex-col items-center">
                    <div className={`size-2 rounded-full ${log.color} mt-1.5`} />
                    {i < logs.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                  </div>
                  <div className="pb-3 flex-1">
                    <p className="text-xs font-medium">{log.title}</p>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Clock className="size-2.5" />
                      {timeAgo(log.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
