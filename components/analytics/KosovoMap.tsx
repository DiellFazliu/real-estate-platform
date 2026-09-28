'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import type { MunicipalityStats } from '@/lib/analytics/municipality-data'

const SVG_ID_TO_SLUG: Record<string, string> = {
  'XK-DE': 'decan', 'XK-GJ': 'gjakove', 'XK-DRE': 'gllogoc',
  'XK-GN': 'gjilan', 'XK-DR': 'dragash', 'XK-IS': 'istog',
  'XK-KA': 'kacanik', 'XK-KL': 'kline', 'XK-FK': 'fushe-kosove',
  'XK-KM': 'kamenice', 'XK-MJ': 'mitrovice', 'XK-LE': 'leposaviq',
  'XK-LI': 'lipjan', 'XK-NB': 'novoberde', 'XK-OB': 'obiliq',
  'XK-RA': 'rahovec', 'XK-PE': 'peje', 'XK-PO': 'podujeve',
  'XK-PZ': 'prizren', 'XK-PR': 'prishtine', 'XK-SK': 'skenderaj',
  'XK-SHT': 'shtime', 'XK-SH': 'shterpce', 'XK-SU': 'suhareke',
  'XK-FE': 'ferizaj', 'XK-VI': 'viti', 'XK-VU': 'vushtrri',
  'XK-ZP': 'zubin-potok', 'XK-ZV': 'zvecan', 'XK-MA': 'malisheve',
  'XK-HE': 'hani-elezit', 'XK-MA2': 'mamushe', 'XK-JU': 'junik',
  'XK-KL2': 'kllokot', 'XK-GR': 'gracanice', 'XK-RN': 'ranillug',
  'XK-PT': 'partesh', 'XK-MV': 'mitrovica-veriut',
}

const STYLE_DEFAULT = { fill: '#F3E9E0', stroke: '#d1d5db', strokeWidth: '0.5' }
const STYLE_HOVER = { fill: '#6B4C3B', stroke: '#F7F3EE', strokeWidth: '1.5' }

function applyStyle(el: SVGElement, style: typeof STYLE_DEFAULT) {
  el.setAttribute('fill', style.fill)
  el.setAttribute('stroke', style.stroke)
  el.setAttribute('stroke-width', "0.2")
}

function getPaths(node: SVGElement): SVGElement[] {
  return node.tagName.toLowerCase() === 'path'
    ? [node]
    : Array.from(node.querySelectorAll('path'))
}

interface KosovoMapProps {
  stats: MunicipalityStats[]
  svgContent: string
  onMunicipalityClick?: (slug: string) => void
}

export function KosovoMap({ stats, svgContent, onMunicipalityClick }: KosovoMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  const statsBySlug = useMemo(
    () => new Map(stats.map((s) => [s.slug, s])),
    [stats]
  )

  // Injekto SVG + aplikoj stilet fillestare
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.innerHTML = svgContent

    const svg = container.querySelector('svg')
    if (svg) {
      svg.style.background = 'transparent'
      svg.style.display = 'block'
      // Hiq background rects
      svg.querySelectorAll('rect').forEach((rect) => {
        if (!rect.id.startsWith('XK-')) rect.setAttribute('fill', 'none')
      })
    }

    // Aplikoj stil default + metadata për secilën komunë
    container.querySelectorAll<SVGElement>('[id^="XK-"]').forEach((node) => {
      getPaths(node).forEach((p) => {
        applyStyle(p, STYLE_DEFAULT)
        p.style.transition = 'fill 0.2s ease, stroke 0.2s ease, stroke-width 0.2s ease'
      })
      node.setAttribute('data-slug', SVG_ID_TO_SLUG[node.id] || '')
      node.style.cursor = 'pointer'
    })
  }, [svgContent])

  // Aplikoj hover efektin
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.querySelectorAll<SVGElement>('[id^="XK-"]').forEach((node) => {
      const style = node.id === hoveredId ? STYLE_HOVER : STYLE_DEFAULT
      getPaths(node).forEach((p) => applyStyle(p, style))
    })
  }, [hoveredId])

  // Event delegation
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const findMunicipality = (target: EventTarget | null): SVGElement | null => {
      let el = target as Node | null
      while (el && el !== container) {
        if (el instanceof SVGElement && el.id.startsWith('XK-')) return el
        el = el.parentNode
      }
      return null
    }

    const handleOver = (e: MouseEvent) => {
      const node = findMunicipality(e.target)
      if (node) setHoveredId(node.id)
    }
    const handleOut = (e: MouseEvent) => {
      const related = e.relatedTarget as Node | null
      if (!related || !container.contains(related)) setHoveredId(null)
    }
    const handleMove = (e: MouseEvent) =>
      setMousePos({ x: e.clientX, y: e.clientY })
    const handleClick = (e: MouseEvent) => {
      const slug = findMunicipality(e.target)?.getAttribute('data-slug')
      if (slug && onMunicipalityClick) onMunicipalityClick(slug)
    }

    container.addEventListener('mouseover', handleOver)
    container.addEventListener('mouseout', handleOut)
    container.addEventListener('mousemove', handleMove)
    container.addEventListener('click', handleClick)

    return () => {
      container.removeEventListener('mouseover', handleOver)
      container.removeEventListener('mouseout', handleOut)
      container.removeEventListener('mousemove', handleMove)
      container.removeEventListener('click', handleClick)
    }
  }, [onMunicipalityClick])

  const hoveredStat = hoveredId
    ? statsBySlug.get(SVG_ID_TO_SLUG[hoveredId] || '')
    : null

  return (
    <>
      <div
        ref={containerRef}
        className="inline-block [&_svg]:block [&_svg]:w-full [&_svg]:h-auto [&_svg]:bg-transparent"
      />
      {hoveredStat && <MapTooltip stat={hoveredStat} mousePos={mousePos} />}
    </>
  )
}

function MapTooltip({ stat, mousePos }: { stat: MunicipalityStats; mousePos: { x: number; y: number } }) {
  return (
    <div
      className="fixed z-50 pointer-events-none bg-white shadow-2xl rounded-xl p-4 text-sm border border-gray-200 min-w-[220px]"
      style={{ left: mousePos.x + 15, top: mousePos.y + 15 }}
    >
      <div className="font-bold text-base mb-2 text-gray-900">{stat.name}</div>
      {stat.count > 0 ? (
        <div className="space-y-1 text-gray-700">
          <Row label="🏠 Prona" value={stat.count} />
          <Row label="💰 Mesatar/m²" value={`€${stat.avgPriceM2.toLocaleString()}`} />
          <Row label="📊 Median/m²" value={`€${stat.medianPriceM2.toLocaleString()}`} />
          <Row label="📉 Min/Max" value={`€${stat.minPriceM2}–€${stat.maxPriceM2}`} />
          <Row label="📐 Mesatarja" value={`${stat.avgArea} m²`} />
          {stat.avgBedrooms > 0 && <Row label="🛏️ Dhoma" value={stat.avgBedrooms} />}
        </div>
      ) : (
        <div className="text-gray-500 italic">Nuk ka të dhëna</div>
      )}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between">
      <span>{label}:</span>
      <strong>{value}</strong>
    </div>
  )
}