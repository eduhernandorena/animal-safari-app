import type { Animal } from '@/types/animal';

const NAO_INFORMADO = 'Nao informado no site oficial';
const ALIMENTACAO_LOCAL = 'Consulte a equipe no local';

/**
 * Plantel do Parque Zoológico de Sapucaia do Sul.
 *
 * Apenas os recintos com coordenadas GPS medidas in loco possuem pins no mapa.
 * As posições percentuais (mapPosition) foram calculadas por normalização linear
 * a partir das coordenadas GPS reais — veja zoo-control-points.ts para detalhes.
 *
 * Coordenadas de referência:
 *   rinocerontes    → GPS -29.7957764, -51.1733016  → imageX 27.5, imageY 28.8
 *   hipopotamo      → GPS -29.7948709, -51.1725962  → imageX 34.5, imageY 17.5
 *   repteis         → GPS -29.7942401, -51.1714897  → imageX 45.4, imageY  9.7
 *   felinos e ursos → GPS -29.7939282, -51.1722501  → imageX 37.9, imageY  5.8
 *   aves            → GPS -29.7935546, -51.1711893  → imageX 48.4, imageY  1.2
 *   elefantes       → GPS -29.7952270, -51.1760642  → imageX  0.0, imageY 22.0
 *   alimentacao     → GPS -29.7985695, -51.1715447  → imageX 44.8, imageY 63.6
 *   lhamas          → GPS -29.7956309, -51.1746749  → imageX 13.8, imageY 27.0
 *   informacoes     → GPS -29.7958578, -51.1717834  → imageX 42.4, imageY 29.8
 *   entrada         → GPS -29.8015603, -51.1659926  → imageX100.0, imageY100.0
 */
export const animals: Animal[] = [
  // ── Rinocerontes ────────────────────────────────────────────────────────────
  {
    id: 'rinoceronte-branco',
    name: 'Rinoceronte-branco',
    species: 'Ceratotherium simum',
    type: 'Mamifero',
    emoji: '🦏',
    description: 'Mamifero exotico listado entre os destaques oficiais do plantel.',
    habitat: 'Recinto dos Rinocerontes',
    feedingTime: ALIMENTACAO_LOCAL,
    status: 'Ameaçado',
    image: '/placeholder.svg',
    weight: NAO_INFORMADO,
    lifespan: NAO_INFORMADO,
    diet: NAO_INFORMADO,
    facts: [
      'Destaque oficial de mamiferos',
      'Um dos maiores mamiferos terrestres',
      'Alimentacao baseada em gramineas',
    ],
    conservation: 'A especie tem historico de pressao por caca ilegal.',
    location: 'Recinto dos Rinocerontes',
    mapPosition: { x: 27.5, y: 28.8 },
  },

  // ── Hipopótamo ───────────────────────────────────────────────────────────────
  {
    id: 'hipopotamo',
    name: 'Hipopotamo',
    species: 'Hippopotamus amphibius',
    type: 'Mamifero',
    emoji: '🦛',
    description: 'Mamifero listado no destaque oficial do plantel do Parque Zoologico.',
    habitat: 'Recinto do Hipopotamo',
    feedingTime: ALIMENTACAO_LOCAL,
    status: 'Ameaçado',
    image: '/placeholder.svg',
    weight: NAO_INFORMADO,
    lifespan: NAO_INFORMADO,
    diet: NAO_INFORMADO,
    facts: [
      'Destaque oficial de mamiferos',
      'Fortemente associado a ambientes aquaticos',
      'Grande porte corporal',
    ],
    conservation: 'A especie e impactada por perda de habitat e pressao humana.',
    location: 'Recinto do Hipopotamo',
    mapPosition: { x: 34.5, y: 17.5 },
  },

  // ── Répteis ──────────────────────────────────────────────────────────────────
  {
    id: 'repteis',
    name: 'Repteis',
    species: 'Diversas especies',
    type: 'Reptil',
    emoji: '🐍',
    description: 'Casa dos repteis com sucuri, jiboias, jabutis, jacare-do-papo-amarelo, cagado-de-barbichas e piton-indiana.',
    habitat: 'Casa dos Repteis',
    feedingTime: ALIMENTACAO_LOCAL,
    status: 'Ameaçado',
    image: '/placeholder.svg',
    weight: NAO_INFORMADO,
    lifespan: NAO_INFORMADO,
    diet: NAO_INFORMADO,
    facts: [
      'Sucuri, jiboia e piton-indiana sao serpentes de grande porte',
      'Jacare-do-papo-amarelo e especie nativa brasileira',
      'Jabutis e cagados sao quelonios presentes no recinto',
    ],
    conservation: 'As especies dependem da protecao de habitats aquaticos e terrestres.',
    location: 'Casa dos Repteis',
    mapPosition: { x: 45.4, y: 9.7 },
  },

  // ── Felinos e Ursos ──────────────────────────────────────────────────────────
  {
    id: 'felinos-e-ursos',
    name: 'Felinos e Ursos',
    species: 'Diversas especies',
    type: 'Mamifero',
    emoji: '🐆',
    description: 'Recinto dos grandes carnivoros: tigre, onca-pintada e urso-andino.',
    habitat: 'Recinto de Felinos e Ursos',
    feedingTime: ALIMENTACAO_LOCAL,
    status: 'Crítico',
    image: '/placeholder.svg',
    weight: NAO_INFORMADO,
    lifespan: NAO_INFORMADO,
    diet: NAO_INFORMADO,
    facts: [
      'Tigre e o maior felino do mundo',
      'Onca-pintada e o maior felino das Americas',
      'Urso-andino e o unico urso nativo da America do Sul',
    ],
    conservation: 'Todas as especies enfrentam ameacas por perda de habitat e caca.',
    location: 'Recinto de Felinos e Ursos',
    mapPosition: { x: 37.9, y: 5.8 },
  },

  // ── Aves ─────────────────────────────────────────────────────────────────────
  {
    id: 'aves',
    name: 'Aves',
    species: 'Diversas especies',
    type: 'Ave',
    emoji: '🦜',
    description: 'Recinto das aves com araras, flamingos, condor-dos-andes, tucanos, corujas, cisnes, gavioes e casuar.',
    habitat: 'Recinto das Aves',
    feedingTime: ALIMENTACAO_LOCAL,
    status: 'Ameaçado',
    image: '/placeholder.svg',
    weight: NAO_INFORMADO,
    lifespan: NAO_INFORMADO,
    diet: NAO_INFORMADO,
    facts: [
      'Condor-dos-andes e uma das maiores aves voadoras do mundo',
      'Araras sao simbolos da fauna brasileira',
      'Flamingos tem coloracao relacionada a dieta',
    ],
    conservation: 'Muitas especies sao impactadas por trafico e desmatamento.',
    location: 'Recinto das Aves',
    mapPosition: { x: 48.4, y: 1.2 },
  },

  // ── Elefantes ────────────────────────────────────────────────────────────────
  {
    id: 'elefantes',
    name: 'Elefantes',
    species: 'Loxodonta africana / Elephas maximus',
    type: 'Mamifero',
    emoji: '🐘',
    description: 'Recinto dos elefantes, um dos maiores destaques do Parque Zoologico.',
    habitat: 'Recinto dos Elefantes',
    feedingTime: ALIMENTACAO_LOCAL,
    status: 'Ameaçado',
    image: '/placeholder.svg',
    weight: NAO_INFORMADO,
    lifespan: NAO_INFORMADO,
    diet: NAO_INFORMADO,
    facts: [
      'Maiores animais terrestres do planeta',
      'Alta inteligencia e vida social complexa',
      'Destaque oficial do plantel',
    ],
    conservation: 'Sofrem com perda de habitat e caca ilegal por marfim.',
    location: 'Recinto dos Elefantes',
    mapPosition: { x: 0.0, y: 22.0 },
  },

  // ── Área de Alimentação ──────────────────────────────────────────────────────
  {
    id: 'alimentacao',
    name: 'Area de Alimentacao',
    species: '—',
    type: 'Servico',
    emoji: '🍽️',
    description: 'Area de alimentacao e lanchonete do Parque Zoologico.',
    habitat: '—',
    feedingTime: '—',
    status: 'Comum',
    image: '/placeholder.svg',
    weight: '—',
    lifespan: '—',
    diet: '—',
    facts: [
      'Ponto de alimentacao para visitantes',
      'Localizado na area central do zoo',
    ],
    conservation: '—',
    location: 'Area de Alimentacao',
    mapPosition: { x: 44.8, y: 63.6 },
  },

  // ── Lhamas ───────────────────────────────────────────────────────────────────
  {
    id: 'lhamas',
    name: 'Lhamas',
    species: 'Lama glama',
    type: 'Mamifero',
    emoji: '🦙',
    description: 'Recinto das lhamas, animais sul-americanos presentes no plantel oficial.',
    habitat: 'Recinto das Lhamas',
    feedingTime: ALIMENTACAO_LOCAL,
    status: 'Comum',
    image: '/placeholder.svg',
    weight: NAO_INFORMADO,
    lifespan: NAO_INFORMADO,
    diet: NAO_INFORMADO,
    facts: [
      'Originarias dos Andes sul-americanos',
      'Utilizadas historicamente como animais de carga',
      'Destaque oficial do plantel',
    ],
    conservation: 'Especie domesticada, sem risco de extincao.',
    location: 'Recinto das Lhamas',
    mapPosition: { x: 13.8, y: 27.0 },
  },

  // ── Posto de Informações ─────────────────────────────────────────────────────
  {
    id: 'informacoes',
    name: 'Posto de Informacoes',
    species: '—',
    type: 'Servico',
    emoji: 'ℹ️',
    description: 'Posto de informacoes ao visitante do Parque Zoologico.',
    habitat: '—',
    feedingTime: '—',
    status: 'Comum',
    image: '/placeholder.svg',
    weight: '—',
    lifespan: '—',
    diet: '—',
    facts: [
      'Atendimento ao visitante',
      'Mapas e informacoes sobre o zoo',
    ],
    conservation: '—',
    location: 'Posto de Informacoes',
    mapPosition: { x: 42.4, y: 29.8 },
  },

  // ── Entrada Principal ────────────────────────────────────────────────────────
  {
    id: 'entrada-principal',
    name: 'Entrada Principal',
    species: '—',
    type: 'Servico',
    emoji: '🚪',
    description: 'Portao de acesso principal ao Parque Zoologico de Sapucaia do Sul.',
    habitat: '—',
    feedingTime: '—',
    status: 'Comum',
    image: '/placeholder.svg',
    weight: '—',
    lifespan: '—',
    diet: '—',
    facts: [
      'Ponto de entrada e saida do zoo',
      'Bilheteria e controle de acesso',
    ],
    conservation: '—',
    location: 'Entrada Principal',
    mapPosition: { x: 100.0, y: 100.0 },
  },
];
