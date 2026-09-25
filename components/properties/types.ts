import type { getPropertyDetail } from '@/lib/data/properties/get-property-detail'

export type PropertyPageData = NonNullable<Awaited<ReturnType<typeof getPropertyDetail>>>
