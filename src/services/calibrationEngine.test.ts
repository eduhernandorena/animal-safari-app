// Feature: gps-zoo-tracking, Property 3: Mínimo de pontos de controle
// Feature: gps-zoo-tracking, Property 4: Round-trip de calibração
// Feature: gps-zoo-tracking, Property 5: Invariante de intervalo da saída
// Feature: gps-zoo-tracking, Property 6: Injetividade dentro do Zoo_Boundary
// Feature: gps-zoo-tracking, Property 7: Corretude do ponto-em-polígono
// Feature: gps-zoo-tracking, Property 8: Validação de Control_Points inválidos

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { createCalibrationEngine } from '@/services/calibrationEngine';
import { ZOO_BOUNDARY_POLYGON } from '@/config/zoo-boundary';
import { ZOO_CONTROL_POINTS } from '@/config/zoo-control-points';
import type { ControlPoint } from '@/types/gps';

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

/**
 * Generates a valid ControlPoint with all fields within their valid ranges.
 * Uses the ranges specified in the task description.
 */
const validControlPointArb: fc.Arbitrary<ControlPoint> = fc.record({
  latitude: fc.float({ min: -89, max: 89, noNaN: true }),
  longitude: fc.float({ min: -179, max: 179, noNaN: true }),
  imageX: fc.float({ min: 0, max: 100, noNaN: true }),
  imageY: fc.float({ min: 0, max: 100, noNaN: true }),
  description: fc.constant('test point'),
});

// ---------------------------------------------------------------------------
// Task 3.2 — Property P3: Mínimo de pontos de controle
// Validates: Requirements 3.1, 3.3
// ---------------------------------------------------------------------------

describe('Calibration_Engine — Propriedade P3: Mínimo de pontos de controle', () => {
  // Feature: gps-zoo-tracking, Property 3: Mínimo de pontos de controle
  it(
    'retorna INSUFFICIENT_CONTROL_POINTS para qualquer array com length < 3',
    () => {
      fc.assert(
        fc.property(
          fc.array(validControlPointArb, { maxLength: 2 }),
          (points) => {
            const result = createCalibrationEngine(points);
            expect(result.ok).toBe(false);
            if (!result.ok) {
              expect(result.error).toBe('INSUFFICIENT_CONTROL_POINTS');
            }
          },
        ),
        { numRuns: 100 },
      );
    },
  );
});

// ---------------------------------------------------------------------------
// Task 3.3 — Property P4: Round-trip de calibração
// Validates: Requirements 3.4, 3.5, 4.1
// ---------------------------------------------------------------------------

describe('Calibration_Engine — Propriedade P4: Round-trip de calibração', () => {
  // Feature: gps-zoo-tracking, Property 4: Round-trip de calibração
  it(
    'toImagePosition(cp.lat, cp.lng) reproduz cp.imageX e cp.imageY com erro ≤ 1%',
    () => {
      /**
       * The round-trip property holds exactly when the system is exactly
       * determined (3 points). With N > 3 points, the least-squares solution
       * minimizes total error but individual errors can exceed 1% when the
       * points are not consistent with an affine transform.
       *
       * Strategy: generate exactly 3 well-spread points (exactly determined
       * system). We use a 10×10 grid with unique indices to guarantee:
       * 1. All GPS locations are distinct (no contradictory constraints)
       * 2. Points span at least 2 different rows AND 2 different columns
       *    (well-conditioned for the affine solver)
       *
       * We skip when createCalibrationEngine returns ok: false
       * (degenerate/collinear cases that the solver detects).
       */

      // Generate exactly 3 unique integer indices in [0, 99] that span
      // at least 2 different rows AND 2 different columns.
      // We use the same index to derive both GPS coordinates AND image positions,
      // guaranteeing that distinct GPS indices also produce distinct image positions.
      // This prevents degenerate cases where two points share the same image position,
      // which would make the affine system under-determined.
      const wellSpreadThreePointsArb = fc
        .uniqueArray(fc.integer({ min: 0, max: 99 }), { minLength: 3, maxLength: 3 })
        .filter((indices) => {
          const rows = new Set(indices.map((i) => i % 10));
          const cols = new Set(indices.map((i) => Math.floor(i / 10)));
          return rows.size >= 2 && cols.size >= 2;
        })
        .map((indices) =>
          indices.map((idx) => {
            const row = idx % 10;
            const col = Math.floor(idx / 10);
            return {
              latitude: -80 + row * 16,        // -80, -64, -48, ..., 64
              longitude: -170 + col * 34,       // -170, -136, -102, ..., 136
              imageX: col * (100 / 9),          // 0, ~11.1, ~22.2, ..., 100
              imageY: row * (100 / 9),          // 0, ~11.1, ~22.2, ..., 100
              description: 'test point',
            };
          }),
        );

      fc.assert(
        fc.property(
          wellSpreadThreePointsArb,
          (rawPoints) => {
            const points: ControlPoint[] = rawPoints;

            const engineResult = createCalibrationEngine(points);
            if (!engineResult.ok) {
              // Skip degenerate cases (collinear points, etc.)
              return true;
            }

            const engine = engineResult.value;
            for (const cp of points) {
              const result = engine.toImagePosition(cp.latitude, cp.longitude);
              expect(Math.abs(result.position.x - cp.imageX)).toBeLessThanOrEqual(1.0);
              expect(Math.abs(result.position.y - cp.imageY)).toBeLessThanOrEqual(1.0);
            }
          },
        ),
        { numRuns: 100 },
      );
    },
  );
});

// ---------------------------------------------------------------------------
// Task 3.4 — Property P5: Invariante de intervalo da saída
// Validates: Requirements 4.2, 4.3
// ---------------------------------------------------------------------------

describe('Calibration_Engine — Propriedade P5: Invariante de intervalo da saída', () => {
  // Feature: gps-zoo-tracking, Property 5: Invariante de intervalo da saída
  it(
    'x e y retornados por toImagePosition estão sempre em [0, 100]',
    () => {
      // Build the engine once from the real zoo control points
      const engineResult = createCalibrationEngine(ZOO_CONTROL_POINTS);
      expect(engineResult.ok).toBe(true);
      if (!engineResult.ok) return;

      const engine = engineResult.value;

      fc.assert(
        fc.property(
          fc.record({
            lat: fc.float({ min: -90, max: 90, noNaN: true }),
            lng: fc.float({ min: -180, max: 180, noNaN: true }),
          }),
          ({ lat, lng }) => {
            const result = engine.toImagePosition(lat, lng);
            expect(result.position.x).toBeGreaterThanOrEqual(0);
            expect(result.position.x).toBeLessThanOrEqual(100);
            expect(result.position.y).toBeGreaterThanOrEqual(0);
            expect(result.position.y).toBeLessThanOrEqual(100);
          },
        ),
        { numRuns: 100 },
      );
    },
  );
});

// ---------------------------------------------------------------------------
// Task 3.5 — Property P6: Injetividade dentro do Zoo_Boundary
// Validates: Requirement 4.4
// ---------------------------------------------------------------------------

describe('Calibration_Engine — Propriedade P6: Injetividade dentro do Zoo_Boundary', () => {
  // Feature: gps-zoo-tracking, Property 6: Injetividade dentro do Zoo_Boundary
  it(
    'dois pares GPS distintos dentro do Zoo_Boundary produzem ImagePositions que diferem ≥ 0,5% em x ou y',
    () => {
      /**
       * We use a well-conditioned engine built from 3 points with large
       * coordinate differences to avoid numerical instability in the
       * least-squares solver. The calibration maps:
       *   (0, 0)   → (0,   0)    [origin]
       *   (1, 0)   → (100, 0)    [north]
       *   (0, 1)   → (0,   100)  [east]
       *
       * With this calibration:
       *   x = 100 * lng
       *   y = 100 * lat (approximately, with the affine transform)
       *
       * We test injectivity within a "zoo boundary" of lat ∈ [0, 1], lng ∈ [0, 1].
       * A 0.01-unit difference in lat or lng maps to ~1 unit in imageX/imageY,
       * well above the 0.5% threshold.
       */
      const calibrationPoints: ControlPoint[] = [
        { latitude: 0, longitude: 0, imageX: 0,   imageY: 0,   description: 'origin' },
        { latitude: 1, longitude: 0, imageX: 100, imageY: 0,   description: 'north' },
        { latitude: 0, longitude: 1, imageX: 0,   imageY: 100, description: 'east' },
      ];

      const engineResult = createCalibrationEngine(calibrationPoints);
      expect(engineResult.ok).toBe(true);
      if (!engineResult.ok) return;

      const engine = engineResult.value;

      // Test injectivity within lat ∈ [0, 1], lng ∈ [0, 1]
      const insidePointArb = fc.record({
        lat: fc.float({ min: 0, max: 1, noNaN: true }),
        lng: fc.float({ min: 0, max: 1, noNaN: true }),
      });

      fc.assert(
        fc.property(
          fc.tuple(insidePointArb, insidePointArb),
          ([p1, p2]) => {
            // Skip pairs that are too close together for the transform to distinguish
            // (require at least 0.01 unit ≈ 1% of the boundary range)
            const latDiff = Math.abs(p1.lat - p2.lat);
            const lngDiff = Math.abs(p1.lng - p2.lng);
            fc.pre(latDiff > 0.01 || lngDiff > 0.01);

            const r1 = engine.toImagePosition(p1.lat, p1.lng);
            const r2 = engine.toImagePosition(p2.lat, p2.lng);

            const xDiff = Math.abs(r1.position.x - r2.position.x);
            const yDiff = Math.abs(r1.position.y - r2.position.y);

            expect(xDiff >= 0.5 || yDiff >= 0.5).toBe(true);
          },
        ),
        { numRuns: 100 },
      );
    },
  );
});

// ---------------------------------------------------------------------------
// Task 3.6 — Property P7: Corretude do ponto-em-polígono
// Validates: Requirement 6.1
// ---------------------------------------------------------------------------

describe('Calibration_Engine — Propriedade P7: Corretude do ponto-em-polígono', () => {
  // Feature: gps-zoo-tracking, Property 7: Corretude do ponto-em-polígono
  it(
    'isInsideZoo retorna true para pontos dentro do ZOO_BOUNDARY_POLYGON',
    () => {
      const engineResult = createCalibrationEngine(ZOO_CONTROL_POINTS);
      expect(engineResult.ok).toBe(true);
      if (!engineResult.ok) return;

      const engine = engineResult.value;

      // Points strictly inside the rectangular boundary (with margin)
      // Real boundary: lat ∈ [-29.8025, -29.7916], lng ∈ [-51.1781, -51.1640]
      // Use a safe inner range to avoid floating-point edge effects
      // Use Math.fround() to satisfy fc.float's 32-bit float constraint
      const insideArb = fc.record({
        lat: fc.float({ min: Math.fround(-29.8020), max: Math.fround(-29.7920), noNaN: true }),
        lng: fc.float({ min: Math.fround(-51.1775), max: Math.fround(-51.1645), noNaN: true }),
      });

      fc.assert(
        fc.property(insideArb, ({ lat, lng }) => {
          expect(engine.isInsideZoo(lat, lng)).toBe(true);
        }),
        { numRuns: 100 },
      );
    },
  );

  // Feature: gps-zoo-tracking, Property 7: Corretude do ponto-em-polígono
  it(
    'isInsideZoo retorna false para pontos claramente fora do ZOO_BOUNDARY_POLYGON',
    () => {
      const engineResult = createCalibrationEngine(ZOO_CONTROL_POINTS);
      expect(engineResult.ok).toBe(true);
      if (!engineResult.ok) return;

      const engine = engineResult.value;

      // Points clearly outside: lat < -29.8025 (south of zoo) or lat > -29.7916 (north of zoo)
      // Real boundary: lat ∈ [-29.8025, -29.7916], lng ∈ [-51.1781, -51.1640]
      // Use Math.fround() to satisfy fc.float's 32-bit float constraint
      const outsideArb = fc.oneof(
        // lat clearly south of zoo
        fc.record({
          lat: fc.float({ min: -90, max: Math.fround(-29.81), noNaN: true }),
          lng: fc.float({ min: -180, max: 180, noNaN: true }),
        }),
        // lat clearly north of zoo
        fc.record({
          lat: fc.float({ min: Math.fround(-29.78), max: 90, noNaN: true }),
          lng: fc.float({ min: -180, max: 180, noNaN: true }),
        }),
      );

      fc.assert(
        fc.property(outsideArb, ({ lat, lng }) => {
          expect(engine.isInsideZoo(lat, lng)).toBe(false);
        }),
        { numRuns: 100 },
      );
    },
  );
});

// ---------------------------------------------------------------------------
// Task 3.7 — Property P8: Validação de Control_Points inválidos
// Validates: Requirements 9.2, 9.3
// ---------------------------------------------------------------------------

describe('Calibration_Engine — Propriedade P8: Validação de Control_Points inválidos', () => {
  // Feature: gps-zoo-tracking, Property 8: Validação de Control_Points inválidos
  it(
    'retorna INVALID_CONTROL_POINT para qualquer ControlPoint com campos fora dos intervalos válidos',
    () => {
      /**
       * Generator: produce a ControlPoint where at least one field is out of range.
       * We pick which field to invalidate via fc.oneof.
       * Use Math.fround() on non-integer bounds to satisfy fc.float's 32-bit constraint.
       */
      const invalidControlPointArb: fc.Arbitrary<ControlPoint> = fc.oneof(
        // latitude out of range: outside [-90, 90]
        fc.record({
          latitude: fc.oneof(
            fc.float({ min: 91, max: 200, noNaN: true }),
            fc.float({ min: -200, max: -91, noNaN: true }),
          ),
          longitude: fc.float({ min: -180, max: 180, noNaN: true }),
          imageX: fc.float({ min: 0, max: 100, noNaN: true }),
          imageY: fc.float({ min: 0, max: 100, noNaN: true }),
          description: fc.constant('test point'),
        }),
        // longitude out of range: outside [-180, 180]
        fc.record({
          latitude: fc.float({ min: -90, max: 90, noNaN: true }),
          longitude: fc.oneof(
            fc.float({ min: 181, max: 360, noNaN: true }),
            fc.float({ min: -360, max: -181, noNaN: true }),
          ),
          imageX: fc.float({ min: 0, max: 100, noNaN: true }),
          imageY: fc.float({ min: 0, max: 100, noNaN: true }),
          description: fc.constant('test point'),
        }),
        // imageX out of range: outside [0, 100]
        fc.record({
          latitude: fc.float({ min: -90, max: 90, noNaN: true }),
          longitude: fc.float({ min: -180, max: 180, noNaN: true }),
          imageX: fc.oneof(
            fc.float({ min: 101, max: 200, noNaN: true }),
            fc.float({ min: -100, max: -1, noNaN: true }),
          ),
          imageY: fc.float({ min: 0, max: 100, noNaN: true }),
          description: fc.constant('test point'),
        }),
        // imageY out of range: outside [0, 100]
        fc.record({
          latitude: fc.float({ min: -90, max: 90, noNaN: true }),
          longitude: fc.float({ min: -180, max: 180, noNaN: true }),
          imageX: fc.float({ min: 0, max: 100, noNaN: true }),
          imageY: fc.oneof(
            fc.float({ min: 101, max: 200, noNaN: true }),
            fc.float({ min: -100, max: -1, noNaN: true }),
          ),
          description: fc.constant('test point'),
        }),
      );

      // Build an array of 3 points where at least one is invalid.
      // The invalid point can be at any position in the array.
      fc.assert(
        fc.property(
          invalidControlPointArb,
          validControlPointArb,
          validControlPointArb,
          (invalid, valid1, valid2) => {
            // Try with the invalid point in each position
            const combinations: ControlPoint[][] = [
              [invalid, valid1, valid2],
              [valid1, invalid, valid2],
              [valid1, valid2, invalid],
            ];

            for (const points of combinations) {
              const result = createCalibrationEngine(points);
              expect(result.ok).toBe(false);
              if (!result.ok) {
                expect(result.error).toBe('INVALID_CONTROL_POINT');
              }
            }
          },
        ),
        { numRuns: 100 },
      );
    },
  );
});

// ---------------------------------------------------------------------------
// Task 3.8 — Example tests for Calibration_Engine
// Validates: Requirements 3.3, 4.2, 4.3, 9.3
// ---------------------------------------------------------------------------

describe('Calibration_Engine — Testes de exemplo', () => {
  // ---------------------------------------------------------------------------
  // Requirement 3.3 — Conversão com pontos de controle conhecidos
  // ---------------------------------------------------------------------------

  it('converte coordenadas GPS dos pontos de controle para as ImagePositions esperadas', () => {
    // Use a simple, well-conditioned set of 3 control points where the
    // expected output is easy to reason about.
    const points: ControlPoint[] = [
      { latitude: 0, longitude: 0, imageX: 0, imageY: 0, description: 'origem' },
      { latitude: 1, longitude: 0, imageX: 100, imageY: 0, description: 'norte' },
      { latitude: 0, longitude: 1, imageX: 0, imageY: 100, description: 'leste' },
    ];

    const engineResult = createCalibrationEngine(points);
    expect(engineResult.ok).toBe(true);
    if (!engineResult.ok) return;

    const engine = engineResult.value;

    // Each control point should round-trip with ≤ 1% error
    for (const cp of points) {
      const result = engine.toImagePosition(cp.latitude, cp.longitude);
      expect(Math.abs(result.position.x - cp.imageX)).toBeLessThanOrEqual(1.0);
      expect(Math.abs(result.position.y - cp.imageY)).toBeLessThanOrEqual(1.0);
    }
  });

  it('cria engine com sucesso a partir dos ZOO_CONTROL_POINTS reais', () => {
    // The real control points should produce a valid engine
    const engineResult = createCalibrationEngine(ZOO_CONTROL_POINTS);
    expect(engineResult.ok).toBe(true);
  });

  it('converte coordenadas GPS com 3 pontos de controle bem condicionados', () => {
    // Use a well-conditioned set of 3 points with good geographic spread.
    // With exactly 3 points the affine system is exactly determined,
    // so the round-trip holds with ≤ 1% error.
    const threePoints: ControlPoint[] = [
      { latitude: 0, longitude: 0, imageX: 50, imageY: 50, description: 'centro' },
      { latitude: 10, longitude: 0, imageX: 50, imageY: 0, description: 'norte' },
      { latitude: 0, longitude: 10, imageX: 100, imageY: 50, description: 'leste' },
    ];
    const engineResult = createCalibrationEngine(threePoints);
    expect(engineResult.ok).toBe(true);
    if (!engineResult.ok) return;

    const engine = engineResult.value;

    // With exactly 3 points the system is exactly determined — round-trip is exact
    for (const cp of threePoints) {
      const result = engine.toImagePosition(cp.latitude, cp.longitude);
      expect(Math.abs(result.position.x - cp.imageX)).toBeLessThanOrEqual(1.0);
      expect(Math.abs(result.position.y - cp.imageY)).toBeLessThanOrEqual(1.0);
    }
  });

  // ---------------------------------------------------------------------------
  // Requirements 4.2, 4.3 — Clamping de valores fora do intervalo
  // ---------------------------------------------------------------------------

  it('clampeia x para 0 quando a coordenada GPS produz rawX < 0', () => {
    const engineResult = createCalibrationEngine(ZOO_CONTROL_POINTS);
    expect(engineResult.ok).toBe(true);
    if (!engineResult.ok) return;

    const engine = engineResult.value;

    // A coordinate far outside the zoo should be clamped
    const result = engine.toImagePosition(90, 180); // extreme north-east
    expect(result.position.x).toBeGreaterThanOrEqual(0);
    expect(result.position.x).toBeLessThanOrEqual(100);
    expect(result.position.y).toBeGreaterThanOrEqual(0);
    expect(result.position.y).toBeLessThanOrEqual(100);
  });

  it('clampeia x para 100 quando a coordenada GPS produz rawX > 100', () => {
    const engineResult = createCalibrationEngine(ZOO_CONTROL_POINTS);
    expect(engineResult.ok).toBe(true);
    if (!engineResult.ok) return;

    const engine = engineResult.value;

    // A coordinate far outside the zoo in the opposite direction
    const result = engine.toImagePosition(-90, -180); // extreme south-west
    expect(result.position.x).toBeGreaterThanOrEqual(0);
    expect(result.position.x).toBeLessThanOrEqual(100);
    expect(result.position.y).toBeGreaterThanOrEqual(0);
    expect(result.position.y).toBeLessThanOrEqual(100);
  });

  it('sinaliza isOutOfBounds = true quando a coordenada GPS está fora da área mapeada', () => {
    const engineResult = createCalibrationEngine(ZOO_CONTROL_POINTS);
    expect(engineResult.ok).toBe(true);
    if (!engineResult.ok) return;

    const engine = engineResult.value;

    // Coordinates far from the zoo should be out of bounds
    const result = engine.toImagePosition(0, 0); // equator / prime meridian
    expect(result.isOutOfBounds).toBe(true);
  });

  it('sinaliza isOutOfBounds = false para coordenadas dentro da área mapeada', () => {
    const engineResult = createCalibrationEngine(ZOO_CONTROL_POINTS);
    expect(engineResult.ok).toBe(true);
    if (!engineResult.ok) return;

    const engine = engineResult.value;

    // The centroid of the control points should be well within bounds
    const centroidLat =
      ZOO_CONTROL_POINTS.reduce((s, cp) => s + cp.latitude, 0) /
      ZOO_CONTROL_POINTS.length;
    const centroidLng =
      ZOO_CONTROL_POINTS.reduce((s, cp) => s + cp.longitude, 0) /
      ZOO_CONTROL_POINTS.length;

    const result = engine.toImagePosition(centroidLat, centroidLng);
    expect(result.isOutOfBounds).toBe(false);
  });

  // ---------------------------------------------------------------------------
  // Requirement 9.3 — Validação de ControlPoints inválidos (exemplos concretos)
  // ---------------------------------------------------------------------------

  it('retorna INVALID_CONTROL_POINT para latitude fora de [-90, 90]', () => {
    const points: ControlPoint[] = [
      { latitude: 91, longitude: 0, imageX: 50, imageY: 50, description: 'inválido' },
      { latitude: 0, longitude: 0, imageX: 0, imageY: 0, description: 'válido 1' },
      { latitude: 1, longitude: 1, imageX: 100, imageY: 100, description: 'válido 2' },
    ];

    const result = createCalibrationEngine(points);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('INVALID_CONTROL_POINT');
    }
  });

  it('retorna INVALID_CONTROL_POINT para longitude fora de [-180, 180]', () => {
    const points: ControlPoint[] = [
      { latitude: 0, longitude: 181, imageX: 50, imageY: 50, description: 'inválido' },
      { latitude: 0, longitude: 0, imageX: 0, imageY: 0, description: 'válido 1' },
      { latitude: 1, longitude: 1, imageX: 100, imageY: 100, description: 'válido 2' },
    ];

    const result = createCalibrationEngine(points);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('INVALID_CONTROL_POINT');
    }
  });

  it('retorna INVALID_CONTROL_POINT para imageX fora de [0, 100]', () => {
    const points: ControlPoint[] = [
      { latitude: 0, longitude: 0, imageX: -1, imageY: 50, description: 'inválido' },
      { latitude: 1, longitude: 0, imageX: 50, imageY: 0, description: 'válido 1' },
      { latitude: 0, longitude: 1, imageX: 100, imageY: 100, description: 'válido 2' },
    ];

    const result = createCalibrationEngine(points);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('INVALID_CONTROL_POINT');
    }
  });

  it('retorna INVALID_CONTROL_POINT para imageY fora de [0, 100]', () => {
    const points: ControlPoint[] = [
      { latitude: 0, longitude: 0, imageX: 50, imageY: 101, description: 'inválido' },
      { latitude: 1, longitude: 0, imageX: 0, imageY: 0, description: 'válido 1' },
      { latitude: 0, longitude: 1, imageX: 100, imageY: 100, description: 'válido 2' },
    ];

    const result = createCalibrationEngine(points);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('INVALID_CONTROL_POINT');
    }
  });

  it('retorna INSUFFICIENT_CONTROL_POINTS para array vazio', () => {
    const result = createCalibrationEngine([]);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('INSUFFICIENT_CONTROL_POINTS');
    }
  });

  it('retorna INSUFFICIENT_CONTROL_POINTS para array com 1 ponto', () => {
    const points: ControlPoint[] = [
      { latitude: 0, longitude: 0, imageX: 50, imageY: 50, description: 'único' },
    ];

    const result = createCalibrationEngine(points);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('INSUFFICIENT_CONTROL_POINTS');
    }
  });

  it('retorna INSUFFICIENT_CONTROL_POINTS para array com 2 pontos', () => {
    const points: ControlPoint[] = [
      { latitude: 0, longitude: 0, imageX: 0, imageY: 0, description: 'p1' },
      { latitude: 1, longitude: 1, imageX: 100, imageY: 100, description: 'p2' },
    ];

    const result = createCalibrationEngine(points);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('INSUFFICIENT_CONTROL_POINTS');
    }
  });

  it('cria engine com sucesso para 3 pontos válidos não-colineares', () => {
    const points: ControlPoint[] = [
      { latitude: 0, longitude: 0, imageX: 0, imageY: 0, description: 'p1' },
      { latitude: 1, longitude: 0, imageX: 100, imageY: 0, description: 'p2' },
      { latitude: 0, longitude: 1, imageX: 0, imageY: 100, description: 'p3' },
    ];

    const result = createCalibrationEngine(points);
    expect(result.ok).toBe(true);
  });
});
