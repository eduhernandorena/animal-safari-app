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

// Animais que compõem cada recinto coletivo
const RECINTO_ANIMAIS: Record<string, { emoji: string; nome: string; especie: string; descricao: string }[]> = {
  'repteis': [
    { emoji: '🐍', nome: 'Sucuri', especie: 'Eunectes murinus', descricao: 'Grande serpente aquatica sul-americana' },
    { emoji: '🐍', nome: 'Jiboia', especie: 'Boa constrictor', descricao: 'Serpente constritora nativa do Brasil' },
    { emoji: '🐍', nome: 'Piton-indiana', especie: 'Python molurus', descricao: 'Serpente exotica de grande porte' },
    { emoji: '🐊', nome: 'Jacare-do-papo-amarelo', especie: 'Caiman latirostris', descricao: 'Crocodiliano nativo brasileiro' },
    { emoji: '🐢', nome: 'Jabuti', especie: 'Chelonoidis spp.', descricao: 'Quelonio terrestre de deslocamento lento' },
    { emoji: '🐢', nome: 'Cagado-de-barbichas', especie: 'Phrynops geoffroanus', descricao: 'Quelonio de agua doce' },
  ],
  'felinos-e-ursos': [
    { emoji: '🐅', nome: 'Tigre', especie: 'Panthera tigris', descricao: 'Maior felino do mundo' },
    { emoji: '🐆', nome: 'Onca-pintada', especie: 'Panthera onca', descricao: 'Maior felino das Americas' },
    { emoji: '🐻', nome: 'Urso-andino', especie: 'Tremarctos ornatus', descricao: 'Unico urso nativo da America do Sul' },
  ],
  'aves': [
    { emoji: '🦜', nome: 'Araras', especie: 'Ara spp.', descricao: 'Simbolos da fauna brasileira' },
    { emoji: '🦩', nome: 'Flamingo-chileno', especie: 'Phoenicopterus chilensis', descricao: 'Ave aquatica de coloracao rosada' },
    { emoji: '🦅', nome: 'Condor-dos-andes', especie: 'Vultur gryphus', descricao: 'Uma das maiores aves voadoras do mundo' },
    { emoji: '🐦', nome: 'Tucanos', especie: 'Ramphastidae', descricao: 'Reconhecidos pelo bico grande e colorido' },
    { emoji: '🦉', nome: 'Corujas', especie: 'Strigiformes', descricao: 'Aves de rapina noturnas' },
    { emoji: '🦢', nome: 'Cisnes', especie: 'Cygnus spp.', descricao: 'Aves aquaticas elegantes' },
    { emoji: '🦅', nome: 'Gavioes', especie: 'Accipitridae', descricao: 'Predadores de topo em varios ambientes' },
    { emoji: '🐦', nome: 'Casuar', especie: 'Casuarius spp.', descricao: 'Ave terrestre de grande porte da Oceania' },
  ],
  'primatas': [
    { emoji: '🐵', nome: 'Chimpanze', especie: 'Pan troglodytes', descricao: 'Alta capacidade cognitiva e vida social complexa' },
    { emoji: '🦍', nome: 'Outros primatas', especie: 'Diversas especies', descricao: 'Primatas do plantel oficial' },
  ],
};

// Informações dos pontos de serviço
const SERVICO_INFO: Record<string, { titulo: string; icone: string; itens: { label: string; valor: string }[] }> = {
  'entrada-principal': {
    titulo: 'Entrada Principal',
    icone: '🚪',
    itens: [
      { label: 'Horario de funcionamento', valor: 'Consulte o site oficial da SEMA-RS' },
      { label: 'Servicos', valor: 'Bilheteria, controle de acesso, guarda-volumes' },
      { label: 'Acessibilidade', valor: 'Acesso para cadeirantes disponivel' },
    ],
  },
  'informacoes': {
    titulo: 'Posto de Informacoes',
    icone: 'ℹ️',
    itens: [
      { label: 'Servicos', valor: 'Mapas do zoo, orientacao ao visitante, primeiros socorros' },
      { label: 'Localizacao', valor: 'Proximo ao centro do parque' },
      { label: 'Atendimento', valor: 'Durante todo o horario de funcionamento' },
    ],
  },
  'alimentacao': {
    titulo: 'Restaurante',
    icone: '🍽️',
    itens: [
      { label: 'Tipo', valor: 'Restaurante e lanchonete' },
      { label: 'Localizacao', valor: 'Area central do parque' },
      { label: 'Horario', valor: 'Durante o horario de funcionamento do zoo' },
    ],
  },
};

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
          setError('Local não encontrado.');
          return;
        }
        setAnimal(foundAnimal);
      } catch {
        setError('Não foi possível carregar os detalhes.');
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
    try {
      if (navigator.share) {
        await navigator.share({ title: animal.name, text: animal.description, url: window.location.href });
        toast({ title: 'Compartilhado com sucesso' });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({ title: 'Link copiado' });
      }
    } catch {
      toast({ title: 'Falha ao compartilhar' });
    }
  };

  if (isLoading) {
    return (
      <Card className="shadow-md border-0">
        <CardContent className="text-center py-10 text-gray-600">Carregando...</CardContent>
      </Card>
    );
  }

  if (error || !animal) {
    return (
      <Card className="shadow-md border-0">
        <CardContent className="text-center py-10 space-y-3">
          <div className="text-5xl mb-3">❓</div>
          <h3 className="text-base font-medium text-gray-600">{error ?? 'Não encontrado'}</h3>
          <Button onClick={onBack} className="mt-3">Voltar</Button>
        </CardContent>
      </Card>
    );
  }

  // ── Tela de SERVIÇO (entrada, informações, restaurante) ──────────────────────
  if (animal.type === 'Servico') {
    const info = SERVICO_INFO[animal.id];
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={onBack} className="flex items-center gap-1.5 shrink-0">
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar</span>
          </Button>
          <h1 className="text-lg font-bold text-emerald-800 truncate">Infraestrutura</h1>
        </div>

        <Card className="shadow-md border-0">
          <CardHeader className="bg-emerald-600 text-white rounded-t-lg py-4 px-4">
            <div className="flex items-center gap-3">
              <div className="text-4xl shrink-0">{animal.emoji}</div>
              <CardTitle className="text-xl">{animal.name}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <p className="text-sm text-gray-700 leading-relaxed">{animal.description}</p>

            {info && (
              <div className="space-y-2">
                <h3 className="font-semibold text-emerald-800 flex items-center text-sm">
                  <Info className="w-4 h-4 mr-2" />
                  Informações
                </h3>
                <div className="bg-gray-50 rounded-lg divide-y divide-gray-100">
                  {info.itens.map((item) => (
                    <div key={item.label} className="flex flex-col sm:flex-row sm:justify-between px-3 py-2.5 gap-0.5 text-sm">
                      <span className="text-gray-500 text-xs">{item.label}</span>
                      <span className="font-medium text-gray-800 sm:text-right sm:max-w-[60%]">{item.valor}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm text-gray-500 bg-emerald-50 rounded-lg px-3 py-2.5">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{animal.location}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Tela de RECINTO COLETIVO (aves, répteis, felinos, primatas) ──────────────
  if (animal.type === 'Recinto') {
    const animaisDoRecinto = RECINTO_ANIMAIS[animal.id] ?? [];
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={onBack} className="flex items-center gap-1.5 shrink-0">
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar</span>
          </Button>
          <h1 className="text-lg font-bold text-emerald-800 truncate">Recinto</h1>
        </div>

        <Card className="shadow-md border-0">
          <CardHeader className="bg-emerald-600 text-white rounded-t-lg py-4 px-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <div className="text-4xl shrink-0">{animal.emoji}</div>
                <div className="min-w-0">
                  <CardTitle className="text-xl leading-tight">{animal.name}</CardTitle>
                  <p className="text-emerald-100 text-xs mt-0.5 truncate">{animal.location}</p>
                </div>
              </div>
              <Badge className={`${getStatusColor(animal.status)} shrink-0 mt-1`}>{animal.status}</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Alimentação: {animal.feedingTime}</span>
            </div>

            {animaisDoRecinto.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-emerald-800 flex items-center text-sm">
                  <Heart className="w-4 h-4 mr-2" />
                  Animais neste recinto
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {animaisDoRecinto.map((a) => (
                    <div key={a.nome} className="flex items-start gap-2.5 bg-gray-50 rounded-lg px-3 py-2.5">
                      <span className="text-xl shrink-0">{a.emoji}</span>
                      <div className="min-w-0">
                        <p className="font-medium text-sm text-gray-900">{a.nome}</p>
                        <p className="text-xs text-gray-500 italic">{a.especie}</p>
                        <p className="text-xs text-gray-600 mt-0.5">{a.descricao}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <Button
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white h-9 text-sm"
                onClick={() => toast({ title: 'Navegação no mapa', description: `Abra a aba Mapa para localizar ${animal.name}.` })}
              >
                <MapPin className="w-4 h-4 mr-2" />
                Ver no Mapa
              </Button>
              <Button variant="outline" className="flex-1 h-9 text-sm" onClick={() => { void handleShare(); }}>
                <Camera className="w-4 h-4 mr-2" />
                Compartilhar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Tela de ANIMAL INDIVIDUAL ────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={onBack} className="flex items-center gap-1.5 shrink-0">
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar</span>
        </Button>
        <h1 className="text-lg font-bold text-emerald-800 truncate">Detalhes do Animal</h1>
      </div>

      <Card className="shadow-md border-0">
        <CardHeader className="bg-emerald-600 text-white rounded-t-lg py-4 px-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="text-5xl shrink-0">{animal.emoji}</div>
              <div className="min-w-0">
                <CardTitle className="text-xl leading-tight">{animal.name}</CardTitle>
                <p className="text-emerald-100 italic text-sm truncate">{animal.species}</p>
              </div>
            </div>
            <Badge className={`${getStatusColor(animal.status)} shrink-0 mt-1`}>{animal.status}</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <p className="text-sm text-gray-700 leading-relaxed">{animal.description}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-emerald-800 flex items-center text-sm">
                <Info className="w-4 h-4 mr-2" />
                Informações Básicas
              </h3>
              <div className="space-y-1.5 text-sm bg-gray-50 rounded-lg px-3 py-2">
                <div className="flex justify-between gap-2">
                  <span className="text-gray-500 shrink-0">Tipo:</span>
                  <span className="font-medium text-right">{animal.type}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-gray-500 shrink-0">Peso:</span>
                  <span className="font-medium text-right">{animal.weight}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-gray-500 shrink-0">Expectativa:</span>
                  <span className="font-medium text-right">{animal.lifespan}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-gray-500 shrink-0">Dieta:</span>
                  <span className="font-medium text-right">{animal.diet}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-emerald-800 flex items-center text-sm">
                <MapPin className="w-4 h-4 mr-2" />
                Localização no Zoo
              </h3>
              <div className="space-y-1.5 text-sm bg-gray-50 rounded-lg px-3 py-2">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{animal.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Alimentação: {animal.feedingTime}</span>
                </div>
              </div>
            </div>
          </div>

          {animal.facts.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-emerald-800 flex items-center text-sm">
                <Heart className="w-4 h-4 mr-2" />
                Curiosidades
              </h3>
              <ul className="space-y-1.5">
                {animal.facts.map((fact, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-emerald-600 mt-0.5 shrink-0">•</span>
                    <span>{fact}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {animal.conservation !== '—' && (
            <div className="space-y-2">
              <h3 className="font-semibold text-emerald-800 flex items-center text-sm">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Status de Conservação
              </h3>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-700">{animal.conservation}</p>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white h-9 text-sm"
              onClick={() => toast({ title: 'Navegação no mapa', description: `Abra a aba Mapa para localizar ${animal.name}.` })}
            >
              <MapPin className="w-4 h-4 mr-2" />
              Ver no Mapa
            </Button>
            <Button variant="outline" className="flex-1 h-9 text-sm" onClick={() => { void handleShare(); }}>
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
