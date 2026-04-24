import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Clock,
  MapPin,
  Mail,
  Globe,
  DollarSign,
  CircleParking,
  Info,
  AlertTriangle,
  ExternalLink,
  Landmark
} from 'lucide-react';

const ZooInfo = () => {
  const schedules = [
    { day: 'Terca a domingo', hours: '09:00 - 17:00' }
  ];

  const pedestrianPrices = [
    { category: 'Adultos', price: 'R$ 10,00', description: 'Ingresso individual' },
    { category: 'Idosos (60+)', price: 'R$ 5,00', description: 'Com documento' },
    { category: 'Estudantes', price: 'R$ 5,00', description: 'Com comprovante' },
    { category: 'Criancas ate 5 anos', price: 'Isentas', description: 'Sem cobranca' }
  ];

  const vehiclePrices = [
    { category: 'Automovel', price: 'R$ 50,00' },
    { category: 'Motocicleta', price: 'R$ 20,00' },
    { category: 'Onibus', price: 'R$ 317,00' },
    { category: 'Micro-onibus', price: 'R$ 161,50' },
    { category: 'Kombi/Lotacao/Van (ate 12)', price: 'R$ 81,00' },
    { category: 'Van (13+)', price: 'R$ 94,50' }
  ];

  const facilities = [
    { icon: CircleParking, name: 'Estacionamentos', description: 'Infraestrutura de acesso para veiculos' },
    { icon: MapPin, name: 'Entradas', description: 'Entrada de pedestres e entrada de veiculos' },
    { icon: Landmark, name: 'Servicos', description: 'Bilheteria, administracao e informacoes' }
  ];

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-emerald-700 text-white rounded-t-lg">
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="w-5 h-5" />
            <span>Parque Zoologico de Sapucaia do Sul (SEMA-RS)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <p className="text-gray-700">
            O parque e apresentado pela SEMA-RS como centro de educacao ambiental, conservacao da fauna e acolhimento
            de animais silvestres resgatados. O plantel informado inclui mais de 1.000 animais de cerca de 130 especies.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="font-semibold text-emerald-800 flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                Localizacao
              </h3>
              <div className="text-sm space-y-1 text-gray-700">
                <p>BR-116, parada 41, Km 252</p>
                <p>Sapucaia do Sul - RS</p>
                <p>Referencia oficial: portal da SEMA-RS</p>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-emerald-800 flex items-center">
                <Info className="w-4 h-4 mr-2" />
                Destaques do Plantel
              </h3>
              <p className="text-sm text-gray-700">
                Entre os destaques citados no site oficial estao sucuri, jacare-do-papo-amarelo, araras,
                flamingo-chileno, tigre, capivara, onca-pintada, urso-andino, tamandua-bandeira,
                rinoceronte-branco e chimpanze.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-blue-700 text-white rounded-t-lg">
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>Funcionamento</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {schedules.map((schedule) => (
              <div key={schedule.day} className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="font-medium text-gray-700">{schedule.day}</span>
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  {schedule.hours}
                </Badge>
              </div>
            ))}
            <div className="p-3 bg-amber-50 rounded-lg text-xs text-amber-800">
              Horarios e operacao podem mudar. Confira sempre a pagina oficial antes da visita.
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0">
          <CardHeader className="bg-green-700 text-white rounded-t-lg">
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5" />
              <span>Ingressos para Pedestres</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2">
            {pedestrianPrices.map((price) => (
              <div key={price.category} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                <div>
                  <p className="font-medium text-gray-700">{price.category}</p>
                  <p className="text-xs text-gray-500">{price.description}</p>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 font-semibold">
                  {price.price}
                </Badge>
              </div>
            ))}
            <p className="text-xs text-gray-600 pt-2">
              Compra na bilheteria do portico de entrada. Formas de pagamento informadas: dinheiro ou PIX.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg border-0">
        <CardHeader className="bg-slate-700 text-white rounded-t-lg">
          <CardTitle className="flex items-center space-x-2">
            <CircleParking className="w-5 h-5" />
            <span>Valores para Veiculos e Estrutura</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {vehiclePrices.map((price) => (
              <div key={price.category} className="flex justify-between items-center bg-slate-50 rounded-md px-3 py-2">
                <span className="text-sm text-gray-700">{price.category}</span>
                <Badge variant="outline" className="bg-white text-slate-700">{price.price}</Badge>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {facilities.map((facility) => {
              const Icon = facility.icon;
              return (
                <div key={facility.name} className="text-center p-4 bg-gray-50 rounded-lg">
                  <Icon className="w-7 h-7 mx-auto mb-2 text-slate-700" />
                  <h4 className="font-medium text-gray-800 mb-1">{facility.name}</h4>
                  <p className="text-xs text-gray-600">{facility.description}</p>
                </div>
              );
            })}
          </div>

          <div className="p-4 bg-amber-50 rounded-lg text-sm text-amber-900 flex gap-2">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <p>
              Para taxa escolar, a solicitacao deve ser enviada por e-mail para <strong>zoo@sema.rs.gov.br</strong>.
              No portal oficial, a taxa escolar nao substitui eventual agendamento de visita monitorada.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg border-0">
        <CardHeader className="bg-emerald-700 text-white rounded-t-lg">
          <CardTitle className="flex items-center space-x-2">
            <Mail className="w-5 h-5" />
            <span>Contato e Fontes Oficiais</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2 text-sm text-gray-700">
            <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-emerald-700" />zoo@sema.rs.gov.br</p>
            <p className="flex items-center gap-2"><Globe className="w-4 h-4 text-emerald-700" />sema.rs.gov.br/zoologico</p>
            <p className="text-xs text-gray-600">Dados sincronizados com as paginas oficiais da SEMA-RS em 24/04/2026.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild className="bg-emerald-700 hover:bg-emerald-800 text-white">
              <a href="https://www.sema.rs.gov.br/zoologico" target="_blank" rel="noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Abrir pagina do Zoologico
              </a>
            </Button>

            <Button asChild variant="outline">
              <a href="https://www.sema.rs.gov.br/mapa-do-zoo" target="_blank" rel="noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Abrir mapa oficial
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ZooInfo;
