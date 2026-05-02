import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface VisitorMarkerProps {
  position: { x: number; y: number }; // percentages 0-100
  isLowAccuracy: boolean;
}

const VisitorMarker: React.FC<VisitorMarkerProps> = ({ position, isLowAccuracy }) => {
  return (
    <div
      data-testid="visitor-marker"
      className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
      style={{ left: `${position.x}%`, top: `${position.y}%` }}
      aria-label={isLowAccuracy ? 'Sua localização (baixa precisão)' : 'Sua localização'}
    >
      <div className="relative flex items-center justify-center">
        {/* Pulse ring */}
        <div className="absolute w-6 h-6 bg-blue-500 rounded-full opacity-35 animate-ping" />
        {/* Blue dot */}
        <div className="relative bg-blue-600 w-4 h-4 rounded-full border-2 border-white shadow-lg" />
        {/* Low accuracy indicator */}
        {isLowAccuracy && (
          <div
            className="absolute -top-3 -right-3 bg-yellow-400 rounded-full p-0.5 shadow"
            aria-label="Baixa precisão GPS"
          >
            <AlertTriangle className="w-3 h-3 text-yellow-900" />
          </div>
        )}
      </div>
    </div>
  );
};

export default VisitorMarker;
