import { ErrorLayout } from '@/components/shared/ErrorLayout'

export default function NotFound() {
  return (
    <ErrorLayout
      title="Faqja Nuk u Gjet"
      description="Na vjen keq, faqja që po kërkoni nuk ekziston ose është zhvendosur. Provo një nga opsionet më poshtë ose shfleto pronat e rekomanduara."
    />
  )
}