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
// MAIN FUNCTION
// ═══════════════════════════════════════════════════════════════

export async function parseWithGroq(query: string): Promise<ParsedQuery> {
  try {
    const groq = getGroqClient()

    // ⭐ PËRDOR PROMPT DINAMIK ME FJALOR + FEW-SHOT
    let systemPrompt = ''

    try {
      systemPrompt = await buildDynamicPrompt()
      console.log('✅ [NLP] Using dynamic prompt with dictionary')
    } catch (error) {
      console.log('⚠️  [NLP] Failed to build dynamic prompt:', error)
      // Fallback minimal
      systemPrompt = `Parse this real estate search query in Albanian or English.
Return ONLY JSON with: bedrooms, bathrooms, minPrice, maxPrice, city, neighborhood, propertyType, listingType, features, keywords, confidence.
Examples:
"3 bedroom in Prishtina under 200k" → {"bedrooms":3,"city":"Prishtina","maxPrice":200000,"confidence":0.95}
"2 banjo me ashensor" → {"bathrooms":2,"features":["elevator"],"confidence":0.9}`
    }

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query },
      ],
      model: 'llama-3.3-70b-versatile', // ⭐ NDRYSHO për saktësi më të mirë
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