import { useState, useRef, useEffect, useCallback } from 'react';
import * as gpsService from '@/services/gpsService';
import { createCalibrationEngine } from '@/services/calibrationEngine';
import type { CalibrationEngine } from '@/services/calibrationEngine';
import { ZOO_CONTROL_POINTS } from '@/config/zoo-control-points';
import type { ImagePosition, GpsErrorType } from '@/types/gps';

// ---------------------------------------------------------------------------
// Public interface
// ---------------------------------------------------------------------------

export interface UseGpsTrackingResult {
  imagePosition: ImagePosition | null;
  isInsideZoo: boolean;
  isLowAccuracy: boolean;
  isWatching: boolean;
  error: GpsErrorType | null;
  hasPromptedForRoute: boolean;
  startTracking: () => void;
  stopTracking: () => void;
  requestSinglePosition: () => void;
  markRoutePrompted: () => void;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Orquestra o GPS_Service e o Calibration_Engine para fornecer a posição do
 * visitante em coordenadas percentuais da imagem do mapa.
 *
 * Requisitos: 2.1, 2.3, 2.4, 2.5, 5.3, 6.2, 6.3, 10.4
 */
export function useGpsTracking(): UseGpsTrackingResult {
  // -------------------------------------------------------------------------
  // State
  // -------------------------------------------------------------------------
  const [imagePosition, setImagePosition] = useState<ImagePosition | null>(null);
  const [isInsideZoo, setIsInsideZoo] = useState<boolean>(false);
  const [isLowAccuracy, setIsLowAccuracy] = useState<boolean>(false);
  const [isWatching, setIsWatching] = useState<boolean>(false);
  const [error, setError] = useState<GpsErrorType | null>(null);
  const [hasPromptedForRoute, setHasPromptedForRoute] = useState<boolean>(false);

  // -------------------------------------------------------------------------
  // Refs (avoid re-renders)
  // -------------------------------------------------------------------------

  /** Active watchId returned by gpsService.watchPosition; -1 means inactive */
  const watchIdRef = useRef<number>(-1);

  /**
   * CalibrationEngine instance — initialised once on mount with ZOO_CONTROL_POINTS.
   * Stored in a ref so it is never recreated on re-renders.
   */
  const engineRef = useRef<CalibrationEngine | null>(null);

  // -------------------------------------------------------------------------
  // Initialise CalibrationEngine on mount (Requisito 3.1 / design)
  // -------------------------------------------------------------------------
  useEffect(() => {
    const result = createCalibrationEngine(ZOO_CONTROL_POINTS);
    if (result.ok) {
      engineRef.current = result.value;
    } else {
      // Configuration error — log in development, surface as error state
      console.error('[useGpsTracking] Failed to initialise CalibrationEngine:', result.error);
      setError(result.error);
    }
  }, []); // runs once on mount

  // -------------------------------------------------------------------------
  // Internal helper: process a successful GPS position
  // -------------------------------------------------------------------------
  const handlePosition = useCallback((lat: number, lng: number, lowAccuracy: boolean) => {
    const engine = engineRef.current;

    if (!engine) {
      // Engine not ready — nothing to do
      return;
    }

    const inside = engine.isInsideZoo(lat, lng);
    const { position } = engine.toImagePosition(lat, lng);

    setError(null);
    setIsLowAccuracy(lowAccuracy);
    setIsInsideZoo(inside);
    setImagePosition(position);
  }, []);

  // -------------------------------------------------------------------------
  // requestSinglePosition — Requisitos 2.1, 6.2, 6.3
  // -------------------------------------------------------------------------
  const requestSinglePosition = useCallback(() => {
    gpsService.getCurrentPosition().then((result) => {
      if (result.ok) {
        const { latitude, longitude } = result.position;
        handlePosition(latitude, longitude, result.isLowAccuracy);
      } else {
        const errorType = result.error;
        setError(errorType);

        // Requisito 2.5: preserve last valid imagePosition on POSITION_UNAVAILABLE
        if (errorType !== 'POSITION_UNAVAILABLE') {
          setImagePosition(null);
        }
        setIsInsideZoo(false);
        setIsLowAccuracy(false);
      }
    });
  }, [handlePosition]);

  // -------------------------------------------------------------------------
  // stopTracking — Requisitos 2.3, 2.4
  // -------------------------------------------------------------------------
  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== -1) {
      gpsService.clearWatch(watchIdRef.current);
      watchIdRef.current = -1;
    }
    setIsWatching(false);
  }, []);

  // -------------------------------------------------------------------------
  // startTracking — Requisitos 2.1, 2.2
  // -------------------------------------------------------------------------
  const startTracking = useCallback(() => {
    // Avoid starting a second watch if one is already active
    if (watchIdRef.current !== -1) {
      return;
    }

    setIsWatching(true);

    const id = gpsService.watchPosition(
      (result) => {
        if (result.ok) {
          const { latitude, longitude } = result.position;
          handlePosition(latitude, longitude, result.isLowAccuracy);
        } else {
          const errorType = result.error;
          setError(errorType);

          // Requisito 2.5: preserve last valid imagePosition on POSITION_UNAVAILABLE
          if (errorType !== 'POSITION_UNAVAILABLE') {
            setImagePosition(null);
          }
          setIsInsideZoo(false);
          setIsLowAccuracy(false);
        }
      },
      (gpsError) => {
        const errorType = gpsError.type;
        setError(errorType);

        // Requisito 2.5: preserve last valid imagePosition on POSITION_UNAVAILABLE
        if (errorType !== 'POSITION_UNAVAILABLE') {
          setImagePosition(null);
        }
        setIsInsideZoo(false);
        setIsLowAccuracy(false);
      },
    );

    watchIdRef.current = id;
  }, [handlePosition]);

  // -------------------------------------------------------------------------
  // Cleanup on unmount — Requisito 2.4
  // -------------------------------------------------------------------------
  useEffect(() => {
    return () => {
      // stopTracking is stable (no deps that change), safe to call in cleanup
      if (watchIdRef.current !== -1) {
        gpsService.clearWatch(watchIdRef.current);
        watchIdRef.current = -1;
      }
    };
  }, []); // runs cleanup only on unmount

  // -------------------------------------------------------------------------
  // markRoutePrompted — Requisito 10.4
  // -------------------------------------------------------------------------
  const markRoutePrompted = useCallback(() => {
    setHasPromptedForRoute(true);
  }, []);

  // -------------------------------------------------------------------------
  // Return
  // -------------------------------------------------------------------------
  return {
    imagePosition,
    isInsideZoo,
    isLowAccuracy,
    isWatching,
    error,
    hasPromptedForRoute,
    startTracking,
    stopTracking,
    requestSinglePosition,
    markRoutePrompted,
  };
}
