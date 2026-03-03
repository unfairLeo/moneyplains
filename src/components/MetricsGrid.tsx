import { MetricItem } from "@/types/api";
import { getIcon } from "@/lib/iconMap";
import { motion } from "framer-motion";

interface MetricsGridProps {
  metrics: MetricItem[];
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 260, damping: 20 },
  },
};

const MetricsGrid = ({ metrics }: MetricsGridProps) => {
  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {metrics.map((metric, index) => {
        const IconComponent = getIcon(metric.icon);

        return (
          <motion.div
            key={index}
            variants={cardVariants}
            whileHover={{
              scale: 1.02,
              boxShadow: "0 0 24px hsl(160 84% 39% / 0.12)",
              borderColor: "hsl(160 84% 39% / 0.3)",
              transition: { type: "spring", stiffness: 400, damping: 20 },
            }}
            className="glass-card p-5 group border border-transparent transition-colors duration-200"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <IconComponent className="w-5 h-5 text-primary group-hover:scale-110 transition-transform duration-200" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1 truncate">{metric.label}</p>
            <p className="text-2xl font-display font-bold text-foreground group-hover:text-primary transition-colors duration-200">
              {metric.value}
            </p>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default MetricsGrid;
