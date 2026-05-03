export type ConservationStatus = 'Comum' | 'Ameaçado' | 'Crítico';

export interface MapPosition {
  x: number;
  y: number;
}

/** Coordenadas GPS reais do recinto/ponto de interesse (medidas in loco) */
export interface GpsCoords {
  lat: number;
  lng: number;
}

export interface Animal {
  id: string;
  name: string;
  species: string;
  type: string;
  emoji: string;
  description: string;
  habitat: string;
  feedingTime: string;
  status: ConservationStatus;
  image: string;
  weight: string;
  lifespan: string;
  diet: string;
  facts: string[];
  conservation: string;
  location: string;
  mapPosition: MapPosition;
  /** Coordenadas GPS reais do recinto (quando disponíveis) */
  gpsPosition?: GpsCoords;
}
