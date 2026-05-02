import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { openMapsWithRoute, ZOO_COORDINATES } from '@/services/mapsService';

interface RouteToZooDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const RouteToZooDialog: React.FC<RouteToZooDialogProps> = ({ open, onConfirm, onCancel }) => {
  const [showFallback, setShowFallback] = useState(false);

  const handleConfirm = () => {
    const success = openMapsWithRoute();
    if (!success) {
      setShowFallback(true);
      return;
    }
    onConfirm();
  };

  const handleCancel = () => {
    setShowFallback(false);
    onCancel();
  };

  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Você está fora do zoo</AlertDialogTitle>
          <AlertDialogDescription>
            Deseja obter a rota até o Parque Zoológico de Sapucaia do Sul?
          </AlertDialogDescription>
        </AlertDialogHeader>

        {showFallback && (
          <div
            role="status"
            className="rounded-md bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800"
          >
            Não foi possível abrir o aplicativo de mapas automaticamente. Insira as coordenadas
            manualmente no seu app de mapas preferido:{' '}
            <strong>
              {ZOO_COORDINATES.lat}, {ZOO_COORDINATES.lng}
            </strong>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>Agora não</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>Obter rota</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default RouteToZooDialog;
