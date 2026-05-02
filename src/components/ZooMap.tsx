import React, { useEffect, useState } from 'react';
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
}

const OFFICIAL_MAP_URL = 'https://www.sema.rs.gov.br/upload/recortes/202510/28114627_112007_GDO.jpg';
const OFFICIAL_PAGE_URL = 'https://www.sema.rs.gov.br/mapa-do-zoo';

const ZooMap: React.FC<ZooMapProps> = ({ onAnimalSelect }) => {
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [animalLocations, setAnimalLocations] = useState<Animal[]>([]);
  const [legendOpen, setLegendOpen] = useState(false);

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

  const handleLocationClick = (animal: Animal) => {
    setSelectedLocation((prev) => (prev === animal.id ? null : animal.id));
    onAnimalSelect(animal.id);
  };

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-emerald-100 shadow-lg bg-emerald-50"
         style={{ aspectRatio: '10/7' }}>

      <img
        src={OFFICIAL_MAP_URL}
        alt="Mapa oficial do Parque Zoológico de Sapucaia do Sul"
        className="absolute inset-0 w-full h-full object-fill"
      />
      <div className="absolute inset-0 bg-black/5" />

      {/* GPS error */}
      {error !== null && (
        <div className="absolute top-3 left-3 right-14 z-30">
          <GpsErrorMessage errorType={error} />
        </div>
      )}

      {/* Visitor marker */}
      {isInsideZoo && userLocation !== null && (
        <VisitorMarker position={userLocation} isLowAccuracy={isLowAccuracy} />
      )}

      {/* Outside zoo banner */}
      {!isInsideZoo && !error && userLocation !== null && (
        <div className="absolute top-3 left-3 right-14 z-30 flex items-center gap-2 rounded-lg bg-amber-50/95 border border-amber-200 px-3 py-2 text-xs text-amber-800 shadow-sm">
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
          <Button
            variant="outline"
            size="sm"
            className={`h-8 w-8 p-0 rounded-full bg-white/95 shadow-md hover:shadow-lg transition-all duration-150 hover:scale-110 ${
              selectedLocation === animal.id ? 'ring-2 ring-emerald-500 bg-emerald-50 scale-110' : ''
            }`}
            onClick={() => handleLocationClick(animal)}
            aria-label={animal.name}
          >
            <span className="text-sm" aria-hidden="true">{animal.emoji}</span>
          </Button>

          {selectedLocation === animal.id && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 bg-white rounded-lg shadow-xl p-2.5 min-w-[140px] z-30 border border-gray-100">
              <button
                className="absolute -top-1.5 -right-1.5 bg-gray-100 rounded-full p-0.5 hover:bg-gray-200"
                onClick={(e) => { e.stopPropagation(); setSelectedLocation(null); }}
                aria-label="Fechar"
              >
                <X className="w-3 h-3 text-gray-600" />
              </button>
              <p className="font-semibold text-sm text-gray-900 text-center">{animal.name}</p>
              <p className="text-xs text-gray-500 text-center mt-0.5">{animal.location}</p>
              <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45 border-t border-l border-gray-100" />
            </div>
          )}
        </div>
      ))}

      {/* Action buttons — top right */}
      <div className="absolute top-3 right-3 flex flex-col gap-2 z-20">
        <Button
          size="sm"
          variant="outline"
          className="h-9 w-9 p-0 bg-white/95 shadow-md hover:shadow-lg"
          onClick={requestSinglePosition}
          aria-label="Atualizar localização"
        >
          <Navigation className="w-4 h-4" />
        </Button>
        <Button asChild size="sm" variant="outline" className="h-9 w-9 p-0 bg-white/95 shadow-md hover:shadow-lg">
          <a href={OFFICIAL_PAGE_URL} target="_blank" rel="noreferrer" aria-label="Abrir mapa oficial da SEMA-RS">
            <ExternalLink className="w-4 h-4" />
          </a>
        </Button>
      </div>

      {/* Collapsible legend — bottom left */}
      <div className="absolute bottom-3 left-3 z-20">
        <div className="bg-white/95 rounded-lg shadow-md overflow-hidden">
          <button
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 w-full"
            onClick={() => setLegendOpen((v) => !v)}
            aria-expanded={legendOpen}
          >
            <Info className="w-3.5 h-3.5 text-emerald-600" />
            <span>Legenda</span>
            <ChevronDown className={`w-3.5 h-3.5 ml-auto transition-transform ${legendOpen ? 'rotate-180' : ''}`} />
          </button>
          {legendOpen && (
            <div className="px-3 pb-3 space-y-1.5 text-xs text-gray-600 border-t border-gray-100">
              <p className="flex items-center gap-2 pt-2">
                <span className="inline-block w-2.5 h-2.5 bg-blue-600 rounded-full shrink-0" />
                Sua localização
              </p>
              <p className="flex items-center gap-2">
                <span className="inline-block w-2.5 h-2.5 bg-white border border-gray-400 rounded-full shrink-0" />
                Recintos e pontos de interesse
              </p>
              <p className="text-[10px] text-gray-400 pt-1">
                Mapa oficial publicado pela SEMA-RS.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ZooMap;
