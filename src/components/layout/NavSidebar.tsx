import { Home, Target, Rocket, Users, Trophy, PanelLeftClose, PanelLeft } from "lucide-react";
import { MoneyPlanLogo } from "@/components/brand/MoneyPlanLogo";
import { NavLink } from "@/components/NavLink";
import { HistoryDrawer } from "./HistoryDrawer";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const mainNavItems = [
  { title: "Chat", path: "/", icon: Home },
  { title: "Metas", path: "/metas", icon: Target },
  { title: "Missões", path: "/missoes", icon: Rocket },
  { title: "Personalidades", path: "/personalidades", icon: Users },
  { title: "Conquistas", path: "/conquistas", icon: Trophy },
];

export function NavSidebar() {
  const { state, toggleSidebar, isMobile, setOpenMobile } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar
      // [ALTERAÇÃO 1] Visual Glassmorphism Real (Sem bordas duras na direita)
      className="border-none bg-black/20 backdrop-blur-md transition-all duration-300"
      collapsible="icon"
    >
      {/* Header com Logo - [ALTERAÇÃO 2] Removi a borda de baixo para não parecer 'recortado' */}
      <SidebarHeader className="p-4 border-none bg-transparent">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="shrink-0">
             <MoneyPlanLogo size="md" />
          </div>
          
          {/* Lógica para esconder o texto suavemente ao recolher */}
          <div className={`transition-all duration-300 ${isCollapsed ? "opacity-0 w-0 translate-x-[-10px]" : "opacity-100 w-auto translate-x-0"}`}>
            <h1 className="text-xl font-sans font-bold tracking-tight whitespace-nowrap">
              <span className="text-primary text-glow-emerald">Money</span>
              <span className="text-foreground">Plan</span>
            </h1>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2 scrollbar-none">
        {/* Grupo A: Navegação Principal */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground/70 mb-2 px-2">
            {isCollapsed ? "Menu" : "Abas"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item, index) => (
                <SidebarMenuItem key={item.title} className={`animate-stagger-in stagger-${index + 1}`}>
                  {/* [ALTERAÇÃO 3] O tooltip agora vai direto no NavLink que configuramos antes */}
                  <SidebarMenuButton asChild size="lg" className="hover:bg-transparent"> 
                    <NavLink
                      to={item.path}
                      end={item.path === "/"}
                      tooltip={item.title} // <--- AQUI ESTÁ A MÁGICA DO TOOLTIP
                      onClick={() => isMobile && setOpenMobile(false)}
                      className="flex items-center gap-4 px-4 py-3 min-h-[48px] rounded-xl transition-all duration-300 text-muted-foreground hover:text-white hover:bg-white/10 group active:scale-95"
                      activeClassName="bg-primary/20 text-primary border border-primary/20 shadow-[0_0_15px_rgba(34,197,94,0.15)]"
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                      {!isCollapsed && (
                        <span className="font-medium text-sm">{item.title}</span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="my-4 bg-white/5" />

        {/* Grupo B: Ações (Histórico) */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground/70 mb-2 px-2">
             {isCollapsed ? "Hist" : "Ações"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <div className="px-1"> {/* Wrapper para ajuste fino */}
                    <HistoryDrawer />
                </div>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer com Botão de Colapso */}
      <SidebarFooter className="p-4 border-none bg-transparent">
        <Button
          variant="ghost"
          onClick={toggleSidebar}
          className="w-full justify-start gap-3 text-muted-foreground hover:text-white hover:bg-white/10 transition-all rounded-xl h-12"
        >
          {isCollapsed ? (
            <PanelLeft className="w-5 h-5 mx-auto" />
          ) : (
            <>
              <PanelLeftClose className="w-5 h-5" />
              <span className="font-medium">Recolher menu</span>
            </>
          )}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
