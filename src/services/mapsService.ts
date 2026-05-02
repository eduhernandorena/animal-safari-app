// Coordenadas da entrada principal do Parque Zoológico de Sapucaia do Sul, medidas in loco.
export const ZOO_COORDINATES = { lat: -29.8015603, lng: -51.1659926 } as const;

export const ZOO_MAPS_DEEP_LINK = `https://maps.google.com/maps?daddr=${ZOO_COORDINATES.lat},${ZOO_COORDINATES.lng}`;

/**
 * Abre o aplicativo de mapas nativo com rota até o Parque Zoológico de Sapucaia do Sul.
 * Retorna true se o deep link foi aberto com sucesso, false se o fallback foi acionado
 * (window.open retornou null — bloqueado pelo navegador ou deep links não suportados).
 *
 * Requisitos: 10.2, 10.5
 */
export function openMapsWithRoute(): boolean {
  const newWindow = window.open(ZOO_MAPS_DEEP_LINK, '_blank');
  return newWindow !== null;
}
