import { NextResponse, NextRequest } from 'next/server'
import { supabaseAdmin } from '../../../../../lib/supabaseAdmin'

async function verifyAdmin(request: NextRequest) {
  const auth = request.headers.get('authorization') || ''
  const token = auth.replace('Bearer ', '')
  if (!token) return { ok: false, status: 401, message: 'Missing Authorization token' }

  const { data, error } = await supabaseAdmin.auth.getUser(token)
  if (error || !data?.user) return { ok: false, status: 401, message: 'Invalid token' }

  const allowed = process.env.ADMIN_USER || process.env.NEXT_PUBLIC_ADMIN_USER
  if (allowed && data.user.email !== allowed) return { ok: false, status: 403, message: 'Not authorized' }

  return { ok: true, user: data.user }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const verify = await verifyAdmin(request)
  if (!verify.ok) return NextResponse.json({ error: verify.message }, { status: verify.status })

  // Next.js typings may provide params as a Promise in some versions — await to normalize
  const params = await context.params
  const { id } = params
  const body = await request.json().catch(() => ({}))
  const { status } = body
  if (!status) return NextResponse.json({ error: 'Missing status field' }, { status: 400 })

  const { data, error } = await supabaseAdmin.from('orders').update({ status }).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ order: data })
}
