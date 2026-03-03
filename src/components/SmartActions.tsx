import { useState } from "react";
import { UtensilsCrossed, Car, ShoppingCart, Gamepad2, LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface SmartActionsProps {
  onAction: (text: string) => void;
}

interface ActionItem {
  icon: LucideIcon;
  label: string;
  template: string;
}

const actions: ActionItem[] = [
  { icon: UtensilsCrossed, label: "Alimentação", template: "Gastei R$  em Alimentação" },
  { icon: Car, label: "Transporte", template: "Gastei R$  em Transporte" },
  { icon: ShoppingCart, label: "Mercado", template: "Gastei R$  em Mercado" },
  { icon: Gamepad2, label: "Lazer", template: "Gastei R$  em Lazer" },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 260, damping: 20 },
  },
};

const SmartActions = ({ onAction }: SmartActionsProps) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const handleClick = (index: number, template: string) => {
    setActiveIndex(index);
    onAction(template);
    setTimeout(() => setActiveIndex(null), 400);
  };

  return (
    <motion.div
      className="grid grid-cols-4 gap-4 justify-items-center"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {actions.map((action, index) => {
        const Icon = action.icon;
        const isActive = activeIndex === index;

        return (
          <motion.button
            key={action.label}
            variants={itemVariants}
            whileHover={{ scale: 1.06, transition: { type: "spring", stiffness: 400, damping: 15 } }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleClick(index, action.template)}
            className="flex flex-col items-center gap-2 group"
          >
            <div
              className={`
                w-16 h-16 rounded-full glass-card border border-border/50
                flex items-center justify-center
                transition-all duration-300
                group-hover:border-primary/40 group-hover:shadow-[0_0_20px_hsl(160_84%_39%/0.15)]
                ${isActive ? "border-primary/60 shadow-[0_0_25px_hsl(160_84%_39%/0.3)]" : ""}
              `}
            >
              <Icon className="w-6 h-6 text-primary transition-colors duration-300" />
            </div>
            <span className="text-xs text-muted-foreground group-hover:text-primary transition-colors duration-200">
              {action.label}
            </span>
          </motion.button>
        );
      })}
    </motion.div>
  );
};

export default SmartActions;
