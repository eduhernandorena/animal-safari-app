import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { animals as animalData } from '@/data/animals';
import { useNavigate } from 'react-router-dom';

// ── Tipos ────────────────────────────────────────────────────────────────────

interface PinData {
  id: string;
  name: string;
  emoji: string;
  lat: number | null;
  lng: number | null;
  calibrated: boolean;
}

// ── Constantes ───────────────────────────────────────────────────────────────

const ZOO_CENTER: [number, number] = [-29.7975, -51.1720];
const ZOO_ZOOM = 17;

// ── Helpers de ícone ─────────────────────────────────────────────────────────

function createEmojiIcon(emoji: string, active: boolean, calibrated: boolean): L.DivIcon {
  const size = active ? 38 : 30;
  const border = active
    ? '3px solid #eab308'
    : calibrated
    ? '2px solid #10b981'
    : '2px solid #ef4444';
  const bg = active ? '#fef9c3' : calibrated ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.6)';
  const opacity = calibrated || active ? '1' : '0.7';

  return L.divIcon({
    html: `<div style="
      width:${size}px; height:${size}px;
      background:${bg};
      border:${border};
      border-radius:50%;
      display:flex; align-items:center; justify-content:center;
      font-size:${Math.round(size * 0.52)}px;
      box-shadow:0 2px 6px rgba(0,0,0,0.3);
      opacity:${opacity};
      cursor:pointer;
      transition:all 0.15s;
    ">${emoji}</div>`,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function createCrosshairIcon(): L.DivIcon {
  return L.divIcon({
    html: `<div style="
      width:20px; height:20px;
      border:2px solid #eab308;
      border-radius:50%;
      background:rgba(234,179,8,0.2);
      box-shadow:0 0 0 2px rgba(234,179,8,0.4);
    "></div>`,
    className: '',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

// ── Componente ───────────────────────────────────────────────────────────────

const Calibrar: React.FC = () => {
  const navigate = useNavigate();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const clickMarkerRef = useRef<L.Marker | null>(null);

  const [pins, setPins] = useState<PinData[]>(
    animalData.map((a) => ({
      id: a.id,
      name: a.name,
      emoji: a.emoji,
      lat: a.gpsPosition?.lat ?? null,
      lng: a.gpsPosition?.lng ?? null,
      calibrated: !!a.gpsPosition,
    }))
  );

  const [activeId, setActiveId] = useState<string>(animalData[0].id);
  const [copied, setCopied] = useState(false);
  const [lastClick, setLastClick] = useState<{ lat: number; lng: number } | null>(null);

  const activePin = pins.find((p) => p.id === activeId);
  const calibratedCount = pins.filter((p) => p.calibrated).length;

  // ── Inicializa o mapa ─────────────────────────────────────────────────────

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: ZOO_CENTER,
      zoom: ZOO_ZOOM,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 20,
    }).addTo(map);

    // Cursor crosshair no mapa
    map.getContainer().style.cursor = 'crosshair';

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // ── Adiciona/atualiza marcadores quando pins mudam ────────────────────────

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    pins.forEach((pin) => {
      const existing = markersRef.current.get(pin.id);
      const icon = createEmojiIcon(pin.emoji, pin.id === activeId, pin.calibrated);

      if (pin.lat !== null && pin.lng !== null) {
        const latlng: [number, number] = [pin.lat, pin.lng];
        if (existing) {
          existing.setLatLng(latlng);
          existing.setIcon(icon);
        } else {
          const marker = L.marker(latlng, { icon, zIndexOffset: pin.id === activeId ? 1000 : 0 });
          marker.bindTooltip(pin.name, { permanent: false, direction: 'top' });
          marker.on('click', () => setActiveId(pin.id));
          marker.addTo(map);
          markersRef.current.set(pin.id, marker);
        }
      } else if (existing) {
        existing.setIcon(icon);
      }
    });
  }, [pins, activeId]);

  // ── Clique no mapa: posiciona o pin ativo ─────────────────────────────────

  const handleMapClick = useCallback(
    (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;

      // Marcador temporário de clique
      if (clickMarkerRef.current) {
        clickMarkerRef.current.setLatLng([lat, lng]);
      } else {
        const m = L.marker([lat, lng], { icon: createCrosshairIcon(), zIndexOffset: 2000 });
        m.addTo(mapRef.current!);
        clickMarkerRef.current = m;
      }

      setLastClick({ lat, lng });

      setPins((prev) =>
        prev.map((p) =>
          p.id === activeId
            ? { ...p, lat: parseFloat(lat.toFixed(7)), lng: parseFloat(lng.toFixed(7)), calibrated: true }
            : p
        )
      );

      // Avança para o próximo não calibrado
      setPins((prev) => {
        const currentIdx = prev.findIndex((p) => p.id === activeId);
        const next = prev.find((p, i) => i > currentIdx && !p.calibrated);
        if (next) setActiveId(next.id);
        return prev;
      });
    },
    [activeId]
  );

  // Registra/remove o listener de clique quando o mapa ou handler muda
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.on('click', handleMapClick);
    return () => { map.off('click', handleMapClick); };
  }, [handleMapClick]);

  // ── Centraliza no pin ativo ───────────────────────────────────────────────

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const pin = pins.find((p) => p.id === activeId);
    if (pin?.lat && pin?.lng) {
      map.panTo([pin.lat, pin.lng], { animate: true, duration: 0.4 });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  // ── Gera o código para colar em animals.ts ────────────────────────────────

  const generateCode = () =>
    pins
      .map((p) =>
        p.lat !== null && p.lng !== null
          ? `  // ${p.name}\n  gpsPosition: { lat: ${p.lat}, lng: ${p.lng} },`
          : `  // ${p.name} — NÃO CALIBRADO`
      )
      .join('\n');

  const copyCode = () => {
    const lines = pins
      .map((p) =>
        p.lat !== null && p.lng !== null
          ? `'${p.id}': { lat: ${p.lat}, lng: ${p.lng} }`
          : `'${p.id}': null // não calibrado`
      )
      .join('\n');
    navigator.clipboard.writeText(lines).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const resetPin = (id: string) => {
    const original = animalData.find((a) => a.id === id);
    setPins((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              lat: original?.gpsPosition?.lat ?? null,
              lng: original?.gpsPosition?.lng ?? null,
              calibrated: !!original?.gpsPosition,
            }
          : p
      )
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-800 shrink-0">
        <div>
          <h1 className="text-lg font-bold">🗺️ Calibração do Mapa</h1>
          <p className="text-gray-400 text-xs">
            Selecione um recinto e clique no mapa para definir sua posição GPS
          </p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="text-gray-400 hover:text-white text-sm px-3 py-1.5 rounded-lg border border-gray-700 hover:border-gray-500 transition-colors"
        >
          ← Voltar
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden flex-col lg:flex-row">
        {/* ── Mapa ── */}
        <div className="flex-1 relative min-h-[50vh] lg:min-h-0">
          <div ref={mapContainerRef} className="absolute inset-0" />

          {/* Instrução flutuante */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none">
            <div className="bg-gray-900/90 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full shadow-lg border border-gray-700">
              {activePin
                ? `Clique para posicionar: ${activePin.emoji} ${activePin.name}`
                : 'Selecione um recinto na lista'}
            </div>
          </div>

          {/* Coordenadas do último clique */}
          {lastClick && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none">
              <div className="bg-gray-900/90 backdrop-blur-sm text-emerald-300 text-xs px-3 py-1.5 rounded-full shadow-lg border border-gray-700 font-mono">
                {lastClick.lat.toFixed(7)}, {lastClick.lng.toFixed(7)}
              </div>
            </div>
          )}
        </div>

        {/* ── Painel lateral ── */}
        <div className="w-full lg:w-72 bg-gray-900 border-t lg:border-t-0 lg:border-l border-gray-800 flex flex-col overflow-hidden">

          {/* Progresso */}
          <div className="px-4 py-3 border-b border-gray-800 shrink-0">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">Calibrados</span>
              <span className="font-bold text-emerald-400">{calibratedCount}/{pins.length}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-1.5">
              <div
                className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${(calibratedCount / pins.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Lista de recintos */}
          <div className="flex-1 overflow-y-auto px-3 py-2">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 px-1">Recintos</p>
            <div className="space-y-1">
              {pins.map((pin) => (
                <button
                  key={pin.id}
                  onClick={() => setActiveId(pin.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-all ${
                    pin.id === activeId
                      ? 'bg-yellow-500/20 border border-yellow-500/40 text-yellow-200'
                      : pin.calibrated
                      ? 'bg-emerald-900/20 text-emerald-300 hover:bg-emerald-900/40 border border-transparent'
                      : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800 border border-transparent'
                  }`}
                >
                  <span className="text-base shrink-0">{pin.emoji}</span>
                  <span className="flex-1 truncate text-xs">{pin.name}</span>
                  <span className={`text-xs shrink-0 ${pin.calibrated ? 'text-emerald-400' : 'text-red-500'}`}>
                    {pin.calibrated ? '✓' : '○'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Detalhes do pin ativo */}
          {activePin && (
            <div className="px-4 py-3 border-t border-gray-800 shrink-0 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400">
                  <span className="text-white font-medium">{activePin.emoji} {activePin.name}</span>
                </p>
                <button
                  onClick={() => resetPin(activePin.id)}
                  className="text-[10px] text-gray-500 hover:text-red-400 transition-colors"
                  title="Resetar para valor original"
                >
                  ↺ reset
                </button>
              </div>
              {activePin.lat !== null && activePin.lng !== null ? (
                <p className="font-mono text-[11px] text-emerald-300 bg-gray-800 rounded px-2 py-1.5">
                  {activePin.lat.toFixed(7)}<br />
                  {activePin.lng.toFixed(7)}
                </p>
              ) : (
                <p className="text-[11px] text-red-400 italic">Não calibrado — clique no mapa</p>
              )}
            </div>
          )}

          {/* Botão copiar */}
          <div className="px-4 pb-4 shrink-0">
            <button
              onClick={copyCode}
              className="w-full bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors text-sm"
            >
              {copied ? '✓ Copiado!' : '📋 Copiar coordenadas'}
            </button>
          </div>
        </div>
      </div>

      {/* Output de código */}
      <div className="shrink-0 bg-gray-900 border-t border-gray-800 px-4 py-3 max-h-40 overflow-y-auto">
        <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">
          Saída — cole em animals.ts
        </p>
        <pre className="text-[11px] text-emerald-300 font-mono whitespace-pre-wrap leading-relaxed">
          {generateCode()}
        </pre>
      </div>
    </div>
  );
};

export default Calibrar;
