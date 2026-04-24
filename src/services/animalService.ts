import { animals } from '@/data/animals';
import type { Animal } from '@/types/animal';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getAnimals(): Promise<Animal[]> {
  await sleep(120);
  return animals;
}

export async function getAnimalById(animalId: string): Promise<Animal | null> {
  await sleep(120);
  return animals.find((animal) => animal.id === animalId) ?? null;
}

export function getAnimalTypes(): string[] {
  return [...new Set(animals.map((animal) => animal.type))];
}
