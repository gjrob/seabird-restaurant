import { NextRequest, NextResponse } from 'next/server'
import { addCustomerNote } from '../../../../lib/crm'

export async function POST(req: NextRequest) {
  try {
    const { customerId, note } = await req.json()
    if (!customerId || !note?.trim()) {
      return NextResponse.json({ error: 'Missing customerId or note' }, { status: 400 })
    }
    const ok = await addCustomerNote(customerId, 'seabird', note.trim())
    if (!ok) return NextResponse.json({ error: 'Failed to save note' }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
