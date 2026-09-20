import Groq from 'groq-sdk'
import type { PriceAnalysis, ComparableProperty } from './price-engine'
import type { TrendAnalysis } from './trend-engine'
import type { LocationInsights } from './location-engine'

let groqClient: Groq | null = null

function getGroqClient(): Groq {
  if (!groqClient) {
    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) throw new Error('GROQ_API_KEY missing')
    groqClient = new Groq({ apiKey })
  }
  return groqClient
}

interface SummaryInput {
  property: any
  priceAnalysis: PriceAnalysis
  trend: TrendAnalysis
  location: LocationInsights
  comparables: ComparableProperty[]
}

export async function generateAISummary(
  input: SummaryInput
): Promise<string | null> {
  try {
    const groq = getGroqClient()
    const { property, priceAnalysis, trend, location, comparables } = input

    // Structured data for AI
    const data = {
      property: {
        title: property.title,
        price: Number(property.price),
        area: property.area,
        pricePerM2: priceAnalysis.price_per_m2,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        yearBuilt: property.year_built,
        parking: property.has_parking,
        location: `${property.neighborhood || ''}, ${property.city || ''}`,
        listingType: property.listing_type,
      },
      market: {
        comparableAverage: priceAnalysis.comparable_average,
        comparableMedian: priceAnalysis.comparable_median,
        comparableCount: priceAnalysis.comparable_count,
        priceDifferencePct: priceAnalysis.price_difference_pct,
        marketPosition: priceAnalysis.market_position,
        percentile: priceAnalysis.percentile,
      },
      trend: {
        direction: trend.trend_direction,
        pct12m: trend.trend_pct_12m,
        pct5y: trend.trend_pct_5y,
      },
      location: {
        score: location.location_score,
        cityTier: location.city_tier,
        distanceFromCenter: location.distance_from_center,
      },
    }

    const prompt = `Ti je një analist profesional i pasurive të patundshme në Kosovë.

Detyra: Shkruaj një përmbledhje FAKTUALE (3-5 fjali) për këtë pronë.

RREGULLA TË RËNDËSISHME:
- Bazohu VETËM në statistikat e dhëna
- MOS shpik informacione
- Shkruaj në shqip profesional dhe të qartë
- Pa emoji
- Pa markdown
- Pa hyrje si "Kjo pronë është..."
- Përfundo me një vlerësim të qartë nëse është çmim i mirë apo jo
- Nëse ka trend pozitiv, përmend atë
- Nëse çmimi është nën mesatare, shpjego pse mund të jetë avantazh

STATISTIKAT:
${JSON.stringify(data, null, 2)}

Përmbledhja:`

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'qwen/qwen3.8-27b',
      temperature: 0.3,
      max_tokens: 400,
    })

    return completion.choices[0]?.message?.content?.trim() || null
  } catch (error: any) {
    console.error('AI summary error:', error.message)
    return null
  }
}