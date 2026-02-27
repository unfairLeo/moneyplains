import { MetricItem } from "@/types/api";
import { getIcon } from "@/lib/iconMap";

interface MetricsGridProps {
  metrics: MetricItem[];
}

const MetricsGrid = ({ metrics }: MetricsGridProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => {
        const IconComponent = getIcon(metric.icon);
        
        return (
          <div
            key={index}
            className="glass-card p-5 group hover:border-primary/40 transition-all duration-300 hover:scale-[1.02] animate-bounce-in"
            style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'backwards' }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 group-hover:animate-glow-pulse transition-colors">
                <IconComponent className="w-5 h-5 text-primary group-hover:scale-110 transition-transform duration-300" />
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground mb-1 truncate">
              {metric.label}
            </p>
            
            <p className="text-2xl font-display font-bold text-foreground group-hover:text-primary group-hover:text-glow-emerald transition-all duration-300">
              {metric.value}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default MetricsGrid;
