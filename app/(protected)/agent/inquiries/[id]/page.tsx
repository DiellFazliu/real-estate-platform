import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft, Mail, Phone, CheckCircle2 } from 'lucide-react'

import { auth } from '@/lib/auth/auth'
import { getAgentInquiryById } from '@/lib/db/queries/inquiries'
import { ReplyViaEmailButton } from '@/components/agent/ReplyViaEmailButton'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

export default async function AgentInquiryDetailPage({ params }: Props) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const { id } = await params
  const inquiryId = Number(id)
  if (!Number.isSafeInteger(inquiryId) || inquiryId <= 0) notFound()

  const agentId = Number(session.user.id)
  const inquiry = await getAgentInquiryById(inquiryId, agentId)
  if (!inquiry) notFound()

  // Nxirr subjektin nga mesazhi ([Subject]\n\n...)
  const subjectMatch = inquiry.message.match(/^\[(.+?)\]/)
  const subject = subjectMatch ? subjectMatch[1] : 'Kërkesë kontakti'

  return (
    <div className="p-8 lg:p-10">
      <Link
        href="/agent/inquiries"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#6B4C3B] hover:text-black"
      >
        <ArrowLeft className="h-4 w-4" />
        Kthehu te kërkesat
      </Link>

      <div className="mx-auto max-w-3xl">
        {/* ⭐ Header — me dy blloqe të brendshme */}
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500">
            {new Intl.DateTimeFormat('sq-AL', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            }).format(inquiry.created_at)}
            </p>
            <h1 className="mt-1 font-serif text-3xl text-[#171310]">
              {inquiry.name}
            </h1>
            <p className="mt-1 text-sm font-medium text-[#6B4C3B]">
              {subject}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <ReplyViaEmailButton
              inquiryId={inquiry.id}
              email={inquiry.email}
              subject={subject}
              inquiryName={inquiry.name}
              originalMessage={inquiry.message}
              alreadyResponded={inquiry.status === 'RESPONDED'}
            />

            {inquiry.status === 'RESPONDED' && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-800">
                <CheckCircle2 className="h-3.5 w-3.5" />
                E përgjigjur
              </span>
            )}
          </div>
        </div>

        {/* Kontaktet */}
        <div className="space-y-3 rounded-2xl border border-[#6B4C3B]/10 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 text-sm">
            <Mail className="h-4 w-4 text-[#6B4C3B]" />
            <a
              href={`mailto:${inquiry.email}`}
              className="font-medium text-[#6B4C3B] hover:underline"
            >
              {inquiry.email}
            </a>
          </div>

          {inquiry.phone && (
            <div className="flex items-center gap-3 text-sm">
              <Phone className="h-4 w-4 text-[#6B4C3B]" />
              <a
                href={`tel:${inquiry.phone}`}
                className="font-medium text-[#6B4C3B] hover:underline"
              >
                {inquiry.phone}
              </a>
            </div>
          )}
        </div>

        {/* Mesazhi origjinal */}
        <div className="mt-6 rounded-2xl border border-[#6B4C3B]/10 bg-white p-6 shadow-sm">
          <p className="whitespace-pre-wrap text-sm leading-7 text-[#171310]">
            {inquiry.message}
          </p>
        </div>
      </div>
    </div>
  )
}