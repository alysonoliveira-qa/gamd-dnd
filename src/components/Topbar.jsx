export const PAGE_TITLES = {
  dashboard: "Painel da Campanha",
  dm: "Dungeon Master — IA",
  players: "Aventureiros",
  dice: "Mesa de Dados",
  map: "Mapa — Geração Procedural",
  campaign: "Diário da Campanha",
};

export default function Topbar({ page }) {
  return (
    <div className="topbar">
      <h2>{PAGE_TITLES[page]}</h2>
      <div className="topbar-badge">🎲 D&D 5e</div>
    </div>
  );
}
