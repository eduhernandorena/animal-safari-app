/**
 * Polígono GPS que delimita o perímetro do Parque Zoológico de Sapucaia do Sul.
 * Coordenadas em sentido anti-horário (convenção GeoJSON).
 *
 * Este polígono é um bounding box retangular calculado a partir dos pontos
 * extremos medidos in loco nos pontos de interesse do zoo, com uma margem de
 * segurança de aproximadamente 0.002° (~220 m) em cada direção. Por ser um
 * retângulo baseado em extremos GPS, pode ser refinado futuramente com
 * medições GPS do perímetro real do zoo para uma delimitação mais precisa.
 *
 * Cálculo da margem:
 *   lat_min_medido = -29.8015603 → lat_sul  = -29.8025 (margem: -0.001°)
 *   lat_max_medido = -29.7935546 → lat_norte = -29.7916 (margem: +0.002°)
 *   lng_min_medido = -51.1760642 → lng_oeste = -51.1781 (margem: -0.002°)
 *   lng_max_medido = -51.1659926 → lng_leste = -51.1640 (margem: +0.002°)
 */
export const ZOO_BOUNDARY_POLYGON: Array<{ lat: number; lng: number }> = [
  { lat: -29.7916, lng: -51.1781 }, // Canto noroeste
  { lat: -29.7916, lng: -51.1640 }, // Canto nordeste
  { lat: -29.8025, lng: -51.1640 }, // Canto sudeste
  { lat: -29.8025, lng: -51.1781 }, // Canto sudoeste
];
