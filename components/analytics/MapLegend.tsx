'use client'

interface MapLegendProps {
  minPrice: number
  maxPrice: number
}

export function MapLegend({ minPrice, maxPrice }: MapLegendProps) {
  return (
    <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-200">
      <span className="text-sm font-medium text-gray-600">
        €{minPrice.toLocaleString()}
      </span>
      <div
        className="w-64 h-4 rounded-full shadow-inner"
        style={{
          background:
            'linear-gradient(to right, rgb(0,255,80), rgb(255,255,80), rgb(255,0,80))',
        }}
      />
      <span className="text-sm font-medium text-gray-600">
        €{maxPrice.toLocaleString()}
      </span>
      <div className="ml-4 flex items-center gap-2 text-sm text-gray-500">
        <span className="w-3 h-3 rounded bg-gray-300 inline-block" />
        Pa të dhëna
      </div>
    </div>
  )
}