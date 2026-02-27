import { NextResponse } from 'next/server'
import { getCustomers } from '../../../../lib/crm'

export async function GET() {
  try {
    const customers = await getCustomers('seabird')
    return NextResponse.json(customers)
  } catch {
    return NextResponse.json([], { status: 500 })
  }
}
