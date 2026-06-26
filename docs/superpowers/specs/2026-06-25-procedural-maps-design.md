# Sistema de Mapas Procedural — Design Spec

> Data: 2026-06-25
> Projeto: DnD Suite (React + Vite + Anthropic API)
> Status: aprovado para planejamento de implementação

---

## 1. Contexto e objetivo

A DnD Suite já possui um DM Agent (Claude via `api.anthropic.com/v1/messages`) e
módulos de fichas, dados e diário. Falta um sistema de mapas que **se adapte à
campanha**: gerar mapas proceduralmente e, no longo prazo, deixar que o DM Agent
dispare/ajuste essa geração conforme narra a história.

O sistema é construído em **fases progressivas**, do mapa estático ao grid tático
completo, com a arquitetura preparada para evoluir desde o início.

## 2. Decisões de produto (fixadas no brainstorming)

| Decisão | Escolha |
|---|---|
| Papel do mapa | Os três (referência → exploração → grid tático), em fases |
| Controle da geração | Híbrido: gerador desacoplado + DM Agent opcional |
| Tipos de mapa | Os três geradores desde o início (masmorra, caverna, wilderness) |
| Renderização | PixiJS (WebGL) |
| Persistência | Determinística por seed + parâmetros (+ overlay de edições) |

## 3. Abordagem escolhida

**Pipeline unificado com saída comum.** Os três geradores implementam a mesma
interface `generate(params, rng) → MapModel`. O `MapModel` é uma estrutura neutra
(grid de tiles + metadados) consumida pelo renderizador e pela persistência sem
conhecimento do algoritmo de origem. Adicionar um 4º gerador no futuro não exige
mudança no renderer nem na persistência.

Rejeitada: cada gerador com formato próprio + adaptadores (vira N×M de
combinações; fog of war e tokens precisariam de código por tipo).

## 4. Arquitetura

```
src/map/
├── core/
│   ├── rng.js           # PRNG determinístico (mulberry32) a partir de seed
│   ├── MapModel.js      # {w, h, tiles[], rooms[], meta, seed, params}
│   └── tiles.js         # enum de tiles: WALL, FLOOR, DOOR, WATER, ...
├── generators/
│   ├── index.js         # registry: {dungeon, cave, wilderness} → generate()
│   ├── dungeon.js       # BSP (Binary Space Partitioning)
│   ├── cave.js          # Cellular Automata
│   └── wilderness.js    # Simplex noise (biomas + elevação)
├── render/
│   ├── MapRenderer.js   # PixiJS: camadas terreno→grid→fog→tokens, pan/zoom
│   └── theme.js         # cores/sprites por tile, alinhado aos design tokens T{}
├── schema/
│   └── mapRequest.js    # validação do contrato JSON
└── MapPage.jsx          # painel de parâmetros + canvas + integração
```

Integração no app: nova página `map` registrada em `App.jsx` e `Sidebar`. Nenhum
módulo existente é alterado.

### 4.1 MapModel (estrutura neutra)

```js
{
  w: 48, h: 32,                 // dimensões em tiles
  tiles: Uint8Array(w*h),       // cada célula = um valor do enum tiles
  rooms: [{x,y,w,h}, ...],      // metadados de salas (vazio p/ caverna/wilderness)
  meta: { type, theme },        // origem e tema
  seed: 1337,
  params: { ... }               // o MapRequest que o gerou
}
```

### 4.2 Contrato JSON — `MapRequest`

O painel manual e o DM Agent produzem o **mesmo objeto**:

```json
{
  "type": "dungeon",
  "width": 48,
  "height": 32,
  "theme": "crypt",
  "seed": 1337,
  "options": { "roomDensity": 0.6, "loopiness": 0.2 }
}
```

- **Painel manual:** monta o objeto a partir de sliders/dropdowns.
- **DM Agent:** ganha uma tool `generate_map` cujo input schema **é** este contrato.
  Quando o Claude narra a cena, chama a tool → mesmo gerador, sem código duplicado.

`seed` é opcional na requisição; se ausente, gera-se uma aleatória e ela é gravada
no `MapModel` para reprodutibilidade.

## 5. Fluxo de dados

```
MapRequest → validar(schema) → rng(seed) → generators[type](params, rng)
   → MapModel → MapRenderer (Pixi) → tela
                     ↑
   edições manuais do DM = overlay separado (Map<tileIndex, tile>)
```

Persistência: salva-se `MapRequest + overlay` (poucos bytes). Reabrir = re-gerar do
seed + reaplicar overlay. O determinismo garante mapa idêntico.

## 6. Fases de entrega

- **Fase 1 — jogável básico:** `MapModel` + 3 geradores + `MapRenderer` com pan/zoom
  + grid + painel manual. Mapa estático na tela. `theme` entra como paleta de cores.
- **Fase 2 — tático:** tokens arrastáveis com snap ao grid, fog of war revelável,
  medição de distância.
- **Fase 3 — IA + persistência:** tool `generate_map` no DM Agent + persistência
  seed/overlay (alinhada ao SPEC v0.2 de localStorage).

## 7. Tratamento de erros e validação

- O schema valida `MapRequest` antes de gerar (tipo desconhecido, dimensões fora de
  faixa → erro amigável na UI, sem quebrar a tela).
- Geradores garantem **conectividade**: pós-passo de flood-fill confirma que toda
  área andável é alcançável. Se falhar, re-tenta com `seed + 1` até N tentativas;
  esgotado o limite, retorna erro tratável.
- O renderer tolera `MapModel` vazio/nulo (estado inicial sem mapa).

## 8. Testes

- Geradores são funções puras `(params, rng) → MapModel`, testáveis sem PixiJS:
  - mesma seed ⇒ mesmo output (determinismo);
  - flood-fill confirma conectividade;
  - densidade/quantidade de salas dentro do esperado para os parâmetros.
- O renderer (camada visual PixiJS) fica fora dos testes unitários.

## 9. Fora de escopo (YAGNI)

- Multiplayer/sincronização do mapa (depende do SPEC v0.4).
- Empacotamento Electron (SPEC v0.5).
- Sprites/assets artísticos detalhados — Fase 1 usa cores sólidas por tile.
- 4º gerador (cidade/masmorra híbrida) — a arquitetura permite, mas não agora.
