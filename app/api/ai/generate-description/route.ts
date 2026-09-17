import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { auth } from '@/lib/auth/auth'
import { z } from 'zod'

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
})

const requestSchema = z.object({
  keywords: z.string().min(3).max(500),
  propertyType: z.string().max(100).optional(),
  bedrooms: z.string().max(10).optional(),
  city: z.string().max(100).optional(),
  features: z.string().max(500).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Duhet të jesh i loguar' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const parsed = requestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Të dhëna të pavlefshme' },
        { status: 400 }
      )
    }

    const { keywords, propertyType, bedrooms, city, features } = parsed.data

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
- Pa URL, pa emoji, pa markdown
- Kthe vetëm përshkrimin, pa hyrje ose komente`

    // Ndrysho modelin në gemini-3.6-flash
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
    })

    const description = response.text?.trim() || ''

    if (!description) {
      return NextResponse.json(
        { success: false, error: 'Nuk mund të gjenerohej përshkrimi' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      description,
    })
  } catch (error: any) {
    console.error('Gemini error:', error)
    return NextResponse.json(
      { success: false, error: 'Gabim gjatë gjenerimit' },
      { status: 500 }
    )
  }
}