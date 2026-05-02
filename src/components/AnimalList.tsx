import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Clock, Heart } from 'lucide-react';
import type { Animal } from '@/types/animal';
import { getAnimals, getAnimalTypes } from '@/services/animalService';
import { useToast } from '@/hooks/use-toast';

interface AnimalListProps {
  onAnimalSelect: (animalId: string) => void;
}

const FAVORITES_STORAGE_KEY = 'zooexplorer-favorites';

const AnimalList: React.FC<AnimalListProps> = ({ onAnimalSelect }) => {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedFavorites = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    } catch {
      setFavorites([]);
    }
  }, []);

  useEffect(() => {
    const loadAnimals = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const loadedAnimals = await getAnimals();
        setAnimals(loadedAnimals);
      } catch {
        setError('Não foi possível carregar os animais.');
      } finally {
        setIsLoading(false);
      }
    };

    void loadAnimals();
  }, []);

  const filteredAnimals = useMemo(() => {
    return animals.filter((animal) => {
      // Serviços (entrada, restaurante, informações) não aparecem na lista
      if (animal.type === 'Servico') return false;
      const matchesSearch =
        animal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        animal.species.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === '' || animal.type === selectedType;
      return matchesSearch && matchesType;
    });
  }, [animals, searchTerm, selectedType]);

  const animalTypes = useMemo(() => getAnimalTypes().filter(t => t !== 'Servico'), []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Crítico': return 'bg-red-100 text-red-800 border-red-200';
      case 'Ameaçado': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const toggleFavorite = (animalId: string, animalName: string) => {
    const nextFavorites = favorites.includes(animalId)
      ? favorites.filter((id) => id !== animalId)
      : [...favorites, animalId];

    setFavorites(nextFavorites);
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(nextFavorites));

    toast({
      title: favorites.includes(animalId) ? 'Favorito removido' : 'Favorito salvo',
      description: `${animalName} ${favorites.includes(animalId) ? 'foi removido dos' : 'foi adicionado aos'} favoritos.`
    });
  };

  if (isLoading) {
    return (
      <Card className="shadow-lg border-0">
        <CardContent className="text-center py-12 text-gray-600">Carregando animais...</CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-lg border-0">
        <CardContent className="text-center py-12 space-y-3">
          <p className="text-red-600">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">Tentar novamente</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
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
              {animalTypes.map((type) => (
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAnimals.map((animal) => (
          <Card
            key={animal.id}
            className="group hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 border-0 shadow-lg"
            onClick={() => onAnimalSelect(animal.id)}
          >
            <CardHeader className="text-center pb-2">
              <div className="flex justify-end">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(animal.id, animal.name);
                  }}
                >
                  <Heart className={`w-4 h-4 ${favorites.includes(animal.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                </Button>
              </div>
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

              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" size="sm">
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
