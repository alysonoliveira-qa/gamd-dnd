import { useState } from "react";
import { T } from "../tokens.js";
import { INITIAL_CAMPAIGN } from "../data/mock.js";

// ============================================================
// CAMPAIGN PAGE
// ============================================================
export default function CampaignPage() {
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
