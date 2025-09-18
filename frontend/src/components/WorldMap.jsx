// frontend/src/components/WorldMap.jsx
import React, { useState, useEffect } from 'react';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from "react-simple-maps";
import { useWebSocket } from '../hooks/useWebSocket';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';

const geoUrl = "/data/countries-110m.json";

export default function WorldMap() {
  const { messages: liveAttacks, status } = useWebSocket('/ws/attacks');
  const [attacks, setAttacks] = useState([]);

  // Keep only attacks from last 24 hours
  useEffect(() => {
    if (!liveAttacks) return;
    
    const now = Date.now();
    const filtered = liveAttacks.filter(a => {
      const attackTime = new Date(a.timestamp).getTime();
      return attackTime > now - 24 * 60 * 60 * 1000; // last 24h
    });

    // Only keep attacks with lat/lon
    setAttacks(filtered.filter(a => a.latitude != null && a.longitude != null));
  }, [liveAttacks]);

  return (
    <div className="bg-white p-2 rounded-lg shadow-md h-[450px] border">
      <div className="flex justify-between items-center mb-2 px-2">
        <h3 className="font-semibold text-gray-700">Real-time Threat Origins (last 24h)</h3>
        <span className={`text-xs font-bold ${status === 'connected' ? 'text-green-500' : 'text-red-500'}`}>
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
                  fill="#EAEAEC"
                  stroke="#D6D6DA"
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
              <circle r={5} fill="#EF4444" stroke="#FFF" strokeWidth={1} />
              <circle r={2} fill="#EF4444" />
            </Marker>
          ))}
        </ZoomableGroup>
      </ComposableMap>

      <Tooltip id="attack-tooltip" place="top" className="!bg-gray-800 !text-white !px-2 !py-1 !rounded-lg text-xs shadow-lg" />
    </div>
  );
}
