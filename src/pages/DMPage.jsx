import { useState, useRef, useEffect } from "react";
import { T } from "../tokens.js";
import { GENERATE_MAP_TOOL, executeMapTool } from "../map/schema/mapTool.js";
import { useActiveMap } from "../map/MapContext.jsx";

// ============================================================
// DM AGENT (AI)
// ============================================================
const DM_SYSTEM = `Você é o Dungeon Master de uma campanha de Dungeons & Dragons 5e chamada "A Sombra de Eldrath".
Você narra com dramatismo épico, usa linguagem evocativa e imersiva, e mantém coerência com o lore da campanha.

CONTEXTO DA CAMPANHA:
- Os jogadores estão no Labirinto de Cristal, prisão do deus esquecido Eldrath
- Devem encontrar 3 Chaves de Âmbar para avançar
- Grupo: Theron Ashblade (Guerreiro Humano Nível 5) e Sylara Moonwhisper (Mago Meio-Elfo Nível 5)
- Última sessão: forçaram a entrada e descobriram a inscrição: "Apenas os dignos encontrarão a luz no fim da escuridão"

REGRAS DE NARRAÇÃO:
- Responda em português brasileiro
- Mantenha respostas entre 3-6 frases, focadas e dramáticas
- Quando houver rolagem de dados necessária, indique qual dado rolar (ex: "Role um d20 de Percepção")
- Referencie os personagens pelo nome quando relevante
- Crie tensão e atmosfera constantemente
- Se o jogador tenta algo impossível, redirecione criativamente

FERRAMENTA DE MAPA:
- Você dispõe da ferramenta \`generate_map\`. Quando a narrativa levar o grupo a um novo ambiente físico explorável (uma masmorra, uma caverna ou uma região externa), CHAME \`generate_map\` com o \`type\` e o \`theme\` apropriados ANTES de descrever a cena, para que o grupo veja o mapa. Depois de gerar, narre a cena normalmente referenciando o terreno.`;

// Chave da API lida do ambiente Vite (.env → import.meta.env)
const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;

export default function DMPage({ setPage }) {
  const [messages, setMessages] = useState([
    {
      role: "dm",
      content: "As paredes de cristal do labirinto vibram com uma energia antiga enquanto vocês avançam pelo corredor principal. O ar cheira a ozônio e magia esquecida. Diante de vocês, três passagens se bifurcam — cada uma marcada com um símbolo diferente: uma chama, uma onda e uma pedra. O silêncio é ensurdecedor. O que fazem?"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatRef = useRef(null);
  const { setActiveMapRequest } = useActiveMap();

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");

    const userMsg = { role: "player", content: text };
    const history = [...messages, userMsg];
    setMessages(history);
    setLoading(true);

    // Histórico para a API: mensagens "map" são affordances locais → não enviadas.
    const apiMessages = history
      .filter((m) => m.role === "dm" || m.role === "player")
      .map((m) => ({
        role: m.role === "dm" ? "assistant" : "user",
        content: m.content,
      }));

    try {
      let finished = false;
      for (let i = 0; i < 3 && !finished; i++) {
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": API_KEY,
            "anthropic-version": "2023-06-01",
            "anthropic-dangerous-direct-browser-access": "true",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-6",
            max_tokens: 1000,
            system: DM_SYSTEM,
            messages: apiMessages,
            tools: [GENERATE_MAP_TOOL],
          }),
        });
        if (!res.ok) {
          setMessages((m) => [
            ...m,
            { role: "dm", content: "*(As energias arcanas falham — o Mestre não responde no momento. Tente novamente.)*" },
          ]);
          finished = true;
          break;
        }
        const data = await res.json();

        if (data.stop_reason === "tool_use") {
          // Texto que o modelo eventualmente emite junto com o tool_use.
          const preface = (data.content || []).find((b) => b.type === "text")?.text;
          if (preface) setMessages((m) => [...m, { role: "dm", content: preface }]);

          const toolBlocks = (data.content || []).filter((b) => b.type === "tool_use");
          const results = toolBlocks.map(executeMapTool);
          for (const r of results) {
            if (r.request) {
              setActiveMapRequest(r.request);
              setMessages((m) => [...m, { role: "map", summary: r.toolResult.content }]);
            }
          }
          apiMessages.push({ role: "assistant", content: data.content });
          apiMessages.push({ role: "user", content: results.map((r) => r.toolResult) });
          continue;
        }

        const reply = (data.content || []).find((b) => b.type === "text")?.text || "O DM hesita...";
        setMessages((m) => [...m, { role: "dm", content: reply }]);
        finished = true;
      }
      if (!finished) {
        setMessages((m) => [
          ...m,
          { role: "dm", content: "*(O mapa se revela diante de vocês. O que fazem?)*" },
        ]);
      }
    } catch (e) {
      setMessages((m) => [
        ...m,
        { role: "dm", content: "*(O Mestre das Masmorras desapareceu brevemente no plano astral. Tente novamente.)*" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 130px)" }}>
      <div style={{ padding: "10px 16px", background: T.bg2, borderBottom: `1px solid ${T.border}`, display: "flex", gap: 10, alignItems: "center" }}>
        <span style={{ fontSize: 20 }}>🎲</span>
        <div>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: 13, color: T.gold }}>Dungeon Master — IA</div>
          <div style={{ fontSize: 11, color: T.textMuted, fontFamily: "'JetBrains Mono',monospace" }}>A Sombra de Eldrath • Sessão 7</div>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <span className="tag arcane">● Online</span>
        </div>
      </div>

      <div className="chat-messages" ref={chatRef}>
        {messages.map((m, i) => {
          if (m.role === "map") {
            return (
              <div key={i} className="msg">
                <div className="msg-avatar dm">🗺️</div>
                <div
                  className="msg-bubble dm"
                  style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}
                >
                  <div>
                    <div className="msg-name dm">MAPA GERADO</div>
                    {m.summary}
                  </div>
                  <button
                    className="btn btn-gold"
                    style={{ minWidth: 110 }}
                    onClick={() => setPage("map")}
                  >
                    Abrir mapa
                  </button>
                </div>
              </div>
            );
          }
          return (
            <div
              key={i}
              className={`msg ${m.role === "player" ? "msg-right" : ""}`}
              style={m.role === "player" ? { flexDirection: "row-reverse" } : {}}
            >
              <div className={`msg-avatar ${m.role}`}>{m.role === "dm" ? "🎭" : "⚔️"}</div>
              <div className={`msg-bubble ${m.role}`}>
                <div className={`msg-name ${m.role}`}>{m.role === "dm" ? "MESTRE" : "JOGADOR"}</div>
                {m.content}
              </div>
            </div>
          );
        })}
        {loading && (
          <div className="msg">
            <div className="msg-avatar dm">🎭</div>
            <div className="msg-bubble dm">
              <div className="msg-name dm">MESTRE</div>
              <div className="typing">
                <span /><span /><span />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="chat-input-row">
        <textarea
          className="chat-input"
          rows={2}
          placeholder="Descreva a ação do seu personagem..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
        />
        <button className="btn btn-gold" onClick={send} disabled={loading || !input.trim()}
          style={{ alignSelf: "flex-end", minWidth: 80 }}>
          {loading ? "..." : "Enviar"}
        </button>
      </div>
    </div>
  );
}
