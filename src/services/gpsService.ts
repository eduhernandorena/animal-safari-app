import type { GpsOptions, GpsResult, GpsError, GpsErrorType } from '@/types/gps';
import { ACCURACY_THRESHOLD_METERS } from '@/types/gps';

/** Timeout padrão em milissegundos para chamadas de geolocalização */
const DEFAULT_TIMEOUT_MS = 10_000;

/** Opções padrão aplicadas quando nenhuma opção é fornecida */
const DEFAULT_GPS_OPTIONS: Required<GpsOptions> = {
  timeout: DEFAULT_TIMEOUT_MS,
  maximumAge: 0,
  enableHighAccuracy: true,
};

/**
 * Mapeia o código de erro da API GeolocationPositionError para o tipo interno GpsErrorType.
 *
 * Códigos da API do navegador:
 *   1 → PERMISSION_DENIED
 *   2 → POSITION_UNAVAILABLE
 *   3 → TIMEOUT
 */
function mapGeolocationError(code: number): GpsErrorType {
  switch (code) {
    case 1:
      return 'PERMISSION_DENIED';
    case 2:
      return 'POSITION_UNAVAILABLE';
    case 3:
      return 'TIMEOUT';
    default:
      return 'POSITION_UNAVAILABLE';
  }
}

/**
 * Constrói as PositionOptions da API do navegador a partir das GpsOptions internas,
 * aplicando os valores padrão para campos não fornecidos.
 */
function buildPositionOptions(options?: GpsOptions): PositionOptions {
  return {
    timeout: options?.timeout ?? DEFAULT_GPS_OPTIONS.timeout,
    maximumAge: options?.maximumAge ?? DEFAULT_GPS_OPTIONS.maximumAge,
    enableHighAccuracy: options?.enableHighAccuracy ?? DEFAULT_GPS_OPTIONS.enableHighAccuracy,
  };
}

/**
 * Obtém a posição GPS atual do dispositivo uma única vez.
 *
 * Retorna um GpsResult com ok=true e a posição quando bem-sucedido,
 * ou ok=false com o tipo de erro quando falha.
 *
 * Erros possíveis:
 * - GEOLOCATION_NOT_SUPPORTED: navegador não suporta navigator.geolocation
 * - PERMISSION_DENIED: usuário negou a permissão de localização
 * - POSITION_UNAVAILABLE: sinal GPS indisponível
 * - TIMEOUT: posição não obtida dentro do tempo limite (padrão: 10 000 ms)
 *
 * Requisitos: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6
 */
export function getCurrentPosition(options?: GpsOptions): Promise<GpsResult> {
  // Requisito 1.3: verificar suporte ao navigator.geolocation
  if (!navigator.geolocation) {
    return Promise.resolve({
      ok: false,
      error: 'GEOLOCATION_NOT_SUPPORTED' as GpsErrorType,
    });
  }

  const positionOptions = buildPositionOptions(options);

  return new Promise<GpsResult>((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;

        // Requisito 1.6: sinalizar baixa precisão quando accuracy > 50 m
        const isLowAccuracy = accuracy > ACCURACY_THRESHOLD_METERS;

        resolve({
          ok: true,
          position: {
            latitude,
            longitude,
            accuracy,
            timestamp: position.timestamp,
          },
          isLowAccuracy,
        });
      },
      (error) => {
        // Requisitos 1.4, 1.5: mapear códigos de erro para tipos internos
        const errorType = mapGeolocationError(error.code);
        resolve({
          ok: false,
          error: errorType,
        });
      },
      positionOptions,
    );
  });
}

/**
 * Inicia o monitoramento contínuo da posição GPS (Watch_Mode).
 *
 * Chama `onPosition` a cada nova leitura de posição recebida do dispositivo.
 * Chama `onError` quando ocorre um erro durante o monitoramento.
 *
 * Retorna o watchId que deve ser passado para `clearWatch` para encerrar o monitoramento.
 *
 * Requisitos: 2.1, 2.2, 2.3
 */
export function watchPosition(
  onPosition: (result: GpsResult) => void,
  onError: (error: GpsError) => void,
  options?: GpsOptions,
): number {
  // Requisito 1.3: verificar suporte ao navigator.geolocation
  if (!navigator.geolocation) {
    // Emite o erro de forma assíncrona para manter a interface consistente
    // e retorna um watchId inválido (-1) que pode ser ignorado pelo chamador
    setTimeout(() => {
      onError({
        type: 'GEOLOCATION_NOT_SUPPORTED',
        message: 'Seu dispositivo não suporta geolocalização.',
      });
    }, 0);
    return -1;
  }

  const positionOptions = buildPositionOptions(options);

  return navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude, accuracy } = position.coords;

      // Requisito 1.6: sinalizar baixa precisão quando accuracy > 50 m
      const isLowAccuracy = accuracy > ACCURACY_THRESHOLD_METERS;

      onPosition({
        ok: true,
        position: {
          latitude,
          longitude,
          accuracy,
          timestamp: position.timestamp,
        },
        isLowAccuracy,
      });
    },
    (error) => {
      // Requisitos 1.4, 1.5, 2.5: mapear códigos de erro para tipos internos
      const errorType = mapGeolocationError(error.code);
      onError({
        type: errorType,
        message: getErrorMessage(errorType),
      });
    },
    positionOptions,
  );
}

/**
 * Encerra o monitoramento contínuo de posição GPS identificado por `watchId`.
 *
 * Requisito: 2.3
 */
export function clearWatch(watchId: number): void {
  if (navigator.geolocation && watchId >= 0) {
    navigator.geolocation.clearWatch(watchId);
  }
}

/**
 * Retorna a mensagem de erro amigável ao usuário para cada tipo de erro GPS.
 * Usada internamente para popular o campo `message` do GpsError.
 */
function getErrorMessage(errorType: GpsErrorType): string {
  switch (errorType) {
    case 'GEOLOCATION_NOT_SUPPORTED':
      return 'Seu dispositivo não suporta geolocalização.';
    case 'PERMISSION_DENIED':
      return 'Permissão de localização negada. Habilite o GPS nas configurações do dispositivo.';
    case 'TIMEOUT':
      return 'Não foi possível obter sua localização. Verifique o sinal GPS e tente novamente.';
    case 'POSITION_UNAVAILABLE':
      return 'Sinal GPS perdido. Última posição conhecida mantida no mapa.';
    default:
      return 'Erro desconhecido ao obter localização.';
  }
}
