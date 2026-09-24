import Groq from 'groq-sdk'
import { z } from 'zod'

import type {
  PropertyXRayContext,
  PropertyXRayResult,
  VerificationPriority,
} from './types'

import {
  formatFurnished,
  formatOrientation,
} from './formatters'

const xRaySchema = z.object({
  missingInformation: z.array(z.string()).max(8),

  verificationPoints: z
    .array(
      z.object({
        title: z.string(),
        detail: z.string(),
        priority: z.enum([
          'high',
          'medium',
          'low',
        ]),
      }),
    )
    .min(1)
    .max(8),

  questionsToAsk: z
    .array(z.string())
    .min(4)
    .max(8),

  visitChecklist: z
    .array(z.string())
    .min(5)
    .max(10),

  negotiationPoints: z
    .array(z.string())
    .max(6),
})

function isApartmentLike(propertyType: string) {
  const value = propertyType.toLowerCase()

  return (
    value.includes('apartment') ||
    value.includes('penthouse') ||
    value.includes('studio') ||
    value.includes('banes') ||
    value.includes('apartament')
  )
}

function isHouseLike(propertyType: string) {
  const value = propertyType.toLowerCase()

  return (
    value.includes('house') ||
    value.includes('villa') ||
    value.includes('shtëpi') ||
    value.includes('vile')
  )
}

function addUnique(
  items: string[],
  value: string,
) {
  if (!items.includes(value)) {
    items.push(value)
  }
}

/**
 * Deterministic facts that are actually missing
 * from the listing.
 *
 * false and 0 are valid declared values
 * and are NOT missing.
 */
function buildMissingInformation(
  property: PropertyXRayContext,
) {
  const missing: string[] = []

  if (!property.city && !property.location) {
    addUnique(missing, 'Lokacioni')
  }

  if (
    !property.propertyType ||
    property.propertyType === 'unknown'
  ) {
    addUnique(
      missing,
      'Lloji i pronës',
    )
  }

  if (property.area === null) {
    addUnique(
      missing,
      'Sipërfaqja',
    )
  }

  if (property.condition === null) {
    addUnique(
      missing,
      'Gjendja',
    )
  }

  if (property.furnished === null) {
    addUnique(
      missing,
      'Mobilimi',
    )
  }

  if (property.yearBuilt === null) {
    addUnique(
      missing,
      'Viti i ndërtimit',
    )
  }

  if (property.energyClass === null) {
    addUnique(
      missing,
      'Klasa energjetike',
    )
  }

  if (property.bedrooms === null) {
    addUnique(
      missing,
      'Numri i dhomave',
    )
  }

  if (property.bathrooms === null) {
    addUnique(
      missing,
      'Numri i banjove',
    )
  }

  if (
    isApartmentLike(property.propertyType)
  ) {
    if (property.floor === null) {
      addUnique(missing, 'Kati')
    }

    if (property.totalFloors === null) {
      addUnique(
        missing,
        'Numri total i kateve',
      )
    }
  }

  if (
    !isHouseLike(property.propertyType) &&
    property.orientation === null
  ) {
    addUnique(
      missing,
      'Orientimi',
    )
  }

  return missing
}

/**
 * Finds factual inconsistencies in the supplied
 * structured data.
 *
 * These are deterministic because we do not want
 * the LLM inventing whether two facts contradict
 * each other.
 */
function buildDataInconsistencies(
  property: PropertyXRayContext,
): string[] {
  const inconsistencies: string[] = []
  const currentYear =
    new Date().getFullYear()

  if (
    property.yearBuilt !== null &&
    property.renovationYear !== null &&
    property.renovationYear <
      property.yearBuilt
  ) {
    addUnique(
      inconsistencies,
      `Viti i rinovimit (${property.renovationYear}) është para vitit të ndërtimit (${property.yearBuilt}).`,
    )
  }

  if (
    property.renovationYear !== null &&
    property.renovationYear > currentYear
  ) {
    addUnique(
      inconsistencies,
      `Viti i rinovimit (${property.renovationYear}) është në të ardhmen krahasuar me vitin aktual (${currentYear}).`,
    )
  }

  if (
    isApartmentLike(property.propertyType) &&
    property.floor !== null &&
    property.totalFloors !== null &&
    property.floor > property.totalFloors
  ) {
    addUnique(
      inconsistencies,
      `Kati i pronës (${property.floor}) është më i madh se numri total i kateve (${property.totalFloors}).`,
    )
  }

  if (
    property.bedrooms !== null &&
    property.bedrooms < 0
  ) {
    addUnique(
      inconsistencies,
      'Numri i dhomave është negativ.',
    )
  }

  if (
    property.bathrooms !== null &&
    property.bathrooms < 0
  ) {
    addUnique(
      inconsistencies,
      'Numri i banjove është negativ.',
    )
  }

  if (
    property.balconies !== null &&
    property.balconies < 0
  ) {
    addUnique(
      inconsistencies,
      'Numri i ballkoneve është negativ.',
    )
  }

  return inconsistencies
}

function buildVerificationPoints(
  property: PropertyXRayContext,
): Array<{
  title: string
  detail: string
  priority: VerificationPriority
}> {
  const points: Array<{
    title: string
    detail: string
    priority: VerificationPriority
  }> = []

  const inconsistencies =
    buildDataInconsistencies(property)

  for (const inconsistency of inconsistencies) {
    points.push({
      title:
        'Mospërputhje në të dhënat e listing-ut',
      detail: `${inconsistency} Kërko sqarim nga listuesi para se të mbështetesh në këtë informacion.`,
      priority: 'high',
    })
  }

  if (property.hasParking === false) {
    points.push({
      title:
        'Parking nuk është i regjistruar si i disponueshëm',
      detail:
        'Të dhënat e pronës e regjistrojnë parkingun si jo të disponueshëm. Verifiko nëse ekziston ndonjë mundësi private, e përbashkët ose alternative pranë pronës.',
      priority: 'medium',
    })
  }

  if (property.hasHeating === false) {
    points.push({
      title:
        'Ngrohja nuk është e regjistruar si e disponueshme',
      detail:
        'Të dhënat e pronës e regjistrojnë ngrohjen si jo të disponueshme. Verifiko sistemin real të ngrohjes dhe mënyrën e funksionimit të tij.',
      priority: 'high',
    })
  }

  if (
    property.condition
      ?.toLowerCase()
      .includes('renov')
  ) {
    points.push({
      title:
        'Gjendja kërkon verifikim të punimeve',
      detail:
        'Listing-u e përshkruan pronën si të nevojshme për renovim. Verifiko cilat punime kërkohen dhe në çfarë gjendjeje janë instalimet kryesore.',
      priority: 'high',
    })
  }

  if (property.renovationYear !== null) {
    points.push({
      title:
        'Verifiko historikun e rinovimit',
      detail: `Listing-u deklaron rinovim në vitin ${property.renovationYear}. Pyet çfarë është rinovuar dhe nëse punimet kanë përfshirë instalimet elektrike, hidraulike, dritaret, izolimin ose pjesë të tjera kryesore.`,
      priority: 'medium',
    })
  }

  if (
    property.yearBuilt !== null &&
    property.yearBuilt <=
      new Date().getFullYear() - 20
  ) {
    points.push({
      title:
        'Verifiko gjendjen e ndërtesës',
      detail: `Prona deklarohet e ndërtuar në vitin ${property.yearBuilt}. Kontrollo gjatë vizitës gjendjen e fasadës, izolimit, dritareve, instalimeve dhe pjesëve të përbashkëta.`,
      priority: 'medium',
    })
  }

  if (property.energyClass === null) {
    points.push({
      title:
        'Klasa energjetike nuk është deklaruar',
      detail:
        'Listing-u nuk jep klasë energjetike. Nëse konsumi i energjisë është i rëndësishëm, kërko dokumentacionin përkatës ose pyet për konsumin real.',
      priority: 'low',
    })
  }

  if (property.furnished === null) {
    points.push({
      title:
        'Gjendja e mobilimit nuk është deklaruar',
      detail:
        'Listing-u nuk specifikon nivelin e mobilimit. Verifiko cilat mobilie dhe pajisje përfshihen në çmim.',
      priority: 'medium',
    })
  }

  if (
    isApartmentLike(property.propertyType) &&
    property.floor === null
  ) {
    points.push({
      title: 'Kati nuk është deklaruar',
      detail:
        'Listing-u nuk specifikon katin e pronës. Verifiko katin real dhe aksesin në ndërtesë.',
      priority: 'medium',
    })
  }

  if (
    isApartmentLike(property.propertyType) &&
    property.totalFloors === null
  ) {
    points.push({
      title:
        'Numri total i kateve nuk është deklaruar',
      detail:
        'Listing-u nuk specifikon numrin total të kateve të ndërtesës.',
      priority: 'low',
    })
  }

  return points.slice(0, 8)
}

function buildQuestions(
  property: PropertyXRayContext,
): string[] {
  const questions: string[] = []

  if (property.hasHeating) {
    addUnique(
      questions,
      'Çfarë sistemi ngrohjeje përdoret dhe si llogariten shpenzimet e ngrohjes?',
    )
  } else {
    addUnique(
      questions,
      'Cili është sistemi real i ngrohjes dhe a ka ndonjë mënyrë alternative ngrohjeje?',
    )
  }

  if (property.hasParking) {
    addUnique(
      questions,
      'A është parkingu i dedikuar për këtë pronë dhe a përfshihet në çmim?',
    )
  } else {
    addUnique(
      questions,
      'A ka ndonjë mundësi parkimi private ose të përbashkët pranë pronës?',
    )
  }

  if (property.renovationYear !== null) {
    addUnique(
      questions,
      `Çfarë është rinovuar në vitin ${property.renovationYear} dhe cilat punime janë bërë atëherë?`,
    )
  }

  if (
    property.furnished ===
    'unfurnished'
  ) {
    addUnique(
      questions,
      'Cilat pajisje dhe elemente të fiksuara përfshihen në pronë, duke qenë se prona është e pamobiluar?',
    )
  } else if (property.furnished !== null) {
    addUnique(
      questions,
      `A përputhet mobilimi real me gjendjen e deklaruar si "${formatFurnished(
        property.furnished,
      )}" dhe cilat pajisje përfshihen në çmim?`,
    )
  }

  if (
    property.propertyType
      .toLowerCase()
      .includes('studio') &&
    property.area !== null
  ) {
    addUnique(
      questions,
      `Meqë prona është studio prej ${property.area} m², si është organizuar hapësira dhe cilat zona funksionale përfshihen?`,
    )
  }

  if (property.orientation !== null) {
    addUnique(
      questions,
      `Si është ndriçimi natyral gjatë ditës me orientimin ${formatOrientation(
        property.orientation,
      )}?`,
    )
  }

  if (
    property.balconies !== null &&
    property.balconies > 0
  ) {
    addUnique(
      questions,
      `A janë të gjitha ${property.balconies} ballkonet të aksesueshme dhe në çfarë gjendjeje janë?`,
    )
  }

  if (
    property.floor !== null &&
    property.totalFloors !== null
  ) {
    addUnique(
      questions,
      `A përputhet kati ${property.floor} me dokumentacionin dhe si është aksesi në këtë kat?`,
    )
  }

  if (
    property.bathrooms !== null &&
    property.bathrooms > 1
  ) {
    addUnique(
      questions,
      `A funksionojnë të gjitha ${property.bathrooms} banjot dhe a kanë ventilim dhe furnizim të rregullt me ujë?`,
    )
  }

  if (
    isHouseLike(property.propertyType) &&
    property.hasGarden
  ) {
    addUnique(
      questions,
      'A është kopshti pjesë e parcelës së pronës dhe a përfshihet në dokumentacion?',
    )
  }

  addUnique(
    questions,
    'Cilat shpenzime paguhen veçmas nga çmimi i publikuar?',
  )

  addUnique(
    questions,
    'A ka pasur probleme të mëparshme me lagështinë, izolimin, ujin ose instalimet?',
  )

  return questions.slice(0, 8)
}

function buildVisitChecklist(
  property: PropertyXRayContext,
): string[] {
  const checklist: string[] = []

  addUnique(
    checklist,
    'Kontrollo muret dhe tavanin për lagështi, njolla ose shenja myku.',
  )

  addUnique(
    checklist,
    'Kontrollo dritaret, dyert dhe izolimin.',
  )

  addUnique(
    checklist,
    'Hap rubinetat dhe kontrollo presionin dhe rrjedhjen e ujit.',
  )

  addUnique(
    checklist,
    'Kontrollo prizat, ndriçimin dhe instalimet e dukshme.',
  )

  if (property.hasHeating) {
    addUnique(
      checklist,
      'Kontrollo sistemin e ngrohjes dhe mënyrën e funksionimit.',
    )
  }

  addUnique(
    checklist,
    'Kontrollo banjën për rrjedhje dhe ventilim.',
  )

  if (property.area !== null) {
    addUnique(
      checklist,
      `Krahaso sipërfaqen e deklaruar prej ${property.area} m² dhe ndarjen e hapësirës me listing-un.`,
    )
  }

  if (property.hasParking) {
    addUnique(
      checklist,
      'Kontrollo fizikisht vendin e parkimit dhe aksesin në të.',
    )
  }

  if (
    property.balconies !== null &&
    property.balconies > 0
  ) {
    addUnique(
      checklist,
      `Kontrollo gjendjen, izolimin dhe kullimin e të gjitha ${property.balconies} ballkoneve.`,
    )
  }

  if (property.hasAirConditioning) {
    addUnique(
      checklist,
      'Kontrollo njësitë e ajrit të kondicionuar dhe gjendjen e tyre.',
    )
  }

  if (property.hasElevator) {
    addUnique(
      checklist,
      'Kontrollo funksionimin dhe gjendjen e ashensorit.',
    )
  }

  if (property.orientation !== null) {
    addUnique(
      checklist,
      `Vlerëso ndriçimin natyral dhe ekspozimin real të orientimit ${formatOrientation(
        property.orientation,
      )}.`,
    )
  }

  return checklist.slice(0, 10)
}

function buildNegotiationPoints(
  property: PropertyXRayContext,
): string[] {
  const points: string[] = []

  if (!property.hasParking) {
    addUnique(
      points,
      'Parking-u nuk deklarohet si pjesë e pronës; verifiko alternativat dhe kushtet e tyre.',
    )
  }

  if (!property.hasHeating) {
    addUnique(
      points,
      'Ngrohja nuk deklarohet si e disponueshme; kërko sqarim për sistemin dhe kostot.',
    )
  }

  if (property.renovationYear !== null) {
    addUnique(
      points,
      `Historiku i rinovimit në vitin ${property.renovationYear} duhet të konfirmohet.`,
    )
  }

  if (property.furnished !== null) {
    if (
      property.furnished ===
      'unfurnished'
    ) {
      addUnique(
        points,
        'Konfirmo cilat pajisje dhe elemente të fiksuara përfshihen në pronë.',
      )
    } else {
      addUnique(
        points,
        `Verifiko çfarë përfshihet konkretisht në mobilimin "${formatFurnished(
          property.furnished,
        )}".`,
      )
    }
  }

  if (property.energyClass === null) {
    addUnique(
      points,
      'Klasa energjetike nuk është deklaruar dhe mund të kërkojë sqarim.',
    )
  }

  return points.slice(0, 6)
}

export function fallbackPropertyXRay(
  property: PropertyXRayContext,
): PropertyXRayResult {
  return {
    missingInformation:
      buildMissingInformation(property),

    verificationPoints:
      buildVerificationPoints(property),

    questionsToAsk:
      buildQuestions(property),

    visitChecklist:
      buildVisitChecklist(property),

    negotiationPoints:
      buildNegotiationPoints(property),
  }
}

export async function analyzePropertyXRay({
  property,
}: {
  property: PropertyXRayContext
}): Promise<PropertyXRayResult> {
  const fallback =
    fallbackPropertyXRay(property)

  const apiKey =
    process.env.GROQ_API_KEY

  if (!apiKey) {
    return fallback
  }

  const inconsistencies =
    buildDataInconsistencies(property)

  const baseline = fallback
  const context = property

  const prompt = `
You are the AI reasoning layer for Villaron Property X-Ray.

Your job is to analyze a property's declared structured data and identify:
1. missing information,
2. contradictions between property facts,
3. facts that should be verified,
4. useful questions to ask during a property visit,
5. practical physical checks during the visit,
6. factual clarification points relevant before making an offer.

IMPORTANT SCOPE:
- This is a verification layer.
- Do NOT perform market valuation.
- Do NOT estimate fair market price.
- Do NOT predict whether an offer will be accepted.
- Do NOT say whether a property is a good or bad deal.
- Do NOT duplicate market intelligence such as comparable prices, price/m², percentile, market position, or market trends.
- Do NOT invent facts that are not provided.
- Use only the supplied property data.

FACT INTERPRETATION:
- null means the information is missing.
- false is an explicit negative value in structured property data.
- true is an explicit positive value.
- 0 is an explicit numeric value and must NOT be treated as missing.
- Do not convert false into a claim that the public listing visibly displays "No".
- If a structured field is false but the human-facing listing may not explicitly display that fact, describe it as:
  "Të dhënat e pronës e regjistrojnë këtë si jo të disponueshme."
  rather than:
  "Listing-u thotë se kjo nuk është e disponueshme."
- Do not invent what the public listing UI displays unless that information is explicitly provided.

IMPORTANT:
When a boolean field is false, do not say that "listing-u e deklaron" or "listing-u thotë" that the feature is unavailable.

Instead use wording such as:
- "Të dhënat e pronës e regjistrojnë parkingun si jo të disponueshëm."
- "Të dhënat e pronës e regjistrojnë ngrohjen si jo të disponueshme."

This distinction is required because structured data and visible listing text are not necessarily the same thing.

REASONING:
Look for meaningful relationships between facts, including:
- title vs structured amenities
- property type vs floor information
- floor vs total floors
- year built vs renovation year
- property type vs area
- property type vs bedrooms/bathrooms
- property type vs balconies/garden/parking
- condition vs renovation year
- energy class vs year built
- furnishing vs property type
- orientation vs property type
- features vs structured amenities

CONTRADICTIONS:
Prioritize direct contradictions.

For example:
- If the title says "with air conditioning" but hasAirConditioning is false, identify this as a direct contradiction.
- If the title says "with parking" but hasParking is false, identify this as a direct contradiction.
- If a renovation year is before the construction year, identify the inconsistency.
- If the floor is greater than total floors, identify the inconsistency.

Do not invent a contradiction merely because two facts are unusual together.

ENERGY CLASS:
Do NOT infer poor insulation, high energy costs, poor construction quality, or another specific cause solely from an energy class.

For energy class:
- State the supplied energy class exactly.
- Recommend verifying the energy certificate and the factors behind the classification.
- Do not infer energy efficiency, insulation quality, expected costs, or unusualness from the energy class, construction year, renovation year, or property type.

For example, do not say:
"Energy class E means the insulation is poor."

Instead say:
"The property has energy class E. Verify the energy certificate and the factors behind this classification."

PARKING AND GARDEN:
If parking is false and garden is true:
- identify that parking is not recorded in the structured data;
- ask whether the property has private parking or another permitted parking option;
- do NOT assume that the garden can be converted into or used as parking;
- do NOT assume that such use is legally permitted.

HEATING:
If hasHeating is false:
- state that the structured data records heating as false;
- ask what heating system is actually used;
- do not invent a heating type or cost.

Do not characterize the absence of heating as unusual, critical, problematic, or significant based only on the property type or location.

Do not use the construction year, renovation year, property type, city, or other contextual facts to imply that the absence of heating is unusual, unexpected, critical, or problematic.

Only state that heating is recorded as false and that the actual heating system should be verified.

CONDITION:
Use the supplied condition exactly.
Do not upgrade, downgrade, reinterpret, or replace the supplied condition with a stronger or weaker description.

FEATURES:
Use supplied features when they are relevant.
A feature may generate a practical inspection point if there is a clear reason to verify it physically.

QUESTIONS:
Questions must be specific to this property whenever possible.
Avoid generic questions unless they are genuinely useful.

BAD:
"Is everything okay with the property?"

GOOD:
"The title mentions air conditioning, but the structured data records hasAirConditioning as false. Is an air-conditioning unit installed and included with the property?"

VISIT CHECKLIST:
Checklist items should be things a person can reasonably inspect or verify during a physical visit.
Do not claim that a physical inspection can prove something that requires documentation.

For visitChecklist, do not use the absence of heating, parking, AC, or another amenity as a reason to intensify an unrelated physical inspection unless there is a direct factual relationship.

Examples:
- inspect walls and ceilings for visible moisture
- test water pressure
- test lights and electrical outlets
- inspect windows and doors
- verify that listed equipment is physically present
- inspect the condition of balconies
- inspect parking access
- check elevator operation where applicable

OUTPUT:
Return ONLY valid JSON matching the provided schema.

The result must contain:
- missingInformation
- verificationPoints
- questionsToAsk
- visitChecklist
- negotiationPoints

Keep every item concise, factual, and property-specific.

For missingInformation, return only concise names of missing fields.

For missingInformation, only include information that is genuinely absent (null or undefined).

Never treat false as missing.

For example:
- hasHeating: false is NOT missing information.
- hasParking: false is NOT missing information.
- hasGarden: false is NOT missing information.

These are explicitly declared negative values and should instead be handled as verification facts or questions when relevant.

Do not explain why the field is missing.
Do not include reasoning, property type, or technical field names unless necessary.

GOOD:
["Kati", "Numri total i kateve"]

BAD:
["Sipas të dhënave strukturore, informacioni për kat dhe numrin total të kateve mungon."]

For negotiationPoints, distinguish between:
- a fact that may be relevant to the user's negotiation, which is allowed;
- a conclusion about how much that fact changes the property's value, which is not allowed.

Do not use phrases such as:
- "ndryshon vlerën e pronës"
- "është shumë i shtrenjtë"
- "është shumë i lirë"
- "është kufizim i madh"
- "justifikon ulje çmimi"
- "duhet kërkuar ulje"
- "duhet ofruar më pak/më shumë"

You may explain practical or financial implications when they follow directly from the supplied facts, but leave the user's valuation or offer decision to the user.

NEGOTIATION POINTS:
Do not simply repeat verification points, missing information, or visit checklist items.

Only include a point here when a supplied fact creates a concrete issue or clarification that may be relevant when discussing the terms of the agreement.

Do not infer that an energy class causes higher or lower costs.

If costs are not supplied, ask for actual or historical costs rather than predicting them from the energy class.

Examples:
- whether air conditioning mentioned in the title is actually included;
- whether heating is included and what system/costs apply;
- whether parking is included or available;
- which furniture/appliances are included;
- which additional costs or conditions apply.

Do not include generic statements such as "this should be verified" unless they are directly relevant to the terms of the agreement.

Do not recommend a specific offer or price.

You may recommend asking about costs when an amenity or service is relevant, but never invent, estimate, or infer a cost unless an amount is explicitly provided in the property data.

QUESTIONS:
- Do not interpret or explain marketing terminology from the title such as "3+1" unless the structured property data explicitly requires clarification.
- Do not ask about specific appliances or equipment unless the property data, title, or existing features provide a factual basis for the question.
- For an unfurnished property, ask which fixed appliances, fixtures, or equipment remain with the property rather than asking what "furnishing" includes.

VISIT CHECKLIST:
- Do not use the construction year, renovation year, property type, or other contextual facts as a reason to intensify an otherwise generic physical check.
- Only include relationships that are directly supported by the supplied data.
- Do not assume that the declared area includes or excludes gardens, balconies, terraces, or other external areas. If relevant, ask how the declared area was calculated.

NEGOTIATION POINTS:
- Do not assume that a garden, balcony, parking space, or other external area is included in the advertised area or rent unless explicitly stated.
- Ask for clarification rather than making assumptions about what is included.

OUTPUT LANGUAGE:
Return every user-facing string in Albanian.

Do not return English titles, details, questions, checklist items, or negotiation points.

Use natural Albanian suitable for a Kosovo real-estate platform.

Keep technical field names such as hasHeating only when necessary to explain a data contradiction.

Use grammatically natural Albanian.

Prefer standard forms such as "qira" than "qiraj".

USER-FACING TERMINOLOGY:
All user-facing text must use natural Albanian terminology.

Never expose raw database enum values in normal user-facing text.

For example:
- "unfurnished" → "e pamobiluar"
- "semi_furnished" → "gjysmë e mobiluar"
- "fully_furnished" → "plotësisht e mobiluar"
- "north" → "veri"
- "south" → "jug"
- "east" → "lindje"
- "west" → "perëndim"
- "north_east" → "verilindje"
- "north_west" → "veriperëndim"
- "south_east" → "juglindje"
- "south_west" → "jugperëndim"

Do not write raw values such as:
"unfurnished"
"south_west"
"hasHeating: false"
"hasParking: false"

Use the corresponding natural Albanian wording instead.

Technical field names or raw values may appear only when they are strictly necessary to explain an internal data contradiction. Even then, prefer natural Albanian wording.

KNOWN DATA INCONSISTENCIES:
${
  inconsistencies.length > 0
    ? JSON.stringify(inconsistencies)
    : 'None'
}

PROPERTY:
${JSON.stringify(context, null, 2)}

DETERMINISTIC BASELINE:
${JSON.stringify(baseline, null, 2)}
`

  try {
    const groq = new Groq({
      apiKey,
    })

    const completion =
      await groq.chat.completions.create({
        model:
          process.env.PROPERTY_XRAY_MODEL ??
          'qwen/qwen3.8-27b',

        temperature: 0.4,

        messages: [
          {
            role: 'system',
            content:
              'You are a precise real-estate verification reasoning engine. Return only valid JSON. Never invent facts.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      })

    const content =
      completion.choices[0]?.message?.content

    if (
      !content ||
      typeof content !== 'string'
    ) {
      return fallback
    }

    const parsed = JSON.parse(content)

    const validated =
      xRaySchema.safeParse(parsed)

    if (!validated.success) {
      return fallback
    }

    return {
      ...validated.data,

      // Missing information is deterministic.
      // The AI must not introduce fields that
      // are not actually missing from structured data.
      missingInformation:
        fallback.missingInformation,
    }
  } catch (error) {
    console.error(
      '[Property X-Ray] AI analysis failed:',
      error,
    )

    return fallback
  }
}