import PendingPropertyReviewsPage from '@/app/(dashboard)/owner/properties/pending/page'

type PageProps = {
  searchParams: Promise<Record<string, string | undefined>>
}

export default async function AdminReviewsPage({ searchParams }: PageProps) {
  const params = await searchParams

  return (
    <PendingPropertyReviewsPage
      searchParams={Promise.resolve({ ...params, context: 'admin' })}
    />
  )
}