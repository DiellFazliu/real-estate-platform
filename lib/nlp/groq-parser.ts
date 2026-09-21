import Groq from 'groq-sdk'
import type { ParsedQuery } from './types'
import { buildDynamicPrompt } from './training-data'

// ═══════════════════════════════════════════════════════════════
// LAZY GROQ CLIENT
// ═══════════════════════════════════════════════════════════════

let groqClient: Groq | null = null

function getGroqClient(): Groq {
  if (!groqClient) {
    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      throw new Error('GROQ_API_KEY is missing. Add it to .env file.')
    }
    groqClient = new Groq({ apiKey })
  }
  return groqClient
}

// ═══════════════════════════════════════════════════════════════
// FALLBACK SYSTEM PROMPT
// ═══════════════════════════════════════════════════════════════
// Përdoret nëse training-data nuk mund të lexojë nga DB

const FALLBACK_SYSTEM_PROMPT = `You are a real estate search parser for Kosovo platform.

Extract filters from user query. Return ONLY JSON.

Fields (omit if not present):
- bedrooms: number
- bathrooms: number
- minPrice: number (EUR)
- maxPrice: number (EUR)
- city: string (Prishtina, Prizren, Peja, Gjakova, Ferizaj, Gjilan, Mitrovica)
- neighborhood: string (Qendra, Dardania, Dragodan, Ulpiana, Lakrishte, Arberia)
- propertyType: apartment | house | villa | penthouse | studio | land | commercial | office
- listingType: sale | rent
- features: array (elevator, parking, garden, pool, air_conditioning, heating, security, internet, view)
- keywords: array of useful words IN ENGLISH
- confidence: number 0-1

TRANSLATE Albanian to English for keywords:
- "luksoz" = luxury
- "i bukur" = beautiful
- "i qetë" = quiet
- "modern" = modern
- "i madh" = large
- "i vogël" = small
- "afër qendrës" = near center
- "me pamje" = with view
- "i re" = new

EXAMPLES:

"3 bedroom apartment in Prishtina under 200k"
→ {"bedrooms":3,"city":"Prishtina","maxPrice":200000,"propertyType":"apartment","confidence":0.95}

"2 banjo me ashensor nën 150 mijë"
→ {"bathrooms":2,"maxPrice":150000,"features":["elevator"],"confidence":0.9}

"luksoz me pamje"
→ {"features":["view"],"keywords":["luxury"],"confidence":0.7}

"diçka e bukur për familjen time"
→ {"keywords":["beautiful","family"],"confidence":0.5}

"shtëpi me kopsht"
→ {"propertyType":"house","features":["garden"],"confidence":0.9}

"apartament modern afër qendrës"
→ {"propertyType":"apartment","keywords":["modern","center"],"confidence":0.8}

"vilë me pishinë"
→ {"propertyType":"villa","features":["pool"],"confidence":0.9}

"dua të blej një shtëpi"
→ {"propertyType":"house","listingType":"sale","confidence":0.8}

"me qira apartament"
→ {"propertyType":"apartment","listingType":"rent","confidence":0.9}

IMPORTANT: Return ONLY valid JSON. No markdown, no explanation.`

// ═══════════════════════════════════════════════════════════════
// MAIN FUNCTION
// ═══════════════════════════════════════════════════════════════

export async function parseWithGroq(query: string): Promise<ParsedQuery> {
  try {
    const groq = getGroqClient()

    // ⭐ PËRDOR PROMPT DINAMIK
    // Provon të marrë vlerat aktuale nga databaza
    // Nëse dështon, përdor fallback
    let systemPrompt = FALLBACK_SYSTEM_PROMPT

    try {
      systemPrompt = await buildDynamicPrompt()
      console.log('✅ [NLP] Using dynamic prompt from DB')
    } catch (error) {
      console.log('⚠️  [NLP] Using fallback prompt')
    }

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query },
      ],
      model: 'qwen/qwen3.8-27b',
      temperature: 0.1,
      max_tokens: 500,
      response_format: { type: 'json_object' },
    })

    const content = completion.choices[0]?.message?.content

    if (!content) {
      return {
        keywords: query.toLowerCase().split(/\s+/),
        confidence: 0.1,
      }
    }

    const parsed = JSON.parse(content) as ParsedQuery

    // ═══════════════════════════════════════════════════════════
    // CLEAN UP NULL VALUES
    // ═══════════════════════════════════════════════════════════
    const cleaned: ParsedQuery = {
      keywords: parsed.keywords || [],
      confidence: parsed.confidence || 0.5,
    }

    if (parsed.bedrooms && parsed.bedrooms > 0) {
      cleaned.bedrooms = parsed.bedrooms
    }
    if (parsed.bathrooms && parsed.bathrooms > 0) {
      cleaned.bathrooms = parsed.bathrooms
    }
    if (parsed.minPrice && parsed.minPrice > 0) {
      cleaned.minPrice = parsed.minPrice
    }
    if (parsed.maxPrice && parsed.maxPrice > 0) {
      cleaned.maxPrice = parsed.maxPrice
    }
    if (parsed.city) cleaned.city = parsed.city
    if (parsed.neighborhood) cleaned.neighborhood = parsed.neighborhood
    if (parsed.propertyType) cleaned.propertyType = parsed.propertyType
    if (parsed.listingType) cleaned.listingType = parsed.listingType
    if (parsed.features && parsed.features.length > 0) {
      cleaned.features = parsed.features
    }

    return cleaned
  } catch (error: any) {
    console.error('Groq error:', error.message)

    return {
      keywords: query.toLowerCase().split(/\s+/).filter((w) => w.length > 3),
      confidence: 0.1,
    }
  }
}