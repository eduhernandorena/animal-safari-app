import React from 'react';
import { AlertTriangle } from 'lucide-react';
import type { GpsErrorType } from '@/types/gps';

interface GpsErrorMessageProps {
  errorType: GpsErrorType | null;
}

const ERROR_MESSAGES: Partial<Record<GpsErrorType, string>> = {
  GEOLOCATION_NOT_SUPPORTED: 'Seu dispositivo não suporta geolocalização.',
  PERMISSION_DENIED:
    'Permissão de localização negada. Habilite o GPS nas configurações do dispositivo.',
  TIMEOUT:
    'Não foi possível obter sua localização. Verifique o sinal GPS e tente novamente.',
  POSITION_UNAVAILABLE:
    'Sinal GPS perdido. Última posição conhecida mantida no mapa.',
};

const GpsErrorMessage: React.FC<GpsErrorMessageProps> = ({ errorType }) => {
  if (!errorType) return null;

  const message = ERROR_MESSAGES[errorType];

  // Config errors (INSUFFICIENT_CONTROL_POINTS, INVALID_CONTROL_POINT) are not
  // shown to end users — they are developer/configuration issues.
  if (!message) return null;

  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800 shadow-sm"
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
};

export default GpsErrorMessage;
