// Feature: gps-zoo-tracking, Property 2: Todas as posições do Watch_Mode são emitidas
// Feature: gps-zoo-tracking, Property 11: Exibição única do diálogo de rota por sessão

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import * as fc from 'fast-check';
import { useGpsTracking } from '@/hooks/useGpsTracking';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('@/services/gpsService', () => ({
  getCurrentPosition: vi.fn(),
  watchPosition: vi.fn(),
  clearWatch: vi.fn(),
}));

vi.mock('@/services/calibrationEngine', () => ({
  createCalibrationEngine: vi.fn(),
}));

// Import the mocked modules so we can configure them per-test
import * as gpsService from '@/services/gpsService';
import * as calibrationEngine from '@/services/calibrationEngine';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Zoo boundary: lat ∈ [-29.8335, -29.8295], lng ∈ [-51.1500, -51.1455]
 * (matches ZOO_BOUNDARY_POLYGON in zoo-boundary.ts)
 */
const ZOO_LAT_MIN = -29.8335;
const ZOO_LAT_MAX = -29.8295;
const ZOO_LNG_MIN = -51.1500;
const ZOO_LNG_MAX = -51.1455;

/** Build a fake CalibrationEngine that maps (lat, lng) → simple image coords */
function makeFakeEngine(insideZoo = true) {
  return {
    toImagePosition: vi.fn((lat: number, lng: number) => ({
      position: { x: Math.abs(lat * 10) % 100, y: Math.abs(lng * 10) % 100 },
      isOutOfBounds: false,
    })),
    isInsideZoo: vi.fn(() => insideZoo),
  };
}

/** Build a GpsResult for a successful position */
function makeGpsResult(lat: number, lng: number, accuracy = 10) {
  return {
    ok: true as const,
    position: { latitude: lat, longitude: lng, accuracy, timestamp: Date.now() },
    isLowAccuracy: accuracy > 50,
  };
}

/** Build a GpsResult for a POSITION_UNAVAILABLE error */
function makePositionUnavailableResult() {
  return { ok: false as const, error: 'POSITION_UNAVAILABLE' as const };
}

// ---------------------------------------------------------------------------
// Setup: configure mocks before each test
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks();

  // Default: calibration engine succeeds with a fake engine that says "inside zoo"
  const fakeEngine = makeFakeEngine(true);
  vi.mocked(calibrationEngine.createCalibrationEngine).mockReturnValue({
    ok: true,
    value: fakeEngine,
  });

  // Default: getCurrentPosition resolves with a valid position
  vi.mocked(gpsService.getCurrentPosition).mockResolvedValue(
    makeGpsResult(-29.832, -51.148),
  );

  // Default: watchPosition captures the callback and returns watchId 1
  vi.mocked(gpsService.watchPosition).mockImplementation(() => 1);

  // Default: clearWatch is a no-op
  vi.mocked(gpsService.clearWatch).mockImplementation(() => {});
});

afterEach(() => {
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Task 5.2 — Property P2: Todas as posições do Watch_Mode são emitidas
// Validates: Requirement 2.2
// ---------------------------------------------------------------------------

describe('useGpsTracking — Propriedade P2: Todas as posições do Watch_Mode são emitidas', () => {
  // Feature: gps-zoo-tracking, Property 2: Todas as posições do Watch_Mode são emitidas
  it(
    'para N posições recebidas em Watch_Mode, imagePosition é atualizada N vezes',
    async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.record({
              lat: fc.float({ min: Math.fround(-29.8334), max: Math.fround(-29.8296), noNaN: true }),
              lng: fc.float({ min: Math.fround(-51.1499), max: Math.fround(-51.1456), noNaN: true }),
              accuracy: fc.float({ min: Math.fround(1), max: Math.fround(30), noNaN: true }),
            }),
            { minLength: 1 },
          ),
          async (positions) => {
            // Capture the onPosition callback registered by watchPosition
            let capturedOnPosition: ((result: ReturnType<typeof makeGpsResult>) => void) | null = null;

            vi.mocked(gpsService.watchPosition).mockImplementation((onPosition) => {
              capturedOnPosition = onPosition as typeof capturedOnPosition;
              return 1;
            });

            const fakeEngine = makeFakeEngine(true);
            vi.mocked(calibrationEngine.createCalibrationEngine).mockReturnValue({
              ok: true,
              value: fakeEngine,
            });

            const { result, unmount } = renderHook(() => useGpsTracking());

            // Start tracking to register the watchPosition callback
            act(() => {
              result.current.startTracking();
            });

            expect(capturedOnPosition).not.toBeNull();

            // Feed N positions through the captured callback
            for (const pos of positions) {
              act(() => {
                capturedOnPosition!(makeGpsResult(pos.lat, pos.lng, pos.accuracy));
              });
            }

            // toImagePosition should have been called exactly N times
            // (once per position update)
            expect(fakeEngine.toImagePosition).toHaveBeenCalledTimes(positions.length);

            // imagePosition should reflect the last position
            const lastPos = positions[positions.length - 1];
            const expectedX = Math.abs(lastPos.lat * 10) % 100;
            const expectedY = Math.abs(lastPos.lng * 10) % 100;
            expect(result.current.imagePosition).toEqual({ x: expectedX, y: expectedY });

            unmount();
          },
        ),
        { numRuns: 50 },
      );
    },
  );
});

// ---------------------------------------------------------------------------
// Task 5.3 — Property P11: Exibição única do diálogo de rota por sessão
// Validates: Requirement 10.4
// ---------------------------------------------------------------------------

describe('useGpsTracking — Propriedade P11: Exibição única do diálogo de rota por sessão', () => {
  // Feature: gps-zoo-tracking, Property 11: Exibição única do diálogo de rota por sessão
  it(
    'hasPromptedForRoute permanece true após N posições fora do boundary quando já foi marcado',
    async () => {
      // Arbitrary: positions clearly outside the zoo boundary
      const outsideBoundaryPositionArb = fc.record({
        lat: fc.oneof(
          // Clearly north of zoo
          fc.float({ min: Math.fround(-29.82), max: Math.fround(-29.80), noNaN: true }),
          // Clearly south of zoo
          fc.float({ min: Math.fround(-29.86), max: Math.fround(-29.84), noNaN: true }),
        ),
        lng: fc.float({ min: Math.fround(-51.16), max: Math.fround(-51.14), noNaN: true }),
        accuracy: fc.float({ min: Math.fround(1), max: Math.fround(30), noNaN: true }),
      });

      await fc.assert(
        fc.asyncProperty(
          fc.array(outsideBoundaryPositionArb, { minLength: 1 }),
          async (outsidePositions) => {
            // Engine that always says "outside zoo"
            const fakeEngine = makeFakeEngine(false);
            vi.mocked(calibrationEngine.createCalibrationEngine).mockReturnValue({
              ok: true,
              value: fakeEngine,
            });

            // getCurrentPosition resolves with an outside-boundary position
            vi.mocked(gpsService.getCurrentPosition).mockResolvedValue(
              makeGpsResult(outsidePositions[0].lat, outsidePositions[0].lng, outsidePositions[0].accuracy),
            );

            const { result, unmount } = renderHook(() => useGpsTracking());

            // Mark route as already prompted (simulates user already saw the dialog)
            act(() => {
              result.current.markRoutePrompted();
            });

            expect(result.current.hasPromptedForRoute).toBe(true);

            // Feed N outside-boundary positions via requestSinglePosition
            for (const pos of outsidePositions) {
              vi.mocked(gpsService.getCurrentPosition).mockResolvedValue(
                makeGpsResult(pos.lat, pos.lng, pos.accuracy),
              );

              await act(async () => {
                result.current.requestSinglePosition();
                // Allow the promise to resolve
                await Promise.resolve();
              });

              // hasPromptedForRoute must remain true — never reset to false
              expect(result.current.hasPromptedForRoute).toBe(true);
            }

            unmount();
          },
        ),
        { numRuns: 50 },
      );
    },
  );
});

// ---------------------------------------------------------------------------
// Task 5.4 — Example tests for useGpsTracking
// Validates: Requirements 2.4, 2.5
// ---------------------------------------------------------------------------

describe('useGpsTracking — Testes de exemplo', () => {
  // -------------------------------------------------------------------------
  // Requirement 2.4 — Cleanup do Watch_Mode no unmount
  // -------------------------------------------------------------------------

  it('chama clearWatch com o watchId correto ao desmontar o componente', () => {
    const WATCH_ID = 42;

    vi.mocked(gpsService.watchPosition).mockReturnValue(WATCH_ID);

    const { result, unmount } = renderHook(() => useGpsTracking());

    // Start tracking to register a watchId
    act(() => {
      result.current.startTracking();
    });

    expect(gpsService.watchPosition).toHaveBeenCalledOnce();

    // Unmount — should trigger cleanup
    unmount();

    expect(gpsService.clearWatch).toHaveBeenCalledWith(WATCH_ID);
  });

  it('não chama clearWatch no unmount quando o Watch_Mode nunca foi iniciado', () => {
    const { unmount } = renderHook(() => useGpsTracking());

    unmount();

    expect(gpsService.clearWatch).not.toHaveBeenCalled();
  });

  // -------------------------------------------------------------------------
  // Requirement 2.5 — Preservação da última posição válida em POSITION_UNAVAILABLE
  // -------------------------------------------------------------------------

  it('preserva a última imagePosition válida quando ocorre POSITION_UNAVAILABLE', async () => {
    // First call: returns a valid position
    vi.mocked(gpsService.getCurrentPosition)
      .mockResolvedValueOnce(makeGpsResult(-29.832, -51.148, 10))
      // Second call: POSITION_UNAVAILABLE
      .mockResolvedValueOnce(makePositionUnavailableResult());

    const { result } = renderHook(() => useGpsTracking());

    // First request — sets a valid imagePosition
    await act(async () => {
      result.current.requestSinglePosition();
      await Promise.resolve();
    });

    const positionAfterFirstRequest = result.current.imagePosition;
    expect(positionAfterFirstRequest).not.toBeNull();

    // Second request — POSITION_UNAVAILABLE should NOT clear imagePosition
    await act(async () => {
      result.current.requestSinglePosition();
      await Promise.resolve();
    });

    // imagePosition must still be the last valid value
    expect(result.current.imagePosition).toEqual(positionAfterFirstRequest);
    expect(result.current.error).toBe('POSITION_UNAVAILABLE');
  });

  it('limpa imagePosition quando ocorre um erro diferente de POSITION_UNAVAILABLE', async () => {
    // First call: returns a valid position
    vi.mocked(gpsService.getCurrentPosition)
      .mockResolvedValueOnce(makeGpsResult(-29.832, -51.148, 10))
      // Second call: PERMISSION_DENIED (not POSITION_UNAVAILABLE)
      .mockResolvedValueOnce({ ok: false as const, error: 'PERMISSION_DENIED' as const });

    const { result } = renderHook(() => useGpsTracking());

    // First request — sets a valid imagePosition
    await act(async () => {
      result.current.requestSinglePosition();
      await Promise.resolve();
    });

    expect(result.current.imagePosition).not.toBeNull();

    // Second request — PERMISSION_DENIED should clear imagePosition
    await act(async () => {
      result.current.requestSinglePosition();
      await Promise.resolve();
    });

    expect(result.current.imagePosition).toBeNull();
    expect(result.current.error).toBe('PERMISSION_DENIED');
  });

  it('preserva a última imagePosition válida quando POSITION_UNAVAILABLE ocorre em Watch_Mode', () => {
    let capturedOnPosition: ((result: ReturnType<typeof makeGpsResult>) => void) | null = null;
    let capturedOnError: ((error: { type: string; message: string }) => void) | null = null;

    vi.mocked(gpsService.watchPosition).mockImplementation((onPosition, onError) => {
      capturedOnPosition = onPosition as typeof capturedOnPosition;
      capturedOnError = onError as typeof capturedOnError;
      return 1;
    });

    const { result, unmount } = renderHook(() => useGpsTracking());

    act(() => {
      result.current.startTracking();
    });

    // Feed a valid position
    act(() => {
      capturedOnPosition!(makeGpsResult(-29.832, -51.148, 10));
    });

    const positionAfterValidUpdate = result.current.imagePosition;
    expect(positionAfterValidUpdate).not.toBeNull();

    // Trigger POSITION_UNAVAILABLE via the error callback
    act(() => {
      capturedOnError!({ type: 'POSITION_UNAVAILABLE', message: 'Sinal GPS perdido.' });
    });

    // imagePosition must still be the last valid value
    expect(result.current.imagePosition).toEqual(positionAfterValidUpdate);
    expect(result.current.error).toBe('POSITION_UNAVAILABLE');

    unmount();
  });
});
