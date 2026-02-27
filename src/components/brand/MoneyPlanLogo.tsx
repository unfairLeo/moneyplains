import { cn } from "@/lib/utils";

interface MoneyPlanLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function MoneyPlanLogo({ size = "md", className }: MoneyPlanLogoProps) {
  const sizes = {
    //Alteração de numero de 32 para 48
    sm: { icon: 20, container: 48 },
    md: { icon: 24, container: 64 },  //alteração de container com 40 para 64
    lg: { icon: 32, container: 100 },  //alteração de cointainer de 56 para 100
  };

  return (
    <img
      src="/logo-renew.png" // Confirme se o nome do arquivo na pasta public é esse mesmo
      alt="MoneyPlan Logo"
      // Aqui aplicamos o tamanho exato que vinha do objeto sizes
      style={{ width: sizes[size].container, height: sizes[size].container }}
      
      // Aqui aplicamos o estilo visual
      className={cn(
        "object-contain", // Mantém a proporção da imagem
        "rounded-full",   // Garante que seja redonda (se a imagem for quadrada)
        "hover:scale-105 transition-transform", // Um pequeno zoom ao passar o mouse (opcional, fica legal)
        className // Importante: permite que o Sidebar empurre a logo pro lugar certo
      )}
    />
  );
}
