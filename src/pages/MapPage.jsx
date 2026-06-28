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
