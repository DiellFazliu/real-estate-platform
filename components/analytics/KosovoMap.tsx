'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import type { MunicipalityStats } from '@/lib/analytics/municipality-data'

const SVG_ID_TO_SLUG: Record<string, string> = {
  'XK-DE': 'decan',
  'XK-GJ': 'gjakove',
  'XK-DRE': 'gllogoc',
  'XK-GN': 'gjilan',
  'XK-DR': 'dragash',
  'XK-IS': 'istog',
  'XK-KA': 'kacanik',
  'XK-KL': 'kline',
  'XK-FK': 'fushe-kosove',
  'XK-KM': 'kamenice',
  'XK-MJ': 'mitrovice',
  'XK-LE': 'leposaviq',
  'XK-LI': 'lipjan',
  'XK-NB': 'novoberde',
  'XK-OB': 'obiliq',
  'XK-RA': 'rahovec',
  'XK-PE': 'peje',
  'XK-PO': 'podujeve',
  'XK-PZ': 'prizren',
  'XK-PR': 'prishtine',
  'XK-SK': 'skenderaj',
  'XK-SHT': 'shtime',
  'XK-SH': 'shterpce',
  'XK-SU': 'suhareke',
  'XK-FE': 'ferizaj',
  'XK-VI': 'viti',
  'XK-VU': 'vushtrri',
  'XK-ZP': 'zubin-potok',
  'XK-ZV': 'zvecan',
  'XK-MA': 'malisheve',
  'XK-HE': 'hani-elezit',
  'XK-MA2': 'mamushe',
  'XK-JU': 'junik',
  'XK-KL2': 'kllokot',
  'XK-GR': 'gracanice',
  'XK-RN': 'ranillug',
  'XK-PT': 'partesh',
  'XK-MV': 'mitrovica-veriut',
}

interface KosovoMapProps {
  stats: MunicipalityStats[]
  svgContent: string
  onMunicipalityClick?: (slug: string) => void
}

export function KosovoMap({
  stats,
  svgContent,
  onMunicipalityClick,
}: KosovoMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [ready, setReady] = useState(false)

  const statsBySlug = useMemo(() => {
    const map = new Map<string, MunicipalityStats>()
    stats.forEach((s) => map.set(s.slug, s))
    return map
  }, [stats])

  // Hapi 1: injekto SVG-në
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    container.innerHTML = svgContent
    setReady(true)
  }, [svgContent])

  // Hapi 2: bëj të gjitha komunat të bardha + hiq background-in e SVG-së
  useEffect(() => {
    if (!ready) return
    const container = containerRef.current
    if (!container) return

    // Hiq background-in nga SVG-ja
    const svg = container.querySelector('svg')
    if (svg) {
      svg.style.background = 'transparent'
      svg.style.display = 'block'
      // Hiq çdo rect/fill që mbulon sfondin
      svg.querySelectorAll('rect').forEach((rect) => {
        if (rect.id !== 'XK-' && !rect.id.startsWith('XK-')) {
          const fill = rect.getAttribute('fill')
          if (
            !fill ||
            fill === '#fff' ||
            fill === '#ffffff' ||
            fill === 'white' ||
            fill === 'none' ||
            fill.startsWith('#f')
          ) {
            rect.setAttribute('fill', 'none')
          }
        }
      })
    }

    const nodes = container.querySelectorAll<SVGElement>('[id^="XK-"]')

    nodes.forEach((node) => {
      const id = node.id
      const slug = SVG_ID_TO_SLUG[id]

      const applyWhite = (el: SVGElement) => {
        el.setAttribute('fill', '#F3E9E0')
        el.setAttribute('stroke', '#d1d5db')
        el.setAttribute('stroke-width', '0')
      }

      if (node.tagName.toLowerCase() === 'path') {
        applyWhite(node)
      } else {
        node.querySelectorAll('path').forEach((p) => applyWhite(p))
      }

      node.setAttribute('data-slug', slug || '')
      node.style.cursor = 'pointer'
      node.style.transition = 'fill 0.15s ease, opacity 0.15s ease'
    })
  }, [ready])

  // Hapi 3: event delegation
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const findXKNode = (target: EventTarget | null): SVGElement | null => {
      let el = target as Node | null
      while (el && el !== container) {
        if (el instanceof SVGElement && el.id && el.id.startsWith('XK-')) {
          return el
        }
        el = el.parentNode
      }
      return null
    }

    const handleOver = (e: Event) => {
      const node = findXKNode(e.target)
      if (node) setHoveredId(node.id)
    }
    const handleOut = () => setHoveredId(null)
    const handleMove = (e: MouseEvent) =>
      setMousePos({ x: e.clientX, y: e.clientY })
    const handleClick = (e: Event) => {
      const node = findXKNode(e.target)
      const slug = node?.getAttribute('data-slug')
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

function MapTooltip({
  stat,
  mousePos,
}: {
  stat: MunicipalityStats
  mousePos: { x: number; y: number }
}) {
  return (
    <div
      className="fixed z-50 pointer-events-none bg-white shadow-2xl rounded-xl p-4 text-sm border border-gray-200 min-w-[220px]"
      style={{ left: mousePos.x + 15, top: mousePos.y + 15 }}
    >
      <div className="font-bold text-base mb-2 text-gray-900">{stat.name}</div>
      {stat.count > 0 ? (
        <div className="space-y-1 text-gray-700">
          <div className="flex justify-between">
            <span>🏠 Prona:</span>
            <strong>{stat.count}</strong>
          </div>
          <div className="flex justify-between">
            <span>💰 Mesatar/m²:</span>
            <strong>€{stat.avgPriceM2.toLocaleString()}</strong>
          </div>
          <div className="flex justify-between">
            <span>📊 Median/m²:</span>
            <strong>€{stat.medianPriceM2.toLocaleString()}</strong>
          </div>
          <div className="flex justify-between">
            <span>📉 Min/Max:</span>
            <strong>
              €{stat.minPriceM2}–€{stat.maxPriceM2}
            </strong>
          </div>
          <div className="flex justify-between">
            <span>📐 Mesatarja:</span>
            <strong>{stat.avgArea} m²</strong>
          </div>
          {stat.avgBedrooms > 0 && (
            <div className="flex justify-between">
              <span>🛏️ Dhoma:</span>
              <strong>{stat.avgBedrooms}</strong>
            </div>
          )}
        </div>
      ) : (
        <div className="text-gray-500 italic">Nuk ka të dhëna</div>
      )}
    </div>
  )
}