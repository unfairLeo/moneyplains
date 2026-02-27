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
  { title: "Dashboard", path: "/", icon: Home },
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
      className="border-r border-border/30 bg-sidebar"
      collapsible="icon"
    >
      {/* Header com Logo */}
      <SidebarHeader className="p-4 border-b border-border/30">
        <div className="flex items-center gap-3">
          <MoneyPlanLogo size="md" />
          {!isCollapsed && (
            <h1 className="text-xl font-sans font-bold tracking-tight">
              <span className="text-primary text-glow-emerald">Money</span>
              <span className="text-foreground">Plan</span>
            </h1>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        {/* Grupo A: Navegação Principal */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground/70 mb-2">
            Navegação
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title} size="lg">
                    <NavLink
                      to={item.path}
                      end={item.path === "/"}
                      onClick={() => isMobile && setOpenMobile(false)}
                      className="flex items-center gap-4 px-4 py-4 min-h-[52px] rounded-xl transition-all duration-300 text-muted-foreground hover:text-foreground hover:bg-muted/50 group"
                      activeClassName="nav-item-active"
                    >
                      <item.icon className="w-6 h-6 flex-shrink-0 group-hover:scale-110 transition-transform" />
                      {!isCollapsed && (
                        <span className="font-medium">{item.title}</span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="my-4" />

        {/* Grupo B: Ações (Histórico) */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground/70 mb-2">
            Ações
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Histórico" size="lg">
                  <HistoryDrawer />
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer com Botão de Colapso */}
      <SidebarFooter className="p-4 border-t border-border/30">
        <Button
          variant="ghost"
          onClick={toggleSidebar}
          className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground hover:bg-muted/50"
        >
          {isCollapsed ? (
            <PanelLeft className="w-5 h-5" />
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
