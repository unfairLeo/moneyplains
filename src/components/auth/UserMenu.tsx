import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, Settings, LogOut } from "lucide-react";

export function UserMenu() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const fullName = user?.user_metadata?.full_name ?? "Usuário";
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="rounded-full ring-2 ring-transparent hover:ring-primary/40 transition-all duration-200 focus:outline-none">
          <Avatar className="h-9 w-9 border border-white/10">
            <AvatarImage src={avatarUrl} alt={fullName} />
            <AvatarFallback className="bg-slate-800 text-slate-300 text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-48 bg-slate-950/90 backdrop-blur-xl border-white/10"
      >
        <DropdownMenuItem className="gap-2 text-slate-300 focus:text-foreground focus:bg-white/5 cursor-pointer">
          <User size={16} strokeWidth={1.5} />
          Meu Perfil
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2 text-slate-300 focus:text-foreground focus:bg-white/5 cursor-pointer">
          <Settings size={16} strokeWidth={1.5} />
          Configurações
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem
          onClick={handleSignOut}
          className="gap-2 text-red-400 focus:text-red-300 focus:bg-red-500/10 cursor-pointer"
        >
          <LogOut size={16} strokeWidth={1.5} />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
