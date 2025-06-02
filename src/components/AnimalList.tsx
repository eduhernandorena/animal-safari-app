
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Clock, Heart } from 'lucide-react';

interface Animal {
  id: string;
  name: string;
  species: string;
  type: string;
  emoji: string;
  description: string;
  habitat: string;
  feedingTime: string;
  status: 'Comum' | 'Ameaçado' | 'Crítico';
  image: string;
}

const animals: Animal[] = [
  {
    id: 'lion',
    name: 'Leão Africano',
    species: 'Panthera leo',
    type: 'Felino',
    emoji: '🦁',
    description: 'O rei da selva, conhecido por sua majestosa juba e rugido poderoso.',
    habitat: 'Savana Africana',
    feedingTime: '14:00',
    status: 'Ameaçado',
    image: '/placeholder.svg'
  },
  {
    id: 'elephant',
    name: 'Elefante Africano',
    species: 'Loxodonta africana',
    type: 'Mamífero',
    emoji: '🐘',
    description: 'O maior mamífero terrestre, conhecido por sua inteligência e memória.',
    habitat: 'Savana e Florestas',
    feedingTime: '10:00',
    status: 'Ameaçado',
    image: '/placeholder.svg'
  },
  {
    id: 'giraffe',
    name: 'Girafa',
    species: 'Giraffa camelopardalis',
    type: 'Mamífero',
    emoji: '🦒',
    description: 'O animal mais alto do mundo, com pescoço que pode chegar a 6 metros.',
    habitat: 'Savana Africana',
    feedingTime: '11:30',
    status: 'Comum',
    image: '/placeholder.svg'
  },
  {
    id: 'penguin',
    name: 'Pinguim Imperador',
    species: 'Aptenodytes forsteri',
    type: 'Ave',
    emoji: '🐧',
    description: 'Excelente nadador antártico, conhecido por sua dedicação parental.',
    habitat: 'Antártica',
    feedingTime: '15:30',
    status: 'Comum',
    image: '/placeholder.svg'
  },
  {
    id: 'monkey',
    name: 'Macaco-Prego',
    species: 'Sapajus nigritus',
    type: 'Primata',
    emoji: '🐵',
    description: 'Primata brasileiro muito inteligente, conhecido por usar ferramentas.',
    habitat: 'Mata Atlântica',
    feedingTime: '09:00',
    status: 'Comum',
    image: '/placeholder.svg'
  },
  {
    id: 'tiger',
    name: 'Tigre de Bengala',
    species: 'Panthera tigris',
    type: 'Felino',
    emoji: '🐅',
    description: 'Predador solitário com listras únicas, excelente nadador.',
    habitat: 'Florestas Asiáticas',
    feedingTime: '16:00',
    status: 'Crítico',
    image: '/placeholder.svg'
  },
  {
    id: 'bear',
    name: 'Urso Pardo',
    species: 'Ursus arctos',
    type: 'Mamífero',
    emoji: '🐻',
    description: 'Onívoro poderoso, conhecido por sua força e habilidades de pesca.',
    habitat: 'Florestas Temperadas',
    feedingTime: '13:00',
    status: 'Comum',
    image: '/placeholder.svg'
  },
  {
    id: 'zebra',
    name: 'Zebra de Planície',
    species: 'Equus quagga',
    type: 'Mamífero',
    emoji: '🦓',
    description: 'Equino selvagem com listras únicas que confundem predadores.',
    habitat: 'Savana Africana',
    feedingTime: '12:00',
    status: 'Comum',
    image: '/placeholder.svg'
  }
];

interface AnimalListProps {
  onAnimalSelect: (animalId: string) => void;
}

const AnimalList: React.FC<AnimalListProps> = ({ onAnimalSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');

  const filteredAnimals = animals.filter(animal => {
    const matchesSearch = animal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         animal.species.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === '' || animal.type === selectedType;
    return matchesSearch && matchesType;
  });

  const animalTypes = [...new Set(animals.map(animal => animal.type))];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Crítico': return 'bg-red-100 text-red-800 border-red-200';
      case 'Ameaçado': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-emerald-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center space-x-2">
            <Search className="w-5 h-5" />
            <span>Explore nossos Animais</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por nome ou espécie..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-emerald-200 focus:border-emerald-500"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedType === '' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedType('')}
                className={selectedType === '' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
              >
                Todos
              </Button>
              {animalTypes.map(type => (
                <Button
                  key={type}
                  variant={selectedType === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedType(type)}
                  className={selectedType === type ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Animais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAnimals.map((animal) => (
          <Card 
            key={animal.id} 
            className="group hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 border-0 shadow-lg"
            onClick={() => onAnimalSelect(animal.id)}
          >
            <CardHeader className="text-center pb-2">
              <div className="text-6xl mb-2 group-hover:scale-110 transition-transform duration-300">
                {animal.emoji}
              </div>
              <CardTitle className="text-lg text-emerald-800">{animal.name}</CardTitle>
              <p className="text-sm text-gray-500 italic">{animal.species}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs">
                  {animal.type}
                </Badge>
                <Badge className={getStatusColor(animal.status)}>
                  {animal.status}
                </Badge>
              </div>
              
              <p className="text-sm text-gray-600 line-clamp-3">
                {animal.description}
              </p>
              
              <div className="space-y-2 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-3 h-3" />
                  <span>{animal.habitat}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>Alimentação: {animal.feedingTime}</span>
                </div>
              </div>

              <Button 
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                size="sm"
              >
                Ver Detalhes
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAnimals.length === 0 && (
        <Card className="shadow-lg border-0">
          <CardContent className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              Nenhum animal encontrado
            </h3>
            <p className="text-gray-500">
              Tente ajustar os filtros ou buscar por outro termo.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AnimalList;
