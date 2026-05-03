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
      <Card className="shadow-md border-0">
        <CardContent className="text-center py-10 text-gray-600">Carregando animais...</CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-md border-0">
        <CardContent className="text-center py-10 space-y-3">
          <p className="text-red-600">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">Tentar novamente</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="shadow-md border-0">
        <CardHeader className="bg-emerald-600 text-white rounded-t-lg py-3 px-4">
          <CardTitle className="flex items-center space-x-2 text-base">
            <Search className="w-4 h-4" />
            <span>Explore nossos Animais</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 space-y-3">
          <Input
            placeholder="Buscar por nome ou espécie..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-emerald-200 focus:border-emerald-500"
          />
          <div className="flex flex-wrap gap-1.5">
            <Button
              variant={selectedType === '' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedType('')}
              className={`text-xs h-7 px-2.5 ${selectedType === '' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
            >
              Todos
            </Button>
            {animalTypes.map((type) => (
              <Button
                key={type}
                variant={selectedType === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedType(type)}
                className={`text-xs h-7 px-2.5 ${selectedType === type ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
              >
                {type}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredAnimals.map((animal) => (
          <Card
            key={animal.id}
            className="group active:scale-[0.98] transition-all duration-150 cursor-pointer border-0 shadow-md hover:shadow-lg"
            onClick={() => onAnimalSelect(animal.id)}
          >
            <CardHeader className="text-center pb-1 pt-3 px-3">
              <div className="flex justify-end">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(animal.id, animal.name);
                  }}
                >
                  <Heart className={`w-4 h-4 ${favorites.includes(animal.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                </Button>
              </div>
              <div className="text-5xl mb-1">
                {animal.emoji}
              </div>
              <CardTitle className="text-base text-emerald-800">{animal.name}</CardTitle>
              <p className="text-xs text-gray-500 italic">{animal.species}</p>
            </CardHeader>
            <CardContent className="space-y-2 px-3 pb-3">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs">
                  {animal.type}
                </Badge>
                <Badge className={getStatusColor(animal.status)}>
                  {animal.status}
                </Badge>
              </div>

              <p className="text-xs text-gray-600 line-clamp-2">
                {animal.description}
              </p>

              <div className="space-y-1 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span className="truncate">{animal.habitat}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3 shrink-0" />
                  <span>Alimentação: {animal.feedingTime}</span>
                </div>
              </div>

              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-xs" size="sm">
                Ver Detalhes
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAnimals.length === 0 && (
        <Card className="shadow-md border-0">
          <CardContent className="text-center py-10">
            <div className="text-5xl mb-3">🔍</div>
            <h3 className="text-base font-medium text-gray-600 mb-1">
              Nenhum animal encontrado
            </h3>
            <p className="text-sm text-gray-500">
              Tente ajustar os filtros ou buscar por outro termo.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AnimalList;
