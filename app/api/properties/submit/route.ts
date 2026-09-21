import { NextResponse } from 'next/server'

import { submitProperty } from '@/app/actions/properties'

export async function POST(request: Request) {
  const formData = await request.formData()
  const result = await submitProperty(formData)

  return NextResponse.json(result, { status: result.success ? 201 : 400 })
}
