import { T } from "../tokens.js";
import { DICE, hpColor } from "../data/constants.js";
import { INITIAL_PLAYERS } from "../data/mock.js";

// ============================================================
// DASHBOARD
// ============================================================
export default function Dashboard({ setPage }) {
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
