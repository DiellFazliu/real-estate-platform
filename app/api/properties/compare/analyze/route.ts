import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { z } from 'zod'

import { prisma } from '@/lib/db/prisma'

export const runtime = 'nodejs'

const prioritySchema = z.enum([
  'price',
  'space',
  'location',
  'bedrooms',
  'amenities',
])

const requestSchema = z.object({
  ids: z
    .array(z.coerce.number().int().positive())
    .min(2)
    .max(4),

  priorities: z
    .array(prioritySchema)
    .min(1)
    .max(4),
})

const insightSchema = z.object({
  summary: z.string().min(1).max(1200),

  keyDifferences: z
    .array(
      z.object({
        category: z.string().min(1).max(100),
        explanation: z.string().min(1).max(500),
      }),
    )
    .min(1)
    .max(6),

  tradeOffs: z
    .array(
      z.object({
        title: z.string().min(1).max(160),
        detail: z.string().min(1).max(600),
      }),
    )
    .min(1)
    .max(5),

  notablePoints: z
    .array(z.string().min(1).max(400))
    .max(5),

  dataIssues: z
    .array(
      z.object({
        field: z.string().min(1).max(100),
        issue: z.string().min(1).max(500),
        severity: z.enum(['low', 'medium', 'high']),
      }),
    )
    .max(5),

  verify: z
    .array(
      z.object({
        topic: z.string().min(1).max(160),
        reason: z.string().min(1).max(500),
      }),
    )
    .max(6),

  questions: z
    .array(z.string().min(1).max(400))
    .max(6),

  missingInformation: z
    .array(z.string().min(1).max(200))
    .max(6),
})

type ComparisonInsight = z.infer<typeof insightSchema>

type DataIssue = {
  field: string
  issue: string
  severity: 'low' | 'medium' | 'high'
}

function buildDataIssues(
  properties: any[],
): DataIssue[] {
  const issues: DataIssue[] = []

  for (const property of properties) {
    const locationParts = [
      property.location,
      property.neighborhood,
      property.city,
    ]
      .filter(Boolean)
      .map((value) =>
        String(value).trim().toLowerCase(),
      )

    /*
     * Detect an obvious location inconsistency.
     * This is a data-quality observation, not a legal
     * or fraud conclusion.
     */
    if (
      locationParts.some((value) =>
        value.includes('new york'),
      ) &&
      property.city &&
      !String(property.city)
        .toLowerCase()
        .includes('new york')
    ) {
      issues.push({
        field: 'Lokacioni',
        issue: `${property.title} ka informacion lokacioni që nuk përputhet qartë mes fushave të listing-ut.`,
        severity: 'high',
      })
    }

    /*
     * A future construction year is an objectively
     * invalid value for an already existing listing.
     */
    const currentYear =
      new Date().getFullYear()

    if (
      property.year_built !== null &&
      property.year_built !== undefined &&
      property.year_built > currentYear
    ) {
      issues.push({
        field: 'Viti i ndërtimit',
        issue: `${property.title} ka një vit ndërtimi të ardhshëm të deklaruar (${property.year_built}).`,
        severity: 'high',
      })
    }

    /*
     * A renovation year should not automatically be
     * treated as invalid merely because it is the
     * current year or a future planned year.
     *
     * The deterministic inconsistency we can establish
     * from the supplied data is renovation before
     * construction.
     */
    if (
      property.renovation_year !== null &&
      property.renovation_year !== undefined &&
      property.year_built !== null &&
      property.year_built !== undefined &&
      property.renovation_year < property.year_built
    ) {
      issues.push({
        field: 'Viti i rinovimit',
        issue: `${property.title} ka një vit rinovimi (${property.renovation_year}) më të hershëm se viti i ndërtimit (${property.year_built}).`,
        severity: 'medium',
      })
    }

    if (
      property.area !== null &&
      property.area !== undefined &&
      Number(property.area) <= 0
    ) {
      issues.push({
        field: 'Sipërfaqja',
        issue: `${property.title} ka një sipërfaqe jo të vlefshme të deklaruar.`,
        severity: 'high',
      })
    }

    if (
      property.price !== null &&
      property.price !== undefined &&
      Number(property.price) <= 0
    ) {
      issues.push({
        field: 'Çmimi',
        issue: `${property.title} ka një çmim jo të vlefshëm të deklaruar.`,
        severity: 'high',
      })
    }
  }

  return issues.slice(0, 5)
}

function buildFallback(
  properties: any[],
  priorities: string[],
): ComparisonInsight {
  const dataIssues =
    buildDataIssues(properties)

  const hasMixedListingTypes =
    new Set(
      properties.map(
        (property) => property.listing_type,
      ),
    ).size > 1

  const keyDifferences: ComparisonInsight['keyDifferences'] =
    []

  const tradeOffs: ComparisonInsight['tradeOffs'] =
    []

  const notablePoints: string[] = []

  const verify: ComparisonInsight['verify'] =
    []

  const questions: string[] = []

  const missingInformation: string[] = []

  const prices = properties
    .map((property) => ({
      title: property.title,
      price: Number(property.price),
      listingType: property.listing_type,
    }))
    .filter((property) =>
      Number.isFinite(property.price),
    )

  const areas = properties.filter(
    (property) =>
      property.area !== null &&
      property.area !== undefined,
  )

  const bedrooms = properties.filter(
    (property) =>
      property.bedrooms !== null &&
      property.bedrooms !== undefined,
  )

  const cities = Array.from(
    new Set(
      properties
        .map((property) => property.city)
        .filter(Boolean),
    ),
  )

  /*
   * PRICE
   */
  if (
    priorities.includes('price') &&
    prices.length > 0
  ) {
    if (hasMixedListingTypes) {
      keyDifferences.push({
        category: 'Çmimi',
        explanation:
          'Pronat kanë mënyra të ndryshme listimi, ndaj çmimi i shitjes dhe qiraja nuk mund të trajtohen si e njëjta metrikë.',
      })
    } else {
      const sorted = [...prices].sort(
        (a, b) => a.price - b.price,
      )

      const lowest = sorted[0]
      const highest =
        sorted[sorted.length - 1]

      if (lowest.price !== highest.price) {
        keyDifferences.push({
          category: 'Çmimi',
          explanation: `Çmimet e publikuara variojnë nga ${lowest.price.toLocaleString()}€ deri në ${highest.price.toLocaleString()}€, për të njëjtin lloj listimi.`,
        })
      } else {
        keyDifferences.push({
          category: 'Çmimi',
          explanation:
            'Pronat kanë të njëjtin çmim të publikuar.',
        })
      }
    }
  }

  /*
   * SPACE
   */
  if (
    priorities.includes('space') &&
    areas.length > 0
  ) {
    const sorted = [...areas].sort(
      (a, b) =>
        Number(b.area) - Number(a.area),
    )

    const largest = sorted[0]

    keyDifferences.push({
      category: 'Sipërfaqja',
      explanation: `${largest.title} ka sipërfaqen më të madhe ndër pronat me të dhëna të deklaruara.`,
    })
  }

  /*
   * BEDROOMS
   */
  if (
    priorities.includes('bedrooms') &&
    bedrooms.length > 0
  ) {
    const sorted = [...bedrooms].sort(
      (a, b) =>
        Number(b.bedrooms) -
        Number(a.bedrooms),
    )

    const mostBedrooms = sorted[0]

    keyDifferences.push({
      category: 'Dhoma gjumi',
      explanation: `${mostBedrooms.title} ka numrin më të madh të dhomave të gjumit ndër pronat me të dhëna.`,
    })
  }

  /*
   * LOCATION
   */
  if (
    priorities.includes('location') &&
    cities.length > 0
  ) {
    keyDifferences.push({
      category: 'Lokacioni',
      explanation: `Pronat janë të shpërndara në ${cities.join(', ')}.`,
    })
  }

  /*
   * AMENITIES
   */
  if (priorities.includes('amenities')) {
    const amenityFields = [
      'has_elevator',
      'has_parking',
      'has_garden',
      'has_pool',
      'has_air_conditioning',
      'has_heating',
      'has_security',
      'has_internet',
    ]

    const differingAmenities =
      amenityFields.filter((field) => {
        const values = properties.map(
          (property) =>
            Boolean(property[field]),
        )

        return new Set(values).size > 1
      })

    if (differingAmenities.length > 0) {
      keyDifferences.push({
        category: 'Komoditetet',
        explanation:
          'Pronat ndryshojnë në një ose më shumë komoditete të deklaruara.',
      })
    }
  }

  /*
   * DATA ISSUES
   */
  dataIssues.forEach((issue) => {
    verify.push({
      topic: issue.field,
      reason: issue.issue,
    })
  })

  /*
   * MISSING INFORMATION
   *
   * Only treat bedrooms/bathrooms as missing for
   * residential properties. A null value on a
   * commercial property may simply mean that the
   * field does not apply.
   */
  const residentialTypes = new Set([
    'house',
    'villa',
    'apartment',
    'residential',
  ])

  properties.forEach((property) => {
    if (
      property.area === null ||
      property.area === undefined
    ) {
      missingInformation.push(
        `${property.title}: sipërfaqja`,
      )
    }

    const propertyType = String(
      property.property_type ?? '',
    ).toLowerCase()

    const isResidential =
      residentialTypes.has(propertyType)

    if (
      isResidential &&
      (property.bedrooms === null ||
        property.bedrooms === undefined)
    ) {
      missingInformation.push(
        `${property.title}: dhomat e gjumit`,
      )
    }

    if (
      isResidential &&
      (property.bathrooms === null ||
        property.bathrooms === undefined)
    ) {
      missingInformation.push(
        `${property.title}: banjot`,
      )
    }

    if (!property.energy_class) {
      missingInformation.push(
        `${property.title}: klasa energjetike`,
      )
    }
  })

  /*
   * NOTABLE POINTS
   */
  if (hasMixedListingTypes) {
    notablePoints.push(
      'Pronat nuk kanë të njëjtin lloj listimi; shitja dhe qiraja duhet të interpretohen veçmas.',
    )
  }

  if (
    new Set(
      properties.map(
        (property) =>
          property.property_type,
      ),
    ).size > 1
  ) {
    notablePoints.push(
      'Pronat kanë lloje të ndryshme pronash, ndaj disa karakteristika nuk janë drejtpërdrejt të krahasueshme.',
    )
  }

  /*
   * QUESTIONS
   *
   * Keep fallback questions grounded in actual
   * inconsistencies or missing fields.
   */
  if (dataIssues.length > 0) {
    dataIssues.forEach((issue) => {
      if (questions.length >= 6) {
        return
      }

      questions.push(
        `A mund të konfirmohet informacioni për ${issue.field.toLowerCase()} siç është deklaruar në listing?`,
      )
    })
  }

  if (
    missingInformation.length > 0 &&
    questions.length < 6
  ) {
    questions.push(
      'A mund të plotësohen ose konfirmohen informacionet që mungojnë në listing?',
    )
  }

  /*
   * TRADE-OFFS
   */
  if (tradeOffs.length === 0) {
    if (hasMixedListingTypes) {
      tradeOffs.push({
        title: 'Lloji i listimit',
        detail:
          'Tre prona janë në shitje, ndërsa një pronë është me qira. Për këtë arsye, çmimet duhet të interpretohen sipas llojit të listimit dhe jo si e njëjta metrikë.',
      })
    } else if (
      priorities.includes('space') &&
      areas.length > 1
    ) {
      tradeOffs.push({
        title: 'Sipërfaqja',
        detail:
          'Pronat kanë sipërfaqe të ndryshme dhe kjo diferencë duhet të lexohet së bashku me llojin e pronës dhe karakteristikat e tjera të deklaruara.',
      })
    } else if (
      priorities.includes('location') &&
      cities.length > 1
    ) {
      tradeOffs.push({
        title: 'Lokacioni',
        detail:
          'Pronat ndodhen në qytete të ndryshme, ndaj dallimet në karakteristikat e tyre duhet të interpretohen në kontekstin e lokacionit të deklaruar.',
      })
    } else {
      tradeOffs.push({
        title: 'Dallime sipas prioriteteve',
        detail:
          'Pronat kanë karakteristika të ndryshme që lidhen me prioritetet e zgjedhura.',
      })
    }
  }

  if (keyDifferences.length === 0) {
    keyDifferences.push({
      category: 'Dallimet kryesore',
      explanation:
        'Pronat kanë karakteristika të ndryshme që duhen interpretuar sipas prioriteteve të zgjedhura.',
    })
  }

  return {
    summary:
      'Këto prona kanë dallime në karakteristikat kryesore. Analiza i interpreton këto dallime sipas prioriteteve të zgjedhura.',

    keyDifferences:
      keyDifferences.slice(0, 6),

    tradeOffs:
      tradeOffs.slice(0, 5),

    notablePoints:
      notablePoints.slice(0, 5),

    dataIssues:
      dataIssues.slice(0, 5),

    verify:
      verify.slice(0, 6),

    questions:
      questions.slice(0, 6),

    missingInformation:
      missingInformation.slice(0, 6),
  }
}

export async function POST(
  request: NextRequest,
) {
  try {
    const body = await request.json()

    const parsed =
      requestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Të dhënat e krahasimit nuk janë valide.',
        },
        { status: 400 },
      )
    }

    const {
      ids,
      priorities,
    } = parsed.data

    const dbProperties =
      await prisma.property.findMany({
        where: {
          id: {
            in: ids,
          },
          status: 'PUBLISHED',
          review_status: 'APPROVED',
        },

        select: {
          id: true,
          title: true,
          slug: true,
          price: true,
          price_per_m2: true,
          listing_type: true,
          property_type: true,

          city: true,
          neighborhood: true,
          location: true,

          bedrooms: true,
          bathrooms: true,
          area: true,
          balconies: true,
          floor: true,
          total_floors: true,

          year_built: true,
          renovation_year: true,
          condition: true,
          orientation: true,
          furnished: true,
          energy_class: true,

          has_elevator: true,
          has_parking: true,
          has_garden: true,
          has_pool: true,
          has_air_conditioning: true,
          has_heating: true,
          has_security: true,
          has_internet: true,

          features: true,
        },
      })

    if (dbProperties.length < 2) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Nuk ka mjaft prona valide për krahasim.',
        },
        { status: 400 },
      )
    }

    const properties = ids
      .map((id) =>
        dbProperties.find(
          (property) =>
            property.id === id,
        ),
      )
      .filter(Boolean)
      .map((property) => ({
        ...property,
        price: Number(property!.price),
        price_per_m2:
          property!.price_per_m2 !== null
            ? Number(
                property!.price_per_m2,
              )
            : null,
      }))

    const fallback =
      buildFallback(
        properties,
        priorities,
      )

    const apiKey =
      process.env.GROQ_API_KEY

    if (!apiKey) {
      return NextResponse.json({
        success: true,
        source: 'fallback',
        result: fallback,
      })
    }

    const prompt = `
You are the AI Property Comparison layer for Villaron.

Your job is to analyze 2-4 real-estate properties selected by the user.

The application has already retrieved the property data from the database.

The supplied property data is the ONLY factual source you may use.

USER PRIORITIES:
${priorities.join(', ')}

YOUR ROLE:

Explain:

1. The most relevant differences between the properties.
2. The trade-offs created by those differences.
3. Important characteristics that stand out.
4. Genuine data inconsistencies.
5. Information that is genuinely missing.
6. What the user should verify.
7. Useful questions the user can ask the owner or agent.

PRIORITY RULE:

The selected priorities are the user's requested focus.

Discuss selected priorities first.

Do not spend significant space discussing unrelated characteristics unless:

- they are important to interpreting the comparison;
- they represent a genuine data inconsistency;
- or they represent genuinely missing information.

STRICT FACTUAL RULES:

- Reply ONLY in Albanian.
- Return ONLY valid JSON matching the requested schema.
- Use ONLY the supplied property data.
- Never invent facts.
- Never use external market information.
- Never estimate market value.
- Never calculate investment returns.
- Never estimate rental yield.
- Never infer financing costs.
- Never infer maintenance costs.
- Never infer utility bills.
- Never infer actual energy savings or energy costs.
- Energy class is a declared property characteristic only.
- Never make legal conclusions from property data.
- Never call a property illegal, fraudulent, fake, invalid, or suspicious unless the supplied data explicitly establishes that fact.
- If two or more fields directly conflict, describe the situation as a data inconsistency.
- Do not determine which conflicting value is correct.
- Recommend verification instead.
- A null value means the information is unavailable. It does NOT mean zero.
- Do not automatically treat a null value as a problem.
- Distinguish facts from interpretation.
- Do not invent reasons for why a property has a particular characteristic.
- Do not recommend a property.
- Do not select a winner.
- Do not assign scores.
- Do not rank properties.
- Do not tell the user what they should buy or rent.
- Do not describe a property as better, worse, superior, inferior, preferable, or more suitable.

PROPERTY TYPE RULES:

- Do not classify a property characteristic as inconsistent merely because it is unusual for the property type.
- A combination such as office + balconies, house + elevator, or apartment + garden is NOT automatically inconsistent.
- Only identify a data inconsistency when two supplied fields directly contradict each other, or when a value is objectively invalid.
- Do not infer what is normal, appropriate, expected, or inappropriate for a property type.
- Do not infer suitability for residential or commercial use beyond the supplied property_type.
- A non-residential property having null bedrooms or bathrooms does not automatically mean information is missing.
- Do not invent explanations for a property's characteristics.

LISTING TYPE RULE:

If properties contain different listing types:

- explicitly state that sale prices and rental prices are not directly comparable;
- do not compare their numerical prices as though they represent the same metric;
- do not call one cheaper or more expensive than the other;
- do not infer ownership from a sale listing;
- do not infer financing, long-term cost, capital requirements, or financial suitability from the listing type;
- describe the listing-type difference only.

PRICE PER M2 RULE:

- price_per_m2 may be compared only as a declared property field.
- Do not describe price_per_m2 as market value, valuation, investment value, or return.
- If price_per_m2 is null, say only that the field is not declared.
- Do not calculate price_per_m2 for a rental property unless the rental price period is explicitly supplied.
- Do not infer why price_per_m2 is null.

ENERGY RULE:

- Do not describe one energy class as better, worse, more efficient, or less efficient.
- Do not infer energy costs or savings from energy class.
- Do not infer that a newer property has better energy performance.
- Treat energy class only as a declared characteristic.

FURNISHING RULE:

- Do not infer additional costs or savings from furnishing status.
- Do not claim that furnishing affects the user's costs unless such information is explicitly supplied.

DATA QUALITY:

Only identify a data issue when:

1. Two supplied fields directly contradict each other; or
2. A supplied value is objectively invalid.

Examples:

- city = "Prishtina" while another location field says "New York, NY" -> location inconsistency.
- renovation_year earlier than year_built -> date inconsistency.
- area <= 0 -> invalid area.
- price <= 0 -> invalid price.

Do NOT treat these as inconsistencies merely because they may seem unusual:

- office + balconies;
- house + elevator;
- apartment + garden;
- office + no heating;
- any other unusual but internally possible combination.

CURRENT YEAR:

- Do not describe the current calendar year as a future year.
- A renovation year equal to the current year is not automatically an inconsistency.
- A renovation year later than the current year is not automatically invalid; it may represent planned renovation.
- If a future renovation year is mentioned, describe it neutrally as a declared future/planned year and recommend verification only if relevant.

MISSING INFORMATION:

Only list information as missing when:

- the relevant field is null or absent; AND
- that field is reasonably applicable to the property.

Do not list:

- false boolean values as missing;
- information that is already explicitly supplied;
- information that is not applicable to the property type;
- generic real-estate information that is not represented by the supplied data.

VERIFICATION:

Verification points must be directly connected to supplied data.

Good:
"Konfirmo adresën e saktë sepse fushat e lokacionit nuk përputhen."

Good:
"Konfirmo nëse viti i renovimit është i saktë sepse është më i hershëm se viti i ndërtimit."

Bad:
"Kontrollo nëse prona ka probleme ligjore."

Do not generate legal or technical conclusions that are not supported by the supplied data.

QUESTIONS:

Questions must be directly connected to:

- a data inconsistency;
- genuinely missing property information;
- or a meaningful difference already identified in the comparison.

Do not generate generic real-estate questions.

Do not ask about utilities, maintenance, financing, legal status, ownership, taxes, market value, or investment performance unless the supplied property data explicitly contains a relevant field or inconsistency.

Do not invent possible heating systems, costs, causes, explanations, or alternatives that are not present in the supplied data.

Do not create a question merely because it could theoretically be useful.

LANGUAGE AND PRESENTATION:

- Prefer the property's title or a short descriptive name.
- Never mention internal database IDs such as "ID 50" or "ID 263".
- Do not repeat every property field.
- Prioritize useful differences.
- Keep explanations concise and grounded.
- Do not produce generic real-estate advice.
- Do not produce an overall recommendation.

OUTPUT:

Return exactly this JSON structure:

{
  "summary": "Përmbledhje e shkurtër dhe neutrale.",

  "keyDifferences": [
    {
      "category": "Kategoria e dallimit",
      "explanation": "Shpjegim faktik dhe interpretim i kufizuar."
    }
  ],

  "tradeOffs": [
    {
      "title": "Titulli i kompromisit",
      "detail": "Shpjegim i kompromisit pa zgjedhur fitues."
    }
  ],

  "notablePoints": [
    "Pikë faktike që ia vlen të vërehet."
  ],

  "dataIssues": [
    {
      "field": "Fusha",
      "issue": "Përshkrim i problemit të të dhënave.",
      "severity": "low"
    }
  ],

  "verify": [
    {
      "topic": "Çfarë duhet verifikuar",
      "reason": "Pse duhet verifikuar bazuar në të dhënat e furnizuara."
    }
  ],

  "questions": [
    "Pyetje konkrete për pronarin ose agjentin."
  ],

  "missingInformation": [
    "Informacion që mungon."
  ]
}

PROPERTIES:

${JSON.stringify(
  properties,
  null,
  2,
)}
`

    try {
      const groq = new Groq({
        apiKey,
      })

      const response =
        await groq.chat.completions.create({
          model:
            process.env.PROPERTY_COMPARE_MODEL ??
            'qwen/qwen3.8-27b',

          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],

          temperature: 0.2,

          response_format: {
            type: 'json_object',
          },
        })

      const raw =
        response.choices[0]
          ?.message?.content

      if (!raw) {
        throw new Error(
          'Empty comparison AI response',
        )
      }

      const modelResult =
        insightSchema.parse(
          JSON.parse(raw),
        )

      return NextResponse.json({
        success: true,
        source: 'ai',
        result: modelResult,
      })
    } catch (error) {
      console.error(
        'Property comparison AI error; using fallback:',
        error,
      )

      return NextResponse.json({
        success: true,
        source: 'fallback',
        result: fallback,
      })
    }
  } catch (error) {
    console.error(
      'Property comparison request error:',
      error,
    )

    return NextResponse.json(
      {
        success: false,
        error:
          'Analiza e krahasimit nuk mund të përfundonte.',
      },
      { status: 500 },
    )
  }
}