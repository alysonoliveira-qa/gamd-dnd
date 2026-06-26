import { useEffect, useRef, useState } from "react";
import { T } from "../tokens.js";
import { generateMap } from "../map/generators/index.js";
import { MapRenderer } from "../map/render/MapRenderer.js";

const TYPES = [
  { id: "dungeon", label: "Masmorra" },
  { id: "cave", label: "Caverna" },
  { id: "wilderness", label: "Wilderness" },
];

export default function MapPage() {
  const hostRef = useRef(null);
  const rendererRef = useRef(null);
  const [type, setType] = useState("dungeon");
  const [seed, setSeed] = useState(1337);
  const [error, setError] = useState(null);

  // Monta o renderer uma vez.
  useEffect(() => {
    const renderer = new MapRenderer();
    rendererRef.current = renderer;
    let alive = true;
    renderer.init(hostRef.current).then(() => {
      if (alive) generate();
    });
    return () => {
      alive = false;
      renderer.destroy();
      rendererRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function generate(nextSeed = seed, nextType = type) {
    try {
      const model = generateMap({ type: nextType, seed: nextSeed, width: 48, height: 32 });
      rendererRef.current?.render(model);
      setError(null);
    } catch (e) {
      setError(e.message);
    }
  }

  function randomize() {
    const s = Math.floor(Math.random() * 2 ** 31);
    setSeed(s);
    generate(s, type);
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
              generate(seed, tp.id);
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
        <button style={btn} onClick={() => generate(seed, type)}>
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
