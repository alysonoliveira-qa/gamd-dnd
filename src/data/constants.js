import { T } from "../tokens.js";

// ============================================================
// DATA — listas de domínio e helpers de regra
// ============================================================
export const RACES = ["Humano", "Elfo", "Anão", "Halfling", "Draconato", "Gnomo", "Meio-Elfo", "Meio-Orc", "Tiefling"];
export const CLASSES = ["Bárbaro", "Bardo", "Clérigo", "Druida", "Guerreiro", "Monge", "Paladino", "Ranger", "Ladino", "Feiticeiro", "Bruxo", "Mago"];
export const ALIGNMENTS = ["Leal e Bom", "Neutro e Bom", "Caótico e Bom", "Leal e Neutro", "Neutro", "Caótico e Neutro", "Leal e Mau", "Neutro e Mau", "Caótico e Mau"];
export const STATS = ["FOR", "DES", "CON", "INT", "SAB", "CAR"];

export const mod = (v) => {
  const m = Math.floor((v - 10) / 2);
  return (m >= 0 ? "+" : "") + m;
};

export const hpColor = (cur, max) => {
  const pct = cur / max;
  if (pct > 0.5) return T.success;
  if (pct > 0.25) return "#c9842c";
  return T.crimsonBright;
};

export const DICE = [
  { label: "d4", sides: 4, icon: "⬦" },
  { label: "d6", sides: 6, icon: "⬡" },
  { label: "d8", sides: 8, icon: "◆" },
  { label: "d10", sides: 10, icon: "◈" },
  { label: "d12", sides: 12, icon: "⬟" },
  { label: "d20", sides: 20, icon: "⭐" },
  { label: "d100", sides: 100, icon: "🎯" },
];
