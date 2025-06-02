
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Info, Navigation } from 'lucide-react';

interface ZooMapProps {
  onAnimalSelect: (animalId: string) => void;
}

interface AnimalLocation {
  id: string;
  name: string;
  x: number;
  y: number;
  type: string;
  emoji: string;
}

const animalLocations: AnimalLocation[] = [
  { id: 'lion', name: 'Leões', x: 25, y: 30, type: 'Felino', emoji: '🦁' },
  { id: 'elephant', name: 'Elefantes', x: 60, y: 20, type: 'Mamífero', emoji: '🐘' },
  { id: 'giraffe', name: 'Girafas', x: 40, y: 60, type: 'Mamífero', emoji: '🦒' },
  { id: 'penguin', name: 'Pinguins', x: 75, y: 70, type: 'Ave', emoji: '🐧' },
  { id: 'monkey', name: 'Macacos', x: 15, y: 75, type: 'Primata', emoji: '🐵' },
  { id: 'tiger', name: 'Tigres', x: 80, y: 40, type: 'Felino', emoji: '🐅' },
  { id: 'bear', name: 'Ursos', x: 50, y: 85, type: 'Mamífero', emoji: '🐻' },
  { id: 'zebra', name: 'Zebras', x: 30, y: 45, type: 'Mamífero', emoji: '🦓' }
];

const ZooMap: React.FC<ZooMapProps> = ({ onAnimalSelect }) => {
  const [userLocation, setUserLocation] = useState<{ x: number; y: number } | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  useEffect(() => {
    // Simula a localização do usuário no mapa (entrada do zoo)
    setUserLocation({ x: 10, y: 10 });
  }, []);

  const handleLocationClick = (animal: AnimalLocation) => {
    setSelectedLocation(animal.id);
  };

  return (
    <div className="relative w-full h-[500px] bg-gradient-to-br from-green-100 to-green-200 rounded-lg overflow-hidden">
      {/* Mapa base com caminhos */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
        {/* Caminhos do zoológico */}
        <path
          d="M 10,10 Q 20,15 30,20 Q 50,25 70,30 Q 80,35 90,40"
          stroke="#8B4513"
          strokeWidth="1"
          fill="none"
          opacity="0.6"
        />
        <path
          d="M 10,10 Q 15,30 20,50 Q 25,70 30,90"
          stroke="#8B4513"
          strokeWidth="1"
          fill="none"
          opacity="0.6"
        />
        <path
          d="M 30,20 Q 40,35 50,50 Q 60,65 70,80"
          stroke="#8B4513"
          strokeWidth="1"
          fill="none"
          opacity="0.6"
        />
        
        {/* Áreas verdes */}
        <circle cx="20" cy="30" r="8" fill="#22C55E" opacity="0.3" />
        <circle cx="65" cy="55" r="12" fill="#22C55E" opacity="0.3" />
        <circle cx="45" cy="75" r="10" fill="#22C55E" opacity="0.3" />
        
        {/* Lago */}
        <ellipse cx="75" cy="70" rx="8" ry="5" fill="#3B82F6" opacity="0.4" />
      </svg>

      {/* Localização do usuário */}
      {userLocation && (
        <div
          className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
          style={{
            left: `${userLocation.x}%`,
            top: `${userLocation.y}%`
          }}
        >
          <div className="bg-blue-500 w-4 h-4 rounded-full border-2 border-white shadow-lg animate-pulse">
            <div className="absolute -top-1 -left-1 w-6 h-6 bg-blue-400 rounded-full opacity-50 animate-ping"></div>
          </div>
        </div>
      )}

      {/* Localizações dos animais */}
      {animalLocations.map((animal) => (
        <div
          key={animal.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
          style={{
            left: `${animal.x}%`,
            top: `${animal.y}%`
          }}
        >
          <Button
            variant="outline"
            size="sm"
            className={`p-2 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 ${
              selectedLocation === animal.id ? 'ring-2 ring-emerald-500 bg-emerald-50' : ''
            }`}
            onClick={() => {
              handleLocationClick(animal);
              onAnimalSelect(animal.id);
            }}
          >
            <span className="text-lg">{animal.emoji}</span>
          </Button>
          
          {selectedLocation === animal.id && (
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white rounded-lg shadow-lg p-2 min-w-[120px] z-30">
              <div className="text-center">
                <p className="font-medium text-sm">{animal.name}</p>
                <p className="text-xs text-gray-500">{animal.type}</p>
              </div>
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rotate-45 border-t border-l border-gray-200"></div>
            </div>
          )}
        </div>
      ))}

      {/* Legenda */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3">
        <h3 className="font-medium text-sm mb-2 flex items-center">
          <Info className="w-4 h-4 mr-1" />
          Legenda
        </h3>
        <div className="space-y-1 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Sua localização</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-white border-2 border-gray-300 rounded-full"></div>
            <span>Animais</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            <span>Áreas verdes</span>
          </div>
        </div>
      </div>

      {/* Controles de navegação */}
      <div className="absolute top-4 right-4 space-y-2">
        <Button
          size="sm"
          variant="outline"
          className="bg-white shadow-lg"
          onClick={() => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  // Simula atualização da posição no mapa
                  const newX = Math.random() * 80 + 10;
                  const newY = Math.random() * 80 + 10;
                  setUserLocation({ x: newX, y: newY });
                  console.log('Localização atualizada:', position.coords);
                },
                (error) => console.error('Erro ao obter localização:', error)
              );
            }
          }}
        >
          <Navigation className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default ZooMap;
