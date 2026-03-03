import * as React from "react";
import { useState } from "react";
import { Home, Target, Rocket, Users, Trophy, History } from "lucide-react";
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
  { title: "Chat", path: "/", icon: Home },
  { title: "Metas", path: "/metas", icon: Target },
  { title: "Missões", path: "/missoes", icon: Rocket },
  { title: "Personalidades", path: "/personalidades", icon: Users },
  { title: "Conquistas", path: "/conquistas", icon: Trophy },
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
      {/* The actual visual sidebar */}
      <div
        onMouseEnter={() => !isMobile && setIsHovered(true)}
        onMouseLeave={() => !isMobile && setIsHovered(false)}
        className={[
          "h-full flex flex-col overflow-hidden",
          // Glassmorphism background
          "bg-slate-950/80 backdrop-blur-md border-r border-slate-800",
          // Width transition
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
                <span className="text-emerald-400">Money</span>
                <span className="text-slate-100">Plan</span>
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
                    item.path === "/"
                      ? location.pathname === "/"
                      : location.pathname.startsWith(item.path);

                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild size="lg" className="hover:bg-transparent p-0">
                        <NavLink
                          to={item.path}
                          end={item.path === "/"}
                          tooltip={item.title}
                          onClick={() => sidebarMobile && setOpenMobile(false)}
                          className={[
                            "flex flex-row items-center gap-3 rounded-lg transition-all duration-200",
                            expanded ? "px-3 py-2.5" : "justify-center px-0 py-2.5",
                            isActive
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "text-slate-400 hover:text-slate-100 hover:bg-white/5",
                          ].join(" ")}
                          activeClassName=""
                        >
                          <item.icon
                            size={20}
                            strokeWidth={1.5}
                            className={`flex-shrink-0 transition-all duration-200 ${
                              isActive
                                ? "text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]"
                                : ""
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

          <SidebarSeparator className="my-3 bg-slate-800/60" />

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

        {/* Bottom glow */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-emerald-500/[0.03] to-transparent pointer-events-none" />
      </div>
    </Sidebar>
  );
}
