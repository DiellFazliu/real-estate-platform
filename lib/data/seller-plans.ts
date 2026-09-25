export type PlanId = 'basic' | 'premium' | 'agency'

export interface SellerPlan {
  id: PlanId
  name: string
  price: string
  period?: string
  description: string
  features: string[]
  highlighted: boolean
  limits: {
    maxActiveListings: number // -1 = pafund
    maxImagesPerListing: number // -1 = pafund
  }
}

export const SELLER_PLANS: Record<PlanId, SellerPlan> = {
  basic: {
    id: 'basic',
    name: 'Bazik',
    price: 'Falas',
    description: 'Për fillestarët që duan të provojnë platformën',
    features: [
      '1 listim aktiv',
      '5 foto',
      'Statistika bazë',
      'Përgjigje ndaj kërkesave',
      'Mbështetje me email',
    ],
    highlighted: false,
    limits: {
      maxActiveListings: 1,
      maxImagesPerListing: 5,
    },
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    price: '€29',
    period: '/muaj',
    description: 'Për shitës serioz që duan më shumë',
    features: [
      '10 listime aktive',
      '20 foto për listim',
      'Statistika të detajuara',
      'Promovim në faqen kryesore',
      'Fotograf profesional (1 sesion)',
      'Mbështetje prioritare',
    ],
    highlighted: true,
    limits: {
      maxActiveListings: 10,
      maxImagesPerListing: 20,
    },
  },
  agency: {
    id: 'agency',
    name: 'Agjenci',
    price: '€99',
    period: '/muaj',
    description: 'Për agjensitë dhe zhvilluesit',
    features: [
      'Listime të pakufizuara',
      'Foto të pakufizuara',
      'Statistika avancuara + eksport',
      'Branding i personalizuar',
      'API access',
      'Menaxher llogarie dedikuar',
      'Trajnim për ekipin',
    ],
    highlighted: false,
    limits: {
      maxActiveListings: -1,
      maxImagesPerListing: -1,
    },
  },
}

export const SELLER_PLANS_LIST = [
  SELLER_PLANS.basic,
  SELLER_PLANS.premium,
  SELLER_PLANS.agency,
]

export function getPlan(id: string | null | undefined): SellerPlan {
  if (id === 'premium') return SELLER_PLANS.premium
  if (id === 'agency') return SELLER_PLANS.agency
  return SELLER_PLANS.basic
}