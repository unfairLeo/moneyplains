import { NavLink as RouterNavLink, NavLinkProps } from "react-router-dom";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";
// [ALTERAÇÃO 1] Importamos os componentes visuais do Tooltip (Shadcn UI)
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NavLinkCompatProps extends Omit<NavLinkProps, "className"> {
  className?: string;
  activeClassName?: string;
  pendingClassName?: string;
  tooltip?: string; // [ALTERAÇÃO 2] Adicionei essa propriedade opcional
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  ({ className, activeClassName, pendingClassName, to, tooltip, ...props }, ref) => {
    
    // [ALTERAÇÃO 3] Isolamos o Link numa variável para poder reutilizar
    const LinkComponent = (
      <RouterNavLink
        ref={ref}
        to={to}
        className={({ isActive, isPending }) =>
          cn(className, isActive && activeClassName, isPending && pendingClassName)
        }
        {...props}
      />
    );

    // [ALTERAÇÃO 4] Se tiver 'tooltip', envolvemos o link com a mágica do Tooltip
    if (tooltip) {
      return (
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              {LinkComponent}
            </TooltipTrigger>
            <TooltipContent 
              side="right" // Aparece na direita
              className="bg-black/90 text-white border-white/10 font-medium z-50" // Estilo Dark
            >
              <p>{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    // Se não tiver tooltip, retorna só o link normal (comportamento antigo)
    return LinkComponent;
  },
);

NavLink.displayName = "NavLink";

export { NavLink };
