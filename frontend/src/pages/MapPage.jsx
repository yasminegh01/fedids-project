// frontend/src/pages/MapPage.jsx
import React from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";

// NOTE: le fichier doit être dans frontend/public/data/countries-110m.json
const geoUrl = "/data/countries-110m.json";

export default function MapPage() {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">🌍 Carte Interactive</h1>

      <div style={{ width: "100%", height: 480 }}>
        <ComposableMap projectionConfig={{ scale: 120 }} width={980} height={480}>
          <Geographies geography={geoUrl}>
            {({ geographies = [] }) =>
              geographies.length > 0 ? (
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    style={{
                      default: { fill: "#D6D6DA", outline: "none" },
                      hover: { fill: "#42a5f5", outline: "none" },
                      pressed: { fill: "#1565c0", outline: "none" },
                    }}
                  />
                ))
              ) : (
                // si rien n'est encore chargé on affiche un message SVG simple
                <g>
                  <text x="10" y="20">Chargement de la carte…</text>
                </g>
              )
            }
          </Geographies>
        </ComposableMap>
      </div>
    </div>
  );
}
