import React from "react";
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { useTheme } from '../context/ThemeContext'; // <<< 1. IMPORTER LE HOOK DE THÈME

// Le chemin vers le fichier de géographie reste le même
const geoUrl = "/data/countries-110m.json";

export default function MapPage() {
  const { theme } = useTheme(); // <<< 2. RÉCUPÉRER LE THÈME ACTUEL

  // === 3. DÉFINIR LES COULEURS DE LA CARTE DE MANIÈRE DYNAMIQUE ===
  const mapColors = {
    defaultFill: theme === 'light' ? '#E5E7EB' : '#374151', // Gris clair / Gris foncé
    hoverFill: theme === 'light' ? '#60A5FA' : '#3B82F6',   // Bleu clair / Bleu plus vif
    pressedFill: theme === 'light' ? '#2563EB' : '#1D4ED8', // Bleu vif / Bleu foncé
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-text-primary">Interactive World Map</h1>
      
      <div className="bg-bg-primary p-4 rounded-lg shadow-md" style={{ height: '70vh' }}>
        <ComposableMap 
          projectionConfig={{ scale: 150 }} 
          style={{ width: "100%", height: "100%" }}
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  style={{
                    default: { fill: mapColors.defaultFill, outline: "none" },
                    hover: { fill: mapColors.hoverFill, outline: "none" },
                    pressed: { fill: mapColors.pressedFill, outline: "none" },
                  }}
                />
              ))
            }
          </Geographies>
        </ComposableMap>
      </div>
    </div>
  );
}