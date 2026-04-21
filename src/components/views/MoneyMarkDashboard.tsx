import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BottomNav, type TabId } from "@/components/moneymark/BottomNav";
import { InicioView } from "@/components/moneymark/views/InicioView";
import { AnalisesView } from "@/components/moneymark/views/AnalisesView";
import { MissoesView } from "@/components/moneymark/views/MissoesView";
import { PerfilView } from "@/components/moneymark/views/PerfilView";

export function MoneyMarkDashboard() {
  const [activeTab, setActiveTab] = useState<TabId>("home");

  const renderView = () => {
    switch (activeTab) {
      case "home":
        return <InicioView />;
      case "analytics":
        return <AnalisesView />;
      case "missions":
        return <MissoesView />;
      case "profile":
        return <PerfilView />;
    }
  };

  return (
    <div className="relative min-h-screen bg-[#050508] text-white overflow-hidden">
      <div className="max-w-[400px] mx-auto relative min-h-screen flex flex-col">
        {/* Content area — pb-28 prevents BottomNav overlap */}
        <div className="flex-1 pb-28">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Bottom Nav (global, fixed) ── */}
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </div>
  );
}
