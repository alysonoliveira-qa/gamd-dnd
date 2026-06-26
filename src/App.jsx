import { useState } from "react";
import { css } from "./tokens.js";
import Sidebar from "./components/Sidebar.jsx";
import Topbar from "./components/Topbar.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import DMPage from "./pages/DMPage.jsx";
import PlayersPage from "./pages/PlayersPage.jsx";
import DicePanel from "./pages/DicePanel.jsx";
import CampaignPage from "./pages/CampaignPage.jsx";

// ============================================================
// APP ROOT
// ============================================================
export default function App() {
  const [page, setPage] = useState("dashboard");

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <Sidebar page={page} setPage={setPage} />

        <main className="main">
          <Topbar page={page} />
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
