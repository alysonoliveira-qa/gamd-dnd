import { useState } from "react";
import { T } from "../tokens.js";
import { STATS, mod, hpColor } from "../data/constants.js";

// ============================================================
// CHARACTER SHEET
// ============================================================
export default function CharacterSheet({ char, onBack }) {
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
