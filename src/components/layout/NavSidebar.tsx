import { useState } from "react";
import { Home, Target, Rocket, Users, Trophy } from "lucide-react";
import { MoneyPlanLogo } from "@/components/brand/MoneyPlanLogo";
import { NavLink } from "@/components/NavLink";
import { HistoryDrawer } from "./HistoryDrawer";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
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

  // On desktop: mini sidebar that expands on hover
  // On mobile: use the default sheet behavior from SidebarProvider
  const expanded = isMobile ? true : isHovered;

  return (
    <Sidebar
      className="border-none bg-transparent transition-none"
      collapsible={isMobile ? "offcanvas" : "icon"}
    >
      <motion.div
        onMouseEnter={() => !isMobile && setIsHovered(true)}
        onMouseLeave={() => !isMobile && setIsHovered(false)}
        animate={{ width: isMobile ? 280 : expanded ? 240 : 72 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="h-full flex flex-col bg-black/30 backdrop-blur-xl border-r border-white/[0.06] relative z-50 overflow-hidden"
        style={!isMobile ? { position: "fixed", left: 0, top: 0, bottom: 0, zIndex: 50 } : {}}
      >
        {/* Header */}
        <SidebarHeader className="p-4 border-none bg-transparent">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="shrink-0">
              <MoneyPlanLogo size="sm" />
            </div>
            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ opacity: 0, x: -10, width: 0 }}
                  animate={{ opacity: 1, x: 0, width: "auto" }}
                  exit={{ opacity: 0, x: -10, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <h1 className="text-lg font-sans font-bold tracking-tight whitespace-nowrap">
                    <span className="text-primary text-glow-emerald">Money</span>
                    <span className="text-foreground">Plan</span>
                  </h1>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </SidebarHeader>

        <SidebarContent className="p-2 scrollbar-none flex-1">
          <SidebarGroup>
            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/50 mb-2 px-3">
                    Menu
                  </SidebarGroupLabel>
                </motion.div>
              )}
            </AnimatePresence>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {mainNavItems.map((item) => {
                  const isActive = item.path === "/" 
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
                          className={`flex items-center gap-3 rounded-xl transition-all duration-200 group
                            ${expanded ? "px-3 py-2.5" : "px-0 py-2.5 justify-center"}
                            ${isActive
                              ? "bg-primary/15 text-primary shadow-[0_0_20px_hsl(160_84%_39%/0.12)]"
                              : "text-muted-foreground hover:text-foreground hover:bg-white/[0.06]"
                            }`}
                          activeClassName=""
                        >
                          <item.icon className={`w-5 h-5 flex-shrink-0 transition-all duration-200 ${isActive ? "text-primary drop-shadow-[0_0_6px_hsl(160_84%_39%/0.5)]" : "group-hover:scale-110"}`} />
                          <AnimatePresence>
                            {expanded && (
                              <motion.span
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: "auto" }}
                                exit={{ opacity: 0, width: 0 }}
                                transition={{ duration: 0.15 }}
                                className={`text-sm font-medium whitespace-nowrap overflow-hidden ${isActive ? "text-primary" : ""}`}
                              >
                                {item.title}
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator className="my-3 bg-white/[0.04]" />

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

        {/* Subtle glow accent at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-primary/[0.03] to-transparent pointer-events-none" />
      </motion.div>
    </Sidebar>
  );
}
