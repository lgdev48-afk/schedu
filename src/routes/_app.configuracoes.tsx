import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LogOut, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSchedu } from "@/components/schedu/store";
import { PageShell } from "@/components/schedu/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/_app/configuracoes")({
  head: () => ({ meta: [{ title: "Configurações — Schedu" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { settings, settingsLoading, updateSettings } = useSchedu();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  useEffect(() => {
    if (!settingsLoading) setName(settings.schoolName);
  }, [settingsLoading, settings.schoolName]);

  async function signOut() {
    await supabase.auth.signOut();
    toast.success("Sessão encerrada");
    navigate({ to: "/login" });
  }

  async function saveName() {
    setSaving(true);
    try { await updateSettings({ schoolName: name }); } finally { setSaving(false); }
  }

  return (
    <PageShell title="Configurações" description="Personalize sua escola e preferências">
      <div className="max-w-2xl space-y-6">
        <section className="bg-card border border-border rounded-xl p-6">
          <h2 className="font-semibold mb-1">Conta</h2>
          <p className="text-xs text-muted-foreground mb-4">Sessão atual no Schedu.</p>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">{email ?? "Carregando..."}</p>
              <p className="text-xs text-muted-foreground">Coordenação</p>
            </div>
            <Button variant="outline" onClick={signOut}><LogOut className="size-4" /> Sair</Button>
          </div>
        </section>

        <section className="bg-card border border-border rounded-xl p-6">
          <h2 className="font-semibold mb-4">Escola</h2>
          {settingsLoading ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="size-4 animate-spin" /> Carregando...</div>
          ) : (
            <div className="grid gap-1.5 max-w-md">
              <Label>Nome da escola</Label>
              <div className="flex gap-2">
                <Input value={name} onChange={(e) => setName(e.target.value)} />
                <Button onClick={saveName} disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
              </div>
            </div>
          )}
        </section>

        <section className="bg-card border border-border rounded-xl p-6 space-y-5">
          <h2 className="font-semibold">Operações</h2>
          <Row
            title="Matching automático"
            desc="Sugerir substitutos automaticamente ao registrar uma ausência."
            checked={settings.autoMatch}
            disabled={settingsLoading}
            onChange={(v) => updateSettings({ autoMatch: v })}
          />
          <Row
            title="Notificações por e-mail"
            desc="Enviar e-mail quando uma substituição for confirmada."
            checked={settings.notifyEmail}
            disabled={settingsLoading}
            onChange={(v) => updateSettings({ notifyEmail: v })}
          />
          <Row
            title="Notificações push"
            desc="Enviar push aos professores em janela livre."
            checked={settings.notifyPush}
            disabled={settingsLoading}
            onChange={(v) => updateSettings({ notifyPush: v })}
          />
        </section>
      </div>
    </PageShell>
  );
}

function Row({ title, desc, checked, onChange, disabled }: { title: string; desc: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} disabled={disabled} />
    </div>
  );
}
