import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CalendarDays, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Entrar — Schedu" },
      { name: "description", content: "Acesse o painel da sua escola no Schedu." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/" });
    });
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("Bem-vindo de volta!");
      navigate({ to: "/" });
    } catch (err) {
      toast.error("Não foi possível entrar", {
        description: err instanceof Error ? err.message : "Verifique seus dados.",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      toast.error("Falha no Google", { description: error.message });
      setLoading(false);
      return;
    }
  }

  return (
    <div className="min-h-screen w-full bg-surface relative overflow-hidden flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 size-[28rem] rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 size-[28rem] rounded-full bg-accent/15 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        <div className="flex items-center gap-3 justify-center mb-8">
          <div className="size-11 rounded-xl bg-primary flex items-center justify-center shadow-elevated">
            <CalendarDays className="size-6 text-primary-foreground" />
          </div>
          <div className="leading-tight">
            <h1 className="font-bold tracking-tight text-2xl">Schedu</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
              Gestão escolar
            </p>
          </div>
        </div>

        <div className="bg-card/80 backdrop-blur border border-border rounded-2xl shadow-elevated p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-1">Entrar</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Acesse o quadro da sua escola.
          </p>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            className="w-full h-11 border border-border rounded-lg flex items-center justify-center gap-2 text-sm font-medium hover:bg-muted transition-colors disabled:opacity-60"
          >
            <svg className="size-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.83z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
            </svg>
            Continuar com Google
          </button>

          <div className="my-5 flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
              ou
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@escola.edu"
                className="h-11"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-11"
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full h-11">
              {loading ? <Loader2 className="size-4 animate-spin" /> : "Entrar"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Não tem conta?{" "}
            <Link to="/cadastro" className="text-primary font-semibold hover:underline">
              Criar agora
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
