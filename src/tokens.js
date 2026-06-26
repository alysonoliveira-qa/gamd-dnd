// ============================================================
// DESIGN TOKENS — Dark parchment + arcane gold + blood crimson
// ============================================================
export const T = {
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

export const css = `
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
