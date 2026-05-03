import React, { useEffect, useState, lazy, Suspense } from 'react';
import { MapPin, PawPrint, Info, Map, ExternalLink } from 'lucide-react';
import ZooMap from '@/components/ZooMap';
import AnimalList from '@/components/AnimalList';
import AnimalDetails from '@/components/AnimalDetails';
import ZooInfo from '@/components/ZooInfo';
import { Button } from '@/components/ui/button';
import { getAnimals } from '@/services/animalService';
import type { Animal } from '@/types/animal';

// Leaflet é carregado sob demanda para não aumentar o bundle inicial
const ZooMapReal = lazy(() => import('@/components/ZooMapReal'));

const OFFICIAL_PAGE_URL = 'https://www.sema.rs.gov.br/mapa-do-zoo';

const Index = () => {
  const [selectedAnimal, setSelectedAnimal] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'map' | 'animals' | 'info'>('map');
  const [useRealMap, setUseRealMap] = useState(true);
  const [animals, setAnimals] = useState<Animal[]>([]);

  useEffect(() => {
    getAnimals().then(setAnimals);
  }, []);

  const handleAnimalSelect = (animalId: string) => {
    setSelectedAnimal(animalId);
    setActiveTab('animals');
  };

  const tabs = [
    { id: 'map',     label: 'Mapa',        Icon: MapPin    },
    { id: 'animals', label: 'Animais',     Icon: PawPrint  },
    { id: 'info',    label: 'Informações', Icon: Info      },
  ] as const;

  const isMapFullscreen = activeTab === 'map';

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-50 flex flex-col">

      {/* ── Header — oculto no mobile quando mapa está fullscreen ── */}
      <header className={`bg-emerald-800 text-white shadow-lg shrink-0 ${isMapFullscreen ? 'hidden sm:block' : ''}`}>
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl" aria-hidden="true">🦁</span>
            <div>
              <h1 className="text-lg font-bold leading-tight">ZooExplorer</h1>
              <p className="text-emerald-300 text-xs leading-tight">Parque Zoológico de Sapucaia do Sul</p>
            </div>
          </div>
        </div>
      </header>

      {/* ── Seletor de mapa no desktop (visível apenas na aba Mapa) ── */}
      {isMapFullscreen && (
        <div className="hidden sm:flex items-center justify-center gap-2 py-2 bg-white border-b border-gray-100 shrink-0">
          <Button
            size="sm"
            variant={useRealMap ? 'default' : 'outline'}
            className={`h-7 text-xs ${useRealMap ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
            onClick={() => setUseRealMap(true)}
          >
            Mapa interativo
          </Button>
          <Button
            size="sm"
            variant={!useRealMap ? 'default' : 'outline'}
            className={`h-7 text-xs ${!useRealMap ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
            onClick={() => setUseRealMap(false)}
          >
            Mapa oficial
          </Button>
          <a
            href={OFFICIAL_PAGE_URL}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-xs text-emerald-700 hover:underline ml-2"
          >
            <ExternalLink className="w-3 h-3" />
            Abrir no site da SEMA-RS
          </a>
        </div>
      )}

      {/* ── Content ── */}
      {isMapFullscreen ? (
        /* Mapa fullscreen no mobile */
        <div className="flex-1 relative">
          <div className="fixed inset-0 sm:static sm:inset-auto sm:h-auto z-0">

            {useRealMap ? (
              /* ── Mapa real (Leaflet + OpenStreetMap) ── */
              <div className="absolute inset-0 sm:static sm:h-[calc(100vh-56px-40px-56px)]">
                {/* Header flutuante no mobile */}
                <div className="absolute top-0 left-0 right-0 z-[1000] sm:hidden">
                  <div className="flex items-center justify-between bg-emerald-800/90 backdrop-blur-sm px-4 pt-3 pb-2 shadow-md">
                    <div className="flex items-center gap-2">
                      <span className="text-xl" aria-hidden="true">🦁</span>
                      <div>
                        <p className="text-white text-sm font-bold leading-tight">ZooExplorer</p>
                        <p className="text-emerald-300 text-[10px] leading-tight">Parque Zoológico de Sapucaia do Sul</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 text-[11px] bg-white/90 border-white/50 text-gray-700"
                      onClick={() => setUseRealMap(false)}
                    >
                      <Map className="w-3 h-3 mr-1" />
                      Mapa oficial
                    </Button>
                  </div>
                </div>

                {/* Mapa Leaflet */}
                <Suspense fallback={
                  <div className="absolute inset-0 flex items-center justify-center bg-emerald-50">
                    <p className="text-emerald-700 text-sm animate-pulse">Carregando mapa...</p>
                  </div>
                }>
                  <ZooMapReal
                    animals={animals}
                    onAnimalSelect={handleAnimalSelect}
                    fullscreen
                  />
                </Suspense>

                {/* Link mapa oficial — canto inferior esquerdo, acima da nav */}
                <div className="absolute bottom-16 left-2 z-[1000] sm:bottom-2">
                  <a
                    href={OFFICIAL_PAGE_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-lg px-2.5 py-1.5 text-[11px] text-gray-700 shadow-md border border-gray-200 hover:bg-white"
                  >
                    <ExternalLink className="w-3 h-3 text-emerald-600" />
                    Mapa oficial SEMA-RS
                  </a>
                </div>
              </div>
            ) : (
              /* ── Mapa oficial (imagem estática com pins) ── */
              <>
                <ZooMap onAnimalSelect={handleAnimalSelect} fullscreen />
                {/* Botão para voltar ao mapa interativo — mobile */}
                <div className="absolute top-16 left-2 z-[1001] sm:hidden">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-2 text-[11px] bg-white/90 border-white/50 text-gray-700"
                    onClick={() => setUseRealMap(true)}
                  >
                    <Map className="w-3 h-3 mr-1" />
                    Mapa interativo
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <main className="flex-1 px-3 py-3 pb-20 overflow-y-auto">
          {activeTab === 'animals' && (
            selectedAnimal ? (
              <AnimalDetails
                animalId={selectedAnimal}
                onBack={() => setSelectedAnimal(null)}
              />
            ) : (
              <AnimalList onAnimalSelect={setSelectedAnimal} />
            )
          )}
          {activeTab === 'info' && <ZooInfo />}
        </main>
      )}

      {/* ── Bottom Navigation ── */}
      <nav className={`fixed bottom-0 left-0 right-0 z-50 safe-area-inset-bottom ${
        isMapFullscreen
          ? 'bg-white/90 backdrop-blur-md border-t border-white/30 shadow-2xl sm:bg-white sm:backdrop-blur-none sm:border-gray-200 sm:shadow-lg'
          : 'bg-white border-t border-gray-200 shadow-lg'
      }`}>
        <div className="flex">
          {tabs.map(({ id, label, Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => {
                  setActiveTab(id);
                  if (id !== 'animals') setSelectedAnimal(null);
                }}
                className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-xs font-medium transition-colors ${
                  active
                    ? 'text-emerald-700 border-t-2 border-emerald-600 -mt-px bg-emerald-50/80'
                    : 'text-gray-600 active:text-emerald-600'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Index;
