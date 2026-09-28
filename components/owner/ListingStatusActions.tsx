'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import {
  Loader2,
  Tag,
  Trash2,
  RotateCcw,
  X,
} from 'lucide-react'

import {
  markPropertySold,
  markPropertyUnavailable,
  restoreProperty,
} from '@/app/actions/properties'

type Action = 'mark' | 'restore'

interface Props {
  propertyId: number
  propertyTitle: string
  action: Action
  restrictToSold?: boolean
}

type ModalKind = 'sold' | 'unavailable' | 'restore' | null

export function ListingStatusActions({
  propertyId,
  propertyTitle,
  action,
  restrictToSold = false,
}: Props) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [modal, setModal] = useState<ModalKind>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // ⭐ Portal-i duhet të montohet vetëm në client
  useEffect(() => {
    setMounted(true)
  }, [])

  async function run(kind: Exclude<ModalKind, null>) {
    setLoading(true)
    setError('')

    const formData = new FormData()
    formData.set('propertyId', String(propertyId))

    let result

    if (kind === 'sold') {
      result = await markPropertySold(formData)
    } else if (kind === 'unavailable') {
      result = await markPropertyUnavailable(formData)
    } else {
      result = await restoreProperty(formData)
    }

    setLoading(false)

    if (!result.success) {
      setError(result.error || 'Veprimi dështoi.')
      return
    }

    setModal(null)
    router.refresh()
  }

  const modalContent =
    modal && mounted
      ? createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
            onClick={() => !loading && setModal(null)}
          >
            <div
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                      modal === 'sold'
                        ? 'bg-emerald-100 text-emerald-700'
                        : modal === 'unavailable'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-[#F3E9E0] text-[#6B4C3B]'
                    }`}
                  >
                    {modal === 'sold' && <Tag size={18} />}
                    {modal === 'unavailable' && <Trash2 size={18} />}
                    {modal === 'restore' && <RotateCcw size={18} />}
                  </div>

                  <div>
                    <p className="text-sm font-bold text-[#171310]">
                      {modal === 'sold' && 'Shëno si të shitur'}
                      {modal === 'unavailable' && 'Tërhiq pronën'}
                      {modal === 'restore' && 'Rikthe pronën në publik'}
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs text-gray-500">
                      {propertyTitle}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => !loading && setModal(null)}
                  className="rounded-lg p-1 text-gray-400 transition hover:bg-[#F7F3EE]"
                  aria-label="Mbyll"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="mt-5 rounded-xl bg-[#FBF8F5] p-4">
                {modal === 'sold' && (
                  <p className="text-sm leading-6 text-gray-700">
                    Prona do të mbetet e dukshme në platformë, por do të
                    shfaqet me etiketën <strong>"SHITUR"</strong> dhe nuk
                    do të pranojë më rezervime vizitash apo ruajtje në
                    favorite.
                  </p>
                )}
                {modal === 'unavailable' && (
                  <p className="text-sm leading-6 text-gray-700">
                    Prona do të <strong>tërhiqet nga platforma</strong>.
                    Nuk do të shfaqet më në listime, kërkim, ose
                    favorite. Mund ta rikthesh në çdo kohë nga kjo faqe.
                  </p>
                )}
                {modal === 'restore' && (
                  <p className="text-sm leading-6 text-gray-700">
                    Prona do të shfaqet përsëri në platformë dhe do të
                    jetë e disponueshme për të gjithë përdoruesit.
                  </p>
                )}
              </div>

              {error && (
                <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  {error}
                </p>
              )}

              <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => !loading && setModal(null)}
                  disabled={loading}
                  className="rounded-xl border border-[#E8DDD2] px-4 py-2.5 text-sm font-medium text-[#6B4C3B] transition hover:bg-[#F7F3EE] disabled:opacity-50"
                >
                  Anulo
                </button>

                <button
                  type="button"
                  onClick={() => run(modal)}
                  disabled={loading}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition disabled:opacity-50 ${
                    modal === 'sold'
                      ? 'bg-emerald-700 hover:bg-emerald-800'
                      : modal === 'unavailable'
                        ? 'bg-red-700 hover:bg-red-800'
                        : 'bg-[#6B4C3B] hover:bg-[#4A3328]'
                  }`}
                >
                  {loading && <Loader2 size={14} className="animate-spin" />}
                  {modal === 'sold' && 'Po, shëno si shitur'}
                  {modal === 'unavailable' && 'Po, tërhiq'}
                  {modal === 'restore' && 'Po, rikthe'}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )
      : null

  return (
    <>
      {action === 'mark' && (
        <>
          <button
            type="button"
            onClick={() => setModal('sold')}
            className="flex items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-800"
          >
            <Tag size={16} />
            Shëno si shitur
          </button>

          {!restrictToSold && (
            <button
              type="button"
              onClick={() => setModal('unavailable')}
              className="flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50"
            >
              <Trash2 size={16} />
              Tërhiq
            </button>
          )}
        </>
      )}

      {action === 'restore' && (
        <button
          type="button"
          onClick={() => setModal('restore')}
          className="flex items-center justify-center gap-2 rounded-lg bg-[#6B4C3B] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#4A3328]"
        >
          <RotateCcw size={16} />
          Rikthe në publik
        </button>
      )}

      {modalContent}
    </>
  )
}