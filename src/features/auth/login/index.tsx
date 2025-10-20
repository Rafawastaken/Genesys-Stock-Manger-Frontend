// LoginPage.tsx (patch do wrapper + card maior + gradiente robusto)
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useLoginMutation } from "@/features/auth/login/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Loader2, Lock, Mail, ArrowRight } from "lucide-react";
import { HttpError } from "@/lib/http-client";

export default function LoginPage() {
  const nav = useNavigate();
  const loc = useLocation() as any;
  const from = loc.state?.from?.pathname || "/";

  const { mutateAsync, isPending, error } = useLoginMutation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("remember_email");
    if (saved) setEmail(saved);
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await mutateAsync({ email, password });
    if (remember) localStorage.setItem("remember_email", email);
    else localStorage.removeItem("remember_email");
    nav(from, { replace: true });
  }

  const isDisabled = useMemo(
    () => isPending || !email || !password,
    [isPending, email, password]
  );

  const errMsg = useMemo(() => {
    if (!error) return null;
    if (error instanceof HttpError) {
      const d = error.data as any;
      return d?.detail ?? "Credenciais inválidas. Tenta novamente.";
    }
    return "Não foi possível iniciar sessão.";
  }, [error]);

  return (
    <div
      className="fixed inset-0 grid place-items-center text-foreground
      bg-[linear-gradient(to_bottom_right,var(--background),var(--muted))]"
    >
      <Card className="w-[340px] border-border/60 shadow-sm">
        <CardHeader className="space-y-2">
          <div className="flex items-center gap-4">
            <img
              src="/logo.png"
              alt="Genesys"
              className="h-10 w-10 rounded-xl"
            />
            <div>
              <CardTitle className="text-2xl leading-tight">Entrar</CardTitle>
              <p className="text-sm text-muted-foreground">
                Acede ao painel do Genesys
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={onSubmit}
            className="grid gap-6"
            aria-describedby={errMsg ? "login-error" : undefined}
          >
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-[13px]">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="nome@empresa.com"
                  className="pl-9 h-11 text-[15px]"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-[13px]">
                  Password
                </Label>
                <button
                  type="button"
                  className="text-xs text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
                  onClick={() => setShowPassword((s) => !s)}
                >
                  {showPassword ? "Esconder" : "Mostrar"}
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="pl-9 h-11 text-[15px]"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-muted-foreground/30"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                Lembrar email
              </label>
            </div>

            {errMsg && (
              <div
                id="login-error"
                role="alert"
                className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              >
                {errMsg}
              </div>
            )}

            <Button
              type="submit"
              disabled={isDisabled}
              className="h-11 text-[15px] group"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> A entrar…
                </>
              ) : (
                <>
                  Entrar
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex items-center justify-between text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Genesys</span>
          <span>v{import.meta.env.VITE_APP_VERSION ?? "2.0.0"}</span>
        </CardFooter>
      </Card>
    </div>
  );
}
