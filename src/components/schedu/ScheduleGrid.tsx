import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useSchedu, DAYS, TIMES, type ScheduleBlock, type Day, type BlockKey } from "./store";

function Block({
  block, onSelect, selected,
}: {
  block: ScheduleBlock;
  onSelect: () => void;
  selected: boolean;
}) {
  if (block.status === "absence") {
    return (
      <button
        type="button"
        onClick={onSelect}
        className={
          "group h-full w-full p-3 bg-accent/5 border border-dashed rounded-xl flex flex-col justify-center items-center text-center hover:bg-accent/10 transition-all cursor-pointer " +
          (selected ? "border-accent ring-2 ring-accent/30" : "border-accent/40")
        }
      >
        <div className="size-5 bg-accent/15 rounded-full flex items-center justify-center mb-1.5">
          <AlertCircle className="size-3 text-accent" />
        </div>
        <p className="text-[10px] font-bold text-accent uppercase tracking-wide">Ausência aberta</p>
        <p className="text-xs font-semibold text-accent/90 mt-0.5">{block.subject} · {block.className}</p>
        <p className="text-[10px] font-medium text-accent group-hover:underline mt-1">Buscar substituto →</p>
      </button>
    );
  }

  if (block.status === "substituted") {
    return (
      <button
        type="button"
        onClick={onSelect}
        className="text-left h-full w-full p-3 bg-success-soft border border-success/20 rounded-xl shadow-xs border-l-4 border-l-success hover:shadow-card transition-shadow"
      >
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold text-success-foreground uppercase tracking-wide">
            {block.subject} · {block.className}
          </p>
          <span className="flex items-center gap-1 text-[9px] bg-success/15 text-success-foreground px-1.5 py-0.5 rounded font-semibold">
            <CheckCircle2 className="size-2.5" />
            Coberta
          </span>
        </div>
        <p className="text-sm font-medium mt-1">{block.substitute}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">{block.room}</p>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onSelect}
      className="text-left h-full w-full p-3 bg-card border border-border rounded-xl shadow-xs border-l-4 border-l-primary/70 hover:shadow-card transition-shadow cursor-grab"
    >
      <p className="text-[10px] font-bold text-primary uppercase tracking-wide">
        {block.subject} · {block.className}
      </p>
      <p className="text-sm font-medium mt-1 truncate">{block.teacher}</p>
      <p className="text-[10px] text-muted-foreground mt-0.5">{block.room}</p>
    </button>
  );
}

export function ScheduleGrid() {
  const { schedule, selected, selectBlock, scheduleLoading, scheduleError, blocks } = useSchedu();

  if (scheduleLoading) {
    return (
      <div className="flex-1 grid place-items-center text-muted-foreground">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="size-5 animate-spin" />
          <p className="text-xs">Carregando quadro...</p>
        </div>
      </div>
    );
  }

  if (scheduleError) {
    return (
      <div className="p-8">
        <div className="bg-card border border-destructive/30 rounded-xl p-6 max-w-md mx-auto text-center">
          <p className="text-sm font-semibold text-destructive">Erro ao carregar quadro</p>
          <p className="text-xs text-muted-foreground mt-1">{scheduleError.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 flex-1 overflow-auto scrollbar-thin">
      {blocks.length === 0 ? (
        <div className="bg-card border border-dashed border-border rounded-xl p-8 text-center max-w-lg mx-auto mb-6">
          <p className="text-sm font-semibold">Nenhuma aula no quadro ainda</p>
          <p className="text-xs text-muted-foreground mt-1">
            Clique em <strong>Nova ausência</strong> para começar a popular o quadro semanal.
          </p>
        </div>
      ) : null}

      <div className="grid grid-cols-[64px_repeat(5,minmax(140px,1fr))] sm:grid-cols-[80px_repeat(5,minmax(160px,1fr))] gap-2 sm:gap-3 min-w-[820px] pb-2">
        <div />
        {DAYS.map((d) => (
          <div key={d.key} className="text-center font-bold text-xs text-muted-foreground uppercase tracking-widest pb-3">
            {d.label}
          </div>
        ))}

        {TIMES.map((time) => (
          <div key={time} className="contents">
            <div className="text-xs font-medium text-muted-foreground pt-3">{time}</div>
            {DAYS.map((d) => {
              const block = schedule[d.key as Day]?.[time];
              const key: BlockKey = { day: d.key, time };
              const isSelected = selected?.day === d.key && selected?.time === time;
              return (
                <div key={d.key + time} className="h-24">
                  {block ? (
                    <Block block={block} selected={isSelected} onSelect={() => selectBlock(key)} />
                  ) : (
                    <div className="h-full rounded-xl border border-dashed border-border/70 bg-card/30" />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
