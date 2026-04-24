import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Clock, Heart, Camera, Info, AlertTriangle } from 'lucide-react';
import type { Animal } from '@/types/animal';
import { getAnimalById } from '@/services/animalService';
import { useToast } from '@/hooks/use-toast';

interface AnimalDetailsProps {
  animalId: string;
  onBack: () => void;
}

const AnimalDetails: React.FC<AnimalDetailsProps> = ({ animalId, onBack }) => {
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadAnimal = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const foundAnimal = await getAnimalById(animalId);
        if (!foundAnimal) {
          setError('Animal não encontrado.');
          return;
        }
        setAnimal(foundAnimal);
      } catch {
        setError('Não foi possível carregar os detalhes do animal.');
      } finally {
        setIsLoading(false);
      }
    };

    void loadAnimal();
  }, [animalId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Crítico': return 'bg-red-100 text-red-800 border-red-200';
      case 'Ameaçado': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const handleShare = async () => {
    if (!animal) return;

    const shareData = {
      title: animal.name,
      text: animal.description,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast({ title: 'Compartilhado com sucesso', description: `${animal.name} foi compartilhado.` });
      } else {
        await navigator.clipboard.writeText(`${animal.name} - ${window.location.href}`);
        toast({ title: 'Link copiado', description: 'Seu navegador não suporta compartilhamento nativo.' });
      }
    } catch {
      toast({ title: 'Falha ao compartilhar', description: 'Não foi possível compartilhar este animal.' });
    }
  };

  if (isLoading) {
    return (
      <Card className="shadow-lg border-0">
        <CardContent className="text-center py-12 text-gray-600">Carregando detalhes...</CardContent>
      </Card>
    );
  }

  if (error || !animal) {
    return (
      <Card className="shadow-lg border-0">
        <CardContent className="text-center py-12 space-y-3">
          <div className="text-6xl mb-4">❓</div>
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            {error ?? 'Animal não encontrado'}
          </h3>
          <Button onClick={onBack} className="mt-4">
            Voltar à lista
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar</span>
        </Button>
        <h1 className="text-2xl font-bold text-emerald-800">Detalhes do Animal</h1>
      </div>

      <Card className="shadow-lg border-0">
        <CardHeader className="bg-emerald-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-6xl">{animal.emoji}</div>
              <div>
                <CardTitle className="text-2xl">{animal.name}</CardTitle>
                <p className="text-emerald-100 italic">{animal.species}</p>
              </div>
            </div>
            <Badge className={getStatusColor(animal.status)}>
              {animal.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <p className="text-gray-700 leading-relaxed">{animal.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h3 className="font-semibold text-emerald-800 flex items-center">
                <Info className="w-4 h-4 mr-2" />
                Informações Básicas
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tipo:</span>
                  <span className="font-medium">{animal.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Peso:</span>
                  <span className="font-medium">{animal.weight}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Expectativa de vida:</span>
                  <span className="font-medium">{animal.lifespan}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Dieta:</span>
                  <span className="font-medium">{animal.diet}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-emerald-800 flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                Localização no Zoo
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>{animal.location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span>Alimentação: {animal.feedingTime}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-emerald-800 flex items-center">
              <Heart className="w-4 h-4 mr-2" />
              Curiosidades
            </h3>
            <ul className="space-y-2">
              {animal.facts.map((fact, index) => (
                <li key={index} className="flex items-start space-x-2 text-sm">
                  <span className="text-emerald-600 mt-1">•</span>
                  <span>{fact}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-emerald-800 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Status de Conservação
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700">{animal.conservation}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => {
                toast({ title: 'Navegação no mapa', description: `Abra a aba Mapa para localizar ${animal.name}.` });
              }}
            >
              <MapPin className="w-4 h-4 mr-2" />
              Ver no Mapa
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                void handleShare();
              }}
            >
              <Camera className="w-4 h-4 mr-2" />
              Compartilhar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnimalDetails;
