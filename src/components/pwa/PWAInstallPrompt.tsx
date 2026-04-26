import { useState, useEffect, useCallback } from "react";
import { Download, X, Share, PlusSquare, ArrowDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function useIsIOS() {
  const [isIOS, setIsIOS] = useState(false);
  useEffect(() => {
    const ua = navigator.userAgent || "";
    const isApple = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    setIsIOS(isApple);
  }, []);
  return isIOS;
}

function useIsStandalone() {
  const [isStandalone, setIsStandalone] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(display-mode: standalone)");
    setIsStandalone(mq.matches || (navigator as any).standalone === true);
  }, []);
  return isStandalone;
}

export function PWAInstallButton() {
  const isIOS = useIsIOS();
  const isStandalone = useIsStandalone();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSSheet, setShowIOSSheet] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = useCallback(async () => {
    if (isIOS) {
      setShowIOSSheet(true);
      return;
    }
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") setDismissed(true);
      setDeferredPrompt(null);
    }
  }, [isIOS, deferredPrompt]);

  if (isStandalone || dismissed) return null;

  // Show button for iOS always (no beforeinstallprompt there), or when prompt is captured
  if (!isIOS && !deferredPrompt) return null;

  return (
    <>
      <button
        onClick={handleInstallClick}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:shadow-[0_0_25px_hsl(160_84%_39%/0.4)] hover:scale-105 active:scale-95 transition-all duration-300"
      >
        <Download className="w-4 h-4" />
        Instalar App
      </button>

      <AnimatePresence>
        {showIOSSheet && (
          <IOSInstallSheet onClose={() => setShowIOSSheet(false)} />
        )}
      </AnimatePresence>
    </>
  );
}

function IOSInstallSheet({ onClose }: { onClose: () => void }) {
  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl bg-card border-t border-border p-6 pb-10 max-h-[85vh] overflow-y-auto"
      >
        {/* Handle */}
        <div className="flex justify-center mb-4">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-muted/50 text-muted-foreground hover:bg-muted transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-3">
            <Download className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-bold text-foreground">
            Instalar MoneyPlan<span className="text-primary">$</span>
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Adicione à sua tela inicial em 2 passos
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {/* Step 1 */}
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-muted/30 border border-border">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 shrink-0">
              <span className="text-sm font-bold text-primary">1</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground mb-1">
                Toque no ícone de Compartilhar
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Na barra inferior do Safari, toque no ícone{" "}
                <Share className="inline w-4 h-4 text-primary align-text-bottom" />{" "}
                (quadrado com seta para cima).
              </p>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex justify-center">
            <ArrowDown className="w-5 h-5 text-muted-foreground/50" />
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-muted/30 border border-border">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 shrink-0">
              <span className="text-sm font-bold text-primary">2</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground mb-1">
                Adicionar à Tela de Início
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Role o menu e toque em{" "}
                <span className="inline-flex items-center gap-1 text-primary font-medium">
                  <PlusSquare className="inline w-4 h-4 align-text-bottom" />
                  Tela de Início
                </span>
                . Depois confirme tocando em <span className="font-medium text-foreground">Adicionar</span>.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-[11px] text-muted-foreground/60">
            O app será instalado como <span className="font-medium text-muted-foreground">MoneyPlan$</span> na sua tela inicial.
          </p>
        </div>
      </motion.div>
    </>
  );
}
