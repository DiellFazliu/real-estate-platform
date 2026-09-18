'use client'

import { useState } from 'react'
import { updateAdminUser } from '@/app/actions/admin'

type Role = { id: number; name: string }

export function UserAccessForm({ userId, roleId, isActive, roles }: { userId: number; roleId: number; isActive: boolean; roles: Role[] }) {
  const [selectedRole, setSelectedRole] = useState(String(roleId))
  const [active, setActive] = useState(isActive)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    setMessage('')
    setError('')
    const formData = new FormData()
    formData.set('userId', String(userId))
    formData.set('roleId', selectedRole)
    formData.set('isActive', String(active))
    const result = await updateAdminUser(formData)
    setSaving(false)
    if (!result.success) setError(result.error || 'Ruajtja dështoi.')
    else setMessage(result.message || 'U ruajt.')
  }

  return (
    <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center">
      <select value={selectedRole} onChange={(event) => setSelectedRole(event.target.value)} className="rounded-lg border border-[#D8C4B3] bg-white px-2 py-2 text-sm text-black">
        {roles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}
      </select>
      <label className="flex items-center gap-2 text-sm text-[#6B4C3B]">
        <input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} /> Active
      </label>
      <button type="button" onClick={save} disabled={saving} className="rounded-lg bg-[#6B4C3B] px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">
        {saving ? 'Saving...' : 'Save'}
      </button>
      {message && <span className="text-xs text-emerald-700">{message}</span>}
      {error && <span className="text-xs text-red-700">{error}</span>}
    </div>
  )
}
