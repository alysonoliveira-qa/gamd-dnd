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
