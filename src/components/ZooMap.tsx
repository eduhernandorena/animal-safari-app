import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Info, Navigation, ExternalLink, X, ChevronDown } from 'lucide-react';
import type { Animal } from '@/types/animal';
import { getAnimals } from '@/services/animalService';
import { useGpsTracking } from '@/hooks/useGpsTracking';
import VisitorMarker from '@/components/VisitorMarker';
import GpsErrorMessage from '@/components/GpsErrorMessage';
import RouteToZooDialog from '@/components/RouteToZooDialog';

interface ZooMapProps {
  onAnimalSelect: (animalId: string) => void;
  /** Quando true, o mapa ocupa toda a área disponível (modo fullscreen mobile) */
  fullscreen?: boolean;
}

const OFFICIAL_MAP_URL = 'https://www.sema.rs.gov.br/upload/recortes/202510/28114627_112007_GDO.jpg';
const OFFICIAL_PAGE_URL = 'https://www.sema.rs.gov.br/mapa-do-zoo';

const ZooMap: React.FC<ZooMapProps> = ({ onAnimalSelect, fullscreen = false }) => {
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [animalLocations, setAnimalLocations] = useState<Animal[]>([]);
  const [legendOpen, setLegendOpen] = useState(false);
  const [mapWidth, setMapWidth] = useState(0);
  const mapRef = useRef<HTMLDivElement>(null);

  const {
    imagePosition,
    isInsideZoo,
    isLowAccuracy,
    error,
    hasPromptedForRoute,
    requestSinglePosition,
    markRoutePrompted,
  } = useGpsTracking();

  const userLocation = imagePosition;

  useEffect(() => {
    const loadAnimalLocations = async () => {
      const loadedAnimals = await getAnimals();
      setAnimalLocations(loadedAnimals);
    };
    void loadAnimalLocations();
  }, []);

  // Mede a largura real do container para escalar os pins proporcionalmente
  useEffect(() => {
    const el = mapRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setMapWidth(entry.contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Tamanho do pin: 4% da largura do mapa, entre 18px e 30px
  const pinSize = mapWidth > 0 ? Math.min(30, Math.max(18, mapWidth * 0.04)) : 24;
  const pinFontSize = pinSize * 0.6;

  const handleLocationClick = (animal: Animal) => {
    setSelectedLocation((prev) => (prev === animal.id ? null : animal.id));
    onAnimalSelect(animal.id);
  };

  // ── Modo fullscreen (mobile, aba Mapa ativa) ─────────────────────────────────
  // O container ocupa toda a tela; a imagem usa object-cover para preencher sem
  // distorção; os controles ficam sobrepostos com posicionamento absoluto.
  if (fullscreen) {
    return (
      <div
        ref={mapRef}
        className="absolute inset-0 bg-black sm:static sm:inset-auto sm:rounded-xl sm:overflow-hidden sm:border sm:border-emerald-100 sm:shadow-lg sm:w-full sm:max-w-2xl sm:mx-auto"
        style={{ aspectRatio: undefined }}
      >
        {/* Imagem do mapa — cobre toda a área */}
        <img
          src={OFFICIAL_MAP_URL}
          alt="Mapa oficial do Parque Zoológico de Sapucaia do Sul"
          className="absolute inset-0 w-full h-full object-cover sm:object-fill"
        />
        <div className="absolute inset-0 bg-black/5" />

        {/* Título flutuante no topo (mobile only) — substitui o header */}
        <div className="absolute top-0 left-0 right-0 z-30 sm:hidden">
          <div className="flex items-center gap-2 bg-emerald-800/90 backdrop-blur-sm px-4 pt-safe-top pb-2 pt-3 shadow-md">
            <span className="text-xl" aria-hidden="true">🦁</span>
            <div>
              <p className="text-white text-sm font-bold leading-tight">ZooExplorer</p>
              <p className="text-emerald-300 text-[10px] leading-tight">Parque Zoológico de Sapucaia do Sul</p>
            </div>
          </div>
        </div>

        {/* GPS error */}
        {error !== null && (
          <div className="absolute top-16 left-2 right-12 z-30 sm:top-2">
            <GpsErrorMessage errorType={error} />
          </div>
        )}

        {/* Visitor marker */}
        {isInsideZoo && userLocation !== null && (
          <VisitorMarker position={userLocation} isLowAccuracy={isLowAccuracy} />
        )}

        {/* Outside zoo banner */}
        {!isInsideZoo && !error && userLocation !== null && (
          <div className="absolute top-16 left-2 right-12 z-30 sm:top-2 flex items-center gap-1.5 rounded-lg bg-amber-50/95 border border-amber-200 px-2.5 py-1.5 text-[11px] text-amber-800 shadow-sm">
            <span>Você está fora da área do zoo.</span>
          </div>
        )}

        {/* Route dialog */}
        {!isInsideZoo && !error && userLocation !== null && !hasPromptedForRoute && (
          <RouteToZooDialog
            open={true}
            onConfirm={markRoutePrompted}
            onCancel={markRoutePrompted}
          />
        )}

        {/* Animal pins */}
        {animalLocations.map((animal) => (
          <div
            key={animal.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
            style={{ left: `${animal.mapPosition.x}%`, top: `${animal.mapPosition.y}%` }}
          >
            <button
              className={`flex items-center justify-center rounded-full bg-white/95 shadow border border-gray-200 transition-all duration-150 active:scale-95 hover:shadow-md hover:scale-110
                ${selectedLocation === animal.id ? 'ring-2 ring-emerald-500 bg-emerald-50 scale-110' : ''}
              `}
              style={{ width: pinSize, height: pinSize, fontSize: pinFontSize }}
              onClick={() => handleLocationClick(animal)}
              aria-label={animal.name}
            >
              <span aria-hidden="true">{animal.emoji}</span>
            </button>

            {selectedLocation === animal.id && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-white rounded-lg shadow-xl z-30 border border-gray-100 p-2 min-w-[110px]">
                <button
                  className="absolute -top-1.5 -right-1.5 bg-gray-100 rounded-full p-0.5 hover:bg-gray-200"
                  onClick={(e) => { e.stopPropagation(); setSelectedLocation(null); }}
                  aria-label="Fechar"
                >
                  <X className="w-3 h-3 text-gray-600" />
                </button>
                <p className="font-semibold text-xs text-gray-900 text-center leading-tight">{animal.name}</p>
                <p className="text-[10px] text-gray-500 text-center mt-0.5 leading-tight">{animal.location}</p>
                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45 border-t border-l border-gray-100" />
              </div>
            )}
          </div>
        ))}

        {/* Botões de ação — canto superior direito, abaixo do header flutuante no mobile */}
        <div className="absolute top-16 right-2 flex flex-col gap-1.5 z-20 sm:top-2">
          <Button
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0 bg-white/95 shadow-md hover:shadow-lg"
            onClick={requestSinglePosition}
            aria-label="Atualizar localização"
          >
            <Navigation className="w-3.5 h-3.5" />
          </Button>
          <Button asChild size="sm" variant="outline" className="h-8 w-8 p-0 bg-white/95 shadow-md hover:shadow-lg">
            <a href={OFFICIAL_PAGE_URL} target="_blank" rel="noreferrer" aria-label="Abrir mapa oficial da SEMA-RS">
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </Button>
        </div>

        {/* Legenda — canto inferior esquerdo, acima da nav */}
        <div className="absolute bottom-16 left-2 z-20 sm:bottom-2">
          <div className="bg-white/95 rounded-lg shadow-md overflow-hidden">
            <button
              className="flex items-center gap-1 px-2 py-1.5 text-[11px] font-medium text-gray-700 hover:bg-gray-50 w-full"
              onClick={() => setLegendOpen((v) => !v)}
              aria-expanded={legendOpen}
            >
              <Info className="w-3 h-3 text-emerald-600 shrink-0" />
              <span>Legenda</span>
              <ChevronDown className={`w-3 h-3 ml-auto transition-transform ${legendOpen ? 'rotate-180' : ''}`} />
            </button>
            {legendOpen && (
              <div className="px-2 pb-2 space-y-1 text-[11px] text-gray-600 border-t border-gray-100">
                <p className="flex items-center gap-1.5 pt-1.5">
                  <span className="inline-block w-2 h-2 bg-blue-600 rounded-full shrink-0" />
                  Sua localização
                </p>
                <p className="flex items-center gap-1.5">
                  <span className="inline-block w-2 h-2 bg-white border border-gray-400 rounded-full shrink-0" />
                  Recintos e pontos de interesse
                </p>
                <p className="text-[10px] text-gray-400 pt-0.5">
                  Mapa oficial publicado pela SEMA-RS.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Modo normal (desktop ou outras abas) ─────────────────────────────────────
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        ref={mapRef}
        className="relative w-full rounded-xl overflow-hidden border border-emerald-100 shadow-lg bg-emerald-50"
        style={{ aspectRatio: '10/7' }}
      >
        <img
          src={OFFICIAL_MAP_URL}
          alt="Mapa oficial do Parque Zoológico de Sapucaia do Sul"
          className="absolute inset-0 w-full h-full object-fill"
        />
        <div className="absolute inset-0 bg-black/5" />

        {error !== null && (
          <div className="absolute top-2 left-2 right-12 z-30">
            <GpsErrorMessage errorType={error} />
          </div>
        )}

        {isInsideZoo && userLocation !== null && (
          <VisitorMarker position={userLocation} isLowAccuracy={isLowAccuracy} />
        )}

        {!isInsideZoo && !error && userLocation !== null && (
          <div className="absolute top-2 left-2 right-12 z-30 flex items-center gap-1.5 rounded-lg bg-amber-50/95 border border-amber-200 px-2.5 py-1.5 text-[11px] text-amber-800 shadow-sm">
            <span>Você está fora da área do zoo.</span>
          </div>
        )}

        {!isInsideZoo && !error && userLocation !== null && !hasPromptedForRoute && (
          <RouteToZooDialog
            open={true}
            onConfirm={markRoutePrompted}
            onCancel={markRoutePrompted}
          />
        )}

        {animalLocations.map((animal) => (
          <div
            key={animal.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
            style={{ left: `${animal.mapPosition.x}%`, top: `${animal.mapPosition.y}%` }}
          >
            <button
              className={`flex items-center justify-center rounded-full bg-white/95 shadow border border-gray-200 transition-all duration-150 active:scale-95 hover:shadow-md hover:scale-110
                ${selectedLocation === animal.id ? 'ring-2 ring-emerald-500 bg-emerald-50 scale-110' : ''}
              `}
              style={{ width: pinSize, height: pinSize, fontSize: pinFontSize }}
              onClick={() => handleLocationClick(animal)}
              aria-label={animal.name}
            >
              <span aria-hidden="true">{animal.emoji}</span>
            </button>

            {selectedLocation === animal.id && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-white rounded-lg shadow-xl z-30 border border-gray-100 p-2 min-w-[110px] sm:p-2.5 sm:min-w-[140px]">
                <button
                  className="absolute -top-1.5 -right-1.5 bg-gray-100 rounded-full p-0.5 hover:bg-gray-200"
                  onClick={(e) => { e.stopPropagation(); setSelectedLocation(null); }}
                  aria-label="Fechar"
                >
                  <X className="w-3 h-3 text-gray-600" />
                </button>
                <p className="font-semibold text-xs text-gray-900 text-center leading-tight">{animal.name}</p>
                <p className="text-[10px] text-gray-500 text-center mt-0.5 leading-tight">{animal.location}</p>
                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45 border-t border-l border-gray-100" />
              </div>
            )}
          </div>
        ))}

        <div className="absolute top-2 right-2 flex flex-col gap-1.5 z-20">
          <Button
            size="sm"
            variant="outline"
            className="h-7 w-7 sm:h-8 sm:w-8 p-0 bg-white/95 shadow-md hover:shadow-lg"
            onClick={requestSinglePosition}
            aria-label="Atualizar localização"
          >
            <Navigation className="w-3.5 h-3.5" />
          </Button>
          <Button asChild size="sm" variant="outline" className="h-7 w-7 sm:h-8 sm:w-8 p-0 bg-white/95 shadow-md hover:shadow-lg">
            <a href={OFFICIAL_PAGE_URL} target="_blank" rel="noreferrer" aria-label="Abrir mapa oficial da SEMA-RS">
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </Button>
        </div>

        <div className="absolute bottom-2 left-2 z-20">
          <div className="bg-white/95 rounded-lg shadow-md overflow-hidden">
            <button
              className="flex items-center gap-1 px-2 py-1.5 text-[11px] font-medium text-gray-700 hover:bg-gray-50 w-full"
              onClick={() => setLegendOpen((v) => !v)}
              aria-expanded={legendOpen}
            >
              <Info className="w-3 h-3 text-emerald-600 shrink-0" />
              <span>Legenda</span>
              <ChevronDown className={`w-3 h-3 ml-auto transition-transform ${legendOpen ? 'rotate-180' : ''}`} />
            </button>
            {legendOpen && (
              <div className="px-2 pb-2 space-y-1 text-[11px] text-gray-600 border-t border-gray-100">
                <p className="flex items-center gap-1.5 pt-1.5">
                  <span className="inline-block w-2 h-2 bg-blue-600 rounded-full shrink-0" />
                  Sua localização
                </p>
                <p className="flex items-center gap-1.5">
                  <span className="inline-block w-2 h-2 bg-white border border-gray-400 rounded-full shrink-0" />
                  Recintos e pontos de interesse
                </p>
                <p className="text-[10px] text-gray-400 pt-0.5">
                  Mapa oficial publicado pela SEMA-RS.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZooMap;
