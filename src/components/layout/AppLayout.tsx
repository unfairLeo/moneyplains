import * as React from "react";
import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { NeuralNetworkBackground } from "@/components/background/NeuralNetworkBackground";
import { NavSidebar } from "./NavSidebar";
import { ConversationProvider } from "@/contexts/ConversationContext";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { MoneyPlanLogo } from "@/components/brand/MoneyPlanLogo";
import { useIsMobile } from "@/hooks/use-mobile";

function AppLayoutContent() {
  const isMobile = useIsMobile();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <NavSidebar />

        {/* Main Content - offset for mini sidebar on desktop */}
        <div
          className="flex-1 flex flex-col min-w-0"
          style={!isMobile ? { marginLeft: 72 } : {}}
        >
          {/* Top Bar - Mobile Only */}
          <header className="h-14 flex items-center px-4 bg-transparent sticky top-0 z-40 md:hidden">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="h-10 w-10" />
              <MoneyPlanLogo size="sm" />
              <span className="text-lg font-bold">
                <span className="text-primary text-glow-emerald">Money</span>
                <span className="text-foreground">Plan</span>
              </span>
            </div>
          </header>

          <main className="flex-1 overflow-auto">
            <NeuralNetworkBackground />
            <div className="relative z-10">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export function AppLayout() {
  return (
    <ConversationProvider>
      <AppLayoutContent />
    </ConversationProvider>
  );
}
