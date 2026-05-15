import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./landing-page.css";

export default function LandingPage() {
  const [tmValor, setTmValor] = useState(5000);
  const [tmAnos, setTmAnos] = useState(10);
  const [tmTipo, setTmTipo] = useState<{ key: string; rate: number; label: string }>({
    key: "cdi",
    rate: 0.105,
    label: "CDI (10.5%)",
  });

  const futuro = tmValor * Math.pow(1 + tmTipo.rate, tmAnos);
  const ganho = futuro - tmValor;
  const ganhoPct = ((futuro / tmValor - 1) * 100).toFixed(0);

  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".reveal, .reveal-l, .reveal-r");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("vis");
        });
      },
      { threshold: 0.1 },
    );
    els.forEach((el) => io.observe(el));

    // custom cursor
    const cursor = document.getElementById("mp-cursor");
    const ring = document.getElementById("mp-cursor-ring");
    const move = (e: MouseEvent) => {
      if (cursor) {
        cursor.style.left = e.clientX + "px";
        cursor.style.top = e.clientY + "px";
      }
      if (ring) {
        ring.style.left = e.clientX + "px";
        ring.style.top = e.clientY + "px";
      }
    };
    window.addEventListener("mousemove", move);
    return () => {
      io.disconnect();
      window.removeEventListener("mousemove", move);
    };
  }, []);

  const fmt = (v: number) =>
    "R$" + Math.round(v).toLocaleString("pt-BR");

  const investTypes = [
    { key: "cdi", rate: 0.105, label: "CDI (10.5%)", cls: "active-cdi" },
    { key: "ipca", rate: 0.07, label: "IPCA+ (7%)", cls: "active-ipca" },
    { key: "acoes", rate: 0.15, label: "Ações (15%)", cls: "active-acoes" },
    { key: "btc", rate: 0.8, label: "Bitcoin (~80%)", cls: "active-btc" },
  ];

  return (
    <div className="mp-landing">
      <div id="mp-cursor" />
      <div id="mp-cursor-ring" />

      <nav>
        <a href="#" className="logo">
          <div className="logo-icon">M$</div>
          <div className="logo-text">
            Money<span>Plain$</span>
          </div>
        </a>
        <div className="nav-links">
          <a href="#personalities">Personalidades</a>
          <a href="#features">Recursos</a>
          <a href="#metas">Metas</a>
          <a href="#timemachine">Máquina do Tempo</a>
          <a href="#pricing">Planos</a>
        </div>
        <Link to="/login" className="nav-cta">
          Começar grátis →
        </Link>
      </nav>

      <div className="ticker-bar">
        <div className="ticker-inner">
          <span>IBOV <span className="up">+1.24% ▲</span></span>
          <span>SELIC 10.5% a.a.</span>
          <span>DÓLAR R$5.12</span>
          <span>BTC R$348.200 <span className="up">▲</span></span>
          <span>CDI 10.4% a.a.</span>
          <span>PETR4 <span className="up">+0.8% ▲</span></span>
          <span>ITUB4 <span className="down">-0.3% ▼</span></span>
          <span>TESOURO SELIC 100% CDI</span>
          <span>VALE3 <span className="up">+2.1% ▲</span></span>
          <span>OURO R$21.400/g</span>
          <span>EGIE3 <span className="up">+3.2% ▲</span></span>
          <span>MGLU3 <span className="down">-1.1% ▼</span></span>
          <span>IBOV <span className="up">+1.24% ▲</span></span>
          <span>SELIC 10.5% a.a.</span>
          <span>DÓLAR R$5.12</span>
          <span>BTC R$348.200 <span className="up">▲</span></span>
          <span>CDI 10.4% a.a.</span>
          <span>PETR4 <span className="up">+0.8% ▲</span></span>
        </div>
      </div>

      <section id="hero" className="grid-bg">
        <div className="hero-content">
          <div>
            <div className="hero-tag">
              <div className="hero-tag-dot" />
              <span>IA Financeira com Personalidade</span>
            </div>
            <h1 className="hero-title">
              <div className="glitch" data-text="SEU DINHEIRO">SEU DINHEIRO</div>
              <div className="glitch" data-text="DO JEITO QUE">DO JEITO QUE</div>
              <div className="glitch gradient-text" data-text="VOCÊ ENTENDE">VOCÊ ENTENDE</div>
            </h1>
            <p className="hero-sub">
              MoneyPlain$ é o agente de IA que fala a sua língua — com sarcasmo,
              carinho de avó, energia de coach ou objetividade total — e
              transforma suas finanças em dashboards claros.
            </p>
            <div className="hero-btns">
              <Link to="/login" className="btn-primary">🚀 Começar agora — Grátis</Link>
              <a href="#features" className="btn-secondary">▶ Ver demo</a>
            </div>
          </div>

          <div className="hero-card-wrap">
            <div className="badge-float bf-1">
              <div className="bf-label">Meta do mês</div>
              <div className="bf-val">72% atingido 🎯</div>
            </div>
            <div className="badge-float bf-2">
              <div className="bf-label">Projeção 5 anos</div>
              <div className="bf-val">+R$45k 📈</div>
            </div>

            <div className="hero-card">
              <div className="card-header">
                <div className="card-avatar">
                  <div className="avatar-ring">🏋️</div>
                  <div>
                    <div className="card-name">MoneyPlain$</div>
                    <div className="card-mode"><span className="online-dot" />Coach Mode</div>
                  </div>
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,.3)", fontFamily: "JetBrains Mono, monospace" }}>16:42</div>
              </div>
              <div className="bubble-ai">Você gastou R$2.400 em delivery esse mês — 47% acima da média. Bora traçar um plano? 💪</div>
              <div className="bubble-user">Quero sim! Me mostra um dashboard dos meus gastos</div>
              <div className="mini-dash">
                <div style={{ fontSize: 11, color: "var(--neon)", fontFamily: "JetBrains Mono, monospace", marginBottom: 4 }}>
                  → Dashboard gerado automaticamente
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "rgba(255,255,255,.4)" }}>
                  <span>Maio 2025</span>
                  <span style={{ color: "var(--neon)" }}>Sobra: R$1.4k</span>
                </div>
                <div className="mini-bars">
                  {[60, 80, 45, 90, 55, 70, 35].map((h, i) => (
                    <div key={i} className="mini-bar" style={{ height: `${h}%`, background: i === 3 ? "var(--neon)" : "rgba(0,255,148,.3)" }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="scroll-ind">
          <span>scroll</span>
          <div className="scroll-ind-line" />
        </div>
      </section>

      <div className="divider" />

      <section className="full-section" style={{ padding: "60px 40px" }}>
        <div className="stats-bar">
          <div className="stat-item">
            <div className="stat-num neon">10k+</div>
            <div className="stat-lbl">Usuários ativos</div>
          </div>
          <div className="stat-item">
            <div className="stat-num blue">98%</div>
            <div className="stat-lbl">de satisfação</div>
          </div>
          <div className="stat-item">
            <div className="stat-num gold">R$4.2M</div>
            <div className="stat-lbl">Economizados pelos usuários</div>
          </div>
          <div className="stat-item">
            <div className="stat-num purple">4</div>
            <div className="stat-lbl">Personalidades únicas</div>
          </div>
        </div>
      </section>

      <section id="personalities">
        <div className="reveal">
          <div className="section-tag tag-purple">4 Personalidades</div>
          <h2 className="section-title">ESCOLHA COMO QUER<br/><span className="gradient-text">SER ORIENTADO</span></h2>
          <p className="section-sub">Cada pessoa aprende de um jeito diferente. Por isso o MoneyPlain$ tem 4 modos que você pode alternar na hora.</p>
        </div>
        <div className="persona-grid">
          {[
            { cls: "pc-n", emoji: "🤖", name: "Normal", desc: "Direto ao ponto. Explicações claras, objetivas e sem enrolação. Pra quem só quer resolver.", quote: '"Seu saldo é R$1.240. Você pode investir R$400 no Tesouro Direto este mês."', mode: "● MODO PADRÃO", color: "var(--neon)" },
            { cls: "pc-s", emoji: "😏", name: "Sarcástico", desc: "Críticas com humor para te manter focado. Para quem aguenta a verdade servida com ironia.", quote: '"Mais R$200 no iFood. Sua carteira agradece — pelo buraco extra que você fez nela."', mode: "● MODO BRUTAL", color: "var(--coral)" },
            { cls: "pc-v", emoji: "👵", name: "Vovó Econômica", desc: "Acolhedora, paciente e cheia de sabedoria. Finanças com carinho e exemplos do cotidiano.", quote: '"Meu bem, guarda um pouquinho todo mês que nem a avó sempre dizia: dinheiro no banco é paz."', mode: "● MODO CARINHOSO", color: "var(--gold)" },
            { cls: "pc-c", emoji: "🏋️", name: "Coach", desc: "Motivacional e intenso. Te desafia, celebra conquistas e não aceita desculpas financeiras.", quote: '"ISSO! R$300 a mais! A disciplina financeira é um músculo — continue treinando! 💪"', mode: "● MODO INTENSO", color: "var(--purple)" },
          ].map((p) => (
            <div key={p.name} className={`persona-card reveal ${p.cls}`}>
              <span className="persona-emoji">{p.emoji}</span>
              <div className="persona-name">{p.name}</div>
              <p className="persona-desc">{p.desc}</p>
              <div className="persona-quote" style={{ borderColor: p.color, color: p.color }}>{p.quote}</div>
              <div className="persona-mode" style={{ color: p.color }}>{p.mode}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="features">
        <div className="reveal">
          <div className="section-tag tag-green">Recursos</div>
          <h2 className="section-title">TUDO QUE VOCÊ PRECISA<br/><span className="gradient-text">EM UM SÓ LUGAR</span></h2>
        </div>
        <div className="features-grid">
          <div className="feat-main reveal-l">
            <div className="feat-icon">💬</div>
            <h3 className="feat-title">Dúvidas financeiras com Dashboard instantâneo</h3>
            <p className="feat-desc">Faça qualquer pergunta sobre suas finanças e receba não apenas uma resposta — mas um dashboard visual gerado automaticamente com gráficos, indicadores e insights personalizados.</p>
            <div style={{ marginTop: 24, padding: 20, background: "rgba(0,0,0,.3)", borderRadius: 14 }}>
              <div style={{ fontSize: 12, color: "var(--neon)", fontFamily: "JetBrains Mono, monospace", marginBottom: 14 }}>
                → "Quanto gastei em alimentação nos últimos 3 meses?"
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 14 }}>
                {[
                  { v: "R$2.1k", l: "Março" },
                  { v: "R$1.8k", l: "Abril" },
                  { v: "R$1.4k", l: "Maio ↓29%", c: "var(--neon)" },
                ].map((m, i) => (
                  <div key={i} style={{ background: "rgba(255,255,255,.03)", borderRadius: 10, padding: 12, textAlign: "center" }}>
                    <div style={{ fontFamily: "Bebas Neue, cursive", fontSize: 24, color: m.c || "#fff" }}>{m.v}</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,.4)" }}>{m.l}</div>
                  </div>
                ))}
              </div>
              <div className="db-bar-wrap"><div className="db-label">Delivery</div><div className="db-track"><div className="db-fill" style={{ width: "65%", background: "var(--coral)" }} /></div><div className="db-val">R$890</div></div>
              <div className="db-bar-wrap"><div className="db-label">Mercado</div><div className="db-track"><div className="db-fill" style={{ width: "42%", background: "var(--blue)" }} /></div><div className="db-val">R$560</div></div>
              <div className="db-bar-wrap"><div className="db-label">Restaurante</div><div className="db-track"><div className="db-fill" style={{ width: "28%", background: "var(--gold)" }} /></div><div className="db-val">R$380</div></div>
            </div>
          </div>
          <div className="feat-card reveal-r">
            <div className="feat-icon">📊</div>
            <h3 className="feat-title">Análise em tempo real</h3>
            <p className="feat-desc">Conecte seus bancos e cartões. A IA categoriza automaticamente e envia alertas inteligentes quando algo foge do padrão.</p>
            <div style={{ marginTop: 16, padding: 12, background: "rgba(255,107,107,.06)", border: "1px solid rgba(255,107,107,.2)", borderRadius: 10, fontSize: 12, color: "var(--coral)" }}>
              ⚡ Alerta: Gasto 47% acima da média em delivery
            </div>
          </div>
          <div className="feat-card reveal-r">
            <div className="feat-icon">🔔</div>
            <h3 className="feat-title">Alertas Inteligentes</h3>
            <p className="feat-desc">Notificações personalizadas no seu estilo de personalidade favorita para nunca perder um insight importante.</p>
            <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, padding: "5px 11px", background: "rgba(0,255,148,.08)", color: "var(--neon)", borderRadius: 100, fontFamily: "JetBrains Mono, monospace" }}>Meta próxima</span>
              <span style={{ fontSize: 11, padding: "5px 11px", background: "rgba(255,107,107,.08)", color: "var(--coral)", borderRadius: 100, fontFamily: "JetBrains Mono, monospace" }}>Saldo baixo</span>
            </div>
          </div>
        </div>
      </section>

      <section id="metas">
        <div className="goals-layout">
          <div className="reveal-l">
            <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 20, padding: 28 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div style={{ fontSize: 12, color: "var(--neon)", fontFamily: "JetBrains Mono, monospace", fontWeight: 700, letterSpacing: 1.5 }}>🌟 METAS & SONHOS</div>
                <button style={{ background: "rgba(0,255,148,.08)", color: "var(--neon)", border: "1px solid rgba(0,255,148,.2)", padding: "6px 12px", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "none" }}>+ Nova meta</button>
              </div>
              {[
                { icon: "🏠", name: "Entrada do apartamento", pct: 72, atual: "R$36.000", total: "R$50.000", t: "~8 meses", color: "var(--neon)" },
                { icon: "✈️", name: "Viagem para Europa", pct: 38, atual: "R$7.600", total: "R$20.000", t: "~18 meses", color: "var(--blue)" },
                { icon: "🚗", name: "Carro novo", pct: 15, atual: "R$6.000", total: "R$40.000", t: "~36 meses", color: "var(--gold)" },
              ].map((g) => (
                <div key={g.name} className="goal-card">
                  <div className="goal-top">
                    <div className="goal-info"><span className="goal-icon">{g.icon}</span><span className="goal-name">{g.name}</span></div>
                    <div className="goal-pct" style={{ color: g.color }}>{g.pct}%</div>
                  </div>
                  <div className="goal-track"><div className="goal-fill" style={{ width: `${g.pct}%`, background: g.color, color: g.color }} /></div>
                  <div className="goal-sub"><span>{g.atual} de {g.total}</span><span>{g.t}</span></div>
                </div>
              ))}
              <div className="ai-tip">
                <div className="ai-tip-label">🏋️ COACH DICE:</div>
                <div className="ai-tip-text">Se aumentar suas economias em R$200/mês, você atinge a meta da viagem 5 meses antes! Você consegue! 💪</div>
              </div>
            </div>
          </div>
          <div className="reveal-r">
            <div className="section-tag tag-blue">Aba de Metas & Sonhos</div>
            <h2 className="section-title">SEUS SONHOS MERECEM<br/><span className="gradient-text">UM PLANO DE VERDADE</span></h2>
            <p className="section-sub" style={{ marginBottom: 24 }}>Cadastre tudo que um dia quer realizar. A IA calcula o caminho realista, ajusta o plano mensalmente e celebra cada conquista do seu jeito.</p>
            {[
              "Projeção automática baseada no seu perfil financeiro",
              "Alertas quando você desvia do plano",
              "Motivação no modo de personalidade que você escolheu",
              "Priorização inteligente entre múltiplas metas simultâneas",
            ].map((t) => (
              <div key={t} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", fontSize: 14, color: "rgba(255,255,255,.7)" }}>
                <span style={{ color: "var(--neon)", fontWeight: 700 }}>✓</span>{t}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="timemachine">
        <div className="reveal" style={{ textAlign: "center" }}>
          <div className="section-tag tag-blue" style={{ margin: "0 auto 20px" }}>⏳ Máquina do Tempo</div>
          <h2 className="section-title">VIAJE NO TEMPO DOS<br/><span className="gradient-text">SEUS INVESTIMENTOS</span></h2>
          <p className="section-sub" style={{ margin: "12px auto 0" }}>Simule quanto um valor investido hoje valerá no futuro — com comparativo entre diferentes tipos de investimento.</p>
        </div>
        <div className="tm-wrap reveal">
          <div className="tm-grid">
            <div>
              <div style={{ fontSize: 12, color: "var(--blue)", fontFamily: "JetBrains Mono, monospace", fontWeight: 700, letterSpacing: 1.5, marginBottom: 20 }}>⚙️ CONFIGURE SUA VIAGEM</div>
              <div style={{ marginBottom: 24 }}>
                <div className="tm-label">Valor inicial</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: "var(--neon)", fontFamily: "JetBrains Mono, monospace", fontWeight: 700 }}>R$</span>
                  <input className="tm-input" type="number" value={tmValor} onChange={(e) => setTmValor(Number(e.target.value) || 0)} />
                </div>
              </div>
              <div style={{ marginBottom: 24 }}>
                <div className="tm-label">Período: {tmAnos} anos</div>
                <input className="tm-slider" type="range" min={1} max={30} value={tmAnos} onChange={(e) => setTmAnos(Number(e.target.value))} />
              </div>
              <div>
                <div className="tm-label">Tipo de investimento</div>
                <div className="invest-btns">
                  {investTypes.map((t) => (
                    <button key={t.key} className={`inv-btn ${tmTipo.key === t.key ? t.cls : ""}`} onClick={() => setTmTipo(t)}>{t.label}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="tm-result">
              <div className="tm-result-label">VALOR FUTURO ESTIMADO</div>
              <div className="tm-result-val">{fmt(futuro)}</div>
              <div className="tm-result-gain">+{ganhoPct}% de ganho</div>
              <div className="tm-row"><span className="tm-row-label">Valor investido</span><span className="tm-row-val">{fmt(tmValor)}</span></div>
              <div className="tm-row"><span className="tm-row-label">Rendimento bruto</span><span className="tm-row-val neon">+{fmt(ganho)}</span></div>
              <div className="tm-row"><span className="tm-row-label">Período</span><span className="tm-row-val">{tmAnos} anos</span></div>
              <div className="tm-row"><span className="tm-row-label">Taxa anual</span><span className="tm-row-val">{(tmTipo.rate * 100).toFixed(1)}% a.a.</span></div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,.25)", marginTop: 16 }}>* Simulação educacional. Não é recomendação de investimento.</div>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing">
        <div className="reveal" style={{ textAlign: "center" }}>
          <div className="section-tag tag-gold" style={{ margin: "0 auto 20px" }}>Planos</div>
          <h2 className="section-title">INVISTA EM VOCÊ<br/><span className="gradient-text">ANTES DO MERCADO</span></h2>
        </div>
        <div className="pricing-grid">
          <div className="price-card reveal">
            <div className="price-tier">GRÁTIS</div>
            <div className="price-val">R$0</div>
            <div className="price-period">/mês para sempre</div>
            <ul className="price-feat">
              <li><span>✓</span>1 personalidade (Normal)</li>
              <li><span>✓</span>10 perguntas/mês</li>
              <li><span>✓</span>Dashboard básico</li>
              <li><span>✓</span>1 meta ativa</li>
              <li className="off"><span>✗</span>Máquina do tempo</li>
              <li className="off"><span>✗</span>Alertas inteligentes</li>
            </ul>
            <button className="price-btn price-btn-ghost">Começar grátis</button>
          </div>
          <div className="price-card price-pop reveal">
            <div className="price-tier neon">PRO</div>
            <div className="price-val gradient-text">R$29</div>
            <div className="price-period">/mês</div>
            <ul className="price-feat">
              <li><span>✓</span>Todas as 4 personalidades</li>
              <li><span>✓</span>Perguntas ilimitadas</li>
              <li><span>✓</span>Dashboard completo</li>
              <li><span>✓</span>Metas & sonhos ilimitados</li>
              <li><span>✓</span>Máquina do tempo</li>
              <li><span>✓</span>Alertas inteligentes</li>
            </ul>
            <button className="price-btn price-btn-main">Assinar Pro →</button>
          </div>
          <div className="price-card reveal">
            <div className="price-tier purple">EXPERT</div>
            <div className="price-val">R$79</div>
            <div className="price-period">/mês</div>
            <ul className="price-feat">
              <li><span>✓</span>Tudo do Pro</li>
              <li><span>✓</span>Conexão com corretoras</li>
              <li><span>✓</span>Relatórios em PDF</li>
              <li><span>✓</span>Modo família (5 usuários)</li>
              <li><span>✓</span>Suporte prioritário</li>
              <li><span>✓</span>API para integração</li>
            </ul>
            <button className="price-btn price-btn-purple">Assinar Expert</button>
          </div>
        </div>
      </section>

      <section id="cta-section">
        <div className="reveal" style={{ position: "relative", zIndex: 1 }}>
          <h2 className="cta-title">COMECE HOJE.<br/><span className="gradient-text">GRÁTIS. DE VERDADE.</span></h2>
          <p className="cta-sub">Sem cartão de crédito. Sem pegadinha.<br/>Só você e suas finanças finalmente fazendo sentido.</p>
          <Link to="/login" className="btn-primary" style={{ display: "inline-block" }}>🚀 Criar minha conta grátis agora</Link>
        </div>
      </section>

      <footer>
        <div className="footer-inner">
          <div>
            <div className="logo" style={{ marginBottom: 4 }}>
              <div className="logo-icon">M$</div>
              <div className="logo-text">MoneyPlain$</div>
            </div>
            <p className="footer-logo-text">Seu agente de IA financeiro com personalidade. Finanças que fazem sentido pra você, do seu jeito.</p>
          </div>
          <div className="footer-col">
            <h5>Produto</h5>
            <a href="#personalities">Personalidades</a>
            <a href="#features">Dashboard</a>
            <a href="#metas">Metas & Sonhos</a>
            <a href="#timemachine">Máquina do Tempo</a>
          </div>
          <div className="footer-col">
            <h5>Empresa</h5>
            <a href="#">Sobre nós</a><a href="#">Blog</a><a href="#">Carreiras</a><a href="#">Imprensa</a>
          </div>
          <div className="footer-col">
            <h5>Legal</h5>
            <a href="#">Privacidade</a><a href="#">Termos de uso</a><a href="#">Cookies</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2025 MoneyPlain$. Todos os direitos reservados.</span>
          <span>Este produto não é consultoria financeira regulamentada.</span>
        </div>
      </footer>
    </div>
  );
}