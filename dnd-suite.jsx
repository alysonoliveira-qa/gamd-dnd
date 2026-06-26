import { useState, useRef, useEffect } from "react";

// ============================================================
// DESIGN TOKENS — Dark parchment + arcane gold + blood crimson
// ============================================================
const T = {
  bg0: "#0d0b10",
  bg1: "#13101a",
  bg2: "#1c1726",
  bg3: "#251f35",
  border: "#2e2742",
  gold: "#c9a84c",
  goldDim: "#7a6030",
  crimson: "#9b1d20",
  crimsonBright: "#c42428",
  text: "#e8e0d0",
  textDim: "#8c8070",
  textMuted: "#4a4260",
  arcane: "#7c5cbf",
  arcaneBright: "#a47fe0",
  success: "#4a9e6b",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400&family=JetBrains+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: ${T.bg0};
    color: ${T.text};
    font-family: 'EB Garamond', Georgia, serif;
    font-size: 17px;
    line-height: 1.6;
    min-height: 100vh;
  }

  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: ${T.bg1}; }
  ::-webkit-scrollbar-thumb { background: ${T.goldDim}; border-radius: 3px; }

  .app { display: flex; min-height: 100vh; }

  /* SIDEBAR */
  .sidebar {
    width: 220px;
    min-width: 220px;
    background: ${T.bg1};
    border-right: 1px solid ${T.border};
    display: flex;
    flex-direction: column;
    padding: 0;
    position: sticky;
    top: 0;
    height: 100vh;
    overflow-y: auto;
  }
  .sidebar-logo {
    padding: 28px 20px 20px;
    border-bottom: 1px solid ${T.border};
  }
  .sidebar-logo h1 {
    font-family: 'Cinzel', serif;
    font-size: 15px;
    font-weight: 700;
    color: ${T.gold};
    letter-spacing: 0.08em;
    line-height: 1.3;
  }
  .sidebar-logo p {
    font-size: 11px;
    color: ${T.textMuted};
    margin-top: 3px;
    font-family: 'JetBrains Mono', monospace;
    letter-spacing: 0.05em;
  }
  .nav-section {
    padding: 16px 12px 8px;
  }
  .nav-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    letter-spacing: 0.15em;
    color: ${T.textMuted};
    text-transform: uppercase;
    padding: 0 8px;
    margin-bottom: 6px;
  }
  .nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 12px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    color: ${T.textDim};
    transition: all 0.15s;
    border: 1px solid transparent;
    font-family: 'EB Garamond', serif;
    margin-bottom: 2px;
  }
  .nav-item:hover { background: ${T.bg2}; color: ${T.text}; }
  .nav-item.active {
    background: ${T.bg2};
    color: ${T.gold};
    border-color: ${T.border};
  }
  .nav-item .icon { font-size: 16px; width: 20px; text-align: center; }

  /* MAIN */
  .main { flex: 1; display: flex; flex-direction: column; min-width: 0; }
  .topbar {
    background: ${T.bg1};
    border-bottom: 1px solid ${T.border};
    padding: 14px 28px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .topbar h2 {
    font-family: 'Cinzel', serif;
    font-size: 16px;
    font-weight: 600;
    color: ${T.text};
    letter-spacing: 0.05em;
  }
  .topbar-badge {
    background: ${T.bg3};
    border: 1px solid ${T.border};
    border-radius: 20px;
    padding: 4px 14px;
    font-size: 12px;
    color: ${T.textDim};
    font-family: 'JetBrains Mono', monospace;
  }
  .content { padding: 28px; flex: 1; }

  /* CARDS */
  .card {
    background: ${T.bg1};
    border: 1px solid ${T.border};
    border-radius: 10px;
    padding: 20px;
  }
  .card-title {
    font-family: 'Cinzel', serif;
    font-size: 13px;
    font-weight: 600;
    color: ${T.gold};
    letter-spacing: 0.08em;
    margin-bottom: 14px;
    text-transform: uppercase;
  }

  /* GRID */
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
  .grid-4 { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 12px; }
  .gap-16 { display: flex; flex-direction: column; gap: 16px; }

  /* STAT BLOCK */
  .stat-box {
    background: ${T.bg2};
    border: 1px solid ${T.border};
    border-radius: 8px;
    padding: 14px 10px;
    text-align: center;
  }
  .stat-score {
    font-family: 'Cinzel', serif;
    font-size: 28px;
    font-weight: 700;
    color: ${T.text};
    line-height: 1;
  }
  .stat-mod {
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
    color: ${T.gold};
    margin-top: 2px;
  }
  .stat-name {
    font-size: 10px;
    color: ${T.textMuted};
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-top: 4px;
    font-family: 'JetBrains Mono', monospace;
  }

  /* HP BAR */
  .hp-bar-wrap { background: ${T.bg3}; border-radius: 4px; height: 8px; overflow: hidden; }
  .hp-bar { height: 100%; border-radius: 4px; transition: width 0.3s; }

  /* DICE */
  .dice-grid { display: flex; gap: 10px; flex-wrap: wrap; }
  .die-btn {
    width: 62px;
    height: 62px;
    background: ${T.bg2};
    border: 2px solid ${T.border};
    border-radius: 10px;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-family: 'Cinzel', serif;
    font-size: 11px;
    color: ${T.textDim};
    gap: 2px;
    transition: all 0.15s;
    position: relative;
    overflow: hidden;
  }
  .die-btn:hover { border-color: ${T.gold}; color: ${T.gold}; background: ${T.bg3}; }
  .die-btn .die-icon { font-size: 24px; }
  .die-btn.rolling { animation: dieShake 0.35s ease; border-color: ${T.arcaneBright}; }
  @keyframes dieShake {
    0%,100%{transform:rotate(0deg)} 20%{transform:rotate(-8deg)} 40%{transform:rotate(8deg)} 60%{transform:rotate(-5deg)} 80%{transform:rotate(5deg)}
  }

  .roll-result {
    background: ${T.bg2};
    border: 1px solid ${T.border};
    border-radius: 10px;
    padding: 20px;
    text-align: center;
    min-height: 110px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .roll-number {
    font-family: 'Cinzel', serif;
    font-size: 52px;
    font-weight: 700;
    line-height: 1;
    background: linear-gradient(135deg, ${T.gold}, ${T.arcaneBright});
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .roll-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: ${T.textMuted};
    margin-top: 6px;
  }
  .roll-history {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 12px;
  }
  .roll-chip {
    background: ${T.bg3};
    border: 1px solid ${T.border};
    border-radius: 4px;
    padding: 2px 8px;
    font-size: 12px;
    font-family: 'JetBrains Mono', monospace;
    color: ${T.textDim};
  }

  /* BUTTONS */
  .btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 18px;
    border-radius: 6px;
    border: none;
    cursor: pointer;
    font-family: 'Cinzel', serif;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.05em;
    transition: all 0.15s;
  }
  .btn-gold {
    background: linear-gradient(135deg, ${T.goldDim}, ${T.gold});
    color: ${T.bg0};
  }
  .btn-gold:hover { filter: brightness(1.1); }
  .btn-ghost {
    background: transparent;
    color: ${T.textDim};
    border: 1px solid ${T.border};
  }
  .btn-ghost:hover { border-color: ${T.gold}; color: ${T.gold}; }
  .btn-crimson {
    background: ${T.crimson};
    color: ${T.text};
  }
  .btn-crimson:hover { background: ${T.crimsonBright}; }
  .btn:disabled { opacity: 0.4; cursor: not-allowed; }

  /* INPUTS */
  .field-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.1em;
    color: ${T.textMuted};
    text-transform: uppercase;
    margin-bottom: 6px;
  }
  .field-input {
    width: 100%;
    background: ${T.bg2};
    border: 1px solid ${T.border};
    border-radius: 6px;
    padding: 9px 12px;
    color: ${T.text};
    font-family: 'EB Garamond', serif;
    font-size: 15px;
    outline: none;
    transition: border-color 0.15s;
  }
  .field-input:focus { border-color: ${T.gold}; }
  .field-select {
    width: 100%;
    background: ${T.bg2};
    border: 1px solid ${T.border};
    border-radius: 6px;
    padding: 9px 12px;
    color: ${T.text};
    font-family: 'EB Garamond', serif;
    font-size: 15px;
    outline: none;
    cursor: pointer;
  }

  /* CHAT (DM) */
  .chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    min-height: 0;
  }
  .msg {
    display: flex;
    gap: 10px;
    align-items: flex-start;
  }
  .msg-avatar {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    flex-shrink: 0;
    border: 1px solid ${T.border};
  }
  .msg-avatar.dm { background: ${T.bg3}; border-color: ${T.goldDim}; }
  .msg-avatar.player { background: ${T.bg2}; border-color: ${T.arcane}; }
  .msg-bubble {
    background: ${T.bg2};
    border: 1px solid ${T.border};
    border-radius: 10px;
    padding: 10px 14px;
    font-size: 15px;
    line-height: 1.65;
    max-width: 82%;
  }
  .msg-bubble.dm { border-color: ${T.goldDim}; }
  .msg-bubble.player { background: ${T.bg3}; }
  .msg-name {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    color: ${T.textMuted};
    margin-bottom: 4px;
    letter-spacing: 0.05em;
  }
  .msg-name.dm { color: ${T.goldDim}; }

  .chat-input-row {
    display: flex;
    gap: 10px;
    padding: 14px 16px;
    border-top: 1px solid ${T.border};
    background: ${T.bg1};
  }
  .chat-input {
    flex: 1;
    background: ${T.bg2};
    border: 1px solid ${T.border};
    border-radius: 8px;
    padding: 10px 14px;
    color: ${T.text};
    font-family: 'EB Garamond', serif;
    font-size: 15px;
    outline: none;
    resize: none;
  }
  .chat-input:focus { border-color: ${T.gold}; }

  /* TYPING INDICATOR */
  .typing { display: flex; align-items: center; gap: 4px; padding: 6px 0; }
  .typing span {
    width: 7px; height: 7px;
    background: ${T.goldDim};
    border-radius: 50%;
    animation: typingBounce 1.2s infinite;
  }
  .typing span:nth-child(2) { animation-delay: 0.2s; }
  .typing span:nth-child(3) { animation-delay: 0.4s; }
  @keyframes typingBounce {
    0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)}
  }

  /* PLAYERS LIST */
  .player-card {
    background: ${T.bg2};
    border: 1px solid ${T.border};
    border-radius: 8px;
    padding: 14px 16px;
    display: flex;
    align-items: center;
    gap: 14px;
    cursor: pointer;
    transition: border-color 0.15s;
  }
  .player-card:hover { border-color: ${T.gold}; }
  .player-avatar {
    width: 46px; height: 46px;
    border-radius: 50%;
    background: ${T.bg3};
    border: 2px solid ${T.border};
    display: flex; align-items: center; justify-content: center;
    font-size: 22px;
  }
  .player-info h3 { font-family: 'Cinzel', serif; font-size: 14px; color: ${T.text}; }
  .player-info p { font-size: 13px; color: ${T.textDim}; margin-top: 2px; }
  .player-badge {
    margin-left: auto;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: ${T.arcane};
    background: ${T.bg3};
    border: 1px solid ${T.border};
    border-radius: 4px;
    padding: 2px 8px;
  }

  /* CAMPAIGN OVERVIEW */
  .session-card {
    background: ${T.bg2};
    border: 1px solid ${T.border};
    border-left: 3px solid ${T.gold};
    border-radius: 6px;
    padding: 14px 16px;
  }
  .session-card h4 { font-family: 'Cinzel', serif; font-size: 14px; color: ${T.text}; }
  .session-card p { font-size: 14px; color: ${T.textDim}; margin-top: 4px; }
  .session-card .meta {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: ${T.textMuted};
    margin-top: 8px;
  }

  /* TABS */
  .tabs { display: flex; gap: 4px; border-bottom: 1px solid ${T.border}; margin-bottom: 20px; }
  .tab {
    padding: 9px 16px;
    cursor: pointer;
    font-family: 'Cinzel', serif;
    font-size: 12px;
    letter-spacing: 0.05em;
    color: ${T.textDim};
    border-bottom: 2px solid transparent;
    margin-bottom: -1px;
    transition: all 0.15s;
  }
  .tab:hover { color: ${T.text}; }
  .tab.active { color: ${T.gold}; border-bottom-color: ${T.gold}; }

  /* MISC */
  .divider { border: none; border-top: 1px solid ${T.border}; margin: 16px 0; }
  .tag {
    display: inline-block;
    background: ${T.bg3};
    border: 1px solid ${T.border};
    border-radius: 4px;
    padding: 2px 8px;
    font-size: 12px;
    font-family: 'JetBrains Mono', monospace;
    color: ${T.textDim};
  }
  .tag.arcane { color: ${T.arcaneBright}; border-color: ${T.arcane}; }
  .tag.gold { color: ${T.gold}; border-color: ${T.goldDim}; }
  .tag.crimson { color: ${T.crimsonBright}; border-color: ${T.crimson}; }
  .empty-state {
    text-align: center;
    padding: 40px 20px;
    color: ${T.textMuted};
    font-style: italic;
  }
  .rune-divider {
    display: flex; align-items: center; gap: 10px; margin: 8px 0;
    color: ${T.textMuted}; font-size: 12px; font-family: 'JetBrains Mono', monospace;
  }
  .rune-divider::before, .rune-divider::after {
    content: ''; flex: 1; border-top: 1px solid ${T.border};
  }
`;

// ============================================================
// DATA
// ============================================================
const RACES = ["Humano", "Elfo", "Anão", "Halfling", "Draconato", "Gnomo", "Meio-Elfo", "Meio-Orc", "Tiefling"];
const CLASSES = ["Bárbaro", "Bardo", "Clérigo", "Druida", "Guerreiro", "Monge", "Paladino", "Ranger", "Ladino", "Feiticeiro", "Bruxo", "Mago"];
const ALIGNMENTS = ["Leal e Bom", "Neutro e Bom", "Caótico e Bom", "Leal e Neutro", "Neutro", "Caótico e Neutro", "Leal e Mau", "Neutro e Mau", "Caótico e Mau"];
const STATS = ["FOR", "DES", "CON", "INT", "SAB", "CAR"];

const mod = (v) => {
  const m = Math.floor((v - 10) / 2);
  return (m >= 0 ? "+" : "") + m;
};

const hpColor = (cur, max) => {
  const pct = cur / max;
  if (pct > 0.5) return T.success;
  if (pct > 0.25) return "#c9842c";
  return T.crimsonBright;
};

const INITIAL_PLAYERS = [
  {
    id: 1,
    name: "Theron Ashblade",
    player: "Lucas",
    race: "Humano",
    class: "Guerreiro",
    level: 5,
    hp: 42,
    maxHp: 52,
    ac: 18,
    speed: 30,
    xp: 6500,
    background: "Soldado",
    alignment: "Leal e Bom",
    avatar: "⚔️",
    stats: { FOR: 18, DES: 14, CON: 16, INT: 10, SAB: 12, CAR: 9 },
    skills: ["Atletismo", "Intimidação", "Percepção"],
    languages: ["Comum", "Élfico"],
    traits: "Cumpro minhas promessas, não importa o custo.",
    bonds: "Devo minha vida a meu mentor Gareth.",
    flaws: "Quando há dinheiro em jogo, esqueço meus valores.",
    backstory: "Ex-capitão de uma guarda municipal destruída por um dragão negro. Busca redenção e vingança.",
  },
  {
    id: 2,
    name: "Sylara Moonwhisper",
    player: "Ana",
    race: "Meio-Elfo",
    class: "Mago",
    level: 5,
    hp: 28,
    maxHp: 35,
    ac: 13,
    speed: 30,
    xp: 6500,
    background: "Sábio",
    alignment: "Caótico e Bom",
    avatar: "✨",
    stats: { FOR: 8, DES: 14, CON: 12, INT: 18, SAB: 13, CAR: 15 },
    skills: ["Arcana", "História", "Investigação", "Percepção"],
    languages: ["Comum", "Élfico", "Dracônico", "Abissal"],
    traits: "Cito textos arcanos para qualquer situação.",
    bonds: "Meu grimório é o bem mais precioso que possuo.",
    flaws: "Ignoro as pessoas que considero menos inteligentes.",
    backstory: "Filha de uma nobre elfa e um acadêmico humano. Abandonou a Academia para descobrir a origem de uma maldição ancestral.",
  },
];

const INITIAL_CAMPAIGN = {
  name: "A Sombra de Eldrath",
  session: 7,
  arc: "O Labirinto de Cristal",
  lastPlayed: "18 Jun 2026",
  nextSession: "25 Jun 2026",
  summary: "O grupo descobriu que o Labirinto de Cristal é, na verdade, a prisão do deus esquecido Eldrath. Para avançar, precisam encontrar as três Chaves de Âmbar espalhadas pelos andares do dungeon.",
  sessions: [
    { n: 6, title: "A Entrada Proibida", date: "11 Jun", summary: "O grupo forçou a entrada do Labirinto após derrotar a Esfinge Guardiã. Sylara decifrou a inscrição da porta: 'Apenas os dignos encontrarão a luz no fim da escuridão'." },
    { n: 5, title: "A Cidade de Mirhas", date: "04 Jun", summary: "Negociaram com a guilda de ladrões local para obter um mapa parcial do labirinto. Theron fez um acordo perigoso com o líder da guilda." },
    { n: 4, title: "Sangue no Desfiladeiro", date: "28 Mai", summary: "Emboscada por cultistas de Eldrath. O grupo descobriu que os cultistas acreditam que libertar o deus trará uma nova era." },
  ],
};

// ============================================================
// DICE COMPONENT
// ============================================================
const DICE = [
  { label: "d4", sides: 4, icon: "⬦" },
  { label: "d6", sides: 6, icon: "⬡" },
  { label: "d8", sides: 8, icon: "◆" },
  { label: "d10", sides: 10, icon: "◈" },
  { label: "d12", sides: 12, icon: "⬟" },
  { label: "d20", sides: 20, icon: "⭐" },
  { label: "d100", sides: 100, icon: "🎯" },
];

function DicePanel() {
  const [rolling, setRolling] = useState(null);
  const [result, setResult] = useState(null);
  const [label, setLabel] = useState("");
  const [history, setHistory] = useState([]);
  const [qty, setQty] = useState(1);
  const [bonus, setBonus] = useState(0);

  const roll = (die) => {
    setRolling(die.label);
    setTimeout(() => {
      let total = 0;
      const rolls = [];
      for (let i = 0; i < qty; i++) {
        const r = Math.floor(Math.random() * die.sides) + 1;
        rolls.push(r);
        total += r;
      }
      total += bonus;
      const isCrit = die.sides === 20 && rolls[0] === 20;
      const isFumble = die.sides === 20 && rolls[0] === 1;
      setResult({ total, rolls, isCrit, isFumble });
      setLabel(`${qty}${die.label}${bonus !== 0 ? (bonus > 0 ? "+" : "") + bonus : ""}`);
      setHistory(h => [`${qty}${die.label}: ${total}`, ...h].slice(0, 10));
      setRolling(null);
    }, 380);
  };

  return (
    <div className="gap-16">
      <div className="card">
        <div className="card-title">Modificadores</div>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <div style={{ flex: 1 }}>
            <div className="field-label">Quantidade</div>
            <input
              type="number" min={1} max={20} value={qty}
              onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))}
              className="field-input" style={{ fontFamily: "'JetBrains Mono', monospace" }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <div className="field-label">Bônus / Penalidade</div>
            <input
              type="number" min={-20} max={20} value={bonus}
              onChange={e => setBonus(parseInt(e.target.value) || 0)}
              className="field-input" style={{ fontFamily: "'JetBrains Mono', monospace" }}
            />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Role os Dados</div>
        <div className="dice-grid">
          {DICE.map(d => (
            <button
              key={d.label}
              className={`die-btn ${rolling === d.label ? "rolling" : ""}`}
              onClick={() => roll(d)}
              disabled={rolling !== null}
            >
              <span className="die-icon">{d.icon}</span>
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <div className="roll-result">
        {result ? (
          <>
            {result.isCrit && <div style={{ color: T.gold, fontFamily: "'Cinzel',serif", fontSize: 12, marginBottom: 6, letterSpacing: "0.15em" }}>⚔️ CRÍTICO!</div>}
            {result.isFumble && <div style={{ color: T.crimsonBright, fontFamily: "'Cinzel',serif", fontSize: 12, marginBottom: 6, letterSpacing: "0.15em" }}>💀 FALHA CRÍTICA!</div>}
            <div className="roll-number" style={result.isCrit ? { WebkitTextFillColor: T.gold } : result.isFumble ? { WebkitTextFillColor: T.crimsonBright } : {}}>
              {result.total}
            </div>
            <div className="roll-label">{label} → [{result.rolls.join(", ")}]{bonus !== 0 ? ` + ${bonus}` : ""}</div>
          </>
        ) : (
          <div style={{ color: T.textMuted, fontStyle: "italic" }}>Aguardando rolagem...</div>
        )}
      </div>

      {history.length > 0 && (
        <div className="card">
          <div className="card-title">Histórico</div>
          <div className="roll-history">
            {history.map((h, i) => <span key={i} className="roll-chip">{h}</span>)}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// CHARACTER SHEET
// ============================================================
function CharacterSheet({ char, onBack }) {
  const [tab, setTab] = useState("stats");
  const hpPct = (char.hp / char.maxHp) * 100;

  return (
    <div className="gap-16">
      {/* Header */}
      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <button className="btn btn-ghost" onClick={onBack} style={{ padding: "6px 12px" }}>← Voltar</button>
        <div style={{ fontSize: 32 }}>{char.avatar}</div>
        <div>
          <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 20, color: T.text }}>{char.name}</h2>
          <p style={{ color: T.textDim, fontSize: 14 }}>
            {char.race} • {char.class} Nível {char.level} • {char.alignment}
          </p>
          <p style={{ color: T.textMuted, fontSize: 13 }}>Jogador: {char.player}</p>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 12 }}>
          <div className="stat-box" style={{ minWidth: 64 }}>
            <div className="stat-score" style={{ fontSize: 20 }}>{char.ac}</div>
            <div className="stat-name">CA</div>
          </div>
          <div className="stat-box" style={{ minWidth: 64 }}>
            <div className="stat-score" style={{ fontSize: 20 }}>{char.speed}ft</div>
            <div className="stat-name">Deslocamento</div>
          </div>
        </div>
      </div>

      {/* HP Bar */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontFamily: "'Cinzel', serif", fontSize: 13, color: T.gold }}>PONTOS DE VIDA</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: T.text }}>
            {char.hp} / {char.maxHp}
          </span>
        </div>
        <div className="hp-bar-wrap">
          <div className="hp-bar" style={{ width: hpPct + "%", background: hpColor(char.hp, char.maxHp) }} />
        </div>
      </div>

      <div className="tabs">
        {["stats", "perícias", "traços", "história"].map(t => (
          <div key={t} className={`tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
            {t.toUpperCase()}
          </div>
        ))}
      </div>

      {tab === "stats" && (
        <div className="grid-3">
          {STATS.map(s => (
            <div key={s} className="stat-box">
              <div className="stat-score">{char.stats[s]}</div>
              <div className="stat-mod">{mod(char.stats[s])}</div>
              <div className="stat-name">{s}</div>
            </div>
          ))}
        </div>
      )}

      {tab === "perícias" && (
        <div className="card">
          <div className="card-title">Perícias Treinadas</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {char.skills.map(s => <span key={s} className="tag arcane">{s}</span>)}
          </div>
          <hr className="divider" />
          <div className="card-title">Idiomas</div>
          <div style={{ display: "flex", gap: 8 }}>
            {char.languages.map(l => <span key={l} className="tag">{l}</span>)}
          </div>
        </div>
      )}

      {tab === "traços" && (
        <div className="gap-16">
          {[["Traços de Personalidade", char.traits], ["Laços", char.bonds], ["Falhas", char.flaws]].map(([title, val]) => (
            <div key={title} className="card">
              <div className="card-title">{title}</div>
              <p style={{ fontStyle: "italic", color: T.textDim }}>{val}</p>
            </div>
          ))}
        </div>
      )}

      {tab === "história" && (
        <div className="card">
          <div className="card-title">Antecedente: {char.background}</div>
          <p style={{ color: T.textDim, lineHeight: 1.7 }}>{char.backstory}</p>
          <hr className="divider" />
          <div style={{ display: "flex", gap: 12 }}>
            <div>
              <div className="field-label">XP</div>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", color: T.gold }}>{char.xp.toLocaleString()}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// PLAYERS PAGE
// ============================================================
function PlayersPage() {
  const [chars, setChars] = useState(INITIAL_PLAYERS);
  const [selected, setSelected] = useState(null);
  const [creating, setCreating] = useState(false);
  const [newChar, setNewChar] = useState({
    name: "", player: "", race: "Humano", class: "Guerreiro",
    level: 1, hp: 10, maxHp: 10, ac: 10, speed: 30, xp: 0,
    background: "", alignment: "Neutro", avatar: "🧙",
    stats: { FOR: 10, DES: 10, CON: 10, INT: 10, SAB: 10, CAR: 10 },
    skills: [], languages: ["Comum"], traits: "", bonds: "", flaws: "", backstory: ""
  });

  if (selected) return <CharacterSheet char={selected} onBack={() => setSelected(null)} />;

  if (creating) return (
    <div className="gap-16">
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <button className="btn btn-ghost" onClick={() => setCreating(false)} style={{ padding: "6px 12px" }}>← Voltar</button>
        <h3 style={{ fontFamily: "'Cinzel',serif", fontSize: 16, color: T.gold }}>Novo Personagem</h3>
      </div>
      <div className="grid-2">
        {[["Nome do Personagem", "name", "text"], ["Jogador", "player", "text"]].map(([label, key, type]) => (
          <div key={key}>
            <div className="field-label">{label}</div>
            <input className="field-input" type={type} value={newChar[key]}
              onChange={e => setNewChar(p => ({ ...p, [key]: e.target.value }))} />
          </div>
        ))}
        <div>
          <div className="field-label">Raça</div>
          <select className="field-select" value={newChar.race}
            onChange={e => setNewChar(p => ({ ...p, race: e.target.value }))}>
            {RACES.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <div className="field-label">Classe</div>
          <select className="field-select" value={newChar.class}
            onChange={e => setNewChar(p => ({ ...p, class: e.target.value }))}>
            {CLASSES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <div className="field-label">Alinhamento</div>
          <select className="field-select" value={newChar.alignment}
            onChange={e => setNewChar(p => ({ ...p, alignment: e.target.value }))}>
            {ALIGNMENTS.map(a => <option key={a}>{a}</option>)}
          </select>
        </div>
        <div>
          <div className="field-label">Avatar (emoji)</div>
          <input className="field-input" value={newChar.avatar}
            onChange={e => setNewChar(p => ({ ...p, avatar: e.target.value }))} />
        </div>
      </div>
      <div className="card">
        <div className="card-title">Atributos Base</div>
        <div className="grid-3">
          {STATS.map(s => (
            <div key={s}>
              <div className="field-label">{s}</div>
              <input type="number" min={3} max={20} className="field-input"
                style={{ fontFamily: "'JetBrains Mono',monospace", textAlign: "center" }}
                value={newChar.stats[s]}
                onChange={e => setNewChar(p => ({ ...p, stats: { ...p.stats, [s]: parseInt(e.target.value) || 10 } }))} />
            </div>
          ))}
        </div>
      </div>
      <div className="card">
        <div className="card-title">Antecedente</div>
        <div>
          <div className="field-label">História</div>
          <textarea className="field-input" rows={3} value={newChar.backstory}
            onChange={e => setNewChar(p => ({ ...p, backstory: e.target.value }))}
            style={{ resize: "vertical" }} />
        </div>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button className="btn btn-gold" onClick={() => {
          if (!newChar.name || !newChar.player) return;
          setChars(c => [...c, { ...newChar, id: Date.now() }]);
          setCreating(false);
          setNewChar({ name: "", player: "", race: "Humano", class: "Guerreiro", level: 1, hp: 10, maxHp: 10, ac: 10, speed: 30, xp: 0, background: "", alignment: "Neutro", avatar: "🧙", stats: { FOR: 10, DES: 10, CON: 10, INT: 10, SAB: 10, CAR: 10 }, skills: [], languages: ["Comum"], traits: "", bonds: "", flaws: "", backstory: "" });
        }}>Criar Personagem</button>
        <button className="btn btn-ghost" onClick={() => setCreating(false)}>Cancelar</button>
      </div>
    </div>
  );

  return (
    <div className="gap-16">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p style={{ color: T.textDim, fontSize: 14 }}>{chars.length} aventureiro{chars.length !== 1 ? "s" : ""} registrado{chars.length !== 1 ? "s" : ""}</p>
        <button className="btn btn-gold" onClick={() => setCreating(true)}>+ Novo Personagem</button>
      </div>
      <div className="gap-16">
        {chars.map(c => (
          <div key={c.id} className="player-card" onClick={() => setSelected(c)}>
            <div className="player-avatar">{c.avatar}</div>
            <div className="player-info">
              <h3>{c.name}</h3>
              <p>{c.race} {c.class} • Nível {c.level} • Jogador: {c.player}</p>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
              <div style={{ textAlign: "right", marginRight: 8 }}>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: hpColor(c.hp, c.maxHp) }}>
                  {c.hp}/{c.maxHp} HP
                </div>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: T.textMuted }}>CA {c.ac}</div>
              </div>
              <span className="player-badge">Ver Ficha →</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// CAMPAIGN PAGE
// ============================================================
function CampaignPage() {
  const [camp] = useState(INITIAL_CAMPAIGN);
  return (
    <div className="gap-16">
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h2 style={{ fontFamily: "'Cinzel',serif", fontSize: 22, color: T.gold }}>{camp.name}</h2>
            <p style={{ color: T.textDim, marginTop: 4 }}>Arco atual: <em>{camp.arc}</em></p>
          </div>
          <div style={{ textAlign: "right" }}>
            <span className="tag gold">Sessão #{camp.session}</span>
            <div style={{ fontSize: 12, color: T.textMuted, marginTop: 6, fontFamily: "'JetBrains Mono',monospace" }}>
              Próxima: {camp.nextSession}
            </div>
          </div>
        </div>
        <hr className="divider" />
        <div className="card-title">Resumo da Situação Atual</div>
        <p style={{ color: T.textDim, lineHeight: 1.75, fontStyle: "italic" }}>{camp.summary}</p>
      </div>

      <div className="card">
        <div className="card-title">Sessões Anteriores</div>
        <div className="gap-16">
          {camp.sessions.map(s => (
            <div key={s.n} className="session-card">
              <h4>Sessão #{s.n} — {s.title}</h4>
              <p>{s.summary}</p>
              <div className="meta">{s.date}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// DM AGENT (AI)
// ============================================================
const DM_SYSTEM = `Você é o Dungeon Master de uma campanha de Dungeons & Dragons 5e chamada "A Sombra de Eldrath". 
Você narra com dramatismo épico, usa linguagem evocativa e imersiva, e mantém coerência com o lore da campanha.

CONTEXTO DA CAMPANHA:
- Os jogadores estão no Labirinto de Cristal, prisão do deus esquecido Eldrath
- Devem encontrar 3 Chaves de Âmbar para avançar
- Grupo: Theron Ashblade (Guerreiro Humano Nível 5) e Sylara Moonwhisper (Mago Meio-Elfo Nível 5)
- Última sessão: forçaram a entrada e descobriram a inscrição: "Apenas os dignos encontrarão a luz no fim da escuridão"

REGRAS DE NARRAÇÃO:
- Responda em português brasileiro
- Mantenha respostas entre 3-6 frases, focadas e dramáticas
- Quando houver rolagem de dados necessária, indique qual dado rolar (ex: "Role um d20 de Percepção")
- Referencie os personagens pelo nome quando relevante
- Crie tensão e atmosfera constantemente
- Se o jogador tenta algo impossível, redirecione criativamente`;

function DMPage() {
  const [messages, setMessages] = useState([
    {
      role: "dm",
      content: "As paredes de cristal do labirinto vibram com uma energia antiga enquanto vocês avançam pelo corredor principal. O ar cheira a ozônio e magia esquecida. Diante de vocês, três passagens se bifurcam — cada uma marcada com um símbolo diferente: uma chama, uma onda e uma pedra. O silêncio é ensurdecedor. O que fazem?"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");

    const userMsg = { role: "player", content: text };
    const history = [...messages, userMsg];
    setMessages(history);
    setLoading(true);

    try {
      const apiMessages = history.map(m => ({
        role: m.role === "dm" ? "assistant" : "user",
        content: m.content
      }));

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system: DM_SYSTEM,
          messages: apiMessages
        })
      });

      const data = await res.json();
      const reply = data.content?.[0]?.text || "O DM hesita...";
      setMessages(m => [...m, { role: "dm", content: reply }]);
    } catch (e) {
      setMessages(m => [...m, { role: "dm", content: "*(O Mestre das Masmorras desapareceu brevemente no plano astral. Tente novamente.)*" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 130px)" }}>
      <div style={{ padding: "10px 16px", background: T.bg2, borderBottom: `1px solid ${T.border}`, display: "flex", gap: 10, alignItems: "center" }}>
        <span style={{ fontSize: 20 }}>🎲</span>
        <div>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 13, color: T.gold }}>Dungeon Master — IA</div>
          <div style={{ fontSize: 11, color: T.textMuted, fontFamily: "'JetBrains Mono',monospace" }}>A Sombra de Eldrath • Sessão 7</div>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <span className="tag arcane">● Online</span>
        </div>
      </div>

      <div className="chat-messages" ref={chatRef}>
        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.role === "player" ? "msg-right" : ""}`}
            style={m.role === "player" ? { flexDirection: "row-reverse" } : {}}>
            <div className={`msg-avatar ${m.role}`}>
              {m.role === "dm" ? "🎭" : "⚔️"}
            </div>
            <div className={`msg-bubble ${m.role}`}>
              <div className={`msg-name ${m.role}`}>{m.role === "dm" ? "MESTRE" : "JOGADOR"}</div>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="msg">
            <div className="msg-avatar dm">🎭</div>
            <div className="msg-bubble dm">
              <div className="msg-name dm">MESTRE</div>
              <div className="typing">
                <span /><span /><span />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="chat-input-row">
        <textarea
          className="chat-input"
          rows={2}
          placeholder="Descreva a ação do seu personagem..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
        />
        <button className="btn btn-gold" onClick={send} disabled={loading || !input.trim()}
          style={{ alignSelf: "flex-end", minWidth: 80 }}>
          {loading ? "..." : "Enviar"}
        </button>
      </div>
    </div>
  );
}

// ============================================================
// DASHBOARD
// ============================================================
function Dashboard({ setPage }) {
  const quickStats = [
    { label: "Aventureiros", value: "2", icon: "⚔️", sub: "Ativos" },
    { label: "Sessões", value: "7", icon: "📜", sub: "Realizadas" },
    { label: "Arco Atual", value: "3", icon: "🗝️", sub: "Chaves a encontrar" },
    { label: "Próxima Sessão", value: "Hj", icon: "🎲", sub: "25 Jun" },
  ];
  return (
    <div className="gap-16">
      <div style={{ padding: "12px 0 4px" }}>
        <h2 style={{ fontFamily: "'Cinzel',serif", fontSize: 22, color: T.gold, marginBottom: 4 }}>
          A Sombra de Eldrath
        </h2>
        <p style={{ color: T.textDim, fontStyle: "italic" }}>
          "Apenas os dignos encontrarão a luz no fim da escuridão."
        </p>
      </div>

      <div className="grid-4">
        {quickStats.map(s => (
          <div key={s.label} className="card" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 26, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: 26, color: T.gold }}>{s.value}</div>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 2 }}>{s.label}</div>
            <div style={{ fontSize: 12, color: T.textDim, marginTop: 2 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-title">Aventureiros</div>
          {INITIAL_PLAYERS.map(c => (
            <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 22 }}>{c.avatar}</span>
              <div>
                <div style={{ fontFamily: "'Cinzel',serif", fontSize: 13, color: T.text }}>{c.name}</div>
                <div style={{ fontSize: 12, color: T.textDim }}>{c.race} {c.class} • Nível {c.level}</div>
              </div>
              <div style={{ marginLeft: "auto" }}>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: hpColor(c.hp, c.maxHp) }}>
                  {c.hp}/{c.maxHp} HP
                </div>
              </div>
            </div>
          ))}
          <button className="btn btn-ghost" style={{ width: "100%", marginTop: 8 }} onClick={() => setPage("players")}>
            Ver Fichas →
          </button>
        </div>

        <div className="card">
          <div className="card-title">Situação Atual</div>
          <p style={{ color: T.textDim, fontSize: 14, lineHeight: 1.7, fontStyle: "italic" }}>
            O grupo está no <strong style={{ color: T.text }}>Labirinto de Cristal</strong>, diante de três passagens marcadas com símbolos elementais. As três Chaves de Âmbar aguardam em algum lugar do labirinto.
          </p>
          <hr className="divider" />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span className="tag crimson">⚠️ Cultistas por perto</span>
            <span className="tag arcane">✨ Magia instável</span>
            <span className="tag gold">🗝️ 0/3 Chaves</span>
          </div>
          <button className="btn btn-gold" style={{ width: "100%", marginTop: 14 }} onClick={() => setPage("dm")}>
            🎭 Iniciar com o DM →
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Ação Rápida — Dados</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {DICE.slice(0, 5).map(d => (
            <button key={d.label} className="die-btn" style={{ width: 52, height: 52 }}
              onClick={() => {
                const r = Math.floor(Math.random() * d.sides) + 1;
                alert(`${d.label}: ${r}${r === d.sides ? " 🎉 MÁXIMO!" : r === 1 && d.sides === 20 ? " 💀 FALHA!" : ""}`);
              }}>
              <span style={{ fontSize: 18 }}>{d.icon}</span>
              <span style={{ fontSize: 10 }}>{d.label}</span>
            </button>
          ))}
          <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={() => setPage("dice")}>
            Painel completo →
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// APP ROOT
// ============================================================
const PAGES = [
  { id: "dashboard", label: "Painel", icon: "🏰" },
  { id: "dm", label: "Dungeon Master", icon: "🎭" },
  { id: "players", label: "Aventureiros", icon: "⚔️" },
  { id: "dice", label: "Dados", icon: "🎲" },
  { id: "campaign", label: "Campanha", icon: "📜" },
];

const PAGE_TITLES = {
  dashboard: "Painel da Campanha",
  dm: "Dungeon Master — IA",
  players: "Aventureiros",
  dice: "Mesa de Dados",
  campaign: "Diário da Campanha",
};

export default function App() {
  const [page, setPage] = useState("dashboard");

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <aside className="sidebar">
          <div className="sidebar-logo">
            <h1>⚔️ DnD Suite</h1>
            <p>v0.1 • alpha</p>
          </div>
          <div className="nav-section">
            <div className="nav-label">Navegação</div>
            {PAGES.map(p => (
              <div
                key={p.id}
                className={`nav-item ${page === p.id ? "active" : ""}`}
                onClick={() => setPage(p.id)}
              >
                <span className="icon">{p.icon}</span>
                {p.label}
              </div>
            ))}
          </div>
          <div style={{ marginTop: "auto", padding: "16px 20px", borderTop: `1px solid ${T.border}` }}>
            <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: T.textMuted, lineHeight: 1.6 }}>
              Sessão #7<br />
              A Sombra de Eldrath<br />
              <span style={{ color: T.goldDim }}>●</span> 2 online
            </div>
          </div>
        </aside>

        <main className="main">
          <div className="topbar">
            <h2>{PAGE_TITLES[page]}</h2>
            <div className="topbar-badge">🎲 D&D 5e</div>
          </div>
          <div className="content" style={page === "dm" ? { padding: 0 } : {}}>
            {page === "dashboard" && <Dashboard setPage={setPage} />}
            {page === "dm" && <DMPage />}
            {page === "players" && <PlayersPage />}
            {page === "dice" && <DicePanel />}
            {page === "campaign" && <CampaignPage />}
          </div>
        </main>
      </div>
    </>
  );
}
