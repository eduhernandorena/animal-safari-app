import type { ControlPoint } from '@/types/gps';

/**
 * Pontos de controle para geo-referenciamento do mapa do Parque Zoológico de Sapucaia do Sul.
 *
 * COORDENADAS MEDIDAS IN LOCO — Parque Zoológico de Sapucaia do Sul (SEMA-RS)
 * Data aproximada das medições: maio de 2026
 *
 * POSIÇÕES PERCENTUAIS (imageX%, imageY%):
 * As posições percentuais são ESTIMATIVAS calculadas por normalização linear das coordenadas
 * GPS em relação ao bounding box dos pontos medidos. Devem ser verificadas visualmente
 * contra a imagem `mapa_referencia.jpg` antes de uso em produção.
 *
 * Fórmulas de normalização (bounding box dos 10 pontos medidos):
 *   lat_min = -29.8015603 (Entrada principal — ponto mais ao sul)
 *   lat_max = -29.7935546 (Aves — ponto mais ao norte)
 *   lng_min = -51.1760642 (Elefantes — ponto mais a oeste)
 *   lng_max = -51.1659926 (Entrada principal — ponto mais a leste)
 *
 *   imageX = (longitude − lng_min) / (lng_max − lng_min) × 100
 *   imageY = (lat_max − latitude) / (lat_max − lat_min) × 100
 *
 * INSTRUÇÕES DE AJUSTE FINO:
 * 1. Abra a imagem `mapa_referencia.jpg` em um editor de imagem ou visualizador.
 * 2. Para cada ponto de interesse listado abaixo, identifique visualmente sua localização
 *    na imagem do mapa.
 * 3. Meça a posição percentual do ponto na imagem:
 *    - imageX: distância da borda esquerda ÷ largura total × 100
 *    - imageY: distância da borda superior ÷ altura total × 100
 * 4. Atualize os valores de imageX e imageY no array abaixo com os valores medidos.
 * 5. Execute os testes (`npm run test`) para verificar que o round-trip de calibração
 *    continua dentro da tolerância de ±1%.
 *
 * PONTOS ATIVOS (4 pontos usados pelo Calibration_Engine para a transformação afim):
 * Os 4 pontos ativos foram selecionados por cobrirem os extremos geográficos do zoo
 * (norte, sul, leste/sul, oeste), garantindo um sistema de mínimos quadrados bem condicionado.
 */
export const ZOO_CONTROL_POINTS: ControlPoint[] = [
  // ── PONTOS ATIVOS (usados pelo engine de calibração — transformação afim) ──────────────

  {
    // Extremo SE — ancora o canto sul-leste do mapa
    latitude: -29.8015603,
    longitude: -51.1659926,
    imageX: 100.0,
    imageY: 100.0,
    description: 'Entrada principal — portão de acesso ao zoo',
  },
  {
    // Extremo N — ancora o topo do mapa
    latitude: -29.7935546,
    longitude: -51.1711893,
    imageX: 48.4,
    imageY: 1.2,
    description: 'Aves — recinto das aves',
  },
  {
    // Extremo W — ancora o lado esquerdo do mapa
    latitude: -29.7952270,
    longitude: -51.1760642,
    imageX: 0.0,
    imageY: 22.0,
    description: 'Elefantes — recinto dos elefantes',
  },
  {
    // Centro-sul — ancora o interior do mapa
    latitude: -29.7985695,
    longitude: -51.1715447,
    imageX: 44.8,
    imageY: 63.6,
    description: 'Alimentação — área de alimentação',
  },

  // ── PONTOS DE REFERÊNCIA (incluídos para documentação e calibração futura) ─────────────
  // Estas posições percentuais são estimativas por normalização linear.
  // Verifique visualmente contra mapa_referencia.jpg antes de ativar como pontos de controle.

  {
    latitude: -29.7957764,
    longitude: -51.1733016,
    imageX: 27.5,
    imageY: 28.8,
    description: 'Rinocerontes — recinto dos rinocerontes',
  },
  {
    latitude: -29.7948709,
    longitude: -51.1725962,
    imageX: 34.5,
    imageY: 17.5,
    description: 'Hipopótamo — recinto do hipopótamo',
  },
  {
    latitude: -29.7942401,
    longitude: -51.1714897,
    imageX: 45.4,
    imageY: 9.7,
    description: 'Répteis — casa dos répteis',
  },
  {
    latitude: -29.7939282,
    longitude: -51.1722501,
    imageX: 37.9,
    imageY: 5.8,
    description: 'Felinos e ursos — recinto dos felinos e ursos',
  },
  {
    latitude: -29.7956309,
    longitude: -51.1746749,
    imageX: 13.8,
    imageY: 27.0,
    description: 'Lhamas — recinto das lhamas',
  },
  {
    latitude: -29.7958578,
    longitude: -51.1717834,
    imageX: 42.4,
    imageY: 29.8,
    description: 'Informações — posto de informações',
  },
];
