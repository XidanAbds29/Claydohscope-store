import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../lib/supabaseAdmin'

async function verifyAdmin(request: Request) {
  const auth = request.headers.get('authorization') || ''
  const token = auth.replace('Bearer ', '')
  if (!token) return { ok: false, status: 401, message: 'Missing Authorization token' }

  const { data, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !data?.user) return { ok: false, status: 401, message: 'Invalid token' }

  const allowed = process.env.ADMIN_USER || process.env.NEXT_PUBLIC_ADMIN_USER
  if (allowed && data.user.email !== allowed) return { ok: false, status: 403, message: 'Not authorized' }

  return { ok: true, user: data.user }
}

export async function GET(request: Request) {
  const verify = await verifyAdmin(request)
  if (!verify.ok) return NextResponse.json({ error: verify.message }, { status: verify.status })

  const { data, error } = await supabaseAdmin.from('orders').select('*').order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ orders: data })
}
