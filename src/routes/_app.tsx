import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CalendarDays, Loader2, Menu } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ScheduSidebar } from "@/components/schedu/Sidebar";
import { ScheduProvider } from "@/components/schedu/store";
import { Toaster } from "@/components/ui/sonner";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setAuthed(!!session);
      if (!session) navigate({ to: "/login" });
    });
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) navigate({ to: "/login" });
      else setAuthed(true);
      setReady(true);
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  if (!ready || !authed) {
    return (
      <div className="min-h-screen w-full grid place-items-center bg-surface">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <ScheduProvider>
      <div className="min-h-screen w-full bg-surface text-foreground flex flex-col lg:flex-row">
        {/* Mobile topbar */}
        <header className="lg:hidden h-14 border-b border-border bg-card flex items-center justify-between px-4 sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
              <CalendarDays className="size-4 text-primary-foreground" />
            </div>
            <span className="font-bold tracking-tight">Schedu</span>
          </div>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label="Abrir menu"
                className="size-9 rounded-md flex items-center justify-center hover:bg-muted transition-colors"
              >
                <Menu className="size-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72 bg-sidebar">
              <ScheduSidebar onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
        </header>

        {/* Desktop sidebar */}
        <div className="hidden lg:block">
          <ScheduSidebar />
        </div>

        <div className="flex-1 flex min-w-0">
          <Outlet />
        </div>

        <Toaster position="top-right" richColors />
      </div>
    </ScheduProvider>
  );
}
