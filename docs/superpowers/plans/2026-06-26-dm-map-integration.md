# DM Agent ↔ Gerador de Mapas — Implementation Plan (Fase 3)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dar ao DM Agent uma tool `generate_map` para gerar/adaptar o mapa enquanto narra; o mapa gerado vira o mapa ativo da sessão, refletido na página Mapa via React Context.

**Architecture:** Um módulo puro `schema/mapTool.js` define a tool e a executa (valida → gera → resume), reaproveitando `validateMapRequest`/`generateMap` da Fase 1. Um `MapContext` guarda o `MapRequest` ativo (única fonte de verdade); `MapPage` e o loop de tool use do `DMPage` ambos escrevem nele via `setActiveMapRequest`. O `DMPage` roda um loop `tool_use → tool_result → texto` (cap de 3 iterações) e mostra uma affordance "Abrir mapa".

**Tech Stack:** React 18 (hooks + Context), Vite 6, Vitest 2 (ambiente `node`), Anthropic Messages API via `fetch` cru (`claude-sonnet-4-6`), PixiJS 8 (renderer da Fase 1).

## Global Constraints

- Modelo da API: **`claude-sonnet-4-6`** (não trocar nesta fase).
- Chamada à API: `fetch` cru para `https://api.anthropic.com/v1/messages` com headers `x-api-key` (de `import.meta.env.VITE_ANTHROPIC_API_KEY`), `anthropic-version: 2023-06-01`, `anthropic-dangerous-direct-browser-access: true`.
- Tool **sem `strict`** e **sem `additionalProperties`**; validação é feita por `validateMapRequest` (Fase 1). `options` fica fora da superfície da tool.
- Persistência: **em memória** (sem localStorage nesta fase).
- Testes unitários rodam em ambiente `node` (`vite.config.js` → `test.environment: "node"`), **sem jsdom/testing-library**. Portanto **apenas `mapTool.js` (puro) recebe teste Vitest**; arquivos React (`MapContext.jsx`, `App.jsx`, `MapPage.jsx`, `DMPage.jsx`) são verificados por `npm run build` + `npm run dev` manual (conforme spec §7).
- Comandos: testes `npm run test` (= `vitest run`); build `npm run build`; dev `npm run dev`.
- Idioma do produto: português brasileiro (mensagens, descrições da tool, system prompt).

---

### Task 1: Módulo puro da tool — `schema/mapTool.js`

**Files:**
- Create: `src/map/schema/mapTool.js`
- Test: `src/map/schema/mapTool.test.js`

**Interfaces:**
- Consumes:
  - `validateMapRequest(req) → { type, width, height, theme, seed, options }` de `src/map/schema/mapRequest.js` (aplica defaults: width 48, height 32, theme "dungeon", seed aleatória se ausente; lança em `type` inválido ou dims fora de 16..128).
  - `generateMap(request) → model` de `src/map/generators/index.js`, onde `model = { w, h, tiles, rooms: [], meta: { type, theme }, seed, params }`. `model.rooms` é populado para dungeon; vazio para cave/wilderness.
- Produces:
  - `GENERATE_MAP_TOOL` — objeto de definição de tool da Anthropic API (`{ name, description, input_schema }`).
  - `summarizeMap(model) → string` — resumo legível, ex.: `"masmorra 48x32, 9 salas, tema crypt, seed 1337"`.
  - `executeMapTool(toolUseBlock) → { request, model, toolResult }`. `toolUseBlock = { id, name, input }`. Em sucesso: `request`/`model` preenchidos e `toolResult = { type: "tool_result", tool_use_id, content: summarizeMap(model) }`. Em erro: `request: null, model: null, toolResult = { type: "tool_result", tool_use_id, content: <mensagem>, is_error: true }`.

- [ ] **Step 1: Write the failing test**

Create `src/map/schema/mapTool.test.js`:

```js
import { describe, it, expect } from "vitest";
import { GENERATE_MAP_TOOL, summarizeMap, executeMapTool } from "./mapTool.js";
import { isFullyConnected } from "../core/connectivity.js";

describe("GENERATE_MAP_TOOL", () => {
  it("tem a forma esperada de uma tool da Anthropic", () => {
    expect(GENERATE_MAP_TOOL.name).toBe("generate_map");
    expect(typeof GENERATE_MAP_TOOL.description).toBe("string");
    expect(GENERATE_MAP_TOOL.description.length).toBeGreaterThan(0);
    expect(GENERATE_MAP_TOOL.input_schema.type).toBe("object");
    expect(GENERATE_MAP_TOOL.input_schema.required).toContain("type");
    expect(GENERATE_MAP_TOOL.input_schema.properties.type.enum).toEqual([
      "dungeon",
      "cave",
      "wilderness",
    ]);
  });

  it("não declara strict nem additionalProperties", () => {
    expect(GENERATE_MAP_TOOL.strict).toBeUndefined();
    expect(GENERATE_MAP_TOOL.input_schema.additionalProperties).toBeUndefined();
  });
});

describe("executeMapTool", () => {
  it("com tool_use válido gera mapa conexo e tool_result sem erro", () => {
    const out = executeMapTool({
      id: "toolu_abc",
      name: "generate_map",
      input: { type: "dungeon", seed: 1337 },
    });
    expect(out.request.type).toBe("dungeon");
    expect(out.request.seed).toBe(1337);
    expect(out.model).not.toBeNull();
    expect(isFullyConnected(out.model)).toBe(true);
    expect(out.toolResult.type).toBe("tool_result");
    expect(out.toolResult.tool_use_id).toBe("toolu_abc");
    expect(out.toolResult.is_error).toBeUndefined();
    expect(typeof out.toolResult.content).toBe("string");
  });

  it("aplica defaults quando dims/seed são omitidos", () => {
    const out = executeMapTool({
      id: "toolu_def",
      name: "generate_map",
      input: { type: "cave" },
    });
    expect(out.request.width).toBe(48);
    expect(out.request.height).toBe(32);
    expect(out.request.theme).toBe("dungeon");
    expect(Number.isInteger(out.request.seed)).toBe(true);
  });

  it("com type inválido retorna erro de tool_result", () => {
    const out = executeMapTool({
      id: "toolu_err",
      name: "generate_map",
      input: { type: "castle" },
    });
    expect(out.request).toBeNull();
    expect(out.model).toBeNull();
    expect(out.toolResult.tool_use_id).toBe("toolu_err");
    expect(out.toolResult.is_error).toBe(true);
    expect(out.toolResult.content).toMatch(/type/i);
  });
});

describe("summarizeMap", () => {
  it("resume uma masmorra com contagem de salas", () => {
    const { model } = executeMapTool({
      id: "t1",
      name: "generate_map",
      input: { type: "dungeon", theme: "crypt", seed: 1337 },
    });
    const s = summarizeMap(model);
    expect(s).toMatch(/^masmorra 48x32, \d+ salas, tema crypt, seed 1337$/);
  });

  it("resume uma caverna sem o trecho de salas", () => {
    const { model } = executeMapTool({
      id: "t2",
      name: "generate_map",
      input: { type: "cave", theme: "cave", seed: 99 },
    });
    const s = summarizeMap(model);
    expect(s).toBe("caverna 48x32, tema cave, seed 99");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/map/schema/mapTool.test.js`
Expected: FAIL — não resolve `./mapTool.js` (módulo ainda não existe).

- [ ] **Step 3: Write minimal implementation**

Create `src/map/schema/mapTool.js`:

```js
import { validateMapRequest } from "./mapRequest.js";
import { generateMap } from "../generators/index.js";

const TYPE_LABELS = {
  dungeon: "masmorra",
  cave: "caverna",
  wilderness: "wilderness",
};

export const GENERATE_MAP_TOOL = {
  name: "generate_map",
  description:
    "Gera um mapa tático procedural para a cena atual e o torna o mapa ativo da sessão " +
    "(visível na página Mapa). Chame esta ferramenta sempre que a narrativa levar o grupo " +
    "a um novo ambiente físico explorável — uma masmorra, uma caverna ou uma região externa " +
    "(wilderness) — ANTES de descrever a cena, para que os jogadores vejam o terreno. " +
    "Escolha 'type' e 'theme' coerentes com a ficção. Omita 'seed' para um mapa novo aleatório.",
  input_schema: {
    type: "object",
    properties: {
      type: {
        type: "string",
        enum: ["dungeon", "cave", "wilderness"],
        description:
          "Tipo de terreno: 'dungeon' (salas e corredores), 'cave' (cavernas orgânicas), " +
          "'wilderness' (terreno externo aberto).",
      },
      width: {
        type: "integer",
        description: "Largura em tiles, 16..128. Opcional (padrão 48).",
      },
      height: {
        type: "integer",
        description: "Altura em tiles, 16..128. Opcional (padrão 32).",
      },
      theme: {
        type: "string",
        enum: ["crypt", "cave", "forest", "dungeon"],
        description: "Tema visual. Opcional (padrão 'dungeon').",
      },
      seed: {
        type: "integer",
        description: "Semente determinística. Opcional; omita para um mapa aleatório.",
      },
    },
    required: ["type"],
  },
};

export function summarizeMap(model) {
  const label = TYPE_LABELS[model.meta.type] ?? model.meta.type;
  const roomsPart = model.rooms.length > 0 ? `, ${model.rooms.length} salas` : "";
  return `${label} ${model.w}x${model.h}${roomsPart}, tema ${model.meta.theme}, seed ${model.seed}`;
}

export function executeMapTool(toolUseBlock) {
  const toolUseId = toolUseBlock?.id;
  try {
    const request = validateMapRequest(toolUseBlock.input);
    const model = generateMap(request);
    return {
      request,
      model,
      toolResult: {
        type: "tool_result",
        tool_use_id: toolUseId,
        content: summarizeMap(model),
      },
    };
  } catch (e) {
    return {
      request: null,
      model: null,
      toolResult: {
        type: "tool_result",
        tool_use_id: toolUseId,
        content: `Erro ao gerar mapa: ${e.message}`,
        is_error: true,
      },
    };
  }
}
```

Nota: `validateMapRequest` resolve a seed para um inteiro concreto, então o `request` retornado é determinístico — a `MapPage` re-renderiza o mesmo mapa via `generateMap(request)`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- src/map/schema/mapTool.test.js`
Expected: PASS (todos os casos).

- [ ] **Step 5: Run the full suite (sem regressões na Fase 1)**

Run: `npm run test`
Expected: PASS — suíte anterior (37 testes) + os novos de `mapTool`.

- [ ] **Step 6: Commit**

```bash
git add src/map/schema/mapTool.js src/map/schema/mapTool.test.js
git commit -m "feat(map): generate_map tool definition + pure executor"
```

---

### Task 2: Estado compartilhado — `MapContext.jsx` + wiring no `App.jsx`

**Files:**
- Create: `src/map/MapContext.jsx`
- Modify: `src/App.jsx` (envolve a árvore em `<MapProvider>`; passa `setPage` ao `DMPage`)

**Interfaces:**
- Produces:
  - `MapProvider({ children })` — componente provider; mantém `const [request, setActiveMapRequest] = useState(null)`.
  - `useActiveMap() → { request, setActiveMapRequest }` — hook; lança se usado fora do provider. `request` é `null` ou um `MapRequest` (`{ type, seed, width, height, theme? }`).

- [ ] **Step 1: Criar o contexto**

Create `src/map/MapContext.jsx`:

```jsx
import { createContext, useContext, useState } from "react";

const MapContext = createContext(null);

export function MapProvider({ children }) {
  const [request, setActiveMapRequest] = useState(null);
  return (
    <MapContext.Provider value={{ request, setActiveMapRequest }}>
      {children}
    </MapContext.Provider>
  );
}

export function useActiveMap() {
  const ctx = useContext(MapContext);
  if (!ctx) {
    throw new Error("useActiveMap deve ser usado dentro de <MapProvider>");
  }
  return ctx;
}
```

- [ ] **Step 2: Envolver a árvore e passar `setPage` ao DMPage**

Em `src/App.jsx`, adicione o import (junto aos demais imports do topo):

```jsx
import { MapProvider } from "./map/MapContext.jsx";
```

Substitua o `return (...)` inteiro do componente `App` por:

```jsx
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
```

(Mudanças: raiz vira `<MapProvider>` em vez do fragmento `<>`; `<DMPage />` passa a receber `setPage`. `DMPage` ainda ignora a prop até a Task 4 — sem efeito colateral.)

- [ ] **Step 3: Build para garantir que a árvore compila**

Run: `npm run build`
Expected: build conclui sem erros (provider montado; nada quebrado).

- [ ] **Step 4: Suíte de testes inalterada**

Run: `npm run test`
Expected: PASS (Context não tem teste unitário — ambiente `node`, sem DOM).

- [ ] **Step 5: Commit**

```bash
git add src/map/MapContext.jsx src/App.jsx
git commit -m "feat(map): MapProvider context + wire into App"
```

---

### Task 3: `MapPage.jsx` consome o mapa ativo do contexto

**Files:**
- Modify: `src/pages/MapPage.jsx`

**Interfaces:**
- Consumes:
  - `useActiveMap() → { request, setActiveMapRequest }` de `src/map/MapContext.jsx`.
  - `generateMap(request) → model` de `src/map/generators/index.js`.
  - `MapRenderer` de `src/map/render/MapRenderer.js` (`new MapRenderer()`, `.init(hostEl) → Promise`, `.render(model)`, `.destroy()`).
- Produces: nenhuma exportação nova (página renderiza o `request` ativo; controles manuais escrevem via `setActiveMapRequest`).

- [ ] **Step 1: Reescrever o componente para ler/escrever o contexto**

Substitua o conteúdo inteiro de `src/pages/MapPage.jsx` por:

```jsx
import { useEffect, useRef, useState } from "react";
import { T } from "../tokens.js";
import { generateMap } from "../map/generators/index.js";
import { MapRenderer } from "../map/render/MapRenderer.js";
import { useActiveMap } from "../map/MapContext.jsx";

const TYPES = [
  { id: "dungeon", label: "Masmorra" },
  { id: "cave", label: "Caverna" },
  { id: "wilderness", label: "Wilderness" },
];

export default function MapPage() {
  const { request, setActiveMapRequest } = useActiveMap();
  const hostRef = useRef(null);
  const rendererRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [type, setType] = useState(request?.type ?? "dungeon");
  const [seed, setSeed] = useState(request?.seed ?? 1337);
  const [error, setError] = useState(null);

  // Monta o renderer uma vez.
  useEffect(() => {
    const renderer = new MapRenderer();
    rendererRef.current = renderer;
    let alive = true;
    renderer
      .init(hostRef.current)
      .then(() => {
        if (alive) setReady(true);
      })
      .catch((e) => {
        if (alive) setError(e.message);
      });
    return () => {
      alive = false;
      renderer.destroy();
      rendererRef.current = null;
      setReady(false);
    };
  }, []);

  // Garante um mapa ativo na primeira montagem (se ninguém definiu ainda).
  useEffect(() => {
    if (!request) setActiveMapRequest({ type, seed, width: 48, height: 32 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mantém os controles em sincronia com o mapa ativo (ex.: gerado pelo DM).
  useEffect(() => {
    if (request) {
      setType(request.type);
      if (Number.isInteger(request.seed)) setSeed(request.seed);
    }
  }, [request]);

  // Redesenha sempre que o mapa ativo (ou a prontidão do renderer) muda.
  useEffect(() => {
    if (!ready || !request) return;
    try {
      const model = generateMap(request);
      rendererRef.current?.render(model);
      setError(null);
    } catch (e) {
      setError(e.message);
    }
  }, [ready, request]);

  function apply(nextType = type, nextSeed = seed) {
    setActiveMapRequest({ type: nextType, seed: nextSeed, width: 48, height: 32 });
  }

  function randomize() {
    const s = Math.floor(Math.random() * 2 ** 31);
    setSeed(s);
    apply(type, s);
  }

  const btn = {
    background: T.bg3,
    color: T.text,
    border: `1px solid ${T.border}`,
    borderRadius: 6,
    padding: "8px 14px",
    cursor: "pointer",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 13,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div
        style={{
          display: "flex",
          gap: 10,
          alignItems: "center",
          padding: 16,
          borderBottom: `1px solid ${T.border}`,
          background: T.bg1,
          flexWrap: "wrap",
        }}
      >
        {TYPES.map((tp) => (
          <button
            key={tp.id}
            style={{
              ...btn,
              borderColor: type === tp.id ? T.gold : T.border,
              color: type === tp.id ? T.gold : T.text,
            }}
            onClick={() => {
              setType(tp.id);
              apply(tp.id, seed);
            }}
          >
            {tp.label}
          </button>
        ))}
        <span style={{ color: T.textDim, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
          seed
        </span>
        <input
          type="number"
          value={seed}
          onChange={(e) => setSeed(Number(e.target.value))}
          style={{
            ...btn,
            width: 120,
            background: T.bg2,
          }}
        />
        <button style={btn} onClick={() => apply(type, seed)}>
          Gerar
        </button>
        <button style={{ ...btn, borderColor: T.arcane, color: T.arcaneBright }} onClick={randomize}>
          🎲 Aleatório
        </button>
        {error && (
          <span style={{ color: T.crimsonBright, fontSize: 13 }}>⚠ {error}</span>
        )}
      </div>
      <div ref={hostRef} style={{ flex: 1, minHeight: 0, position: "relative" }} />
    </div>
  );
}
```

(Mudanças-chave: o mapa renderizado vem do `request` do contexto, não de estado local; os controles chamam `setActiveMapRequest` via `apply()`; um efeito sincroniza os controles quando o DM gera um mapa.)

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: build limpo.

- [ ] **Step 3: Verificação manual da página Mapa**

Run: `npm run dev` e abra a página **Mapa** no navegador.
Expected:
- Um mapa aparece na montagem (dungeon, seed 1337).
- Trocar tipo (Masmorra/Caverna/Wilderness) redesenha.
- Mudar a seed + "Gerar" redesenha; "🎲 Aleatório" troca a seed e o mapa.
- Sem erros no console (atenção à inicialização do PixiJS sob StrictMode — comportamento já tratado na Fase 1).

- [ ] **Step 4: Commit**

```bash
git add src/pages/MapPage.jsx
git commit -m "refactor(map): MapPage reads/writes active map via context"
```

---

### Task 4: `DMPage.jsx` — loop de tool use, affordance "Abrir mapa" e system prompt

**Files:**
- Modify: `src/pages/DMPage.jsx`

**Interfaces:**
- Consumes:
  - `GENERATE_MAP_TOOL`, `executeMapTool(toolUseBlock) → { request, model, toolResult }` de `src/map/schema/mapTool.js`.
  - `useActiveMap() → { setActiveMapRequest }` de `src/map/MapContext.jsx`.
  - Prop `setPage(pageId: string)` recebida do `App` (Task 2) para o botão "Abrir mapa".
- Produces: nenhuma exportação nova; novo tipo de mensagem local `{ role: "map", summary: string }` renderizada como card com botão.

- [ ] **Step 1: Imports, prop e system prompt**

Em `src/pages/DMPage.jsx`, troque a primeira linha de import por:

```jsx
import { useState, useRef, useEffect } from "react";
import { T } from "../tokens.js";
import { GENERATE_MAP_TOOL, executeMapTool } from "../map/schema/mapTool.js";
import { useActiveMap } from "../map/MapContext.jsx";
```

Acrescente o adendo da tool ao final do template `DM_SYSTEM` (antes da crase de fechamento `` ` ``), logo após "redirecione criativamente":

```
\n\nFERRAMENTA DE MAPA:
- Você dispõe da ferramenta \`generate_map\`. Quando a narrativa levar o grupo a um novo ambiente físico explorável (uma masmorra, uma caverna ou uma região externa), CHAME \`generate_map\` com o \`type\` e o \`theme\` apropriados ANTES de descrever a cena, para que o grupo veja o mapa. Depois de gerar, narre a cena normalmente referenciando o terreno.
```

Altere a assinatura do componente para receber a prop:

```jsx
export default function DMPage({ setPage }) {
```

E logo no início do corpo do componente (junto aos outros hooks `useState`), adicione:

```jsx
  const { setActiveMapRequest } = useActiveMap();
```

- [ ] **Step 2: Reescrever `send()` com o loop de tool use**

Substitua a função `send` inteira por:

```jsx
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
        const data = await res.json();

        if (data.stop_reason === "tool_use") {
          const toolBlocks = (data.content || []).filter((b) => b.type === "tool_use");
          const results = toolBlocks.map(executeMapTool);
          for (const r of results) {
            if (r.request) setActiveMapRequest(r.request);
            if (r.model) {
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
```

(O turno do assistant com `tool_use` e o turno do user com os `tool_result` são anexados ao `apiMessages` exatamente como a Anthropic API exige; o cap de 3 iterações evita loop infinito.)

- [ ] **Step 3: Renderizar a affordance "Abrir mapa" no chat**

No JSX, substitua o bloco `{messages.map((m, i) => ( ... ))}` por um `.map` que trata o tipo `"map"`:

```jsx
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
```

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: build limpo.

- [ ] **Step 5: Suíte de testes**

Run: `npm run test`
Expected: PASS (sem novos testes aqui — DMPage é orquestrador de rede/UI, verificado manualmente).

- [ ] **Step 6: Verificação manual do fluxo ponta-a-ponta**

Run: `npm run dev`. Na página **DM**, envie algo que leve a um novo ambiente, ex.: *"Abrimos a porta de pedra e descemos a escada para a cripta abaixo."*
Expected:
- O Claude chama `generate_map` (type/theme coerentes — ex. dungeon/crypt).
- Surge um card "🗺️ MAPA GERADO: masmorra ... — [Abrir mapa]" no chat.
- Em seguida o DM narra a cena (texto final, `stop_reason: end_turn`).
- Clicar "Abrir mapa" navega para a página **Mapa**, que mostra exatamente o mapa gerado.
- Mensagem comum (sem novo ambiente) continua respondendo só com texto, sem gerar mapa.
- Em caso de falha de rede, aparece o fallback "plano astral".

Nota (pré-existente, fora de escopo): a primeira mensagem semeada do chat tem papel `dm` → `assistant`; isso não foi alterado por esta fase.

- [ ] **Step 7: Commit**

```bash
git add src/pages/DMPage.jsx
git commit -m "feat(dm): generate_map tool-use loop + open-map affordance"
```

---

## Self-Review

**Spec coverage:**
- §2 Decisões de produto: página Mapa via estado compartilhado (Tasks 2–3); narração no loop (Task 4); em memória (sem persistência — nenhum task adiciona localStorage); Context (Task 2); modelo `claude-sonnet-4-6` (Global Constraints + Task 4). ✔
- §3 Mecânica de tool use: `tools` no body, detecção de `stop_reason: tool_use`, anexar assistant + tool_result, re-chamar (Task 4); sem `strict`, reaproveita `validateMapRequest` (Task 1 + Global Constraints). ✔
- §4.1 MapContext: Task 2. §4.2 mapTool (GENERATE_MAP_TOOL/executeMapTool/summarizeMap): Task 1. §4.3 loop com cap de 3: Task 4. §4.4 system prompt: Task 4 Step 1. §4.5 MapPage refatorada: Task 3. ✔
- §6 Tratamento de erros: tool input inválido → `is_error` (Task 1, testado); falha de geração → mesmo caminho (Task 1); erro de rede → fallback (Task 4); `request` nulo tolerado (Task 3 guarda `if (!request) return`). ✔
- §7 Testes: só `mapTool.js` com Vitest (Task 1); React verificado manualmente (Tasks 2–4). ✔
- §8 Fora de escopo: nenhum task adiciona persistência, `get_current_map`, edição de tiles, tokens ou troca de modelo. ✔

**Placeholder scan:** Sem TBD/TODO/"handle edge cases"/"similar to Task N" — todo código está completo e literal. ✔

**Type consistency:** `executeMapTool` retorna `{ request, model, toolResult }` em todas as tasks; `toolResult.content`/`toolResult.is_error`/`toolResult.tool_use_id` consistentes entre Task 1 (def) e Task 4 (consumo). `setActiveMapRequest`/`request` idênticos entre Tasks 2, 3, 4. `model.meta.type`, `model.meta.theme`, `model.w`, `model.h`, `model.rooms`, `model.seed` batem com a forma real do MapModel da Fase 1. `MapRenderer` API (`init`/`render`/`destroy`) idêntica ao uso original. ✔
