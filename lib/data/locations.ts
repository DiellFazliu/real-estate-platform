// ═══════════════════════════════════════════════════════════════
// QYTETET DHE LAGJET E KOSOVËS
// ═══════════════════════════════════════════════════════════════

export const CITIES = [
  'Prishtina',
  'Prizren',
  'Peja',
  'Gjakova',
  'Ferizaj',
  'Gjilan',
  'Mitrovica',
  'Vushtrri',
  'Podujeva',
  'Suhareka',
  'Rahovec',
  'Kamenica',
] as const

export type City = (typeof CITIES)[number]

export const NEIGHBORHOODS: Record<string, string[]> = {
  Prishtina: [
    'Qendra',
    'Dardania',
    'Dragodan',
    'Ulpiana',
    'Bregu i Diellit',
    'Lakrishte',
    'Kalabria',
    'Arberia',
    'Mati 1',
    'Aktash',
    'Taslixhe',
    'Veternik',
    'Sunny Hill',
    'Tophane',
    'Kodra e Trimave',
    'Pejton',
    'Bardhosh',
    'Hajvali',
    'Rizani',
    'Besi',
  ],
  Prizren: [
    'Qendra',
    'Bazhdarhane',
    'Ortakoll',
    'Arasta',
    'Tusus',
    'Kurilla',
    'Lakuriq',
    'Gjonaj',
    'Zhur',
    'Korisha',
  ],
  Peja: [
    'Qendra',
    'Kapeshnica',
    'Zatra',
    'Karagaq',
    'Haxhaj',
    'Leshan',
    'Vitomirica',
    'Rugova',
  ],
  Gjakova: [
    'Qendra',
    'Carshia e Madhe',
    'Krena',
    'Bardhaniq',
    'Bec',
    'Bitesh',
    'Dolac',
    'Rracaj',
  ],
  Ferizaj: [
    'Qendra',
    'Varosh',
    'Fusha e Ferizajt',
    'Greme',
    'Nikadin',
    'Sazli',
    'Bibaj',
  ],
  Gjilan: [
    'Qendra',
    'Arbëria',
    'Dardania',
    'Kodra',
    'Zabeli',
    'Livoq',
    'Nasale',
  ],
  Mitrovica: [
    'Qendra',
    'Kodra e Minatorëve',
    'Tavnik',
    'Ilirida',
    'Suvi Do',
    'Shipol',
  ],
  Vushtrri: ['Qendra', 'Stanovc', 'Samadrexha', 'Beçiq', 'Dumnica'],
  Podujeva: ['Qendra', 'Dumnica', 'Lluzhan', 'Sibovc', 'Bajcina'],
  Suhareka: ['Qendra', 'Mushtisht', 'Studençan', 'Bllacë', 'Gjinoc'],
  Rahovec: ['Qendra', 'Krushë e Madhe', 'Bratotin', 'Drenoc', 'Zatriq'],
  Kamenica: ['Qendra', 'Rogacica', 'Berivojce', 'Hogosht', 'Koretin'],
}

/**
 * Kthen lagjet për një qytet
 */
export function getNeighborhoods(city: string): string[] {
  return NEIGHBORHOODS[city] || ['Qendra']
}

/**
 * Kthen një lagje të rastësishme për një qytet (për seed)
 */
export function pickRandomNeighborhood(cityName: string): string {
  const neighborhoods = getNeighborhoods(cityName)
  return neighborhoods[Math.floor(Math.random() * neighborhoods.length)]
}

/**
 * Gjeneron një adresë të rastësishme (për seed)
 */
export function randomAddress(neighborhood: string): string {
  const streets = [
    'Rr. Nëna Terezë',
    'Rr. UÇK',
    'Rr. Luan Haradinaj',
    'Rr. Agim Ramadani',
    'Rr. Bill Klinton',
    'Rr. Garibaldi',
    'Rr. Mbretëresha Teutë',
    'Rr. Skënderbeu',
    'Rr. Isa Boletini',
    'Rr. Adem Jashari',
    'Rr. Bajram Kelmendi',
    'Rr. Fehmi Agani',
    'Rr. Zagrebi',
    'Rr. Tirana',
    'Rr. Ilir Konushevci',
  ]

  const street = streets[Math.floor(Math.random() * streets.length)]
  const number = Math.floor(Math.random() * 200) + 1

  return `${street}, Nr. ${number}, ${neighborhood}`
}