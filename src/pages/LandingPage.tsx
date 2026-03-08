import { Bot, Coins, TrendingUp, Wallet, Shield, PiggyBank, ArrowRight, Sparkles, BarChart3, Lock, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ParticleBackground } from "@/components/landing/ParticleBackground";
import { AuroraBackground } from "@/components/landing/AuroraBackground";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  }),
};

function FloatingCard({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className={`bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-lg ${className}`}
    >
      {children}
    </motion.div>
  );
}

function MiniChart() {
  const points = [40, 55, 35, 60, 45, 70, 65, 80, 75, 90];
  const max = 100;
  const w = 200;
  const h = 60;
  const pathD = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * w;
      const y = h - (p / max) * h;
      return `${i === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");
  const areaD = `${pathD} L${w},${h} L0,${h} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-16">
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(160 84% 39%)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="hsl(160 84% 39%)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#chartGrad)" />
      <path d={pathD} fill="none" stroke="hsl(160 84% 39%)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Interactive particle background */}
      <ParticleBackground />

      {/* Aurora animated glow blobs */}
      <motion.div
        className="fixed top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-primary/10 blur-[180px] pointer-events-none z-[1]"
        animate={{ x: [0, 80, -40, 0], y: [0, 60, -30, 0] }}
        transition={{ duration: 20, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
      />
      <motion.div
        className="fixed bottom-[-15%] right-[-5%] w-[550px] h-[550px] rounded-full bg-primary/[0.08] blur-[160px] pointer-events-none z-[1]"
        animate={{ x: [0, -60, 50, 0], y: [0, -80, 40, 0] }}
        transition={{ duration: 25, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
      />
      <motion.div
        className="fixed top-[30%] left-[40%] w-[500px] h-[500px] rounded-full bg-emerald-500/[0.06] blur-[200px] pointer-events-none z-[1]"
        animate={{ x: [0, 40, -60, 0], y: [0, -50, 70, 0] }}
        transition={{ duration: 18, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
      />

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <img src="/logo-renew.png" alt="MoneyPlan" className="w-10 h-10 rounded-full" />
          <span className="font-display text-xl font-bold text-foreground">
            Money<span className="text-primary">Plan$</span>
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Recursos</a>
          <a href="#cofre" className="hover:text-foreground transition-colors">Cofre</a>
          <a href="#footer" className="hover:text-foreground transition-colors">Contato</a>
        </div>
        <Link
          to="/login"
          className="px-5 py-2 rounded-lg border border-primary/50 text-primary text-sm font-medium hover:bg-primary/10 transition-all"
        >
          Entrar
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-16 md:pt-24 pb-20">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          {/* Left column */}
          <div>
            <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
              <span className="inline-flex items-center gap-2 text-xs font-medium text-primary bg-primary/10 border border-primary/20 rounded-full px-3 py-1 mb-6">
                <Sparkles size={14} />
                Assistente com Inteligência Artificial
              </span>
            </motion.div>

            <motion.h1
              custom={1}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6"
            >
              <span className="text-primary">MoneyPlan$</span>
              {": "}
              <span className="text-foreground">Seu Assistente Financeiro Inteligente.</span>
            </motion.h1>

            <motion.p
              custom={2}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="text-muted-foreground text-lg md:text-xl leading-relaxed mb-8 max-w-lg"
            >
              Organize, guarde e invista com a ajuda da nossa IA de finanças. Controle total do seu patrimônio na palma da mão.
            </motion.p>

            <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible" className="flex flex-wrap gap-4">
              <Link
                to="/login"
                className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-base hover:shadow-[0_0_30px_hsl(160_84%_39%/0.5)] hover:scale-105 active:scale-95 transition-all duration-300"
              >
                Começar Agora
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#cofre"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border border-primary/40 text-primary font-semibold text-base hover:bg-primary/10 hover:border-primary transition-all duration-300"
              >
                Saiba Mais
              </a>
            </motion.div>
          </div>

          {/* Right column — floating cards composition */}
          <div className="relative min-h-[400px] md:min-h-[480px] flex items-center justify-center">
            {/* Main card */}
            <FloatingCard className="absolute z-20 top-[10%] left-[5%] md:left-[10%] w-[260px]" delay={0.3}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
                  <Wallet size={20} className="text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Patrimônio Estimado</p>
                  <p className="font-display text-xl font-bold text-foreground">R$ 257.430<span className="text-sm text-muted-foreground">,00</span></p>
                </div>
              </div>
              <MiniChart />
              <div className="flex items-center gap-1 mt-2">
                <TrendingUp size={14} className="text-primary" />
                <span className="text-xs text-primary font-medium">+12,4% este mês</span>
              </div>
            </FloatingCard>

            {/* AI Bot card */}
            <FloatingCard className="absolute z-30 top-[55%] right-[0%] md:right-[5%] w-[220px]" delay={0.5}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-full bg-secondary/15 flex items-center justify-center">
                  <Bot size={18} className="text-secondary" />
                </div>
                <p className="text-sm font-medium text-foreground">IA MoneyPlan</p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                "Você pode economizar <span className="text-primary font-medium">R$ 340</span> cortando assinaturas não usadas."
              </p>
            </FloatingCard>

            {/* Coins floating badge */}
            <FloatingCard className="absolute z-10 top-[0%] right-[10%] md:right-[15%] !p-3" delay={0.7}>
              <div className="flex items-center gap-2">
                <Coins size={20} className="text-tier-gold" />
                <span className="text-sm font-medium text-foreground">+R$ 1.200</span>
              </div>
            </FloatingCard>

            {/* Shield badge */}
            <FloatingCard className="absolute z-10 bottom-[5%] left-[0%] md:left-[5%] !p-3" delay={0.9}>
              <div className="flex items-center gap-2">
                <Shield size={18} className="text-primary" />
                <span className="text-xs text-muted-foreground">Dados Protegidos</span>
              </div>
            </FloatingCard>

            {/* Ambient circle */}
            <div className="absolute w-[300px] h-[300px] rounded-full border border-primary/10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse-slow" />
          </div>
        </div>
      </section>

      {/* Cofre Inteligente Section */}
      <section id="cofre" className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-16">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 md:p-10 grid md:grid-cols-2 gap-8 items-center"
        >
          {/* Left — simulated chart */}
          <div className="relative">
            <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 size={18} className="text-primary" />
                <span className="text-sm font-medium text-foreground">Rendimento do Cofre</span>
              </div>
              <svg viewBox="0 0 300 120" className="w-full h-32">
                <defs>
                  <linearGradient id="cofreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(160 84% 39%)" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="hsl(160 84% 39%)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,100 Q30,90 60,80 T120,60 T180,40 T240,30 T300,10 L300,120 L0,120 Z"
                  fill="url(#cofreGrad)"
                />
                <path
                  d="M0,100 Q30,90 60,80 T120,60 T180,40 T240,30 T300,10"
                  fill="none"
                  stroke="hsl(160 84% 39%)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>Jan</span><span>Mar</span><span>Mai</span><span>Jul</span><span>Set</span>
              </div>
            </div>
          </div>

          {/* Right — text */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center">
                <Lock size={24} className="text-primary" />
              </div>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">Cofre Inteligente</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Guarde seu dinheiro de forma automática e inteligente. Nossa IA analisa seus gastos e sugere o melhor momento para poupar, maximizando seus rendimentos com segurança total.
            </p>
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:shadow-[0_0_20px_hsl(160_84%_39%/0.4)] transition-all"
              >
                Saiba Mais
                <ChevronRight size={16} />
              </Link>
              <div className="flex -space-x-2">
                {[PiggyBank, Coins, TrendingUp].map((Icon, i) => (
                  <div key={i} className="w-9 h-9 rounded-full bg-card border-2 border-background flex items-center justify-center">
                    <Icon size={16} className="text-primary" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features grid */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 py-16">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="font-display text-2xl md:text-3xl font-bold text-center mb-12"
        >
          Por que escolher o <span className="text-primary">MoneyPlan$</span>?
        </motion.h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: Bot, title: "IA Financeira", desc: "Conselhos personalizados baseados nos seus hábitos reais de consumo." },
            { icon: Shield, title: "100% Seguro", desc: "Seus dados financeiros protegidos com criptografia de ponta." },
            { icon: TrendingUp, title: "Investimentos", desc: "Sugestões inteligentes para fazer seu dinheiro render mais." },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-primary/30 transition-colors group"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:shadow-[0_0_20px_hsl(160_84%_39%/0.3)] transition-shadow">
                <item.icon size={24} className="text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer id="footer" className="relative z-10 border-t border-white/5 mt-12">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-8">
          <div className="flex flex-wrap justify-center gap-6 md:gap-10 text-sm text-muted-foreground mb-6">
            {["Home", "Produção", "Investimentos", "Serviços", "Contato"].map((link) => (
              <a key={link} href="#" className="hover:text-foreground transition-colors">{link}</a>
            ))}
            <Link to="/login" className="hover:text-primary transition-colors">Entrar</Link>
          </div>
          <p className="text-center text-xs text-muted-foreground">
            Copyright © 2026 MoneyPlan$. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
