// ═══════════════════════════════════════════════════════════════
// QYTETET E KOSOVËS ME LAGJET DHE KOORDINATAT
// ═══════════════════════════════════════════════════════════════

import { randomElement } from './random'

export interface CityData {
  name: string
  nameEn: string
  nameLocative: string   // "në Prishtinë"
  nameGenitive: string   // "i Prishtinës"
  lat: number
  lng: number
  weight: number
  postalCode: string
  neighborhoods: string[]
}

export const CITIES: CityData[] = [
  {
    name: 'Prishtina',
    nameEn: 'Pristina',
    nameLocative: 'Prishtinë',
    nameGenitive: 'Prishtinës',
    lat: 42.6629,
    lng: 21.1655,
    weight: 40,
    postalCode: '10000',
    neighborhoods: [
      'Qendra', 'Dardania', 'Dragodan', 'Ulpiana', 'Bregu i Diellit',
      'Lakrishte', 'Kalabria', 'Arberia', 'Mati 1', 'Aktash',
      'Taslixhe', 'Veternik', 'Sunny Hill', 'Tophane',
      'Kodra e Trimave', 'Pejton', 'Bardhosh', 'Hajvali',
      'Rizani', 'Besi',
    ],
  },
  {
    name: 'Prizren',
    nameEn: 'Prizren',
    nameLocative: 'Prizren',
    nameGenitive: 'Prizrenit',
    lat: 42.2139,
    lng: 20.7397,
    weight: 15,
    postalCode: '20000',
    neighborhoods: [
      'Qendra', 'Bazhdarhane', 'Ortakoll', 'Arasta', 'Tusus',
      'Kurilla', 'Lakuriq', 'Gjonaj', 'Zhur', 'Korisha',
    ],
  },
  {
    name: 'Peja',
    nameEn: 'Peja',
    nameLocative: 'Pejë',
    nameGenitive: 'Pejës',
    lat: 42.6593,
    lng: 20.2887,
    weight: 10,
    postalCode: '30000',
    neighborhoods: [
      'Qendra', 'Kapeshnica', 'Zatra', 'Karagaq', 'Haxhaj',
      'Leshan', 'Vitomirica', 'Rugova',
    ],
  },
  {
    name: 'Gjakova',
    nameEn: 'Gjakova',
    nameLocative: 'Gjakovë',
    nameGenitive: 'Gjakovës',
    lat: 42.3803,
    lng: 20.4308,
    weight: 10,
    postalCode: '50000',
    neighborhoods: [
      'Qendra', 'Carshia e Madhe', 'Krena', 'Bardhaniq',
      'Bec', 'Bitesh', 'Dolac', 'Rracaj',
    ],
  },
  {
    name: 'Ferizaj',
    nameEn: 'Ferizaj',
    nameLocative: 'Ferizaj',
    nameGenitive: 'Ferizajt',
    lat: 42.3702,
    lng: 21.1553,
    weight: 8,
    postalCode: '70000',
    neighborhoods: [
      'Qendra', 'Varosh', 'Fusha e Ferizajt', 'Greme',
      'Nikadin', 'Sazli', 'Bibaj',
    ],
  },
  {
    name: 'Gjilan',
    nameEn: 'Gjilan',
    nameLocative: 'Gjilan',
    nameGenitive: 'Gjilanit',
    lat: 42.4635,
    lng: 21.4694,
    weight: 7,
    postalCode: '60000',
    neighborhoods: [
      'Qendra', 'Arbëria', 'Dardania', 'Kodra',
      'Zabeli', 'Livoq', 'Nasale',
    ],
  },
  {
    name: 'Mitrovica',
    nameEn: 'Mitrovica',
    nameLocative: 'Mitrovicë',
    nameGenitive: 'Mitrovicës',
    lat: 42.8914,
    lng: 20.866,
    weight: 5,
    postalCode: '40000',
    neighborhoods: [
      'Qendra', 'Kodra e Minatorëve', 'Tavnik',
      'Ilirida', 'Suvi Do', 'Shipol',
    ],
  },
  {
    name: 'Vushtrri',
    nameEn: 'Vushtrri',
    nameLocative: 'Vushtrri',
    nameGenitive: 'Vushtrrisë',
    lat: 42.8231,
    lng: 20.9675,
    weight: 3,
    postalCode: '42000',
    neighborhoods: ['Qendra', 'Stanovc', 'Samadrexha', 'Beçiq', 'Dumnica'],
  },
  {
    name: 'Podujeva',
    nameEn: 'Podujeva',
    nameLocative: 'Podujevë',
    nameGenitive: 'Podujevës',
    lat: 42.9108,
    lng: 21.1933,
    weight: 2,
    postalCode: '11000',
    neighborhoods: ['Qendra', 'Dumnica', 'Lluzhan', 'Sibovc', 'Bajcina'],
  },
]

// ═══════════════════════════════════════════════════════════════
// FUNKSIONE NDIHMËSE
// ═══════════════════════════════════════════════════════════════

export function pickRandomCity(): CityData {
  const totalWeight = CITIES.reduce((sum, c) => sum + c.weight, 0)
  let random = Math.random() * totalWeight

  for (const city of CITIES) {
    random -= city.weight
    if (random <= 0) return city
  }

  return CITIES[0]
}

export function pickRandomNeighborhood(city: CityData): string {
  return randomElement(city.neighborhoods)
}

export function randomCoordinatesNear(
  city: CityData,
  radiusKm = 5
): { lat: number; lng: number } {
  const radiusDeg = radiusKm / 111
  const angle = Math.random() * 2 * Math.PI
  const distance = Math.random() * radiusDeg

  return {
    lat: city.lat + Math.cos(angle) * distance,
    lng: city.lng + Math.sin(angle) * distance,
  }
}

const STREETS = [
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

export function randomAddress(neighborhood: string): string {
  const street = randomElement(STREETS)
  const number = Math.floor(Math.random() * 200) + 1
  return `${street}, Nr. ${number}, ${neighborhood}`
}