import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Info, Navigation, ExternalLink } from 'lucide-react';
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
    setSelectedLocation(animal.id);
    onAnimalSelect(animal.id);
  };

  return (
    <div className="relative w-full aspect-[10/7] rounded-lg overflow-hidden border border-emerald-100 bg-emerald-50">
      <img
        src={OFFICIAL_MAP_URL}
        alt="Mapa oficial do Parque Zoologico de Sapucaia do Sul"
        className="absolute inset-0 w-full h-full object-fill"
      />

      <div className="absolute inset-0 bg-black/5" />

      {/* GPS error overlay */}
      {error !== null && (
        <div className="absolute top-4 left-4 right-4 z-30">
          <GpsErrorMessage errorType={error} />
        </div>
      )}

      {/* Visitor marker — only when inside zoo and position is known */}
      {isInsideZoo && userLocation !== null && (
        <VisitorMarker position={userLocation} isLowAccuracy={isLowAccuracy} />
      )}

      {/* Outside zoo message */}
      {!isInsideZoo && !error && userLocation !== null && (
        <div className="absolute top-4 left-4 right-4 z-30 flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800 shadow-sm">
          <span>Você está fora da área do zoo.</span>
        </div>
      )}

      {/* Route to zoo dialog — shown only once per session */}
      {!isInsideZoo && !error && userLocation !== null && !hasPromptedForRoute && (
        <RouteToZooDialog
          open={true}
          onConfirm={() => {
            markRoutePrompted();
          }}
          onCancel={() => {
            markRoutePrompted();
          }}
        />
      )}

      {animalLocations.map((animal) => (
        <div
          key={animal.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
          style={{ left: `${animal.mapPosition.x}%`, top: `${animal.mapPosition.y}%` }}
        >
          <Button
            variant="outline"
            size="sm"
            className={`h-8 w-8 p-0 rounded-full bg-white/95 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 ${
              selectedLocation === animal.id ? 'ring-2 ring-emerald-500 bg-emerald-50' : ''
            }`}
            onClick={() => handleLocationClick(animal)}
          >
            <span className="text-sm" aria-hidden="true">{animal.emoji}</span>
          </Button>

          {selectedLocation === animal.id && (
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white rounded-lg shadow-lg p-2 min-w-[150px] z-30">
              <div className="text-center">
                <p className="font-medium text-sm text-gray-900">{animal.name}</p>
                <p className="text-xs text-gray-600">{animal.location}</p>
              </div>
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rotate-45 border-t border-l border-gray-200" />
            </div>
          )}
        </div>
      ))}

      <div className="absolute bottom-4 left-4 bg-white/95 rounded-lg shadow-lg p-3 max-w-[320px]">
        <h3 className="font-medium text-sm mb-2 flex items-center text-gray-900">
          <Info className="w-4 h-4 mr-1" />
          Legenda
        </h3>
        <div className="space-y-1 text-xs text-gray-700">
          <p><span className="inline-block w-2.5 h-2.5 bg-blue-600 rounded-full mr-2 align-middle" />Sua localizacao</p>
          <p><span className="inline-block w-2.5 h-2.5 bg-white border border-gray-400 rounded-full mr-2 align-middle" />Animais do plantel informado no site oficial</p>
          <p className="pt-1 text-[11px] text-gray-600">Base visual: mapa oficial publicado pela SEMA-RS.</p>
        </div>
      </div>

      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <Button
          size="sm"
          variant="outline"
          className="bg-white/95 shadow-lg"
          onClick={requestSinglePosition}
          aria-label="Atualizar localizacao"
        >
          <Navigation className="w-4 h-4" />
        </Button>

        <Button asChild size="sm" variant="outline" className="bg-white/95 shadow-lg">
          <a href={OFFICIAL_PAGE_URL} target="_blank" rel="noreferrer" aria-label="Abrir mapa oficial da SEMA-RS">
            <ExternalLink className="w-4 h-4" />
          </a>
        </Button>
      </div>
    </div>
  );
};

export default ZooMap;
