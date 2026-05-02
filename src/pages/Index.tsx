import React, { useState } from 'react';
import { MapPin, PawPrint, Info } from 'lucide-react';
import ZooMap from '@/components/ZooMap';
import AnimalList from '@/components/AnimalList';
import AnimalDetails from '@/components/AnimalDetails';
import ZooInfo from '@/components/ZooInfo';

const Index = () => {
  const [selectedAnimal, setSelectedAnimal] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'map' | 'animals' | 'info'>('map');

  const handleAnimalSelect = (animalId: string) => {
    setSelectedAnimal(animalId);
    setActiveTab('animals');
  };

  const tabs = [
    { id: 'map',     label: 'Mapa',        Icon: MapPin    },
    { id: 'animals', label: 'Animais',     Icon: PawPrint  },
    { id: 'info',    label: 'Informações', Icon: Info      },
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-50 flex flex-col">

      {/* ── Header ── */}
      <header className="bg-emerald-800 text-white shadow-lg shrink-0">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl" aria-hidden="true">🦁</span>
            <div>
              <h1 className="text-xl font-bold leading-tight">ZooExplorer</h1>
              <p className="text-emerald-300 text-xs">Parque Zoológico de Sapucaia do Sul</p>
            </div>
          </div>
        </div>
      </header>

      {/* ── Content ── */}
      <main className="flex-1 container mx-auto px-4 py-4 pb-24 overflow-y-auto">
        {activeTab === 'map' && (
          <ZooMap onAnimalSelect={handleAnimalSelect} />
        )}

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

        {activeTab === 'info' && (
          <ZooInfo />
        )}
      </main>

      {/* ── Bottom Navigation ── */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="container mx-auto flex">
          {tabs.map(({ id, label, Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => {
                  setActiveTab(id);
                  if (id !== 'animals') setSelectedAnimal(null);
                }}
                className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 text-xs font-medium transition-colors ${
                  active
                    ? 'text-emerald-700 border-t-2 border-emerald-600 -mt-px bg-emerald-50'
                    : 'text-gray-500 hover:text-emerald-600'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                <Icon className="w-5 h-5" />
                {label}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Index;
