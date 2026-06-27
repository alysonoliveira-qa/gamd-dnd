# ⚔️ DnD Suite

> Suite completa para sessões de Dungeons & Dragons 5e jogadas online — com Dungeon Master alimentado por IA.

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-gold)
![Stack](https://img.shields.io/badge/stack-React%20%2B%20Vite-61dafb)
![AI](https://img.shields.io/badge/AI-Claude%20Sonnet-8a2be2)
![License](https://img.shields.io/badge/licença-MIT-green)

---

## Sobre o Projeto

O **DnD Suite** nasceu da necessidade real de um grupo de amigos que trabalham muito e têm pouco tempo para jogar — mas que ainda querem viver aventuras épicas de D&D 5e juntos, 100% online.

A ideia é simples: uma plataforma única que centraliza tudo que um grupo precisa para jogar, com uma IA atuando como Dungeon Master narrativo para dar suporte às sessões.

Se tudo der certo, o destino final é a **Steam**, empacotado com Electron.

---

## Funcionalidades

| Módulo | Status | Descrição |
|---|---|---|
| 🏰 **Dashboard** | ✅ Pronto | Visão geral da campanha, status dos personagens, ações rápidas |
| 🎭 **DM Agent** | ✅ Pronto | Chat com IA (Claude) atuando como Dungeon Master narrativo |
| ⚔️ **Fichas de Personagem** | ✅ Pronto | Criação e visualização completa de personagens D&D 5e |
| 🎲 **Mesa de Dados** | ✅ Pronto | d4 ao d100, modificadores, críticos, histórico de rolagens |
| 📜 **Diário de Campanha** | ✅ Pronto | Registro de sessões, arco atual e resumo da situação |
| 💾 **Persistência Local** | 🔨 Em breve | Personagens e campanha salvos no localStorage |
| 🗺️ **Mapa Procedural** | 🔜 Planejado | Masmorras geradas via BSP + PixiJS, integradas ao DM Agent |
| 🌐 **Multiplayer** | 🔜 Planejado | Cada jogador em sua própria máquina, dados sincronizados em tempo real |
| 🖥️ **Electron / Steam** | 🔜 Planejado | Build desktop para distribuição |

---

## Stack

- **Frontend:** React + Vite
- **AI:** [Anthropic API](https://anthropic.com) — Claude Sonnet 4.6
- **Mapas (futuro):** PixiJS — renderer 2D/WebGL
- **Desktop (futuro):** Electron
- **Design:** Sistema de tokens próprio — sem Tailwind, sem UI library
- **Fontes:** Cinzel · EB Garamond · JetBrains Mono (Google Fonts)

---

## Design

Paleta dark parchment com dourado arcano e carmesim. Visual inspirado em tomos medievais e interfaces mágicas — construído do zero com um sistema de tokens próprio no arquivo `src/tokens.js`.

```
bg0 → bg3    Fundos em camadas (escuro profundo → superfície)
gold         Dourado arcano — títulos, destaques, ações primárias
crimson      Carmesim — perigo, HP crítico, ações destrutivas
arcane       Roxo arcano — magia, status, badges
```

---

## Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/gamd-dnd.git
cd gamd-dnd

# Instale as dependências
npm install

# Configure a API key da Anthropic
cp .env.example .env
# Edite o .env e adicione sua chave: VITE_ANTHROPIC_API_KEY=sk-ant-...

# Rode em desenvolvimento
npm run dev
```

> **Onde obter a API key?** Crie uma conta em [console.anthropic.com](https://console.anthropic.com) e gere uma chave em *API Keys*.

---

## Variáveis de Ambiente

```env
VITE_ANTHROPIC_API_KEY=sk-ant-...
```

⚠️ **Nunca commite o arquivo `.env`** — ele já está no `.gitignore`.

---

## Estrutura do Projeto

```
gamd-dnd/
├── src/
│   ├── App.jsx              # Navegação, sidebar, topbar
│   ├── main.jsx             # Entry point
│   ├── tokens.js            # Design tokens + CSS global
│   ├── data/
│   │   ├── constants.js     # Raças, classes, alinhamentos, dados
│   │   ├── mock.js          # Dados iniciais de campanha e personagens
│   │   └── storage.js       # Utilitários load/save para localStorage
│   ├── components/
│   │   ├── Sidebar.jsx
│   │   ├── Topbar.jsx
│   │   └── ui/              # Card, Button, Field, Tag, StatBox
│   └── pages/
│       ├── Dashboard.jsx
│       ├── DMPage.jsx       # DM Agent — integração com Anthropic API
│       ├── PlayersPage.jsx
│       ├── CharacterSheet.jsx
│       ├── DicePanel.jsx
│       └── CampaignPage.jsx
├── public/
├── .env.example
└── vite.config.js
```

---

## O DM Agent

O módulo mais especial do projeto. Uma instância do Claude recebe um system prompt com todo o contexto da campanha atual — nome, arco, NPCs, últimos eventos — e narra a sessão em português brasileiro com dramatismo épico.

Ele solicita rolagens de dados quando necessário, reage às ações dos jogadores e mantém coerência com o lore da campanha. No futuro, também vai emitir JSON estruturado para gerar mapas procedurais automaticamente.

```
Jogador: "Sylara examina os símbolos na parede com Arcana."
DM:      "Role um d20 e some seu modificador de Arcana..."
```

---

## Roadmap

```
v0.1  ✅  Protótipo single-file com todos os módulos base
v0.2  🔨  Migração para estrutura modular + persistência localStorage
v0.3  🔜  MapPage — PixiJS + geração procedural BSP/Cellular Automata
v0.4  🔜  Multiplayer — jogadores conectados em tempo real
v0.5  🔜  Electron — build desktop para Windows/Mac/Linux
v1.0  🔜  Steam
```

---

## Contribuindo

Por enquanto é um projeto pessoal de um grupo fechado de amigos — mas se você chegou aqui e curtiu a ideia, fique à vontade para abrir issues ou mandar um PR.

---

## Licença

MIT — use, modifique e distribua à vontade.

---

<p align="center">
  Feito com ☕, dados de 20 faces e muita magia arcana.
</p>
