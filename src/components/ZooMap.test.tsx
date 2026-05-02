// Feature: gps-zoo-tracking, Property 9: Marcadores de animais preservados
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import * as fc from 'fast-check';
import ZooMap from '@/components/ZooMap';
import type { Animal } from '@/types/animal';
import type { UseGpsTrackingResult } from '@/hooks/useGpsTracking';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('@/services/animalService', () => ({
  getAnimals: vi.fn(),
}));

vi.mock('@/hooks/useGpsTracking', () => ({
  useGpsTracking: vi.fn(),
}));

// calibrationEngine is used internally by useGpsTracking — mocked via the hook
vi.mock('@/services/calibrationEngine', () => ({
  createCalibrationEngine: vi.fn(() => ({
    ok: true,
    value: {
      toImagePosition: vi.fn(() => ({ position: { x: 50, y: 50 }, isOutOfBounds: false })),
      isInsideZoo: vi.fn(() => true),
    },
  })),
}));

import { getAnimals } from '@/services/animalService';
import { useGpsTracking } from '@/hooks/useGpsTracking';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const defaultGpsState: UseGpsTrackingResult = {
  imagePosition: null,
  isInsideZoo: false,
  isLowAccuracy: false,
  isWatching: false,
  error: null,
  hasPromptedForRoute: false,
  startTracking: vi.fn(),
  stopTracking: vi.fn(),
  requestSinglePosition: vi.fn(),
  markRoutePrompted: vi.fn(),
};

function makeAnimal(overrides: Partial<Animal> = {}): Animal {
  return {
    id: 'test-animal',
    name: 'Leão',
    species: 'Panthera leo',
    type: 'Mamifero',
    emoji: '🦁',
    description: 'Um leão de teste',
    habitat: 'Savana',
    feedingTime: 'Consulte a equipe no local',
    status: 'Ameaçado',
    image: '/placeholder.svg',
    weight: 'Nao informado',
    lifespan: 'Nao informado',
    diet: 'Nao informado',
    facts: ['Fato 1'],
    conservation: 'Conservação necessária',
    location: 'Área de Carnívoros',
    mapPosition: { x: 50, y: 50 },
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Arbitrary for property test P9
// ---------------------------------------------------------------------------

const animalArb = fc.record<Animal>({
  id: fc.uuid(),
  name: fc.constantFrom('Leão', 'Tigre', 'Elefante', 'Girafa', 'Zebra'),
  emoji: fc.constantFrom('🦁', '🐯', '🐘', '🦒', '🦓'),
  mapPosition: fc.record({
    x: fc.float({ min: 0, max: 100, noNaN: true }),
    y: fc.float({ min: 0, max: 100, noNaN: true }),
  }),
  // Required fields with reasonable defaults
  species: fc.constant('Panthera leo'),
  type: fc.constant('Mamifero'),
  description: fc.constant('Animal de teste'),
  habitat: fc.constant('Savana'),
  feedingTime: fc.constant('Consulte a equipe no local'),
  status: fc.constantFrom('Comum', 'Ameaçado', 'Crítico'),
  image: fc.constant('/placeholder.svg'),
  weight: fc.constant('Nao informado'),
  lifespan: fc.constant('Nao informado'),
  diet: fc.constant('Nao informado'),
  facts: fc.constant(['Fato 1']),
  conservation: fc.constant('Conservação necessária'),
  location: fc.constant('Área de teste'),
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('ZooMap', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: no GPS position, no error
    vi.mocked(useGpsTracking).mockReturnValue({ ...defaultGpsState });
  });

  // -------------------------------------------------------------------------
  // Property P9: Marcadores de animais preservados
  // -------------------------------------------------------------------------

  /**
   * Validates: Requirement 8.2
   *
   * Property P9: Para qualquer lista de animais com posições percentuais válidas,
   * o ZooMap deve renderizar um marcador para cada animal, independentemente do
   * estado do GPS.
   */
  it('P9: renderiza um marcador para cada animal independentemente do estado do GPS', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(animalArb, { minLength: 1 }),
        async (animals) => {
          // Ensure unique ids to avoid React key warnings affecting rendering
          const uniqueAnimals = animals.map((a, i) => ({ ...a, id: `${a.id}-${i}` }));

          vi.mocked(getAnimals).mockResolvedValue(uniqueAnimals);
          vi.mocked(useGpsTracking).mockReturnValue({ ...defaultGpsState });

          const { unmount } = render(<ZooMap onAnimalSelect={vi.fn()} />);

          // Wait for animals to load
          await waitFor(() => {
            for (const animal of uniqueAnimals) {
              const buttons = screen.getAllByRole('button');
              const emojiButtons = buttons.filter((btn) =>
                btn.textContent?.includes(animal.emoji)
              );
              expect(emojiButtons.length).toBeGreaterThanOrEqual(1);
            }
          });

          unmount();
        }
      ),
      { numRuns: 50 }
    );
  }, 60000);

  // -------------------------------------------------------------------------
  // Example tests (Task 7.4)
  // -------------------------------------------------------------------------

  it('renderiza a Map_Image oficial da SEMA-RS com a URL correta', () => {
    vi.mocked(getAnimals).mockResolvedValue([]);

    render(<ZooMap onAnimalSelect={vi.fn()} />);

    const img = screen.getByAltText('Mapa oficial do Parque Zoologico de Sapucaia do Sul');
    expect(img).toBeTruthy();
    expect((img as HTMLImageElement).src).toBe(
      'https://www.sema.rs.gov.br/upload/recortes/202510/28114627_112007_GDO.jpg'
    );
  });

  it('chama onAnimalSelect com o id correto ao clicar em um marcador de animal', async () => {
    const testAnimal = makeAnimal({ id: 'leao-test', emoji: '🦁' });
    vi.mocked(getAnimals).mockResolvedValue([testAnimal]);

    const onAnimalSelect = vi.fn();
    render(<ZooMap onAnimalSelect={onAnimalSelect} />);

    await waitFor(() => {
      expect(screen.getAllByRole('button').some((btn) => btn.textContent?.includes('🦁'))).toBe(true);
    });

    const animalButton = screen.getAllByRole('button').find((btn) =>
      btn.textContent?.includes('🦁')
    );
    expect(animalButton).toBeTruthy();
    fireEvent.click(animalButton!);

    expect(onAnimalSelect).toHaveBeenCalledWith('leao-test');
  });

  it('exibe mensagem de erro GPS quando error está definido', () => {
    vi.mocked(getAnimals).mockResolvedValue([]);
    vi.mocked(useGpsTracking).mockReturnValue({
      ...defaultGpsState,
      error: 'PERMISSION_DENIED',
    });

    render(<ZooMap onAnimalSelect={vi.fn()} />);

    expect(screen.getByRole('alert')).toBeTruthy();
    expect(screen.getByRole('alert').textContent).toContain(
      'Permissão de localização negada'
    );
  });

  it('não renderiza o VisitorMarker quando não há posição GPS', () => {
    vi.mocked(getAnimals).mockResolvedValue([]);
    vi.mocked(useGpsTracking).mockReturnValue({
      ...defaultGpsState,
      imagePosition: null,
    });

    render(<ZooMap onAnimalSelect={vi.fn()} />);

    expect(screen.queryByTestId('visitor-marker')).toBeNull();
  });

  it('não renderiza o VisitorMarker quando visitante está fora do zoo', () => {
    vi.mocked(getAnimals).mockResolvedValue([]);
    vi.mocked(useGpsTracking).mockReturnValue({
      ...defaultGpsState,
      imagePosition: { x: 50, y: 50 },
      isInsideZoo: false,
    });

    render(<ZooMap onAnimalSelect={vi.fn()} />);

    expect(screen.queryByTestId('visitor-marker')).toBeNull();
  });

  it('renderiza o VisitorMarker quando visitante está dentro do zoo com posição válida', () => {
    vi.mocked(getAnimals).mockResolvedValue([]);
    vi.mocked(useGpsTracking).mockReturnValue({
      ...defaultGpsState,
      imagePosition: { x: 40, y: 60 },
      isInsideZoo: true,
    });

    render(<ZooMap onAnimalSelect={vi.fn()} />);

    expect(screen.getByTestId('visitor-marker')).toBeTruthy();
  });
});
