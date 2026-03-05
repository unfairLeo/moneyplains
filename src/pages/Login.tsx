import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { lovable } from "@/integrations/lovable";
import { MoneyPlanLogo } from "@/components/brand/MoneyPlanLogo";
import { useToast } from "@/hooks/use-toast";
import bgImage from "@/assets/fundompsemimg.png";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" className="shrink-0">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export default function Login() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, loading, navigate]);

  const handleGoogleSignIn = async () => {
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast({
          title: "Erro ao entrar",
          description: "Não foi possível fazer login com o Google.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Erro ao entrar",
        description: "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 rounded-full border-4 border-muted animate-spin border-t-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <img
        src={bgImage}
        alt=""
        className="fixed inset-0 w-full h-full object-cover pointer-events-none z-0"
      />

      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-slate-950/60 backdrop-blur-xl border border-white/10 rounded-2xl p-8 md:p-10 shadow-2xl">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <MoneyPlanLogo size="lg" />
            <h1 className="mt-4 text-2xl font-bold text-foreground">
              <span className="text-primary text-glow-emerald">Money</span>
              <span>Plan</span>
            </h1>
            <p className="mt-2 text-muted-foreground text-center text-sm">
              Acesse o seu Patrimônio
            </p>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8" />

          {/* Google Button */}
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 h-12 rounded-xl bg-white/[0.07] hover:bg-white/[0.12] border border-white/10 hover:border-white/20 text-foreground font-medium transition-all duration-300 hover:shadow-[0_0_20px_hsl(160_84%_39%/0.15)] active:scale-[0.98]"
          >
            <GoogleIcon />
            <span>Entrar com o Google</span>
          </button>

          {/* Footer */}
          <p className="mt-6 text-center text-xs text-muted-foreground/60">
            Ao continuar, você aceita nossos termos de uso.
          </p>
        </div>
      </div>
    </div>
  );
}
