
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Clock, Phone, Mail, Navigation, Camera } from 'lucide-react';
import ZooMap from '@/components/ZooMap';
import AnimalList from '@/components/AnimalList';
import AnimalDetails from '@/components/AnimalDetails';
import ZooInfo from '@/components/ZooInfo';

const Index = () => {
  const [selectedAnimal, setSelectedAnimal] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("map");

  const handleAnimalSelect = (animalId: string) => {
    setSelectedAnimal(animalId);
    setActiveTab("animals");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-emerald-50">
      {/* Header */}
      <header className="bg-emerald-800 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-emerald-600 p-2 rounded-full">
                <Camera className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">ZooExplorer</h1>
                <p className="text-emerald-200 text-sm">Descubra a vida selvagem</p>
              </div>
            </div>
            <Button
              variant="outline"
              className="bg-emerald-700 border-emerald-600 text-white hover:bg-emerald-600"
              onClick={() => {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(
                    (position) => {
                      console.log('Localização do visitante:', position.coords);
                    },
                    (error) => {
                      console.error('Erro ao obter localização:', error);
                    }
                  );
                }
              }}
            >
              <Navigation className="w-4 h-4 mr-2" />
              Minha Localização
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white shadow-md">
            <TabsTrigger value="map" className="flex items-center space-x-2">
              <MapPin className="w-4 h-4" />
              <span>Mapa</span>
            </TabsTrigger>
            <TabsTrigger value="animals" className="flex items-center space-x-2">
              <Camera className="w-4 h-4" />
              <span>Animais</span>
            </TabsTrigger>
            <TabsTrigger value="info" className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Informações</span>
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="map" className="space-y-4">
              <Card className="shadow-lg border-0">
                <CardHeader className="bg-emerald-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center space-x-2">
                    <MapPin className="w-5 h-5" />
                    <span>Mapa do Zoológico</span>
                  </CardTitle>
                  <CardDescription className="text-emerald-100">
                    Explore o zoológico e encontre seus animais favoritos
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <ZooMap onAnimalSelect={handleAnimalSelect} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="animals" className="space-y-4">
              {selectedAnimal ? (
                <AnimalDetails 
                  animalId={selectedAnimal} 
                  onBack={() => setSelectedAnimal(null)} 
                />
              ) : (
                <AnimalList onAnimalSelect={setSelectedAnimal} />
              )}
            </TabsContent>

            <TabsContent value="info" className="space-y-4">
              <ZooInfo />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
