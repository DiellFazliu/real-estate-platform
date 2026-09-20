import type { PriceAnalysis } from './price-engine'

export interface Warning {
  type: 'PRICE' | 'DATA' | 'LOCATION' | 'DOCUMENT'
  severity: 'INFO' | 'WARNING' | 'DANGER'
  message: string
  icon?: string
}

export function detectAnomalies(
  property: any,
  analysis: PriceAnalysis
): Warning[] {
  const warnings: Warning[] = []

  // ═══════════════════════════════════════════════════════════
  // PRICE ANOMALIES
  // ═══════════════════════════════════════════════════════════
  if (
    analysis.price_difference_pct !== null &&
    analysis.price_difference_pct < -15
  ) {
    warnings.push({
      type: 'PRICE',
      severity: 'INFO',
      icon: '💰',
      message: `Çmimi është ${Math.abs(analysis.price_difference_pct).toFixed(1)}% nën mesataren e pronave të ngjashme. Verifiko arsyen (gjendja, kati, orientimi).`,
    })
  }

  if (
    analysis.price_difference_pct !== null &&
    analysis.price_difference_pct > 20
  ) {
    warnings.push({
      type: 'PRICE',
      severity: 'WARNING',
      icon: '💰',
      message: `Çmimi është ${analysis.price_difference_pct.toFixed(1)}% mbi mesataren e pronave të ngjashme.`,
    })
  }

  // ═══════════════════════════════════════════════════════════
  // DATA ANOMALIES
  // ═══════════════════════════════════════════════════════════
  if (!property.area || property.area === 0) {
    warnings.push({
      type: 'DATA',
      severity: 'WARNING',
      icon: '📐',
      message: 'Sipërfaqja e pronës mungon. Verifiko me shitësin.',
    })
  }

  if (!property.year_built) {
    warnings.push({
      type: 'DATA',
      severity: 'INFO',
      icon: '🏗️',
      message: 'Viti i ndërtimit mungon. Kërko dokumentacionin.',
    })
  }

  if (!property.floor && property.property_type === 'apartment') {
    warnings.push({
      type: 'DATA',
      severity: 'INFO',
      icon: '🏢',
      message: 'Kati i pronës mungon. Verifiko nëse ka ashensor.',
    })
  }

  // ═══════════════════════════════════════════════════════════
  // DOCUMENT WARNINGS
  // ═══════════════════════════════════════════════════════════
  if (property.has_parking) {
    warnings.push({
      type: 'DOCUMENT',
      severity: 'INFO',
      icon: '🚗',
      message: 'Verifiko nëse parkingu përfshihet në dokumentet e pronësisë.',
    })
  }

  if (property.balconies > 0) {
    warnings.push({
      type: 'DOCUMENT',
      severity: 'INFO',
      icon: '🏠',
      message: 'Verifiko nëse ballkonet janë të regjistruara në kadastër.',
    })
  }

  // ═══════════════════════════════════════════════════════════
  // CONSISTENCY
  // ═══════════════════════════════════════════════════════════
  if (property.bathrooms && property.bedrooms) {
    if (property.bathrooms > property.bedrooms) {
      warnings.push({
        type: 'DATA',
        severity: 'INFO',
        icon: '🚿',
        message: 'Numri i banjove është më i madh se numri i dhomave.',
      })
    }
  }

  // ═══════════════════════════════════════════════════════════
  // MAINTENANCE
  // ═══════════════════════════════════════════════════════════
  const age = new Date().getFullYear() - (property.year_built || 2020)
  if (age > 30) {
    warnings.push({
      type: 'LOCATION',
      severity: 'INFO',
      icon: '🔧',
      message: `Prona është ${age} vjet e vjetër. Verifiko gjendjen e instalimeve dhe çatisë.`,
    })
  }

  return warnings
}