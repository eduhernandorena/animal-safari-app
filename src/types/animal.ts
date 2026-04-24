export type ConservationStatus = 'Comum' | 'Ameaçado' | 'Crítico';

export interface MapPosition {
  x: number;
  y: number;
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
}
