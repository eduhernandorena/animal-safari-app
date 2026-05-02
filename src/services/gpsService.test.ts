// Feature: gps-zoo-tracking, Property 1: Threshold de precisão GPS
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { getCurrentPosition, watchPosition, clearWatch } from '@/services/gpsService';
import { ACCURACY_THRESHOLD_METERS } from '@/types/gps';

// ---------------------------------------------------------------------------
// Helpers para construir mocks de GeolocationPosition
// ---------------------------------------------------------------------------

function makePosition(
  latitude: number,
  longitude: number,
  accuracy: number,
  timestamp = Date.now(),
): GeolocationPosition {
  return {
    coords: {
      latitude,
      longitude,
      accuracy,
      altitude: null,
      altitudeAccuracy: null,
      heading: null,
      speed: null,
    },
    timestamp,
  } as GeolocationPosition;
}

function makeGeolocationError(code: 1 | 2 | 3): GeolocationPositionError {
  return { code, message: '', PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 } as GeolocationPositionError;
}

// ---------------------------------------------------------------------------
// Task 2.2 — Propriedade P1: Threshold de precisão GPS
// Valida: Requisito 1.6
// ---------------------------------------------------------------------------

describe('GPS_Service — Propriedade P1: Threshold de precisão GPS', () => {
  it('isLowAccuracy deve ser true quando accuracy > 50 e false quando accuracy ≤ 50', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.float({ min: 0, max: 200, noNaN: true }),
        async (accuracy) => {
          const mockGetCurrentPosition = vi.fn((
            successCb: PositionCallback,
          ) => {
            successCb(makePosition(-29.83, -51.15, accuracy));
          });

          vi.stubGlobal('navigator', {
            geolocation: {
              getCurrentPosition: mockGetCurrentPosition,
              watchPosition: vi.fn(),
              clearWatch: vi.fn(),
            },
          });

          const result = await getCurrentPosition();

          if (!result.ok) {
            // Não deve acontecer neste cenário
            return false;
          }

          const expectedLowAccuracy = accuracy > ACCURACY_THRESHOLD_METERS;
          return result.isLowAccuracy === expectedLowAccuracy;
        },
      ),
      { numRuns: 100 },
    );
  });
});

// ---------------------------------------------------------------------------
// Task 2.3 — Testes de exemplo para o GPS_Service
// Valida: Requisitos 1.3, 1.4, 1.5, 2.3
// ---------------------------------------------------------------------------

describe('GPS_Service — getCurrentPosition', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // Requisito 1.3 — GEOLOCATION_NOT_SUPPORTED
  it('retorna GEOLOCATION_NOT_SUPPORTED quando navigator.geolocation não existe', async () => {
    vi.stubGlobal('navigator', { geolocation: undefined });

    const result = await getCurrentPosition();

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('GEOLOCATION_NOT_SUPPORTED');
    }
  });

  // Requisito 1.4 — PERMISSION_DENIED (código 1)
  it('retorna PERMISSION_DENIED quando o usuário nega a permissão (código 1)', async () => {
    vi.stubGlobal('navigator', {
      geolocation: {
        getCurrentPosition: vi.fn((_success: PositionCallback, errorCb: PositionErrorCallback) => {
          errorCb(makeGeolocationError(1));
        }),
        watchPosition: vi.fn(),
        clearWatch: vi.fn(),
      },
    });

    const result = await getCurrentPosition();

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('PERMISSION_DENIED');
    }
  });

  // Requisito 1.5 — TIMEOUT (código 3)
  it('retorna TIMEOUT quando a posição não é obtida dentro do tempo limite (código 3)', async () => {
    vi.stubGlobal('navigator', {
      geolocation: {
        getCurrentPosition: vi.fn((_success: PositionCallback, errorCb: PositionErrorCallback) => {
          errorCb(makeGeolocationError(3));
        }),
        watchPosition: vi.fn(),
        clearWatch: vi.fn(),
      },
    });

    const result = await getCurrentPosition();

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('TIMEOUT');
    }
  });

  // POSITION_UNAVAILABLE (código 2)
  it('retorna POSITION_UNAVAILABLE quando o sinal GPS está indisponível (código 2)', async () => {
    vi.stubGlobal('navigator', {
      geolocation: {
        getCurrentPosition: vi.fn((_success: PositionCallback, errorCb: PositionErrorCallback) => {
          errorCb(makeGeolocationError(2));
        }),
        watchPosition: vi.fn(),
        clearWatch: vi.fn(),
      },
    });

    const result = await getCurrentPosition();

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('POSITION_UNAVAILABLE');
    }
  });

  // Código de erro desconhecido → POSITION_UNAVAILABLE (fallback)
  it('mapeia código de erro desconhecido para POSITION_UNAVAILABLE', async () => {
    vi.stubGlobal('navigator', {
      geolocation: {
        getCurrentPosition: vi.fn((_success: PositionCallback, errorCb: PositionErrorCallback) => {
          errorCb({ code: 99, message: '', PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 } as GeolocationPositionError);
        }),
        watchPosition: vi.fn(),
        clearWatch: vi.fn(),
      },
    });

    const result = await getCurrentPosition();

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('POSITION_UNAVAILABLE');
    }
  });

  // Sucesso — retorna posição com campos corretos
  it('retorna posição com latitude, longitude, accuracy e timestamp quando bem-sucedido', async () => {
    const mockPos = makePosition(-29.8320, -51.1480, 10, 1700000000000);

    vi.stubGlobal('navigator', {
      geolocation: {
        getCurrentPosition: vi.fn((successCb: PositionCallback) => {
          successCb(mockPos);
        }),
        watchPosition: vi.fn(),
        clearWatch: vi.fn(),
      },
    });

    const result = await getCurrentPosition();

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.position.latitude).toBe(-29.8320);
      expect(result.position.longitude).toBe(-51.1480);
      expect(result.position.accuracy).toBe(10);
      expect(result.position.timestamp).toBe(1700000000000);
      expect(result.isLowAccuracy).toBe(false);
    }
  });

  // Requisito 1.6 — isLowAccuracy = true quando accuracy > 50
  it('sinaliza isLowAccuracy = true quando accuracy > 50 metros', async () => {
    vi.stubGlobal('navigator', {
      geolocation: {
        getCurrentPosition: vi.fn((successCb: PositionCallback) => {
          successCb(makePosition(-29.83, -51.15, 75));
        }),
        watchPosition: vi.fn(),
        clearWatch: vi.fn(),
      },
    });

    const result = await getCurrentPosition();

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.isLowAccuracy).toBe(true);
    }
  });

  // Requisito 1.6 — isLowAccuracy = false quando accuracy = 50 (no limite)
  it('sinaliza isLowAccuracy = false quando accuracy = 50 metros (no limite)', async () => {
    vi.stubGlobal('navigator', {
      geolocation: {
        getCurrentPosition: vi.fn((successCb: PositionCallback) => {
          successCb(makePosition(-29.83, -51.15, 50));
        }),
        watchPosition: vi.fn(),
        clearWatch: vi.fn(),
      },
    });

    const result = await getCurrentPosition();

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.isLowAccuracy).toBe(false);
    }
  });
});

// ---------------------------------------------------------------------------
// Task 2.3 — Testes de exemplo: watchPosition e clearWatch
// Valida: Requisito 2.3
// ---------------------------------------------------------------------------

describe('GPS_Service — watchPosition', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('retorna GEOLOCATION_NOT_SUPPORTED via onError quando navigator.geolocation não existe', async () => {
    vi.stubGlobal('navigator', { geolocation: undefined });

    const onPosition = vi.fn();
    const onError = vi.fn();

    watchPosition(onPosition, onError);

    // O erro é emitido de forma assíncrona (setTimeout)
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(onPosition).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledOnce();
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'GEOLOCATION_NOT_SUPPORTED' }),
    );
  });

  it('chama onPosition com resultado correto a cada nova posição recebida', () => {
    let capturedSuccessCb: PositionCallback | null = null;

    vi.stubGlobal('navigator', {
      geolocation: {
        getCurrentPosition: vi.fn(),
        watchPosition: vi.fn((successCb: PositionCallback) => {
          capturedSuccessCb = successCb;
          return 42;
        }),
        clearWatch: vi.fn(),
      },
    });

    const onPosition = vi.fn();
    const onError = vi.fn();

    const watchId = watchPosition(onPosition, onError);
    expect(watchId).toBe(42);

    // Simula duas atualizações de posição
    capturedSuccessCb!(makePosition(-29.83, -51.15, 20));
    capturedSuccessCb!(makePosition(-29.84, -51.16, 30));

    expect(onPosition).toHaveBeenCalledTimes(2);
    expect(onPosition.mock.calls[0][0]).toMatchObject({ ok: true, isLowAccuracy: false });
    expect(onPosition.mock.calls[1][0]).toMatchObject({ ok: true, isLowAccuracy: false });
  });

  it('chama onError com PERMISSION_DENIED quando o usuário nega a permissão durante o watch', () => {
    let capturedErrorCb: PositionErrorCallback | null = null;

    vi.stubGlobal('navigator', {
      geolocation: {
        getCurrentPosition: vi.fn(),
        watchPosition: vi.fn((_success: PositionCallback, errorCb: PositionErrorCallback) => {
          capturedErrorCb = errorCb;
          return 7;
        }),
        clearWatch: vi.fn(),
      },
    });

    const onPosition = vi.fn();
    const onError = vi.fn();

    watchPosition(onPosition, onError);
    capturedErrorCb!(makeGeolocationError(1));

    expect(onError).toHaveBeenCalledOnce();
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'PERMISSION_DENIED' }),
    );
  });

  it('chama onError com TIMEOUT quando ocorre timeout durante o watch', () => {
    let capturedErrorCb: PositionErrorCallback | null = null;

    vi.stubGlobal('navigator', {
      geolocation: {
        getCurrentPosition: vi.fn(),
        watchPosition: vi.fn((_success: PositionCallback, errorCb: PositionErrorCallback) => {
          capturedErrorCb = errorCb;
          return 8;
        }),
        clearWatch: vi.fn(),
      },
    });

    const onPosition = vi.fn();
    const onError = vi.fn();

    watchPosition(onPosition, onError);
    capturedErrorCb!(makeGeolocationError(3));

    expect(onError).toHaveBeenCalledOnce();
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'TIMEOUT' }),
    );
  });

  it('chama onError com POSITION_UNAVAILABLE quando o sinal GPS é perdido durante o watch', () => {
    let capturedErrorCb: PositionErrorCallback | null = null;

    vi.stubGlobal('navigator', {
      geolocation: {
        getCurrentPosition: vi.fn(),
        watchPosition: vi.fn((_success: PositionCallback, errorCb: PositionErrorCallback) => {
          capturedErrorCb = errorCb;
          return 9;
        }),
        clearWatch: vi.fn(),
      },
    });

    const onPosition = vi.fn();
    const onError = vi.fn();

    watchPosition(onPosition, onError);
    capturedErrorCb!(makeGeolocationError(2));

    expect(onError).toHaveBeenCalledOnce();
    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'POSITION_UNAVAILABLE' }),
    );
  });
});

describe('GPS_Service — clearWatch', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // Requisito 2.3 — clearWatch encerra o monitoramento
  it('chama navigator.geolocation.clearWatch com o watchId correto', () => {
    const mockClearWatch = vi.fn();

    vi.stubGlobal('navigator', {
      geolocation: {
        getCurrentPosition: vi.fn(),
        watchPosition: vi.fn(() => 42),
        clearWatch: mockClearWatch,
      },
    });

    clearWatch(42);

    expect(mockClearWatch).toHaveBeenCalledOnce();
    expect(mockClearWatch).toHaveBeenCalledWith(42);
  });

  it('não chama clearWatch quando o watchId é -1 (inválido)', () => {
    const mockClearWatch = vi.fn();

    vi.stubGlobal('navigator', {
      geolocation: {
        getCurrentPosition: vi.fn(),
        watchPosition: vi.fn(),
        clearWatch: mockClearWatch,
      },
    });

    clearWatch(-1);

    expect(mockClearWatch).not.toHaveBeenCalled();
  });

  it('não lança erro quando navigator.geolocation não existe ao chamar clearWatch', () => {
    vi.stubGlobal('navigator', { geolocation: undefined });

    expect(() => clearWatch(5)).not.toThrow();
  });
});
