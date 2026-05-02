/** Tipos de erro do GPS_Service */
export type GpsErrorType =
  | 'GEOLOCATION_NOT_SUPPORTED'
  | 'PERMISSION_DENIED'
  | 'TIMEOUT'
  | 'POSITION_UNAVAILABLE'
  | 'INSUFFICIENT_CONTROL_POINTS'
  | 'INVALID_CONTROL_POINT';

/** Posição GPS bruta retornada pelo GPS_Service */
export interface GpsPosition {
  latitude: number;
  longitude: number;
  accuracy: number; // metros
  timestamp: number;
}

/** Resultado de uma leitura GPS */
export type GpsResult =
  | { ok: true; position: GpsPosition; isLowAccuracy: boolean }
  | { ok: false; error: GpsErrorType };

/** Erro estruturado do GPS_Service */
export interface GpsError {
  type: GpsErrorType;
  message: string;
}

/** Posição percentual na imagem do mapa */
export interface ImagePosition {
  x: number; // 0–100
  y: number; // 0–100
}

/** Resultado da conversão GPS → imagem */
export interface ImagePositionResult {
  position: ImagePosition;
  isOutOfBounds: boolean;
}

/** Par de coordenadas GPS + posição na imagem (ponto de controle) */
export interface ControlPoint {
  /** Latitude WGS-84 (-90 a 90) */
  latitude: number;
  /** Longitude WGS-84 (-180 a 180) */
  longitude: number;
  /** Posição horizontal na imagem (0–100%) */
  imageX: number;
  /** Posição vertical na imagem (0–100%) */
  imageY: number;
  /** Descrição do local onde o ponto foi medido */
  description: string;
}

/** Opções para as chamadas de geolocalização */
export interface GpsOptions {
  timeout?: number;            // ms, padrão: 10000
  maximumAge?: number;         // ms, padrão: 0
  enableHighAccuracy?: boolean; // padrão: true
}

/** Threshold de precisão GPS aceitável (metros) */
export const ACCURACY_THRESHOLD_METERS = 50;
