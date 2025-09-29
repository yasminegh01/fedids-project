import React, { useState, useEffect } from 'react';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from "react-simple-maps";
import { useWebSocket } from '../hooks/useWebSocket';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import { useTheme } from '../context/ThemeContext'; // <<< 1. IMPORTER LE HOOK DE THÈME

const geoUrl = "/data/countries-110m.json";

export default function WorldMap() {
  const { messages: liveAttacks, status } = useWebSocket('/ws/attacks');
  const [attacks, setAttacks] = useState([]);
  const { theme } = useTheme(); // <<< 2. RÉCUPÉRER LE THÈME ACTUEL

  useEffect(() => {
    if (!liveAttacks) return;
    const now = Date.now();
    const filtered = liveAttacks.filter(a => {
      const attackTime = new Date(a.timestamp).getTime();
      return attackTime > now - 24 * 60 * 60 * 1000;
    });
    setAttacks(filtered.filter(a => a.latitude != null && a.longitude != null));
  }, [liveAttacks]);

  // === 3. DÉFINIR LES COULEURS DE LA CARTE DE MANIÈRE DYNAMIQUE ===
  const mapColors = {
    land: theme === 'light' ? '#F3F4F6' : '#374151', // Gris clair / Gris foncé
    border: theme === 'light' ? '#E5E7EB' : '#4B5563', // Gris plus foncé / Gris moyen
  };

  const statusStyles = {
    connecting: 'text-yellow-500',
    connected: 'text-green-500',
    disconnected: 'text-red-500',
    error: 'text-red-500',
  };

  return (
    <div className="bg-bg-primary p-2 rounded-lg shadow-md h-[450px] border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-2 px-2">
        <h3 className="font-semibold text-text-primary">Real-time Threat Origins (last 24h)</h3>
        <span className={`text-xs font-bold ${statusStyles[status]}`}>
          {status}
        </span>
      </div>

      <ComposableMap projectionConfig={{ scale: 140 }} style={{ width: "100%", height: "calc(100% - 30px)" }}>
        <ZoomableGroup center={[20, 10]} zoom={0.8}>
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={mapColors.land}
                  stroke={mapColors.border}
                />
              ))
            }
          </Geographies>

          {attacks.map((attack, i) => (
            <Marker
              key={i}
              coordinates={[attack.longitude, attack.latitude]}
              data-tooltip-id="attack-tooltip"
              data-tooltip-content={`${attack.attack_type} (${attack.country || "Unknown"})`}
            >
              {/* Le marqueur d'attaque reste rouge vif pour un impact maximal */}
              <circle r={5} fill="#EF4444" stroke="#FFF" strokeWidth={1} className="animate-ping opacity-75" />
              <circle r={5} fill="#EF4444" />
            </Marker>
          ))}
        </ZoomableGroup>
      </ComposableMap>

      {/* Le tooltip est stylisé pour les deux thèmes */}
      <Tooltip 
        id="attack-tooltip" 
        place="top" 
        className="!bg-gray-800 dark:!bg-gray-900 !text-white !px-2 !py-1 !rounded-lg text-xs shadow-lg" 
      />
    </div>
  );
}