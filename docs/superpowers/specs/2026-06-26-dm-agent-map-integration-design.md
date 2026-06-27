# Integração DM Agent ↔ Gerador de Mapas — Design Spec (Fase 3)

> Data: 2026-06-26
> Projeto: DnD Suite (React + Vite + Anthropic API + PixiJS)
> Status: aprovado para planejamento de implementação
> Depende de: Fase 1 (sistema de mapas procedural) — `src/map/**`

---

## 1. Contexto e objetivo

A Fase 1 entregou o gerador de mapas procedural (masmorra/caverna/wilderness,
determinístico por seed, renderizado em PixiJS na página Mapa). O DM Agent já
existe (`src/pages/DMPage.jsx`) e conversa com Claude via `fetch` para
`api.anthropic.com/v1/messages`.

Esta fase liga os dois: dar ao DM Agent uma **tool `generate_map`** para que ele
gere/adapte o mapa conforme narra a campanha. O mapa gerado vira o **mapa ativo
da sessão**, refletido na página Mapa.

## 2. Decisões de produto (fixadas no brainstorming)

| Decisão | Escolha |
|---|---|
| Onde o mapa surge | Atualiza a página Mapa (estado compartilhado); o chat avisa com botão "Abrir mapa" |
| Após gerar | Claude **narra a cena** (loop tool_use → tool_result → texto final) |
| Persistência | Em memória nesta fase (persistência fica para o v0.2) |
| Estado compartilhado | React Context (`MapProvider`) |
| Modelo | Mantém `claude-sonnet-4-6` (escolha atual do projeto para o DM em tempo real) |

## 3. Mecânica de tool use (fundamentada na API real)

Tool use é um recurso do endpoint `/v1/messages`. O projeto chama a API por
`fetch` cru com o header `anthropic-dangerous-direct-browser-access: true`
(mantido). Fluxo:

1. A requisição inclui `tools: [GENERATE_MAP_TOOL]`.
2. Quando o Claude quer o mapa, a resposta vem com `stop_reason: "tool_use"` e um
   bloco `tool_use` (`{ id, name, input }`) em `content`.
3. O cliente executa `generateMap(input)`, anexa o turno do assistant
   (`response.content`) e um turno `user` com um bloco
   `{ type: "tool_result", tool_use_id, content }`, e chama a API de novo.
4. O Claude então produz o texto final (a narração) com `stop_reason: "end_turn"`.

Decisão: **não usar `strict: true`**. Em vez disso, reaproveitar
`validateMapRequest` (Fase 1) como rede de validação — ela aplica defaults e lança
em entrada inválida. Em caso de erro, devolve-se um `tool_result` com
`is_error: true` para o Claude se corrigir. Isso evita a complexidade de campos
opcionais sob `strict` e reusa código já testado.

## 4. Arquitetura

```
src/map/
├── MapContext.jsx          # <MapProvider> + useActiveMap() → { request, setActiveMapRequest }
└── schema/
    └── mapTool.js          # GENERATE_MAP_TOOL, executeMapTool(input), summarizeMap(model)

src/pages/
├── DMPage.jsx              # (modificado) tools no body + loop de tool use + escreve mapa ativo
└── MapPage.jsx             # (modificado) lê/escreve o MapRequest ativo via contexto

src/
└── App.jsx                 # (modificado) envolve a árvore em <MapProvider>; passa setPage ao DMPage
```

### 4.1 Estado compartilhado — `MapContext.jsx`

- `MapProvider` mantém `const [request, setActiveMapRequest] = useState(null)`.
- `useActiveMap()` retorna `{ request, setActiveMapRequest }`.
- O `MapRequest` ativo é a **única fonte de verdade**. O painel manual da página
  Mapa e a tool do DM ambos chamam `setActiveMapRequest(req)`. A página Mapa
  renderiza `generateMap(request)` quando `request` não é nulo.

### 4.2 Tool — `schema/mapTool.js`

- `GENERATE_MAP_TOOL`:
  ```js
  {
    name: "generate_map",
    description: "<quando e como usar — prescritivo>",
    input_schema: {
      type: "object",
      properties: {
        type:   { type: "string", enum: ["dungeon","cave","wilderness"], description: ... },
        width:  { type: "integer", description: "16..128, opcional (default 48)" },
        height: { type: "integer", description: "16..128, opcional (default 32)" },
        theme:  { type: "string", enum: ["crypt","cave","forest","dungeon"], description: ... },
        seed:   { type: "integer", description: "opcional; omitir = aleatória" },
      },
      required: ["type"],
    },
  }
  ```
  (Sem `additionalProperties`/`strict`; `options` fica fora da superfície da tool
  nesta fase — defaults por tipo são suficientes.)
- `executeMapTool(toolUseBlock) → { request, model, toolResult }` — **função pura**.
  Recebe o bloco `tool_use` inteiro (`{ id, name, input }`) para preencher o
  `tool_use_id` do resultado:
  - `request = validateMapRequest(toolUseBlock.input)`; `model = generateMap(request)`.
  - `toolResult = { type:"tool_result", tool_use_id: toolUseBlock.id, content: summarizeMap(model) }`.
  - Em erro (validação/geração lança): retorna `{ request:null, model:null, toolResult:{ type:"tool_result", tool_use_id: toolUseBlock.id, content:<mensagem>, is_error:true } }`.
- `summarizeMap(model) → string` — ex.: `"masmorra 48x32, 9 salas, tema crypt, seed 1337"`.

### 4.3 Loop de tool use — `DMPage.jsx`

```
send():
  monta apiMessages (histórico) + body { model, max_tokens, system, messages, tools:[GENERATE_MAP_TOOL] }
  loop (máx 3 iterações):
    res = fetch(...)
    if res.stop_reason == "tool_use":
       blocks = res.content.filter(b => b.type == "tool_use")
       results = blocks.map(executeMapTool)         // por bloco
       para cada result com request != null: setActiveMapRequest(result.request)
       empurra no chat a affordance "🗺️ Mapa gerado: <resumo> — [Abrir mapa]"
       apiMessages.push(assistant=res.content, user=results.toolResults)
       continue                                      // re-chama
    else:
       texto = res.content.find(b => b.type=="text")?.text
       empurra bolha do DM com o texto; break
```
- A bolha-affordance é um novo tipo de mensagem renderizada no chat com um botão
  que chama `setPage("map")` (passado do `App`).
- Cap de 3 iterações evita loop infinito; esgotado, posta aviso amigável.

### 4.4 System prompt

Adendo ao `DM_SYSTEM` em `DMPage.jsx`: descreve a tool e *quando* usá-la —
"Quando a narrativa levar o grupo a um novo ambiente físico explorável (masmorra,
caverna, região externa), chame `generate_map` com o `type` e o `theme`
apropriados antes de descrever a cena, para que o grupo veja o mapa." Descrição
prescritiva de quando chamar melhora a taxa de disparo.

### 4.5 Página Mapa — `MapPage.jsx`

Refatorada para usar o contexto: o painel manual chama `setActiveMapRequest` (em
vez de só estado local); o renderer desenha `generateMap(request)` a partir do
`request` ativo. Manual e IA convergem no mesmo mapa ativo — unifica o modelo
"híbrido" da Fase 1. Os controles (tipo/seed/Gerar/Aleatório) continuam, agora
escrevendo no contexto.

## 5. Fluxo de dados

```
DM Agent (Claude) --tool_use--> executeMapTool --> setActiveMapRequest(req)
                                                          |
Painel manual ----------------> setActiveMapRequest(req) --+--> MapContext.request
                                                                      |
                                                          MapPage: generateMap(request) --> MapRenderer
```

## 6. Tratamento de erros

- Input de tool inválido (`type` desconhecido, dims fora de faixa): `executeMapTool`
  devolve `tool_result` com `is_error:true` e a mensagem; o Claude se corrige
  dentro do cap de iterações.
- Falha de geração (conectividade): tratada como erro de tool (mesmo caminho).
- Erro de rede/API: mantém o fallback atual do `DMPage` ("plano astral").
- `MapPage` tolera `request` nulo (estado inicial sem mapa — comportamento da Fase 1).

## 7. Testes

- `schema/mapTool.js` é puro → coberto por Vitest:
  - `GENERATE_MAP_TOOL` tem `name`, `description` não-vazia, `input_schema` com
    `type` em `required` e enum dos três tipos.
  - `executeMapTool` com `tool_use` válido → `request`/`model` preenchidos,
    `toolResult` sem `is_error`, model conexo (`isFullyConnected`).
  - `executeMapTool` com `type` inválido → `request:null`, `toolResult.is_error === true`.
  - defaults aplicados quando dims/seed omitidos.
  - `summarizeMap` formata o resumo esperado para cada tipo.
- O orquestrador de `fetch` no `DMPage` e o `MapRenderer` ficam fora do teste
  unitário (camadas de rede/visual), verificados manualmente via `npm run dev`.

## 8. Fora de escopo (YAGNI)

- Persistência do mapa ativo (entra no v0.2 com o resto do localStorage).
- Tool `get_current_map` para o DM "ler"/ajustar o mapa existente.
- Edição manual de tiles / overlay.
- Tokens, fog of war, combate (Fase 2 — plano próprio).
- Troca de modelo (mantém `claude-sonnet-4-6`).
