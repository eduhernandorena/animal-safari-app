import type { ControlPoint, GpsErrorType, ImagePositionResult } from '@/types/gps';
import { ZOO_BOUNDARY_POLYGON } from '@/config/zoo-boundary';

// ---------------------------------------------------------------------------
// Internal types
// ---------------------------------------------------------------------------

interface AffineCoefficients {
  a: number; b: number; c: number; // x = a·lat + b·lng + c
  d: number; e: number; f: number; // y = d·lat + e·lng + f
}

export interface CalibrationEngine {
  toImagePosition(lat: number, lng: number): ImagePositionResult;
  isInsideZoo(lat: number, lng: number): boolean;
}

export type CalibrationEngineResult =
  | { ok: true; value: CalibrationEngine }
  | { ok: false; error: GpsErrorType };

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

/**
 * Returns true when every field of the ControlPoint is a finite number within
 * the valid domain:
 *   latitude  ∈ [-90,  90]
 *   longitude ∈ [-180, 180]
 *   imageX    ∈ [0,   100]
 *   imageY    ∈ [0,   100]
 */
function isValidControlPoint(cp: ControlPoint): boolean {
  return (
    typeof cp.latitude === 'number' &&
    isFinite(cp.latitude) &&
    cp.latitude >= -90 &&
    cp.latitude <= 90 &&
    typeof cp.longitude === 'number' &&
    isFinite(cp.longitude) &&
    cp.longitude >= -180 &&
    cp.longitude <= 180 &&
    typeof cp.imageX === 'number' &&
    isFinite(cp.imageX) &&
    cp.imageX >= 0 &&
    cp.imageX <= 100 &&
    typeof cp.imageY === 'number' &&
    isFinite(cp.imageY) &&
    cp.imageY >= 0 &&
    cp.imageY <= 100
  );
}

// ---------------------------------------------------------------------------
// Least-squares affine transform
// ---------------------------------------------------------------------------

/**
 * Inverts a 3×3 matrix analytically using Cramer's rule.
 * Returns null when the matrix is singular (determinant ≈ 0).
 *
 * Matrix layout (row-major, 9 elements):
 *   [ m[0] m[1] m[2] ]
 *   [ m[3] m[4] m[5] ]
 *   [ m[6] m[7] m[8] ]
 */
function invert3x3(m: number[]): number[] | null {
  // Cofactors
  const c00 = m[4] * m[8] - m[5] * m[7];
  const c01 = -(m[3] * m[8] - m[5] * m[6]);
  const c02 = m[3] * m[7] - m[4] * m[6];

  const c10 = -(m[1] * m[8] - m[2] * m[7]);
  const c11 = m[0] * m[8] - m[2] * m[6];
  const c12 = -(m[0] * m[7] - m[1] * m[6]);

  const c20 = m[1] * m[5] - m[2] * m[4];
  const c21 = -(m[0] * m[5] - m[2] * m[3]);
  const c22 = m[0] * m[4] - m[1] * m[3];

  const det = m[0] * c00 + m[1] * c01 + m[2] * c02;

  if (Math.abs(det) < 1e-12) {
    return null; // singular matrix
  }

  const invDet = 1 / det;

  // Adjugate (transpose of cofactor matrix) divided by determinant
  return [
    c00 * invDet, c10 * invDet, c20 * invDet,
    c01 * invDet, c11 * invDet, c21 * invDet,
    c02 * invDet, c12 * invDet, c22 * invDet,
  ];
}

/**
 * Multiplies a 3×3 matrix (row-major, 9 elements) by a 3×1 column vector.
 * Returns the resulting 3×1 vector.
 */
function mul3x3Vec3(m: number[], v: number[]): number[] {
  return [
    m[0] * v[0] + m[1] * v[1] + m[2] * v[2],
    m[3] * v[0] + m[4] * v[1] + m[5] * v[2],
    m[6] * v[0] + m[7] * v[1] + m[8] * v[2],
  ];
}

/**
 * Solves the affine transform coefficients using least squares.
 *
 * For N control points we build the design matrix A (N×3) where each row is
 * [lat_i, lng_i, 1], and the target vectors bx = [x_1…x_N] and by = [y_1…y_N].
 *
 * The normal equations give:
 *   p = (Aᵀ·A)⁻¹ · Aᵀ · b
 *
 * We compute Aᵀ·A (3×3) and Aᵀ·bx / Aᵀ·by (3×1) directly without
 * materialising the full N×3 matrix.
 *
 * Coordinates are centered around their mean before solving to avoid numerical
 * instability when GPS values have large absolute magnitudes (e.g., lat ≈ -29.8,
 * lng ≈ -51.17). The resulting coefficients are adjusted to operate on the
 * original (uncentered) coordinate space.
 *
 * Returns null when the system is degenerate (collinear points, etc.).
 */
function solveAffineTransform(points: ControlPoint[]): AffineCoefficients | null {
  // Compute centroid for coordinate centering (improves numerical stability)
  const n = points.length;
  let latMean = 0;
  let lngMean = 0;
  for (const cp of points) {
    latMean += cp.latitude;
    lngMean += cp.longitude;
  }
  latMean /= n;
  lngMean /= n;

  // Accumulate Aᵀ·A (symmetric 3×3) and Aᵀ·bx, Aᵀ·by (3×1)
  // using centered coordinates: dlat = lat - latMean, dlng = lng - lngMean
  // AtA indices: [0]=Σdlat², [1]=Σdlat·dlng, [2]=Σdlat,
  //              [3]=Σdlat·dlng, [4]=Σdlng², [5]=Σdlng,
  //              [6]=Σdlat,    [7]=Σdlng,   [8]=N
  const AtA = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  const Atbx = [0, 0, 0];
  const Atby = [0, 0, 0];

  for (const cp of points) {
    const lat = cp.latitude - latMean;
    const lng = cp.longitude - lngMean;
    const x = cp.imageX;
    const y = cp.imageY;

    AtA[0] += lat * lat;
    AtA[1] += lat * lng;
    AtA[2] += lat;
    AtA[3] += lat * lng;
    AtA[4] += lng * lng;
    AtA[5] += lng;
    AtA[6] += lat;
    AtA[7] += lng;
    AtA[8] += 1;

    Atbx[0] += lat * x;
    Atbx[1] += lng * x;
    Atbx[2] += x;

    Atby[0] += lat * y;
    Atby[1] += lng * y;
    Atby[2] += y;
  }

  const AtA_inv = invert3x3(AtA);
  if (AtA_inv === null) {
    return null;
  }

  // Coefficients in centered space: x = a·dlat + b·dlng + c
  // Convert back to original space: x = a·(lat - latMean) + b·(lng - lngMean) + c
  //                                    = a·lat + b·lng + (c - a·latMean - b·lngMean)
  const pxCentered = mul3x3Vec3(AtA_inv, Atbx); // [a, b, c] in centered space
  const pyCentered = mul3x3Vec3(AtA_inv, Atby); // [d, e, f] in centered space

  const px = [
    pxCentered[0],
    pxCentered[1],
    pxCentered[2] - pxCentered[0] * latMean - pxCentered[1] * lngMean,
  ];
  const py = [
    pyCentered[0],
    pyCentered[1],
    pyCentered[2] - pyCentered[0] * latMean - pyCentered[1] * lngMean,
  ];

  return {
    a: px[0], b: px[1], c: px[2],
    d: py[0], e: py[1], f: py[2],
  };
}

// ---------------------------------------------------------------------------
// Image position conversion
// ---------------------------------------------------------------------------

/**
 * Applies the affine coefficients to convert (lat, lng) → (x%, y%).
 * Clamps the result to [0, 100] and flags isOutOfBounds when the raw value
 * falls outside that range.
 */
function applyAffineTransform(
  lat: number,
  lng: number,
  coeffs: AffineCoefficients,
): ImagePositionResult {
  const rawX = coeffs.a * lat + coeffs.b * lng + coeffs.c;
  const rawY = coeffs.d * lat + coeffs.e * lng + coeffs.f;

  const isOutOfBounds = rawX < 0 || rawX > 100 || rawY < 0 || rawY > 100;

  return {
    position: {
      x: Math.max(0, Math.min(100, rawX)),
      y: Math.max(0, Math.min(100, rawY)),
    },
    isOutOfBounds,
  };
}

// ---------------------------------------------------------------------------
// Point-in-polygon (ray casting)
// ---------------------------------------------------------------------------

/**
 * Determines whether the point (lat, lng) lies inside the given polygon using
 * the ray casting algorithm.
 *
 * The polygon vertices are { lat, lng } objects. The ray is cast horizontally
 * (along constant latitude) to the left of the test point.
 */
function isPointInPolygon(
  lat: number,
  lng: number,
  polygon: Array<{ lat: number; lng: number }>,
): boolean {
  let inside = false;
  const n = polygon.length;

  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = polygon[i].lng;
    const yi = polygon[i].lat;
    const xj = polygon[j].lng;
    const yj = polygon[j].lat;

    const intersect =
      yi > lat !== yj > lat &&
      lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;

    if (intersect) inside = !inside;
  }

  return inside;
}

// ---------------------------------------------------------------------------
// Public factory
// ---------------------------------------------------------------------------

/**
 * Creates a CalibrationEngine from a set of ControlPoints.
 *
 * Validation rules:
 *  - Every ControlPoint must have numeric fields within valid ranges;
 *    returns INVALID_CONTROL_POINT on the first invalid point found.
 *  - At least 3 points are required; returns INSUFFICIENT_CONTROL_POINTS
 *    when points.length < 3.
 *  - The resulting linear system must be non-degenerate (non-collinear
 *    points); returns INSUFFICIENT_CONTROL_POINTS when the matrix is
 *    singular.
 */
export function createCalibrationEngine(
  points: ControlPoint[],
): CalibrationEngineResult {
  // 1. Validate each control point
  for (const cp of points) {
    if (!isValidControlPoint(cp)) {
      return { ok: false, error: 'INVALID_CONTROL_POINT' };
    }
  }

  // 2. Require at least 3 points
  if (points.length < 3) {
    return { ok: false, error: 'INSUFFICIENT_CONTROL_POINTS' };
  }

  // 3. Solve the affine transform
  const coeffs = solveAffineTransform(points);
  if (coeffs === null) {
    // Degenerate system (e.g. all points collinear)
    return { ok: false, error: 'INSUFFICIENT_CONTROL_POINTS' };
  }

  // 4. Return the engine
  const engine: CalibrationEngine = {
    toImagePosition(lat: number, lng: number): ImagePositionResult {
      return applyAffineTransform(lat, lng, coeffs);
    },

    isInsideZoo(lat: number, lng: number): boolean {
      return isPointInPolygon(lat, lng, ZOO_BOUNDARY_POLYGON);
    },
  };

  return { ok: true, value: engine };
}
