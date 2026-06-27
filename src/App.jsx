import { useState } from "react";
import { css } from "./tokens.js";
import Sidebar from "./components/Sidebar.jsx";
import Topbar from "./components/Topbar.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import DMPage from "./pages/DMPage.jsx";
import PlayersPage from "./pages/PlayersPage.jsx";
import DicePanel from "./pages/DicePanel.jsx";
import CampaignPage from "./pages/CampaignPage.jsx";
import MapPage from "./pages/MapPage.jsx";
import { MapProvider } from "./map/MapContext.jsx";

// ============================================================
// APP ROOT
// ============================================================
export default function App() {
  const [page, setPage] = useState("dashboard");

  return (
    <MapProvider>
      <style>{css}</style>
      <div className="app">
        <Sidebar page={page} setPage={setPage} />

        <main className="main">
          <Topbar page={page} />
          <div className="content" style={page === "dm" || page === "map" ? { padding: 0 } : {}}>
            {page === "dashboard" && <Dashboard setPage={setPage} />}
            {page === "dm" && <DMPage setPage={setPage} />}
            {page === "players" && <PlayersPage />}
            {page === "dice" && <DicePanel />}
            {page === "campaign" && <CampaignPage />}
            {page === "map" && <MapPage />}
          </div>
        </main>
      </div>
    </MapProvider>
  );
}
