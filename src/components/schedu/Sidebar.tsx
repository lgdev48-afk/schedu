import { CalendarDays, Users, DoorOpen, Repeat, BarChart3, Settings, GraduationCap, LogOut } from "lucide-react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSchedu } from "./store";

type NavItem = { icon: typeof CalendarDays; label: string; to: string; badge?: number };

export function ScheduSidebar({ onNavigate }: { onNavigate?: () => void } = {}) {
  const { settings, blocks } = useSchedu();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();

  const openAbsences = blocks.filter((b) => b.status === "absence").length;

  const groups: { label: string; items: NavItem[] }[] = [
    {
      label: "Gestão",
      items: [
        { icon: CalendarDays, label: "Quadro Geral", to: "/" },
        { icon: Users, label: "Professores", to: "/professores" },
        { icon: GraduationCap, label: "Turmas", to: "/turmas" },
        { icon: DoorOpen, label: "Salas", to: "/salas" },
      ],
    },
    {
      label: "Operações",
      items: [
        { icon: Repeat, label: "Substituições", to: "/substituicoes", badge: openAbsences || undefined },
        { icon: BarChart3, label: "Relatórios", to: "/relatorios" },
        { icon: Settings, label: "Configurações", to: "/configuracoes" },
      ],
    },
  ];

  async function handleSignOut() {
    await supabase.auth.signOut();
    toast.success("Sessão encerrada");
    navigate({ to: "/login" });
  }

  return (
    <aside className="w-64 h-full shrink-0 border-r border-border bg-sidebar flex flex-col">
      <div className="p-6 border-b border-border flex items-center gap-3">
        <div className="size-9 rounded-lg bg-primary flex items-center justify-center shadow-card">
          <CalendarDays className="size-5 text-primary-foreground" />
        </div>
        <div className="leading-tight">
          <p className="font-bold tracking-tight text-lg">Schedu</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest truncate">{settings.schoolName}</p>
        </div>
      </div>

      <nav className="p-4 space-y-6 flex-1 overflow-y-auto">
        {groups.map((group) => (
          <div key={group.label}>
            <div className="px-3 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
              {group.label}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = pathname === item.to;
                return (
                  <Link
                    key={item.label}
                    to={item.to}
                    onClick={onNavigate}
                    className={
                      "w-full flex items-center justify-between gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors " +
                      (active ? "bg-primary-soft text-primary" : "text-sidebar-foreground hover:bg-muted")
                    }
                  >
                    <span className="flex items-center gap-3">
                      <item.icon className="size-4" />
                      {item.label}
                    </span>
                    {item.badge ? (
                      <span className="px-1.5 py-0.5 bg-accent text-accent-foreground text-[10px] rounded-full font-semibold">
                        {item.badge}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-border space-y-2">
        <button
          type="button"
          onClick={handleSignOut}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <LogOut className="size-4" />
          Sair
        </button>
      </div>
    </aside>
  );
}
