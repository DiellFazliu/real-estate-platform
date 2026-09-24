// ═══════════════════════════════════════════════════════════════
// FJALOR I PLOTË SHQIP - ANGLISHT
// Bazuar në Fjalorin e Gjuhës Shqipe + Sinonime të Zakonshme
// ═══════════════════════════════════════════════════════════════

export const SQ_EN_DICTIONARY: Record<string, string> = {
  // ═══════════════════════════════════════════════════════════
  // TIPET E PRONAVE (Property Types)
  // ═══════════════════════════════════════════════════════════
  apartament: 'apartment',
  apartamenti: 'apartment',
  apartamente: 'apartment',
  apartamentet: 'apartment',
  apartman: 'apartment',
  banes: 'apartment',
  banesa: 'apartment',
  banese: 'apartment',
  banesë: 'apartment',
  banesat: 'apartment',
  stan: 'apartment',
  stani: 'apartment',
  flat: 'apartment',
  shtëpi: 'house',
  shtepi: 'house',
  shpi: 'house',
  shpia: 'house',
  shtepia: 'house',
  kuća: 'house',
  kuca: 'house',
  home: 'house',
  vilë: 'villa',
  vile: 'villa',
  villa: 'villa',
  vila: 'villa',
  penthouse: 'penthouse',
  pentaus: 'penthouse',
  studio: 'studio',
  garsonjerë: 'studio',
  garsonjere: 'studio',
  tokë: 'land',
  toke: 'land',
  truall: 'land',
  parcelë: 'land',
  parcele: 'land',
  plot: 'land',
  land: 'land',
  lokal: 'commercial',
  lokali: 'commercial',
  dyqan: 'commercial',
  dyqani: 'commercial',
  biznes: 'commercial',
  biznesi: 'commercial',
  zyrë: 'office',
  zyre: 'office',
  zyra: 'office',
  office: 'office',

  // ═══════════════════════════════════════════════════════════
  // DHOMAT (Rooms)
  // ═══════════════════════════════════════════════════════════
  dhomë: 'bedroom',
  dhome: 'bedroom',
  dhoma: 'bedroom',
  dhomat: 'bedroom',
  'dhoma gjumi': 'bedroom',
  'dhome gjumi': 'bedroom',
  sobe: 'bedroom',
  soba: 'bedroom',
  bedroom: 'bedroom',
  bedrooms: 'bedroom',
  bed: 'bedroom',
  beds: 'bedroom',
  kamare: 'bedroom',
  kamarja: 'bedroom',
  
  banjo: 'bathroom',
  banjë: 'bathroom',
  banje: 'bathroom',
  banjot: 'bathroom',
  banja: 'bathroom',
  tualet: 'bathroom',
  tualeti: 'bathroom',
  wc: 'bathroom',
  bathroom: 'bathroom',
  bathrooms: 'bathroom',
  bath: 'bathroom',
  baths: 'bathroom',
  
  kuzhinë: 'kitchen',
  kuzhine: 'kitchen',
  kuzhina: 'kitchen',
  sallon: 'living room',
  'dhomë ndenje': 'living room',
  'dhome ndenje': 'living room',
  ballkon: 'balcony',
  ballkone: 'balcony',
  ballkoni: 'balcony',
  verandë: 'terrace',
  verande: 'terrace',
  tarracë: 'terrace',
  tarrace: 'terrace',
  bodrum: 'basement',
  garazh: 'garage',
  garazhi: 'garage',
  parkim: 'parking',
  parkimi: 'parking',
  ashensor: 'elevator',
  ashensori: 'elevator',
  shkallë: 'stairs',
  shkalle: 'stairs',

  // ═══════════════════════════════════════════════════════════
  // GJENDJA (Condition)
  // ═══════════════════════════════════════════════════════════
  'i ri': 'new',
  'e re': 'new',
  'i re': 'new',
  ri: 'new',
  re: 'new',
  'i vjetër': 'old',
  'i vjeter': 'old',
  'e vjetër': 'old',
  vjetër: 'old',
  vjeter: 'old',
  modern: 'modern',
  moderno: 'modern',
  luksoz: 'luxury',
  luksoze: 'luxury',
  luks: 'luxury',
  luksozë: 'luxury',
  ekskluziv: 'exclusive',
  ekskluzive: 'exclusive',
  premium: 'premium',
  'i mirë': 'good',
  'i mire': 'good',
  'shumë i mirë': 'excellent',
  'shume i mire': 'excellent',
  'i rinovuar': 'renovated',
  'e rinovuar': 'renovated',
  'i mobiluar': 'furnished',
  'e mobiluar': 'furnished',
  'i pamobiluar': 'unfurnished',
  'gjysmë i mobiluar': 'semi-furnished',

  // ═══════════════════════════════════════════════════════════
  // VEÇORITË (Features)
  // ═══════════════════════════════════════════════════════════
  pishinë: 'pool',
  pishine: 'pool',
  pishina: 'pool',
  bazen: 'pool',
  bazeni: 'pool',
  pool: 'pool',
  
  kopsht: 'garden',
  kopshti: 'garden',
  kopshtin: 'garden',
  oborr: 'garden',
  oborri: 'garden',
  garden: 'garden',
  
  siguri: 'security',
  siguria: 'security',
  alarm: 'security',
  alarmi: 'security',
  security: 'security',
  
  kondicioner: 'air conditioning',
  kondicioneri: 'air conditioning',
  klimatizim: 'air conditioning',
  ac: 'air conditioning',
  
  ngrohje: 'heating',
  ngrohja: 'heating',
  'ngrohje qendrore': 'heating',
  heating: 'heating',
  
  internet: 'internet',
  interneti: 'internet',
  wifi: 'wifi',
  'wi-fi': 'wifi',
  
  pamje: 'view',
  pamja: 'view',
  'pamje panoramike': 'panoramic view',
  panoramë: 'panoramic view',
  panorame: 'panoramic view',
  
  det: 'sea',
  deti: 'sea',
  liqen: 'lake',
  liqeni: 'lake',
  lumë: 'river',
  lume: 'river',
  mal: 'mountain',
  mali: 'mountain',
  qytet: 'city',
  qyteti: 'city',
  fshat: 'village',
  fshati: 'village',
  
  qendër: 'center',
  qender: 'center',
  Qendra: 'center',
  periferi: 'suburbs',
  periferia: 'suburbs',
  
  afër: 'near',
  afer: 'near',
  larg: 'far',

  // ═══════════════════════════════════════════════════════════
  // TRANSAKSIONET (Transactions)
  // ═══════════════════════════════════════════════════════════
  shitje: 'sale',
  shitja: 'sale',
  shitet: 'sale',
  shiten: 'sale',
  blerje: 'sale',
  blerja: 'sale',
  blej: 'sale',
  ble: 'sale',
  shes: 'sale',
  sale: 'sale',
  
  qira: 'rent',
  qera: 'rent',
  qiraja: 'rent',
  qiramarrje: 'rent',
  'marr me qira': 'rent',
  'me qira': 'rent',
  'jepet me qira': 'rent',
  rent: 'rent',
  rental: 'rent',

  // ═══════════════════════════════════════════════════════════
  // ÇMIMET (Prices)
  // ═══════════════════════════════════════════════════════════
  mijë: 'thousand',
  mije: 'thousand',
  mij: 'thousand',
  k: 'thousand',
  thousand: 'thousand',
  
  milion: 'million',
  miliona: 'million',
  mil: 'million',
  m: 'million',
  million: 'million',
  
  nën: 'under',
  nen: 'under',
  deri: 'up to',
  maks: 'max',
  max: 'max',
  maksimum: 'max',
  'më pak se': 'less than',
  under: 'under',
  below: 'below',
  
  mbi: 'over',
  min: 'min',
  minimum: 'min',
  'më shumë se': 'more than',
  over: 'over',
  above: 'above',
  
  nga: 'from',
  ndërmjet: 'between',
  ndermjet: 'between',
  between: 'between',

  // ═══════════════════════════════════════════════════════════
  // ADJEKTIVA (Adjectives)
  // ═══════════════════════════════════════════════════════════
  'i bukur': 'beautiful',
  'e bukur': 'beautiful',
  bukur: 'beautiful',
  beautiful: 'beautiful',
  
  'i madh': 'large',
  'e madhe': 'large',
  madh: 'large',
  madhe: 'large',
  large: 'large',
  big: 'large',
  
  'i vogël': 'small',
  'i vogel': 'small',
  'e vogël': 'small',
  vogël: 'small',
  vogel: 'small',
  small: 'small',
  
  'i qetë': 'quiet',
  'i qete': 'quiet',
  qetë: 'quiet',
  qete: 'quiet',
  quiet: 'quiet',
  
  komod: 'comfortable',
  komode: 'comfortable',
  comfortable: 'comfortable',
  
  'i ndritshëm': 'bright',
  'e ndritshme': 'bright',
  bright: 'bright',
  
  'i bollshëm': 'spacious',
  bollshëm: 'spacious',
  bollshem: 'spacious',
  spacious: 'spacious',
  
  hapësirë: 'space',
  hapesire: 'space',
  kompakt: 'compact',
  compact: 'compact',
  
  'i mrekullueshëm': 'amazing',
  'i mrekullueshem': 'amazing',
  amazing: 'amazing',
  wonderful: 'wonderful',
  
  'i rehatshëm': 'cozy',
  rehatshëm: 'cozy',
  rehatshem: 'cozy',
  cozy: 'cozy',

  // ═══════════════════════════════════════════════════════════
  // VEPRIME (Actions)
  // ═══════════════════════════════════════════════════════════
  dua: 'want',
  do: 'want',
  dëshiroj: 'want',
  deshiroj: 'want',
  want: 'want',
  
  kërkoj: 'looking for',
  kerkoj: 'looking for',
  'dua të blej': 'want to buy',
  gjej: 'find',
  find: 'find',
  shikoj: 'view',
  view: 'view',
  vizitoj: 'visit',
  visit: 'visit',

  // ═══════════════════════════════════════════════════════════
  // QYTETET E KOSOVËS (Kosovo Cities)
  // ═══════════════════════════════════════════════════════════
  prishtinë: 'Prishtina',
  prishtine: 'Prishtina',
  prishtina: 'Prishtina',
  pristina: 'Prishtina',
  pristin: 'Prishtina',
  pristine: 'Prishtina',
  priština: 'Prishtina',
  
  prizren: 'Prizren',
  prizreni: 'Prizren',
  
  pejë: 'Peja',
  peje: 'Peja',
  peja: 'Peja',
  
  gjakovë: 'Gjakova',
  gjakove: 'Gjakova',
  gjakova: 'Gjakova',
  
  ferizaj: 'Ferizaj',
  ferizaji: 'Ferizaj',
  
  gjilan: 'Gjilan',
  gjilani: 'Gjilan',
  
  mitrovicë: 'Mitrovica',
  mitrovice: 'Mitrovica',
  mitrovica: 'Mitrovica',
  
  vushtrri: 'Vushtrri',
  vushtrria: 'Vushtrri',
  
  podujevë: 'Podujeva',
  podujeve: 'Podujeva',
  podujeva: 'Podujeva',
  
  suharekë: 'Suhareka',
  suhareke: 'Suhareka',
  suhareka: 'Suhareka',
  
  rahovec: 'Rahovec',
  rahoveci: 'Rahovec',
  
  kamenicë: 'Kamenica',
  kamenice: 'Kamenica',
  kamenica: 'Kamenica',

  // ═══════════════════════════════════════════════════════════
  // LAGJET E PRISHTINËS (Prishtina Neighborhoods)
  // ═══════════════════════════════════════════════════════════
  qendra: 'Qendra',
  dardania: 'Dardania',
  dragodan: 'Dragodan',
  dragodani: 'Dragodan',
  ulpiana: 'Ulpiana',
  'bregu i diellit': 'Bregu i Diellit',
  'breg dielli': 'Bregu i Diellit',
  lakrishte: 'Lakrishte',
  lakrishtja: 'Lakrishte',
  kalabria: 'Kalabria',
  arberia: 'Arberia',
  'arbëria': 'Arberia',
  'mati 1': 'Mati 1',
  aktash: 'Aktash',
  taslixhe: 'Taslixhe',
  veternik: 'Veternik',
  'sunny hill': 'Sunny Hill',
  tophane: 'Tophane',
}

// ═══════════════════════════════════════════════════════════════
// FUNKSIONET E PËRKTHIMIT
// ═══════════════════════════════════════════════════════════════

export function translateWord(word: string): string {
  const lower = word.toLowerCase().trim()
  return SQ_EN_DICTIONARY[lower] || word
}

export function translateKeywords(keywords: string[]): string[] {
  return keywords.map(translateWord)
}

// ═══════════════════════════════════════════════════════════════
// STOP WORDS
// ═══════════════════════════════════════════════════════════════

export const STOP_WORDS_SQ = [
  'një', 'nje', 'e', 'i', 'të', 'te', 'me', 'pa', 'për', 'per',
  'në', 'ne', 'nga', 'deri', 'më', 'me', 'dhe', 'ose', 'por',
  'kjo', 'ky', 'ai', 'ajo', 'ato', 'ata', 'këto', 'keto',
  'është', 'eshte', 'janë', 'jane', 'ishte', 'ishin',
  'kam', 'ke', 'ka', 'kemi', 'keni', 'kanë', 'kane',
  'dua', 'do', 'dëshiroj', 'deshiroj', 'shumë', 'shume',
  'pak', 'mire', 'keq', 'brenda', 'jashtë', 'jashte',
]

export function removeStopWords(words: string[]): string[] {
  return words.filter(
    (w) => !STOP_WORDS_SQ.includes(w.toLowerCase()) && w.length > 2
  )
}