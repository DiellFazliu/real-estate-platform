import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react'

export const STATUS_CONFIG = {
  PENDING: {
    label: 'Në pritje',
    icon: Clock,
    color: 'bg-amber-100 text-amber-800 border-amber-200',
  },

  CONFIRMED: {
    label: 'Konfirmuar',
    icon: CheckCircle2,
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },

  REJECTED: {
    label: 'Refuzuar',
    icon: XCircle,
    color: 'bg-red-100 text-red-800 border-red-200',
  },

  CANCELLED: {
    label: 'Anuluar',
    icon: AlertCircle,
    color: 'bg-gray-100 text-gray-700 border-gray-200',
  },

  COMPLETED: {
    label: 'Përfunduar',
    icon: CheckCircle2,
    color: 'bg-blue-100 text-blue-800 border-blue-200',
  },
} as const