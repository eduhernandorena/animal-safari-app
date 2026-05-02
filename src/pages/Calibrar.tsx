import React, { useState, useRef, useCallback } from 'react';
import { animals } from '@/data/animals';

const MAP_URL = 'https://www.sema.rs.gov.br/upload/recortes/202510/28114627_112007_GDO.jpg';

interface PinData {
  id: string;
  name: string;
  emoji: string;
  x: number;
  y: number;
  calibrated: boolean;
}

const Calibrar: React.FC = () => {
  const imgRef = useRef<HTMLDivElement>(null);

  const [pins, setPins] = useState<PinData[]>(
    animals.map((a) => ({
      id: a.id,
      name: a.name,
      emoji: a.emoji,
      x: a.mapPosition.x,
      y: a.mapPosition.y,
      calibrated: false,
    }))
  );

  const [activePin, setActivePin] = useState<string>(animals[0].id);
  const [copied, setCopied] = useState(false);

  const handleMapClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = imgRef.current?.getBoundingClientRect();
      if (!rect) return;

      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      setPins((prev) =>
        prev.map((p) =>
          p.id === activePin
            ? { ...p, x: parseFloat(x.toFixed(1)), y: parseFloat(y.toFixed(1)), calibrated: true }
            : p
        )
      );

      // Avança automaticamente para o próximo pin não calibrado
      const currentIndex = pins.findIndex((p) => p.id === activePin);
      const next = pins.find((p, i) => i > currentIndex && !p.calibrated);
      if (next) setActivePin(next.id);
    },
    [activePin, pins]
  );

  const generateCode = () => {
    return pins
      .map((p) => `  // ${p.name}\n  mapPosition: { x: ${p.x}, y: ${p.y} },`)
      .join('\n');
  };

  const copyToClipboard = () => {
    const lines = pins
      .map((p) => `${p.id}: { x: ${p.x}, y: ${p.y} }`)
      .join('\n');
    navigator.clipboard.writeText(lines).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const calibratedCount = pins.filter((p) => p.calibrated).length;
  const activeData = pins.find((p) => p.id === activePin);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-1">🗺️ Ferramenta de Calibração</h1>
        <p className="text-gray-400 text-sm mb-4">
          Selecione um recinto na lista, depois clique no local correto no mapa.
        </p>

        <div className="flex gap-4 flex-col lg:flex-row">
          {/* ── Mapa ── */}
          <div className="flex-1">
            <div
              ref={imgRef}
              className="relative w-full cursor-crosshair rounded-lg overflow-hidden border-2 border-emerald-500 select-none"
              style={{ aspectRatio: '10/7' }}
              onClick={handleMapClick}
            >
              <img
                src={MAP_URL}
                alt="Mapa do Zoo"
                className="absolute inset-0 w-full h-full object-fill pointer-events-none"
                draggable={false}
              />

              {/* Pins já calibrados */}
              {pins.map((pin) => (
                <div
                  key={pin.id}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 z-10 cursor-pointer transition-all`}
                  style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActivePin(pin.id);
                  }}
                >
                  <div
                    className={`rounded-full flex items-center justify-center text-base shadow-lg border-2 transition-all ${
                      pin.id === activePin
                        ? 'w-9 h-9 border-yellow-400 bg-yellow-100 scale-125'
                        : pin.calibrated
                        ? 'w-7 h-7 border-emerald-400 bg-white/90'
                        : 'w-7 h-7 border-red-400 bg-white/60 opacity-60'
                    }`}
                  >
                    {pin.emoji}
                  </div>
                  {pin.id === activePin && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-yellow-400 text-black text-[10px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap shadow">
                      {pin.name}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1 text-center">
              Clique no mapa para posicionar o pin selecionado
            </p>
          </div>

          {/* ── Painel lateral ── */}
          <div className="w-full lg:w-72 flex flex-col gap-3">
            {/* Progresso */}
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-300">Progresso</span>
                <span className="font-bold text-emerald-400">{calibratedCount}/{pins.length}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-emerald-500 h-2 rounded-full transition-all"
                  style={{ width: `${(calibratedCount / pins.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Lista de pins */}
            <div className="bg-gray-800 rounded-lg p-3 flex-1">
              <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">Recintos</p>
              <div className="space-y-1 max-h-80 overflow-y-auto">
                {pins.map((pin) => (
                  <button
                    key={pin.id}
                    onClick={() => setActivePin(pin.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-all ${
                      pin.id === activePin
                        ? 'bg-yellow-500/20 border border-yellow-500/50 text-yellow-300'
                        : pin.calibrated
                        ? 'bg-emerald-900/30 text-emerald-300 hover:bg-emerald-900/50'
                        : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <span>{pin.emoji}</span>
                    <span className="flex-1 truncate">{pin.name}</span>
                    {pin.calibrated ? (
                      <span className="text-emerald-400 text-xs">✓</span>
                    ) : (
                      <span className="text-red-400 text-xs">○</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Coordenadas do pin ativo */}
            {activeData && (
              <div className="bg-gray-800 rounded-lg p-3 text-sm">
                <p className="text-gray-400 text-xs mb-1">Pin ativo: <span className="text-white font-medium">{activeData.name}</span></p>
                <p className="font-mono text-emerald-300">
                  x: {activeData.x.toFixed(1)}% &nbsp; y: {activeData.y.toFixed(1)}%
                </p>
              </div>
            )}

            {/* Botão copiar */}
            <button
              onClick={copyToClipboard}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2.5 px-4 rounded-lg transition-colors text-sm"
            >
              {copied ? '✓ Copiado!' : '📋 Copiar todos os valores'}
            </button>
          </div>
        </div>

        {/* Output de código */}
        <div className="mt-4 bg-gray-900 rounded-lg p-4 border border-gray-700">
          <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide">Valores atuais — cole aqui para me passar</p>
          <pre className="text-xs text-emerald-300 font-mono overflow-x-auto whitespace-pre-wrap">
            {pins.map((p) => `${p.id}: { x: ${p.x}, y: ${p.y} }`).join('\n')}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default Calibrar;
