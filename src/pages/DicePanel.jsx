import { useState } from "react";
import { T } from "../tokens.js";
import { DICE } from "../data/constants.js";

// ============================================================
// DICE COMPONENT
// ============================================================
export default function DicePanel() {
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
