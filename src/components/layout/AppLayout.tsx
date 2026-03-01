import * as React from "react";
import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import bgImage from "@/assets/fundompsemimg.png";
import { NavSidebar } from "./NavSidebar";
import { ConversationProvider } from "@/contexts/ConversationContext";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { MoneyPlanLogo } from "@/components/brand/MoneyPlanLogo";

function AppLayoutContent() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        {/* Left Navigation Sidebar */}
        <NavSidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Bar */}
          <header className="h-14 border-b border-white/10 flex items-center px-4 bg-black/30 backdrop-blur-md sticky top-0 z-40">
            {/* Hamburger + Logo - Mobile Only */}
            <div className="flex items-center gap-3 md:hidden">
              <SidebarTrigger className="h-10 w-10" />
              <MoneyPlanLogo size="sm" />
              <span className="text-lg font-bold">
                <span className="text-primary text-glow-emerald">Money</span>
                <span className="text-foreground">Plan</span>
              </span>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 overflow-auto">
            {/* Background Effects */}
            <img
              src={bgImage}
              alt=""
              className="fixed inset-0 w-full h-full object-cover pointer-events-none z-0"
            />

            {/* Page Content */}
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
