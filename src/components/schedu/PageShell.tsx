import type { ReactNode } from "react";

export function PageShell({
  title, description, action, children,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <main className="flex-1 flex flex-col min-w-0">
      <header className="h-16 border-b border-border bg-card flex items-center justify-between px-8 shrink-0">
        <div>
          <h1 className="text-base font-semibold leading-tight">{title}</h1>
          {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
        </div>
        {action}
      </header>
      <div className="p-8 flex-1 overflow-auto">{children}</div>
    </main>
  );
}
