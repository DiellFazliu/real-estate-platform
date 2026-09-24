import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { auth } from '@/lib/auth/auth'
import { z } from 'zod'

// ═══════════════════════════════════════════════════════════════
// GROQ CLIENT (LAZY INIT)
// ═══════════════════════════════════════════════════════════════

let groqClient: Groq | null = null

function getGroqClient(): Groq {
  if (!groqClient) {
    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      throw new Error('GROQ_API_KEY is missing in .env.local')
    }
    groqClient = new Groq({ apiKey })
  }
  return groqClient
}

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

    // 2. Parse body
    const body = await req.json()

    // 3. Validate input
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

    // 4. Build prompt
    const prompt = `Ti je një ekspert i pasurive të patundshme në Kosovë.

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
- Mos shto hyrje ose komente`

    console.log('🤖 Generating property description with Groq...')

    // 5. Get Groq client
    let groq: Groq
    try {
      groq = getGroqClient()
    } catch (error: any) {
      return NextResponse.json(
        {
          success: false,
          error:
            'GROQ_API_KEY nuk është konfiguruar. Kontrollo .env.local dhe restarto serverin.',
        },
        { status: 500 }
      )
    }

    // 6. Generate content with Groq
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content:
            'Ti je një ekspert i pasurive të patundshme në Kosovë që shkruan përshkrime profesionale në gjuhën shqipe.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'qwen/qwen3.8-27b', // Ose 'llama-3.1-8b-instant' për më të shpejtë
      temperature: 0.7,
      max_tokens: 500,
    })

    const description = completion.choices[0]?.message?.content?.trim() || ''

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
    console.error('❌ Groq error:', error)

    // Error handling
    let errorMessage = 'Gabim gjatë gjenerimit'
    let statusCode = 500

    if (error?.status === 401) {
      errorMessage =
        'API key i pavlefshëm. Kontrollo GROQ_API_KEY në .env.local'
      statusCode = 401
    } else if (error?.status === 403) {
      errorMessage = 'API key nuk ka leje për këtë model'
      statusCode = 403
    } else if (error?.status === 429) {
      errorMessage = 'Shumë kërkesa. Provo përsëri pas një minute.'
      statusCode = 429
    } else if (error?.message?.includes('API key')) {
      errorMessage =
        'API key i pavlefshëm. Gjenero një key të re nga https://console.groq.com/keys'
    } else if (error?.message?.includes('model')) {
      errorMessage = 'Modeli i AI nuk është i disponueshëm'
    } else if (error?.message?.includes('rate_limit')) {
      errorMessage = 'Keni arritur limitin e kërkesave. Provo më vonë.'
      statusCode = 429
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