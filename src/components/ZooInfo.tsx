
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Calendar, 
  DollarSign, 
  Parking,
  Coffee,
  ShoppingBag,
  Camera,
  Users,
  Heart,
  Leaf
} from 'lucide-react';

const ZooInfo = () => {
  const schedules = [
    { day: 'Segunda a Quinta', hours: '09:00 - 17:00' },
    { day: 'Sexta e Sábado', hours: '09:00 - 19:00' },
    { day: 'Domingo', hours: '08:00 - 18:00' },
    { day: 'Feriados', hours: '08:00 - 18:00' }
  ];

  const prices = [
    { category: 'Adulto', price: 'R$ 45,00', description: 'Acima de 12 anos' },
    { category: 'Criança', price: 'R$ 25,00', description: '5 a 12 anos' },
    { category: 'Idoso/Estudante', price: 'R$ 22,50', description: 'Com comprovante' },
    { category: 'Criança até 4 anos', price: 'Gratuito', description: 'Acompanhada dos pais' }
  ];

  const facilities = [
    { icon: Parking, name: 'Estacionamento', description: 'Gratuito para visitantes' },
    { icon: Coffee, name: 'Restaurantes', description: '3 opções de alimentação' },
    { icon: ShoppingBag, name: 'Loja de Souvenirs', description: 'Produtos temáticos' },
    { icon: Camera, name: 'Áreas para Fotos', description: 'Cenários instagramáveis' }
  ];

  const events = [
    {
      title: 'Alimentação dos Leões',
      time: '14:00',
      description: 'Acompanhe o momento da alimentação e aprenda sobre a dieta dos felinos.',
      days: 'Todos os dias'
    },
    {
      title: 'Palestra sobre Conservação',
      time: '15:30',
      description: 'Conheça nossos projetos de preservação e como você pode ajudar.',
      days: 'Sábados e Domingos'
    },
    {
      title: 'Encontro com Tratadores',
      time: '11:00',
      description: 'Converse com nossos especialistas sobre os cuidados dos animais.',
      days: 'Quartas e Sextas'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Informações Gerais */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-emerald-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="w-5 h-5" />
            <span>ZooExplorer - Informações Gerais</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="text-center">
            <div className="text-6xl mb-4">🦁</div>
            <h2 className="text-2xl font-bold text-emerald-800 mb-2">
              Bem-vindo ao ZooExplorer
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Há mais de 50 anos dedicados à conservação da vida selvagem, educação ambiental 
              e pesquisa científica. Nosso zoológico abriga mais de 200 espécies de animais 
              em habitats cuidadosamente projetados.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-emerald-800 flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                Localização
              </h3>
              <div className="text-sm space-y-1">
                <p>Avenida das Palmeiras, 1500</p>
                <p>Parque Ecológico - São Paulo, SP</p>
                <p>CEP: 04567-890</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-emerald-800 flex items-center">
                <Users className="w-4 h-4 mr-2" />
                Missão
              </h3>
              <p className="text-sm text-gray-600">
                Promover a conservação da biodiversidade através da educação, 
                pesquisa e cuidado exemplar dos animais.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Horários e Preços */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Horários */}
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-blue-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>Horário de Funcionamento</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              {schedules.map((schedule, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                  <span className="font-medium text-gray-700">{schedule.day}</span>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    {schedule.hours}
                  </Badge>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
              <p className="text-xs text-yellow-800">
                <strong>Atenção:</strong> A bilheteria fecha 1 hora antes do fechamento do zoo.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Preços */}
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-green-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5" />
              <span>Ingressos</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              {prices.map((price, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                  <div>
                    <span className="font-medium text-gray-700">{price.category}</span>
                    <p className="text-xs text-gray-500">{price.description}</p>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700 font-semibold">
                    {price.price}
                  </Badge>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <p className="text-xs text-green-800">
                <strong>Dica:</strong> Compre online e ganhe 10% de desconto!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Facilidades */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-purple-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center space-x-2">
            <Coffee className="w-5 h-5" />
            <span>Facilidades do Zoo</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {facilities.map((facility, index) => {
              const IconComponent = facility.icon;
              return (
                <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                  <IconComponent className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                  <h4 className="font-medium text-gray-800 mb-1">{facility.name}</h4>
                  <p className="text-xs text-gray-600">{facility.description}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Eventos e Atividades */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-orange-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Eventos e Atividades</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {events.map((event, index) => (
              <div key={index} className="border-l-4 border-orange-500 pl-4 py-2">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-800">{event.title}</h4>
                  <Badge variant="outline" className="bg-orange-50 text-orange-700">
                    {event.time}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-1">{event.description}</p>
                <p className="text-xs text-gray-500">{event.days}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contato */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-emerald-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center space-x-2">
            <Phone className="w-5 h-5" />
            <span>Entre em Contato</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-emerald-600" />
                <div>
                  <p className="font-medium">Telefone</p>
                  <p className="text-sm text-gray-600">(11) 3456-7890</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-emerald-600" />
                <div>
                  <p className="font-medium">E-mail</p>
                  <p className="text-sm text-gray-600">contato@zooexplorer.com.br</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Globe className="w-5 h-5 text-emerald-600" />
                <div>
                  <p className="font-medium">Website</p>
                  <p className="text-sm text-gray-600">www.zooexplorer.com.br</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-emerald-800 flex items-center">
                <Heart className="w-4 h-4 mr-2" />
                Apoie a Conservação
              </h4>
              <p className="text-sm text-gray-600 mb-4">
                Sua visita ajuda nossos projetos de conservação. Conheça outras formas de contribuir:
              </p>
              <div className="space-y-2">
                <Button size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700">
                  <Heart className="w-4 h-4 mr-2" />
                  Programa de Adoção
                </Button>
                <Button size="sm" variant="outline" className="w-full">
                  <Leaf className="w-4 h-4 mr-2" />
                  Projetos Ambientais
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ZooInfo;
