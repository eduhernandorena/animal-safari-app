
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Clock, Heart, Camera, Info, AlertTriangle } from 'lucide-react';

interface AnimalDetailsProps {
  animalId: string;
  onBack: () => void;
}

const animalData: Record<string, any> = {
  lion: {
    name: 'Leão Africano',
    species: 'Panthera leo',
    type: 'Felino',
    emoji: '🦁',
    status: 'Ameaçado',
    habitat: 'Savana Africana',
    feedingTime: '14:00',
    weight: '150-250 kg',
    lifespan: '10-14 anos',
    diet: 'Carnívoro',
    description: 'O leão africano é conhecido como o "rei da selva", embora viva principalmente nas savanas. Os machos são facilmente reconhecidos por suas jubas majestosas, que indicam maturidade e status social.',
    facts: [
      'Podem rugir a uma distância de até 8 km',
      'Vivem em grupos sociais chamados alcateias',
      'As fêmeas são as principais caçadoras',
      'Dormem até 20 horas por dia'
    ],
    conservation: 'A população de leões diminuiu drasticamente nos últimos 50 anos devido à perda de habitat e conflitos com humanos.',
    location: 'Setor A - Savana Africana'
  },
  elephant: {
    name: 'Elefante Africano',
    species: 'Loxodonta africana',
    type: 'Mamífero',
    emoji: '🐘',
    status: 'Ameaçado',
    habitat: 'Savana e Florestas',
    feedingTime: '10:00',
    weight: '4000-7000 kg',
    lifespan: '60-70 anos',
    diet: 'Herbívoro',
    description: 'O maior mamífero terrestre do planeta, conhecido por sua inteligência excepcional, memória impressionante e comportamento social complexo.',
    facts: [
      'Podem consumir até 300 kg de vegetação por dia',
      'Têm memória extraordinária e reconhecem rostos',
      'Comunicam-se através de infrassons',
      'Mostram comportamentos de luto pelos mortos'
    ],
    conservation: 'Ameaçados principalmente pela caça ilegal por marfim e perda de habitat.',
    location: 'Setor B - Planície dos Gigantes'
  },
  giraffe: {
    name: 'Girafa',
    species: 'Giraffa camelopardalis',
    type: 'Mamífero',
    emoji: '🦒',
    status: 'Comum',
    habitat: 'Savana Africana',
    feedingTime: '11:30',
    weight: '800-1200 kg',
    lifespan: '20-25 anos',
    diet: 'Herbívoro',
    description: 'O animal mais alto do mundo, com adaptações únicas para sua altura extrema, incluindo um coração poderoso e válvulas especiais nas veias do pescoço.',
    facts: [
      'Podem ter até 6 metros de altura',
      'Língua pode medir até 50 cm',
      'Dormem apenas 2 horas por dia',
      'Cada padrão de manchas é único'
    ],
    conservation: 'Considerada vulnerável devido à perda de habitat e fragmentação.',
    location: 'Setor C - Savana das Torres'
  },
  penguin: {
    name: 'Pinguim Imperador',
    species: 'Aptenodytes forsteri',
    type: 'Ave',
    emoji: '🐧',
    status: 'Comum',
    habitat: 'Antártica',
    feedingTime: '15:30',
    weight: '20-40 kg',
    lifespan: '15-20 anos',
    diet: 'Piscívoro',
    description: 'A maior espécie de pinguim, famosa por suas habilidades de mergulho e cuidado parental extremo durante o inverno antártico.',
    facts: [
      'Podem mergulhar até 500 metros de profundidade',
      'Machos incubam ovos por 64 dias sem comer',
      'Resistem a temperaturas de -40°C',
      'Excelentes nadadores, chegando a 9 km/h'
    ],
    conservation: 'Vulneráveis às mudanças climáticas que afetam o gelo marinho.',
    location: 'Setor D - Mundo Polar'
  },
  monkey: {
    name: 'Macaco-Prego',
    species: 'Sapajus nigritus',
    type: 'Primata',
    emoji: '🐵',
    status: 'Comum',
    habitat: 'Mata Atlântica',
    feedingTime: '09:00',
    weight: '1.5-4 kg',
    lifespan: '15-20 anos',
    diet: 'Onívoro',
    description: 'Primata brasileiro extremamente inteligente, conhecido por sua capacidade de usar ferramentas e resolver problemas complexos.',
    facts: [
      'Usam pedras para quebrar nozes',
      'Têm estrutura social matriarcal',
      'Comunicam-se com mais de 40 vocalizações',
      'Podem viver em grupos de até 40 indivíduos'
    ],
    conservation: 'Habitat ameaçado pelo desmatamento da Mata Atlântica.',
    location: 'Setor E - Floresta Brasileira'
  },
  tiger: {
    name: 'Tigre de Bengala',
    species: 'Panthera tigris',
    type: 'Felino',
    emoji: '🐅',
    status: 'Crítico',
    habitat: 'Florestas Asiáticas',
    feedingTime: '16:00',
    weight: '140-300 kg',
    lifespan: '10-15 anos',
    diet: 'Carnívoro',
    description: 'O maior felino do mundo, predador solitário com força impressionante e padrão de listras único para cada indivíduo.',
    facts: [
      'Cada tigre tem padrão único de listras',
      'Excelentes nadadores, diferente de outros felinos',
      'Podem saltar até 10 metros horizontalmente',
      'Visão noturna 6 vezes melhor que humanos'
    ],
    conservation: 'Criticamente ameaçado com menos de 4.000 indivíduos na natureza.',
    location: 'Setor F - Templo dos Tigres'
  },
  bear: {
    name: 'Urso Pardo',
    species: 'Ursus arctos',
    type: 'Mamífero',
    emoji: '🐻',
    status: 'Comum',
    habitat: 'Florestas Temperadas',
    feedingTime: '13:00',
    weight: '130-400 kg',
    lifespan: '20-25 anos',
    diet: 'Onívoro',
    description: 'Onívoro adaptável com força extraordinária, conhecido por suas habilidades de pesca e comportamento maternal protetor.',
    facts: [
      'Podem correr até 55 km/h',
      'Hibernam durante o inverno',
      'Têm olfato 7 vezes melhor que cães',
      'Podem ficar em pé nas patas traseiras'
    ],
    conservation: 'Estável na maioria das regiões, mas alguns habitats estão ameaçados.',
    location: 'Setor G - Caverna dos Ursos'
  },
  zebra: {
    name: 'Zebra de Planície',
    species: 'Equus quagga',
    type: 'Mamífero',
    emoji: '🦓',
    status: 'Comum',
    habitat: 'Savana Africana',
    feedingTime: '12:00',
    weight: '175-385 kg',
    lifespan: '20-25 anos',
    diet: 'Herbívoro',
    description: 'Equino selvagem com padrão distintivo de listras que serve como camuflagem e confunde predadores durante ataques em grupo.',
    facts: [
      'Listras são únicas como impressões digitais',
      'Podem correr até 65 km/h',
      'Vivem em grupos familiares liderados por garanhão',
      'Listras confundem moscas e predadores'
    ],
    conservation: 'População estável, mas algumas subespécies estão ameaçadas.',
    location: 'Setor H - Planície das Listras'
  }
};

const AnimalDetails: React.FC<AnimalDetailsProps> = ({ animalId, onBack }) => {
  const animal = animalData[animalId];

  if (!animal) {
    return (
      <Card className="shadow-lg border-0">
        <CardContent className="text-center py-12">
          <div className="text-6xl mb-4">❓</div>
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            Animal não encontrado
          </h3>
          <Button onClick={onBack} className="mt-4">
            Voltar à lista
          </Button>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Crítico': return 'bg-red-100 text-red-800 border-red-200';
      case 'Ameaçado': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header com botão voltar */}
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

      {/* Informações principais */}
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

          {/* Informações básicas */}
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

          {/* Curiosidades */}
          <div className="space-y-3">
            <h3 className="font-semibold text-emerald-800 flex items-center">
              <Heart className="w-4 h-4 mr-2" />
              Curiosidades
            </h3>
            <ul className="space-y-2">
              {animal.facts.map((fact: string, index: number) => (
                <li key={index} className="flex items-start space-x-2 text-sm">
                  <span className="text-emerald-600 mt-1">•</span>
                  <span>{fact}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Conservação */}
          <div className="space-y-3">
            <h3 className="font-semibold text-emerald-800 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Status de Conservação
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700">{animal.conservation}</p>
            </div>
          </div>

          {/* Botões de ação */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => {
                // Simula navegação para o animal no mapa
                console.log(`Navegando para ${animal.name} no mapa`);
              }}
            >
              <MapPin className="w-4 h-4 mr-2" />
              Ver no Mapa
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => {
                // Simula compartilhamento
                if (navigator.share) {
                  navigator.share({
                    title: animal.name,
                    text: animal.description,
                    url: window.location.href
                  });
                }
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
