import { useState } from "react";
import { T } from "../tokens.js";
import { RACES, CLASSES, ALIGNMENTS, STATS, hpColor } from "../data/constants.js";
import { INITIAL_PLAYERS } from "../data/mock.js";
import CharacterSheet from "./CharacterSheet.jsx";

// ============================================================
// PLAYERS PAGE
// ============================================================
export default function PlayersPage() {
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
