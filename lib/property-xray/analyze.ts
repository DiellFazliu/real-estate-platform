import Groq from 'groq-sdk'
import { z } from 'zod'

import type {
  PropertyXRayContext,
  PropertyXRayResult,
} from './types'

import { getMissingListingInformation } from './decision'

const resultSchema = z.object({
  missingInformation: z
    .array(z.string().min(1).max(180))
    .max(8),

  verificationPoints: z
    .array(
      z.object({
        title: z.string().min(1).max(110),
        detail: z.string().min(1).max(300),
        priority: z.enum([
          'high',
          'medium',
          'low',
        ]),
      })
    )
    .min(2)
    .max(6),

  questionsToAsk: z
    .array(z.string().min(1).max(240))
    .min(4)
    .max(8),

  visitChecklist: z
    .array(z.string().min(1).max(180))
    .min(5)
    .max(10),

  negotiationPoints: z
    .array(z.string().min(1).max(220))
    .max(6),
})

function formatCondition(
  value: string | null
): string {
  if (!value) return 'Nuk është specifikuar'

  const labels: Record<string, string> = {
    new: 'E re',
    excellent: 'E shkëlqyer',
    good: 'E mirë',
    needs_renovation: 'Kërkon rinovim',
    under_construction: 'Në ndërtim',
  }

  return labels[value] ?? value
}

function formatFurnished(
  value: string | null
): string {
  if (!value) return 'Nuk është specifikuar'

  const labels: Record<string, string> = {
    unfurnished: 'E pamobiluar',
    semi_furnished: 'Gjysmë e mobiluar',
    fully_furnished: 'Plotësisht e mobiluar',
  }

  return labels[value] ?? value
}

function formatOrientation(
  value: string | null
): string {
  if (!value) return 'Nuk është specifikuar'

  const labels: Record<string, string> = {
    north: 'Veri',
    south: 'Jug',
    east: 'Lindje',
    west: 'Perëndim',
    north_east: 'Veri-Lindje',
    north_west: 'Veri-Perëndim',
    south_east: 'Jug-Lindje',
    south_west: 'Jug-Perëndim',
  }

  return labels[value] ?? value
}

function formatPropertyType(
  value: string
): string {
  const labels: Record<string, string> = {
    apartment: 'Apartament',
    house: 'Shtëpi',
    villa: 'Vilë',
    penthouse: 'Penthouse',
    studio: 'Studio',
    land: 'Truall',
    commercial: 'Pronë komerciale',
    office: 'Zyrë',
  }

  return labels[value] ?? value
}

function getDeterministicVerificationPoints(
  property: PropertyXRayContext
): PropertyXRayResult['verificationPoints'] {
  const points: PropertyXRayResult['verificationPoints'] = []

  if (property.hasParking === false) {
    points.push({
      title: 'Parkimi nuk është i listuar',
      detail:
        'Të dhënat e listing-ut tregojnë se parkingu nuk është i disponueshëm si veçori e pronës. Nëse parkingu është i rëndësishëm, verifiko alternativat dhe kushtet e tyre.',
      priority: 'medium',
    })
  }

  if (property.hasHeating === false) {
    points.push({
      title: 'Ngrohja nuk është e listuar',
      detail:
        'Të dhënat e listing-ut tregojnë se prona nuk ka sistem ngrohjeje të deklaruar si të disponueshëm. Verifiko nëse ekziston ndonjë mënyrë tjetër ngrohjeje dhe si mbulohen kostot.',
      priority: 'high',
    })
  }

  if (
    property.condition === 'needs_renovation'
  ) {
    points.push({
      title: 'Prona kërkon rinovim',
      detail:
        'Listing-u e deklaron pronën si pronë që kërkon rinovim. Gjatë vizitës kontrollo cilat pjesë kërkojnë ndërhyrje dhe kërko detaje për punimet e nevojshme.',
      priority: 'high',
    })
  }

  if (
    property.renovationYear !== null
  ) {
    points.push({
      title: 'Verifiko historikun e rinovimit',
      detail:
        `Listing-u deklaron rinovim në vitin ${property.renovationYear}. Pyet çfarë është rinovuar dhe nëse punimet kanë përfshirë instalimet elektrike, hidraulike, dritaret ose pjesë të tjera kryesore.`,
      priority: 'medium',
    })
  }

  if (
    property.yearBuilt !== null &&
    new Date().getFullYear() -
      property.yearBuilt >=
      20
  ) {
    points.push({
      title: 'Kontrollo gjendjen e ndërtesës',
      detail:
        `Prona është deklaruar e ndërtuar në vitin ${property.yearBuilt}. Gjatë vizitës kushto vëmendje instalimeve, dritareve, izolimit dhe gjendjes së përgjithshme të ndërtesës.`,
      priority: 'medium',
    })
  }

  if (
    property.energyClass === null
  ) {
    points.push({
      title: 'Klasa energjetike mungon',
      detail:
        'Listing-u nuk përmban klasë energjetike. Kërko informacion për performancën energjetike të pronës dhe dokumentacionin përkatës nëse ekziston.',
      priority: 'medium',
    })
  }

  if (
    property.furnished === null
  ) {
    points.push({
      title: 'Mobilimi nuk është specifikuar',
      detail:
        'Listing-u nuk përcakton nëse prona jepet e mobiluar dhe cilat pajisje ose mobilje përfshihen.',
      priority: 'medium',
    })
  }

  if (
    property.floor === null &&
    [
      'apartment',
      'penthouse',
      'studio',
    ].includes(property.propertyType)
  ) {
    points.push({
      title: 'Kati nuk është specifikuar',
      detail:
        'Për këtë lloj prone nuk është deklaruar kati. Konfirmo katin dhe pozicionin e pronës në ndërtesë.',
      priority: 'medium',
    })
  }

  if (
    property.totalFloors === null &&
    [
      'apartment',
      'penthouse',
      'studio',
    ].includes(property.propertyType)
  ) {
    points.push({
      title: 'Numri i kateve nuk është specifikuar',
      detail:
        'Listing-u nuk deklaron numrin total të kateve të ndërtesës. Kjo mund të verifikohet gjatë vizitës ose me listuesin.',
      priority: 'low',
    })
  }

  if (points.length < 2) {
    points.push({
      title: 'Gjendja reale duhet verifikuar',
      detail:
        'Informacioni i listing-ut nuk mund të konfirmojë gjendjen fizike të pronës. Kontrollo elementet kryesore gjatë vizitës.',
      priority: 'medium',
    })
  }

  return points.slice(0, 6)
}

function getFallbackQuestions(
  property: PropertyXRayContext
): string[] {
  const questions: string[] = []

  if (property.hasHeating === false) {
    questions.push(
      'Si ngrohet prona gjatë dimrit dhe cilat janë shpenzimet tipike të ngrohjes?'
    )
  } else {
    questions.push(
      'Çfarë sistemi ngrohjeje përdoret dhe si llogariten shpenzimet e ngrohjes?'
    )
  }

  if (property.hasParking === false) {
    questions.push(
      'A ka ndonjë mundësi parkimi private ose të përbashkët pranë pronës?'
    )
  } else {
    questions.push(
      'A është parkingu i dedikuar për këtë pronë dhe a përfshihet në çmim?'
    )
  }

  if (
    property.renovationYear !== null
  ) {
    questions.push(
      `Çfarë është rinovuar në vitin ${property.renovationYear} dhe cilat punime janë bërë atëherë?`
    )
  }

  if (property.furnished === null) {
    questions.push(
      'Çfarë mobilimi dhe pajisjesh përfshihen në pronë?'
    )
  } else {
    questions.push(
      `A përputhet mobilimi real me gjendjen e deklaruar si "${formatFurnished(property.furnished)}"?`
    )
  }

  questions.push(
    'Cilat shpenzime paguhen veçmas nga çmimi i publikuar?'
  )

  questions.push(
    'A ka depozitë, tarifë shtesë ose kusht tjetër financiar që duhet ditur para marrëveshjes?'
  )

  questions.push(
    'A ka pasur probleme me lagështinë, izolimin, ujin ose instalimet?'
  )

  questions.push(
    'A mund të kontrollohen fizikisht elementet kryesore të pronës gjatë vizitës?'
  )

  return questions.slice(0, 8)
}

function getFallbackChecklist(
  property: PropertyXRayContext
): string[] {
  const checklist: string[] = [
    'Kontrollo muret dhe tavanin për lagështi, njolla ose shenja myku.',
    'Kontrollo dritaret, dyert dhe izolimin.',
    'Hap rubinetat dhe kontrollo presionin dhe rrjedhjen e ujit.',
    'Kontrollo prizat, ndriçimin dhe instalimet e dukshme.',
    'Kontrollo sistemin e ngrohjes dhe mënyrën e funksionimit.',
    'Kontrollo banjën për rrjedhje dhe ventilim.',
    'Krahaso sipërfaqen dhe ndarjen e dhomave me listing-un.',
  ]

  if (property.hasParking) {
    checklist.push(
      'Kontrollo fizikisht vendin e parkimit dhe aksesin në të.'
    )
  }

  if (property.hasGarden) {
    checklist.push(
      'Kontrollo gjendjen e kopshtit dhe aksesin në të.'
    )
  }

  if (
    property.balconies !== null &&
    property.balconies > 0
  ) {
    checklist.push(
      `Kontrollo gjendjen dhe aksesin në të gjitha ${property.balconies} ballkonet.`
    )
  }

  if (property.hasAirConditioning) {
    checklist.push(
      'Kontrollo njësitë e ajrit të kondicionuar dhe gjendjen e tyre.'
    )
  }

  return checklist.slice(0, 10)
}

function getFallbackNegotiationPoints(
  property: PropertyXRayContext
): string[] {
  const points: string[] = []

  if (property.hasParking === false) {
    points.push(
      'Parking-u nuk është i listuar si pjesë e pronës.'
    )
  }

  if (property.hasHeating === false) {
    points.push(
      'Ngrohja nuk është e deklaruar si e disponueshme.'
    )
  }

  if (
    property.energyClass === null
  ) {
    points.push(
      'Klasa energjetike nuk është specifikuar.'
    )
  }

  if (
    property.renovationYear !== null
  ) {
    points.push(
      `Historiku i rinovimit në vitin ${property.renovationYear} mund të kërkojë sqarim mbi punimet e kryera.`
    )
  }

  if (
    property.furnished === null
  ) {
    points.push(
      'Nuk është specifikuar qartë mobilimi dhe pajisjet e përfshira.'
    )
  }

  points.push(
    'Kostot dhe kushtet shtesë duhet të konfirmohen para marrëveshjes.'
  )

  return points.slice(0, 6)
}

export function fallbackPropertyXRay(
  property: PropertyXRayContext
): PropertyXRayResult {
  return {
    missingInformation:
      getMissingListingInformation(property),

    verificationPoints:
      getDeterministicVerificationPoints(
        property
      ),

    questionsToAsk:
      getFallbackQuestions(property),

    visitChecklist:
      getFallbackChecklist(property),

    negotiationPoints:
      getFallbackNegotiationPoints(property),
  }
}

export async function analyzePropertyXRay(input: {
  property: PropertyXRayContext
}): Promise<PropertyXRayResult> {
  const apiKey = process.env.GROQ_API_KEY

  if (!apiKey) {
    throw new Error(
      'GROQ_API_KEY is not configured'
    )
  }

  const property = input.property

  const missingInformation =
    getMissingListingInformation(property)

  const facts = {
    property: {
      title: property.title,
      type: formatPropertyType(
        property.propertyType
      ),
      listingType:
        property.listingType === 'rent'
          ? 'Qira mujore'
          : 'Shitje',
      priceEUR: property.price,
    },

    location: {
      city: property.city,
      neighborhood: property.neighborhood,
      address: property.location,
      postalCode: property.postalCode,
    },

    characteristics: {
      areaM2: property.area,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      balconies: property.balconies,
      floor: property.floor,
      totalFloors: property.totalFloors,
      yearBuilt: property.yearBuilt,
      renovationYear:
        property.renovationYear,
      condition: formatCondition(
        property.condition
      ),
      orientation: formatOrientation(
        property.orientation
      ),
      furnished: formatFurnished(
        property.furnished
      ),
    },

    features: {
      parking: property.hasParking,
      heating: property.hasHeating,
      elevator: property.hasElevator,
      garden: property.hasGarden,
      pool: property.hasPool,
      airConditioning:
        property.hasAirConditioning,
      security: property.hasSecurity,
      internet: property.hasInternet,
      energyClass:
        property.energyClass,
      additionalFeatures:
        property.features.slice(0, 20),
    },

    informationGaps:
      missingInformation,
  }

  const system = `
You are Villaron Property X-Ray, a cautious real-estate listing analysis assistant for Kosovo.

Reply ONLY in Albanian.

Return ONLY valid JSON matching the requested schema.

Your role is NOT to estimate market value.
Your role is NOT to decide whether the user should buy or rent the property.
Your role is to identify what the listing says, what it does not say, what should be verified, what questions should be asked, and what can be checked during a visit.

RULES:

1. Use ONLY the supplied structured listing facts.

2. Never invent property facts.

3. Never claim that a defect exists unless the supplied facts explicitly support it.

4. Distinguish between:
   - explicitly listed information,
   - information missing from the listing,
   - things that require physical verification.

5. A boolean false value is an explicit listing fact.
   Example:
   parking=false means the property data says parking is unavailable.
   It does NOT mean that parking information is missing.

6. Do not treat marketing language as proof of physical condition.

7. Do not calculate or estimate market value.

8. Do not use comparable properties.

9. Do not predict whether an offer will be accepted.

10. Do not recommend a specific offer amount.

11. Do not invent legal, financial, utility, tax or contract facts.

12. Questions should be concrete and relevant to THIS property.

13. Visit checklist items should be things the user can actually inspect or test during a visit.

14. Avoid generic questions when a property-specific question can be created.

15. If a fact is already explicitly listed, do not describe it as missing.

16. Use renovationYear, yearBuilt, condition, propertyType, floor, balconies, garden, parking, heating, energy class and other supplied fields when they are relevant.

17. Do not duplicate market-analysis functionality such as price-per-square-meter comparisons, market trends, comparable properties, market position or rental yield.

18. Negotiation points must be factual discussion points based on the listing. Do not say that any point means the property is overpriced or underpriced.

19. Keep the result concise and practical.

For the visit checklist, prioritize property-specific checks first, followed by essential physical checks.

`

  const user = JSON.stringify({
    task:
      'Create a complete Property X-Ray analysis for this specific listing.',

    facts,

    output: {
      missingInformation:
        '0-8 concrete information gaps from the listing',

      verificationPoints:
        '2-6 property-specific things that should be verified, with title, detail and priority',

      questionsToAsk:
        '4-8 concrete questions relevant to this property',

      visitChecklist:
        '5-10 practical physical checks relevant to this property',

      negotiationPoints:
        '0-6 factual discussion points based on listing information only',
    },
  })

  const completion =
    await new Groq({
      apiKey,
    }).chat.completions.create({
      model:
        process.env.GROQ_XRAY_MODEL ||
        'qwen/qwen3.8-27b',

      messages: [
        {
          role: 'system',
          content: system,
        },
        {
          role: 'user',
          content: user,
        },
      ],

      temperature: 0.15,
      max_tokens: 2200,

      response_format: {
        type: 'json_object',
      },
    })

  const content =
    completion.choices[0]?.message
      ?.content

  if (!content) {
    throw new Error(
      'The AI returned an empty response'
    )
  }

  const parsed = resultSchema.parse(
    JSON.parse(content)
  )

  return {
    ...parsed,

    // Missing information is deterministic.
    // The LLM cannot accidentally invent a missing field.
    missingInformation,
  }
}