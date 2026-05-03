import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Animal } from '@/types/animal';

// Corrige o problema dos ícones padrão do Leaflet com bundlers
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface ZooMapRealProps {
  animals: Animal[];
  onAnimalSelect: (animalId: string) => void;
  /** Modo fullscreen (mobile) */
  fullscreen?: boolean;
}

// Centro aproximado do zoológico
const ZOO_CENTER: [number, number] = [-29.7975, -51.1720];
const ZOO_ZOOM = 16;
const ZOO_ZOOM_MOBILE = 15;

// Cria um ícone de emoji como DivIcon do Leaflet
function createEmojiIcon(emoji: string, size = 28): L.DivIcon {
  return L.divIcon({
    html: `<div style="
      width:${size}px;
      height:${size}px;
      background:rgba(255,255,255,0.95);
      border:1.5px solid #d1d5db;
      border-radius:50%;
      display:flex;
      align-items:center;
      justify-content:center;
      font-size:${Math.round(size * 0.55)}px;
      box-shadow:0 1px 4px rgba(0,0,0,0.25);
      cursor:pointer;
    ">${emoji}</div>`,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2 + 4)],
  });
}

// Ícone do visitante (ponto azul pulsante)
function createVisitorIcon(): L.DivIcon {
  return L.divIcon({
    html: `<div style="position:relative;width:20px;height:20px;display:flex;align-items:center;justify-content:center;">
      <div style="position:absolute;width:20px;height:20px;background:rgba(59,130,246,0.3);border-radius:50%;animation:zoo-ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>
      <div style="width:12px;height:12px;background:#2563eb;border:2px solid white;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,0.3);"></div>
    </div>
    <style>@keyframes zoo-ping{75%,100%{transform:scale(2);opacity:0}}</style>`,
    className: '',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

const ZooMapReal: React.FC<ZooMapRealProps> = ({ animals, onAnimalSelect, fullscreen = false }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const visitorMarkerRef = useRef<L.Marker | null>(null);
  const watchIdRef = useRef<number | null>(null);

  // Inicializa o mapa Leaflet
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const isMobile = window.innerWidth < 640;
    const zoom = isMobile ? ZOO_ZOOM_MOBILE : ZOO_ZOOM;

    const map = L.map(mapContainerRef.current, {
      center: ZOO_CENTER,
      zoom,
      zoomControl: false,
      attributionControl: true,
    });

    // Tiles OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // Controle de zoom no canto inferior direito
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    mapInstanceRef.current = map;

    // Inicia rastreamento GPS
    if (navigator.geolocation) {
      const id = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          const latlng: [number, number] = [latitude, longitude];

          if (visitorMarkerRef.current) {
            visitorMarkerRef.current.setLatLng(latlng);
          } else {
            const icon = createVisitorIcon();
            const marker = L.marker(latlng, { icon, zIndexOffset: 1000 });
            marker.bindTooltip('Você está aqui', { permanent: false, direction: 'top' });
            marker.addTo(map);
            visitorMarkerRef.current = marker;
          }
        },
        () => { /* GPS indisponível — silencioso */ },
        { enableHighAccuracy: true, maximumAge: 5000 }
      );
      watchIdRef.current = id;
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      map.remove();
      mapInstanceRef.current = null;
      visitorMarkerRef.current = null;
    };
  }, []);

  // Adiciona pins dos animais quando os dados chegam
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const isMobile = window.innerWidth < 640;
    const pinSize = isMobile ? 24 : 30;

    animals.forEach((animal) => {
      if (!animal.gpsPosition) return;

      const icon = createEmojiIcon(animal.emoji, pinSize);
      const marker = L.marker([animal.gpsPosition.lat, animal.gpsPosition.lng], { icon });

      marker.bindPopup(
        `<div style="text-align:center;min-width:120px;font-family:system-ui,sans-serif;">
          <div style="font-size:1.6rem;margin-bottom:4px;">${animal.emoji}</div>
          <p style="font-weight:600;font-size:0.85rem;margin:0 0 2px;color:#111;">${animal.name}</p>
          <p style="font-size:0.72rem;color:#6b7280;margin:0;">${animal.location}</p>
        </div>`,
        { maxWidth: 180 }
      );

      marker.on('click', () => {
        onAnimalSelect(animal.id);
      });

      marker.addTo(map);
    });
  // Só roda quando animals muda — onAnimalSelect é estável
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animals]);

  // Força resize quando o container muda de tamanho (fullscreen toggle)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const timer = setTimeout(() => map.invalidateSize(), 150);
    return () => clearTimeout(timer);
  }, [fullscreen]);

  return (
    <div
      ref={mapContainerRef}
      className="w-full h-full"
      style={{ minHeight: fullscreen ? '100%' : '300px' }}
      aria-label="Mapa interativo do Parque Zoológico de Sapucaia do Sul"
    />
  );
};

export default ZooMapReal;
