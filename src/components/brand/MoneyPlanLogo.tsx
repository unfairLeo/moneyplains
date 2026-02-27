 import { cn } from "@/lib/utils";
 
 interface MoneyPlanLogoProps {
   size?: "sm" | "md" | "lg";
   className?: string;
 }
 
 export function MoneyPlanLogo({ size = "md", className }: MoneyPlanLogoProps) {
   const sizes = {
     sm: { icon: 20, container: 32 },
     md: { icon: 24, container: 40 },
     lg: { icon: 32, container: 56 },
   };
 
   return (
     <div
       className={cn(
         "rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 neon-glow-emerald flex items-center justify-center flex-shrink-0",
         className
       )}
       style={{ width: sizes[size].container, height: sizes[size].container }}
     >
       <svg
         width={sizes[size].icon}
         height={sizes[size].icon}
         viewBox="0 0 24 24"
         fill="none"
       >
         <defs>
           <linearGradient id="dollarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
             <stop offset="0%" stopColor="hsl(160 84% 50%)" />
             <stop offset="100%" stopColor="hsl(160 84% 35%)" />
           </linearGradient>
         </defs>
         <path
           d="M12 2v2m0 16v2M9 6h6c1.1 0 2 .9 2 2s-.9 2-2 2H9c-1.1 0-2 .9-2 2s.9 2 2 2h6"
           stroke="url(#dollarGradient)"
           strokeWidth="2.5"
           strokeLinecap="round"
           strokeLinejoin="round"
         />
       </svg>
     </div>
   );
 }