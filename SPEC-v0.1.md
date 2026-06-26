# DnD Suite — Project Spec v0.1
> Gerado em: 25 Jun 2026  
> Stack: React (Vite) + Anthropic API  
> Pasta: `game-d&d/`

---

## Contexto do Projeto

Suite completa para suporte a sessões de Dungeons & Dragons 5e jogadas 100% online entre amigos. O objetivo de curto prazo é uma ferramenta funcional para o grupo; o objetivo de longo prazo é uma publicação na Steam via Electron.

O protótipo inicial (`dnd-suite.jsx`) foi gerado como artifact React single-file e contém todas as telas base. O trabalho agora é transformar esse arquivo em um projeto estruturado, funcional e expansível.

---

## Estado Atual — O que existe no arquivo `dnd-suite.jsx`

### Módulos implementados (UI + lógica básica):

| Módulo | Status | Notas |
|---|---|---|
| **Dashboard** | ✅ Completo | Cards de status, aventureiros, situação atual, dados rápidos |
| **DM Agent** | ✅ Funcional | Chat com Claude via `api.anthropic.com/v1/messages`, system prompt com contexto de campanha |
| **Fichas de Personagem** | ✅ Completo | Visualização completa, criação de novo personagem, abas stats/perícias/traços/história |
| **Painel de Dados** | ✅ Completo | d4 a d100, quantidade, bônus, crítico/falha, histórico |
| **Diário de Campanha** | ✅ Completo | Arco atual, resumo, histórico de sessões |

### Dados mockados (hardcoded, precisam virar estado persistido):
- `INITIAL_PLAYERS` — 2 personagens pré-criados (Theron e Sylara)
- `INITIAL_CAMPAIGN` — campanha "A Sombra de Eldrath", sessão 7

### Design tokens definidos em `T {}`:
- Paleta: `bg0` até `bg3` (dark parchment), `gold`, `crimson`, `arcane`
- Fontes: Cinzel (display), EB Garamond (body), JetBrains Mono (dados/código)
- Todos os componentes usam as variáveis de `T`, sem dependência de Tailwind

---

## Objetivo desta Iteração — Estruturar o Projeto

Transformar o single-file artifact em projeto Vite + React organizado, pronto para desenvolvimento contínuo.

### Estrutura de pastas alvo:

```
game-d&d/
├── index.html
├── vite.config.js
├── package.json
├── .env.example          # VITE_ANTHROPIC_API_KEY=
├── src/
│   ├── main.jsx
│   ├── App.jsx           # Navegação, sidebar, topbar
│   ├── tokens.js         # Design tokens (objeto T + css string base)
│   ├── data/
│   │   ├── constants.js  # RACES, CLASSES, ALIGNMENTS, STATS, DICE, mod()
│   │   └── mock.js       # INITIAL_PLAYERS, INITIAL_CAMPAIGN
│   ├── components/
│   │   ├── Sidebar.jsx
│   │   ├── Topbar.jsx
│   │   └── ui/
│   │       ├── Card.jsx
│   │       ├── StatBox.jsx
│   │       ├── Button.jsx
│   │       ├── Field.jsx
│   │       └── Tag.jsx
│   └── pages/
│       ├── Dashboard.jsx
│       ├── DMPage.jsx
│       ├── PlayersPage.jsx
│       ├── CharacterSheet.jsx
│       ├── DicePanel.jsx
│       └── CampaignPage.jsx
└── public/
```

### Tarefas desta iteração:

1. **Inicializar projeto** com `npm create vite@latest . -- --template react`
2. **Extrair o `dnd-suite.jsx`** para a estrutura acima, sem alterar nenhuma lógica ou visual
3. **Criar `.env.example`** com `VITE_ANTHROPIC_API_KEY=` e conectar no `DMPage.jsx` via `import.meta.env`
4. **Confirmar que `npm run dev` sobe** sem erros e todas as 5 telas navegam corretamente

### O que NÃO fazer nesta iteração:
- Não adicionar novas features
- Não mudar visual ou design tokens
- Não implementar persistência ainda
- Não adicionar bibliotecas além do essencial (sem React Router por enquanto, navegação via estado já funciona)

---

## Backlog — Próximas Iterações

> Estes specs serão gerados separadamente. Não implementar agora.

### SPEC v0.2 — Persistência Local
- Substituir `INITIAL_PLAYERS` e `INITIAL_CAMPAIGN` por `localStorage`
- Personagens criados persistem entre sessões
- Histórico de rolagens persiste por sessão

### SPEC v0.3 — Combate Tracker
- Initiative tracker com ordem de turno
- HP editável durante combate (clique para editar)
- Condições (envenenado, paralisado, etc.)
- Contador de rounds

### SPEC v0.4 — Multiplayer
- Avaliar Supabase Realtime ou Firebase
- Cada jogador vê sua própria ficha + o chat do DM
- DM tem visão global
- Rolagens são compartilhadas em tempo real no chat

### SPEC v0.5 — Electron (Steam prep)
- Wrap com Electron
- API key armazenada com `electron-store` (seguro, fora do código)
- Build para Windows/Mac/Linux
- Ícone, splash screen, auto-update

---

## Referências Técnicas

**DM Agent — chamada atual:**
```js
fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    model: "claude-sonnet-4-6",
    max_tokens: 1000,
    system: DM_SYSTEM,   // system prompt com contexto da campanha
    messages: apiMessages // histórico completo da conversa
  })
})
```

**Variável de ambiente necessária:**
```
VITE_ANTHROPIC_API_KEY=sk-ant-...
```

**Fonte das fontes (já no CSS via @import):**
```
Cinzel, EB Garamond, JetBrains Mono — Google Fonts
```
