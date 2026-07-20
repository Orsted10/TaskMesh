'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect } from 'react';

// Custom Map Marker Icon (Cyberpunk styled)
const customIcon = L.divIcon({
  html: `<div style="background-color: #ff4655; width: 16px; height: 16px; border-radius: 50%; border: 2px solid #000; box-shadow: 0 0 10px #ff4655;"></div>`,
  className: '',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
  popupAnchor: [0, -8],
});

interface Bounty {
  id: string;
  title: string;
  description: string;
  bounty_amount: number;
  bounty_currency: string;
  lat: number;
  lng: number;
}

export default function WorldMap({ bounties }: { bounties: Bounty[] }) {
  useEffect(() => {
    // Leaflet throws errors on SSR if not careful, but dynamic import handles it.
  }, []);

  return (
    <div className="w-full h-full relative z-10 border border-zinc-800 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
      <MapContainer 
        center={[37.7749, -122.4194]} 
        zoom={3} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%', background: '#0B0C10' }}
        zoomControl={false}
      >
        {/* CartoDB Dark Matter Theme for that sleek cyber look */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        
        {bounties.map((bounty) => (
          <Marker key={bounty.id} position={[bounty.lat, bounty.lng]} icon={customIcon}>
            <Popup className="cyber-popup">
              <div className="bg-zinc-950 p-4 border border-[#ff4655]/50 rounded text-white min-w-[200px]">
                <h3 className="font-teko text-2xl uppercase text-[#ff4655] leading-none mb-1">{bounty.title}</h3>
                <p className="text-zinc-400 font-mono text-[10px] mb-3">{bounty.description}</p>
                <div className="flex justify-between items-center border-t border-zinc-800 pt-2">
                  <span className="font-mono text-xs uppercase tracking-widest text-zinc-500">Reward</span>
                  <span className="font-mono text-yellow-500 font-bold">{bounty.bounty_amount} {bounty.bounty_currency.toUpperCase()}</span>
                </div>
                <button className="w-full mt-3 bg-[#ff4655] text-black font-teko text-lg uppercase py-1 rounded hover:bg-[#ff4655]/80 transition-colors">
                  Accept Directive
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* HUD Overlays */}
      <div className="absolute top-4 left-4 z-[400] bg-black/80 border border-[#ff4655]/30 p-4 rounded backdrop-blur pointer-events-none">
        <h2 className="font-teko text-3xl text-white uppercase tracking-widest leading-none">Global Bounties</h2>
        <p className="font-mono text-[10px] text-[#ff4655] uppercase mt-1">Live Sat-Link Active</p>
      </div>
      
      <style jsx global>{`
        .leaflet-popup-content-wrapper {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
        .leaflet-popup-tip-container {
          display: none;
        }
        .leaflet-popup-content {
          margin: 0 !important;
        }
      `}</style>
    </div>
  );
}
