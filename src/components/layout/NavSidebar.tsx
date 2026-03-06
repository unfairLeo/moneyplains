import * as React from "react";
import { useState } from "react";
import { MessageSquare, Target, Rocket, UserCircle, Trophy, History, Settings } from "lucide-react";
import { MoneyPlanLogo } from "@/components/brand/MoneyPlanLogo";
import { NavLink } from "@/components/NavLink";
import { HistoryDrawer } from "./HistoryDrawer";
import { useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";

const mainNavItems = [
  { title: "Chat", path: "/dashboard", icon: MessageSquare },
  { title: "Metas", path: "/metas", icon: Target },
  { title: "Missões", path: "/missoes", icon: Rocket },
  { title: "Personalidades", path: "/personalidades", icon: UserCircle },
  { title: "Conquistas", path: "/conquistas", icon: Trophy },
  { title: "Configurações", path: "/configuracoes", icon: Settings },
];

export function NavSidebar() {
  const [isHovered, setIsHovered] = useState(false);
  const isMobile = useIsMobile();
  const { isMobile: sidebarMobile, setOpenMobile } = useSidebar();
  const location = useLocation();

  const expanded = isMobile ? true : isHovered;

  return (
    <Sidebar
      className="border-none bg-transparent transition-none"
      collapsible={isMobile ? "offcanvas" : "icon"}
    >
      <div
        onMouseEnter={() => !isMobile && setIsHovered(true)}
        onMouseLeave={() => !isMobile && setIsHovered(false)}
        className={[
          "h-full flex flex-col overflow-hidden",
          // Fundo dark neutro para destacar apenas o verde da aba ativa
          "bg-slate-950/90 backdrop-blur-md border-r border-slate-800 shadow-xl",
          "transition-all duration-300 ease-in-out",
          expanded ? "w-64" : "w-16",
        ].join(" ")}
        style={
          !isMobile
            ? { position: "fixed", left: 0, top: 0, bottom: 0, zIndex: 100 }
            : {}
        }
      >
        {/* Header: Logo */}
        <SidebarHeader className="border-none bg-transparent px-0 py-5">
          <div className={`flex items-center gap-3 overflow-hidden ${expanded ? "px-4" : "justify-center px-0"}`}>
            <div className="shrink-0">
              <MoneyPlanLogo size="sm" />
            </div>
            <div
              className={`transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap ${
                expanded ? "opacity-100 max-w-[160px]" : "opacity-0 max-w-0"
              }`}
            >
              <h1 className="text-base font-sans font-bold tracking-tight">
                {/* Aqui voltamos para o Verde da marca */}
                <span className="text-emerald-400">Money</span>
                <span className="text-slate-300">Plan$</span>
              </h1>
            </div>
          </div>
        </SidebarHeader>

        {/* Navigation */}
        <SidebarContent className="px-2 scrollbar-none flex-1 py-2">
          {/* Section label */}
          <div
            className={`transition-all duration-300 overflow-hidden ${
              expanded ? "opacity-60 max-h-8 mb-2 px-3" : "opacity-0 max-h-0 mb-0"
            }`}
          >
            <span className="text-[10px] uppercase tracking-[0.15em] text-slate-500 font-semibold">
              Menu
            </span>
          </div>

          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {mainNavItems.map((item) => {
                  const isActive =
                    item.path === "/dashboard"
                      ? location.pathname === "/dashboard"
                      : location.pathname.startsWith(item.path);

                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild size="lg" className="hover:bg-transparent p-0">
                        <NavLink
                          to={item.path}
                          end={item.path === "/dashboard"}
                          tooltip={item.title}
                          onClick={() => sidebarMobile && setOpenMobile(false)}
                          className={[
                            "relative flex flex-row items-center gap-3 rounded-lg transition-all duration-200", 
                            expanded ? "px-3 py-2.5" : "justify-center px-0 py-2.5",
                            isActive
                              ? "bg-emerald-500/10 text-emerald-400" // Verde quando a aba está aberta
                              : "text-slate-400 hover:text-slate-300 hover:bg-slate-800/50", // Cinza minimalista quando inativo
                          ].join(" ")}
                          activeClassName=""
                        >
                          {/* Indicador lateral neon verde */}
                          {isActive && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-emerald-500 rounded-r-full shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
                          )}
                          
                          <item.icon
                            size={20}
                            strokeWidth={isActive ? 2 : 1.5}
                            className={`flex-shrink-0 transition-all duration-200 ${
                              isActive
                                ? "text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.6)]" // Brilho verde no ícone
                                : "" // Ícone normal e fino se inativo
                            }`}
                          />
                          <span
                            className={`text-sm font-medium whitespace-nowrap transition-all duration-300 ease-in-out overflow-hidden ${
                              expanded
                                ? "opacity-100 max-w-[160px]"
                                : "opacity-0 max-w-0"
                            } ${isActive ? "text-emerald-400" : ""}`}
                          >
                            {item.title}
                          </span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator className="my-3 bg-slate-800/50" />

          {/* History Drawer */}
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <div className={expanded ? "px-1" : "flex justify-center"}>
                    <HistoryDrawer />
                  </div>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* Bottom shadow */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-emerald-900/10 to-transparent pointer-events-none" />
      </div>
    </Sidebar>
  );
}
