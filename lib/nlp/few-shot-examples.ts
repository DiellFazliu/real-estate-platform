// ═══════════════════════════════════════════════════════════════
// SHEMBUJ TË SHUMTË (Few-Shot Learning)
// Për t'i dhënë modelit më shumë kontekst
// ═══════════════════════════════════════════════════════════════

export interface FewShotExample {
  input: string
  output: string
}

export const FEW_SHOT_EXAMPLES: FewShotExample[] = [
  // ═══════════════════════════════════════════════════════════
  // QUERIES TË THJESHTA
  // ═══════════════════════════════════════════════════════════
  {
    input: '3 bedroom apartment in Prishtina under 200k',
    output: '{"bedrooms":3,"city":"Prishtina","maxPrice":200000,"propertyType":"apartment","confidence":0.95}',
  },
  {
    input: '2 banjo me ashensor nën 150 mijë',
    output: '{"bathrooms":2,"maxPrice":150000,"features":["elevator"],"confidence":0.9}',
  },
  {
    input: 'villa with pool in Dragodan',
    output: '{"propertyType":"villa","neighborhood":"Dragodan","features":["pool"],"confidence":0.95}',
  },
  {
    input: 'shtëpi me kopsht nën 300k',
    output: '{"propertyType":"house","maxPrice":300000,"features":["garden"],"confidence":0.9}',
  },
  {
    input: 'penthouse Prishtinë',
    output: '{"propertyType":"penthouse","city":"Prishtina","confidence":0.9}',
  },
  {
    input: 'apartment me qira në Qendra',
    output: '{"propertyType":"apartment","listingType":"rent","neighborhood":"Qendra","confidence":0.95}',
  },
  {
    input: 'studio under 100k',
    output: '{"propertyType":"studio","maxPrice":100000,"confidence":0.9}',
  },

  // ═══════════════════════════════════════════════════════════
  // QUERIES KOMPLEKSE
  // ═══════════════════════════════════════════════════════════
  {
    input: 'apartament modern afër qendrës',
    output: '{"propertyType":"apartment","neighborhood":"Qendra","keywords":["modern"],"confidence":0.9}',
  },
  {
    input: 'luksoz me pamje dhe pishinë',
    output: '{"features":["view","pool"],"keywords":["luxury"],"confidence":0.85}',
  },
  {
    input: 'dua të blej një shtëpi të re në Prishtinë',
    output: '{"propertyType":"house","listingType":"sale","city":"Prishtina","keywords":["new"],"confidence":0.9}',
  },
  {
    input: 'dy banjo dhe tre dhoma gjumi',
    output: '{"bedrooms":3,"bathrooms":2,"confidence":0.95}',
  },
  {
    input: 'me qira apartament me ashensor',
    output: '{"propertyType":"apartment","listingType":"rent","features":["elevator"],"confidence":0.95}',
  },
  {
    input: 'penthouse me pamje panoramike',
    output: '{"propertyType":"penthouse","features":["view"],"keywords":["panoramic"],"confidence":0.9}',
  },
  {
    input: 'under 500 per month',
    output: '{"maxPrice":500,"listingType":"rent","confidence":0.9}',
  },

  // ═══════════════════════════════════════════════════════════
  // VARIANTS TË SHQIPES
  // ═══════════════════════════════════════════════════════════
  {
    input: 'banesa 2+1 në Prishtine',
    output: '{"bedrooms":2,"bathrooms":1,"propertyType":"apartment","city":"Prishtina","confidence":0.95}',
  },
  {
    input: 'shpi me 4 dhome',
    output: '{"bedrooms":4,"propertyType":"house","confidence":0.9}',
  },
  {
    input: 'stan nën 100 mije',
    output: '{"propertyType":"apartment","maxPrice":100000,"confidence":0.9}',
  },
  {
    input: 'vilë me bazen në Dragodan',
    output: '{"propertyType":"villa","neighborhood":"Dragodan","features":["pool"],"confidence":0.9}',
  },
  {
    input: 'lokal në qendër',
    output: '{"propertyType":"commercial","neighborhood":"Qendra","confidence":0.9}',
  },
  {
    input: 'zyrë me qira',
    output: '{"propertyType":"office","listingType":"rent","confidence":0.9}',
  },

  // ═══════════════════════════════════════════════════════════
  // NUMRAT ME FJALË
  // ═══════════════════════════════════════════════════════════
  {
    input: 'tre dhoma gjumi dhe dy banjo',
    output: '{"bedrooms":3,"bathrooms":2,"confidence":0.95}',
  },
  {
    input: 'katër dhoma ne Prishtine',
    output: '{"bedrooms":4,"city":"Prishtina","confidence":0.95}',
  },
  {
    input: 'pesë dhome nën 500 mijë',
    output: '{"bedrooms":5,"maxPrice":500000,"confidence":0.9}',
  },

  // ═══════════════════════════════════════════════════════════
  // ÇMIMET NË FORMATE TË NDRYSHME
  // ═══════════════════════════════════════════════════════════
  {
    input: 'nën 200000 euro',
    output: '{"maxPrice":200000,"confidence":0.95}',
  },
  {
    input: 'mbi 150k',
    output: '{"minPrice":150000,"confidence":0.95}',
  },
  {
    input: '1.5 milion euro',
    output: '{"maxPrice":1500000,"confidence":0.9}',
  },
  {
    input: 'deri në 300 mijë',
    output: '{"maxPrice":300000,"confidence":0.9}',
  },
  {
    input: 'mbi 500 mijë',
    output: '{"minPrice":500000,"confidence":0.9}',
  },

  // ═══════════════════════════════════════════════════════════
  // QUERIES VAGUE
  // ═══════════════════════════════════════════════════════════
  {
    input: 'diçka e bukur për familjen time',
    output: '{"keywords":["beautiful","family"],"confidence":0.5}',
  },
  {
    input: 'diçka interesante',
    output: '{"keywords":["interesting"],"confidence":0.3}',
  },
  {
    input: 'i qetë dhe i rehatshëm',
    output: '{"keywords":["quiet","cozy"],"confidence":0.5}',
  },

  // ═══════════════════════════════════════════════════════════
  // LAGJET E PRISHTINËS
  // ═══════════════════════════════════════════════════════════
  {
    input: 'apartament në Dardania',
    output: '{"propertyType":"apartment","neighborhood":"Dardania","confidence":0.95}',
  },
  {
    input: 'shtëpi në Ulpiana',
    output: '{"propertyType":"house","neighborhood":"Ulpiana","confidence":0.95}',
  },
  {
    input: 'apartament në Bregu i Diellit',
    output: '{"propertyType":"apartment","neighborhood":"Bregu i Diellit","confidence":0.95}',
  },
  {
    input: 'penthouse në Lakrishte',
    output: '{"propertyType":"penthouse","neighborhood":"Lakrishte","confidence":0.95}',
  },

  // ═══════════════════════════════════════════════════════════
  // KOMBINIME
  // ═══════════════════════════════════════════════════════════
  {
    input: '3 bedroom apartment in Prishtina under 200k with parking',
    output: '{"bedrooms":3,"city":"Prishtina","maxPrice":200000,"propertyType":"apartment","features":["parking"],"confidence":0.95}',
  },
  {
    input: 'apartament 2+1 me ashensor dhe parkim nën 150 mijë',
    output: '{"bedrooms":2,"bathrooms":1,"maxPrice":150000,"propertyType":"apartment","features":["elevator","parking"],"confidence":0.95}',
  },
  {
    input: 'luxury villa me pishinë dhe kopsht në Dragodan',
    output: '{"propertyType":"villa","neighborhood":"Dragodan","features":["pool","garden"],"keywords":["luxury"],"confidence":0.95}',
  },
  {
    input: '4 bedroom house for rent under 800',
    output: '{"bedrooms":4,"propertyType":"house","listingType":"rent","maxPrice":800,"confidence":0.95}',
  },
]

/**
 * Kthen shembujt si string për prompt
 */
export function getFewShotPrompt(): string {
  return FEW_SHOT_EXAMPLES.map(
    (ex) => `Input: "${ex.input}"\nOutput: ${ex.output}`
  ).join('\n\n')
}

/**
 * Kthen shembuj të rastësishëm
 */
export function getRandomExamples(count: number = 5): FewShotExample[] {
  const shuffled = [...FEW_SHOT_EXAMPLES].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}