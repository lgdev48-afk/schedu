import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { StatsHeader } from "@/components/schedu/StatsHeader";
import { ScheduleGrid } from "@/components/schedu/ScheduleGrid";
import { QuickMatchesPanel } from "@/components/schedu/QuickMatchesPanel";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

export const Route = createFileRoute("/_app/")({
  head: () => ({
    meta: [
      { title: "Schedu — Quadro acadêmico" },
      { name: "description", content: "Quadro semanal de aulas, ausências e substituições em tempo real." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const isMobile = useIsMobile();
  const [desktopOpen, setDesktopOpen] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);

  const openPanel = () => (isMobile ? setSheetOpen(true) : setDesktopOpen(true));

  return (
    <>
      <main className="flex-1 flex flex-col min-w-0">
        <StatsHeader onOpenRightPanel={!desktopOpen || isMobile ? openPanel : undefined} />
        <ScheduleGrid />
      </main>

      {/* Desktop side panel */}
      {desktopOpen && !isMobile ? (
        <div className="hidden lg:flex w-80 xl:w-96 shrink-0">
          <QuickMatchesPanel onClose={() => setDesktopOpen(false)} />
        </div>
      ) : null}

      {/* Mobile/Tablet sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="p-0 w-full sm:max-w-sm bg-card">
          <QuickMatchesPanel onClose={() => setSheetOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
}
