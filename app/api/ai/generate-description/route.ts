import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { auth } from '@/lib/auth/auth'
import { z } from 'zod'

// ═══════════════════════════════════════════════════════════════
// API KEY SETUP
// ═══════════════════════════════════════════════════════════════

const apiKey =
  process.env.GEMINI_API_KEY ||
  process.env.GOOGLE_GENERATIVE_AI_API_KEY

if (!apiKey) {
  console.error('❌ GEMINI_API_KEY is not configured in .env.local')
} else {
  console.log(
    '✅ GEMINI_API_KEY loaded:',
    apiKey.substring(0, 8) + '...' + apiKey.substring(apiKey.length - 4)
  )
}

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null

// ═══════════════════════════════════════════════════════════════
// VALIDATION SCHEMA
// ═══════════════════════════════════════════════════════════════

const requestSchema = z.object({
  keywords: z.string().min(3).max(500),
  propertyType: z.string().max(100).optional(),
  bedrooms: z.string().max(10).optional(),
  city: z.string().max(100).optional(),
  features: z.string().max(500).optional(),
})

// ═══════════════════════════════════════════════════════════════
// POST HANDLER
// ═══════════════════════════════════════════════════════════════

export async function POST(req: NextRequest) {
  try {
    // 1. Authentication
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Duhet të jesh i loguar' },
        { status: 401 }
      )
    }

    // 2. API key check
    if (!ai) {
      return NextResponse.json(
        {
          success: false,
          error:
            'GEMINI_API_KEY nuk është konfiguruar. Kontrollo .env.local dhe restarto serverin.',
        },
        { status: 500 }
      )
    }

    // 3. Parse body
    const body = await req.json()

    // 4. Validate input
    const parsed = requestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Të dhëna të pavlefshme',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const { keywords, propertyType, bedrooms, city, features } = parsed.data

    // 5. Build prompt
    const prompt = `
Ti je një ekspert i pasurive të patundshme në Kosovë.

Shkruaj një përshkrim profesional të një prone në gjuhën shqipe.

Detajet e pronës:

${propertyType ? `- Tipi: ${propertyType}` : ''}
${bedrooms ? `- Dhomat: ${bedrooms}` : ''}
${city ? `- Qyteti: ${city}` : ''}
${features ? `- Veçoritë: ${features}` : ''}
- Fjalë kyçe: ${keywords}

Kërkesat:

- Gjatësia: 100-200 fjalë
- Ton profesional dhe tërheqës
- Thekso veçoritë kryesore
- Mos shpik informacione që nuk janë dhënë
- Pa URL
- Pa emoji
- Pa markdown
- Kthe vetëm përshkrimin
- Mos shto hyrje ose komente
`

    console.log('🤖 Generating property description...')

    // 6. Generate content with VALID model
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',  // ✅ FIXED: valid model name
      contents: prompt,
    })

    const description = response.text?.trim() || ''

    if (!description) {
      return NextResponse.json(
        {
          success: false,
          error: 'Nuk mund të gjenerohej përshkrimi',
        },
        { status: 500 }
      )
    }

    console.log('✅ Description generated successfully')

    return NextResponse.json({
      success: true,
      description,
    })
  } catch (error: any) {
    console.error('❌ Gemini error:', error)

    // Better error messages based on error type
    let errorMessage = 'Gabim gjatë gjenerimit'
    let statusCode = 500

    if (error?.status === 400) {
      errorMessage =
        'API key i pavlefshëm. Kontrollo GEMINI_API_KEY në .env.local'
      statusCode = 400
    } else if (error?.status === 403) {
      errorMessage = 'API key nuk ka leje për këtë model'
      statusCode = 403
    } else if (error?.status === 429) {
      errorMessage = 'Shumë kërkesa. Provo përsëri pas një minute.'
      statusCode = 429
    } else if (error?.message?.includes('API key not valid')) {
      errorMessage =
        'API key i pavlefshëm. Gjenero një key të re nga https://aistudio.google.com/app/apikey'
    } else if (error?.message?.includes('model')) {
      errorMessage = 'Modeli i AI nuk është i disponueshëm'
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details:
          process.env.NODE_ENV === 'development'
            ? error?.message
            : undefined,
      },
      { status: statusCode }
    )
  }
}
