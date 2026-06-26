import { T } from "../tokens.js";

export const PAGES = [
  { id: "dashboard", label: "Painel", icon: "🏰" },
  { id: "dm", label: "Dungeon Master", icon: "🎭" },
  { id: "players", label: "Aventureiros", icon: "⚔️" },
  { id: "dice", label: "Dados", icon: "🎲" },
  { id: "campaign", label: "Campanha", icon: "📜" },
];

export default function Sidebar({ page, setPage }) {
  return (
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
  );
}
