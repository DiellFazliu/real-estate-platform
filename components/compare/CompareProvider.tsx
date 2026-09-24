'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'

const MAX_COMPARE = 4

export interface CompareProperty {
  id: number
  slug: string
  title: string
  price: number
  city: string | null
  neighborhood: string | null
  primary_image_url: string | null
}

interface CompareContextValue {
  selectedProperties: CompareProperty[]
  isSelected: (id: number) => boolean
  addProperty: (property: CompareProperty) => boolean
  removeProperty: (id: number) => void
  toggleProperty: (property: CompareProperty) => boolean
  clearAll: () => void
  canAddMore: boolean
  maxCompare: number
}

const CompareContext = createContext<CompareContextValue | null>(null)

export function CompareProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [selectedProperties, setSelectedProperties] = useState<
    CompareProperty[]
  >([])

  const isSelected = useCallback(
    (id: number) => {
      return selectedProperties.some((property) => property.id === id)
    },
    [selectedProperties],
  )

  const addProperty = useCallback((property: CompareProperty) => {
    let added = false

    setSelectedProperties((current) => {
      if (current.some((item) => item.id === property.id)) {
        return current
      }

      if (current.length >= MAX_COMPARE) {
        return current
      }

      added = true
      return [...current, property]
    })

    return added
  }, [])

  const removeProperty = useCallback((id: number) => {
    setSelectedProperties((current) =>
      current.filter((property) => property.id !== id),
    )
  }, [])

  const toggleProperty = useCallback(
    (property: CompareProperty) => {
      if (isSelected(property.id)) {
        removeProperty(property.id)
        return false
      }

      return addProperty(property)
    },
    [addProperty, isSelected, removeProperty],
  )

  const clearAll = useCallback(() => {
    setSelectedProperties([])
  }, [])

  const value = useMemo<CompareContextValue>(
    () => ({
      selectedProperties,
      isSelected,
      addProperty,
      removeProperty,
      toggleProperty,
      clearAll,
      canAddMore: selectedProperties.length < MAX_COMPARE,
      maxCompare: MAX_COMPARE,
    }),
    [
      selectedProperties,
      isSelected,
      addProperty,
      removeProperty,
      toggleProperty,
      clearAll,
    ],
  )

    return (
    <CompareContext.Provider value={value}>
        {children}
    </CompareContext.Provider>
    )
}

export function useCompare() {
  const context = useContext(CompareContext)

  if (!context) {
    throw new Error(
      'useCompare must be used inside a CompareProvider',
    )
  }

  return context
}