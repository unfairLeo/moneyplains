import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { UserMenu } from "@/components/auth/UserMenu";
import { Bell, Moon, Sun, Globe, Shield, Smartphone, LogOut, ChevronRight, User, Palette, BellRing } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface SettingRowProps {
  icon: React.ReactNode;
  label: string;
  description?: string;
  children?: React.ReactNode;
  onClick?: () => void;
}

function SettingRow({ icon, label, description, children, onClick }: SettingRowProps) {
  return (
    <div
      className={`flex items-center justify-between py-4 px-1 ${onClick ? "cursor-pointer hover:bg-muted/30 rounded-lg -mx-1 px-2 transition-colors" : ""}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <div className="text-muted-foreground">{icon}</div>
        <div>
          <p className="text-sm font-medium text-foreground">{label}</p>
          {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
        </div>
      </div>
      {children ?? (onClick && <ChevronRight size={16} className="text-muted-foreground" />)}
    </div>
  );
}

export function SettingsView() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);

  const fullName = user?.user_metadata?.full_name ?? "Usuário";
  const email = user?.email ?? "";
  const avatarUrl = user?.user_metadata?.avatar_url;
  const initials = fullName
    .split(" ")
    .map((n: string) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  const handleComingSoon = () => {
    toast.info("Em breve!", { description: "Esta funcionalidade estará disponível em breve." });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground text-sm mt-1">Gerencie sua conta e preferências</p>
      </header>

      {/* Profile Section */}
      <div className="glass-card p-5 mb-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14 border-2 border-primary/20">
            <AvatarImage src={avatarUrl} alt={fullName} />
            <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-foreground truncate">{fullName}</h2>
            <p className="text-sm text-muted-foreground truncate">{email}</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleComingSoon} className="shrink-0">
            Editar
          </Button>
        </div>
      </div>

      {/* Preferences */}
      <div className="glass-card p-5 mb-6">
        <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-2">
          Preferências
        </h3>
        <Separator className="mb-2 bg-border/50" />

        <SettingRow
          icon={<Moon size={18} />}
          label="Modo Escuro"
          description="Tema escuro ativado por padrão"
        >
          <Switch checked={darkMode} onCheckedChange={setDarkMode} />
        </SettingRow>

        <SettingRow
          icon={<Globe size={18} />}
          label="Idioma"
          description="Português (Brasil)"
          onClick={handleComingSoon}
        />

        <SettingRow
          icon={<Palette size={18} />}
          label="Aparência"
          description="Personalize cores e layout"
          onClick={handleComingSoon}
        />
      </div>

      {/* Notifications */}
      <div className="glass-card p-5 mb-6">
        <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-2">
          Notificações
        </h3>
        <Separator className="mb-2 bg-border/50" />

        <SettingRow
          icon={<Bell size={18} />}
          label="Notificações por e-mail"
          description="Receba atualizações e alertas"
        >
          <Switch checked={notifications} onCheckedChange={setNotifications} />
        </SettingRow>

        <SettingRow
          icon={<BellRing size={18} />}
          label="Notificações push"
          description="Alertas no navegador"
        >
          <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
        </SettingRow>
      </div>

      {/* Security */}
      <div className="glass-card p-5 mb-6">
        <h3 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-2">
          Segurança
        </h3>
        <Separator className="mb-2 bg-border/50" />

        <SettingRow
          icon={<Shield size={18} />}
          label="Alterar senha"
          description="Atualize sua senha de acesso"
          onClick={handleComingSoon}
        />

        <SettingRow
          icon={<Smartphone size={18} />}
          label="Autenticação em dois fatores"
          description="Adicione uma camada extra de segurança"
          onClick={handleComingSoon}
        />
      </div>

      {/* Sign Out */}
      <div className="glass-card p-5">
        <Button
          variant="destructive"
          className="w-full gap-2"
          onClick={handleSignOut}
        >
          <LogOut size={16} />
          Sair da conta
        </Button>
      </div>
    </div>
  );
}
