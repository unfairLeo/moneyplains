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
          <header className="h-14 border-b border-border/30 flex items-center px-4 bg-background/80 backdrop-blur-sm sticky top-0 z-40">
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
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float" />
              <div
                className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-float"
                style={{ animationDelay: "-3s" }}
              />
              <div
                className="absolute inset-0 opacity-[0.02]"
                style={{
                  backgroundImage:
                    "linear-gradient(hsl(220 20% 18%) 1px, transparent 1px), linear-gradient(90deg, hsl(220 20% 18%) 1px, transparent 1px)",
                  backgroundSize: "50px 50px",
                }}
              />
            </div>

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
