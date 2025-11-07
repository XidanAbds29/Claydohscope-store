import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const cookie = req.headers.get('cookie') || '';
  const isAuthed = cookie.includes('admin_auth=1');
  if (isAuthed) return NextResponse.json({ ok: true });
  return NextResponse.json({ ok: false }, { status: 401 });
}
