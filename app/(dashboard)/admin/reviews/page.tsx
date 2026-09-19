import PendingPropertyReviewsPage from '@/app/(dashboard)/owner/properties/pending/page'

type PageProps = {
	searchParams: Promise<Record<string, string | undefined>>
}

export default function AdminReviewsPage({ searchParams }: PageProps) {
	return (
		<PendingPropertyReviewsPage
			searchParams={searchParams.then((params) => ({ ...params, context: 'admin' }))}
		/>
	)
}
