import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, password } = body;

    const ADMIN_USER = process.env.ADMIN_USER;
    const ADMIN_PASS = process.env.ADMIN_PASS;

    if (!ADMIN_USER || !ADMIN_PASS) {
      return NextResponse.json({ error: 'Admin credentials not configured' }, { status: 500 });
    }

    if (username === ADMIN_USER && password === ADMIN_PASS) {
      const res = NextResponse.json({ ok: true });
      // Set a simple httpOnly cookie for the admin session (short-lived)
      res.cookies.set('admin_auth', '1', { httpOnly: true, path: '/admin', maxAge: 60 * 60 * 8 });
      return res;
    }

    return NextResponse.json({ ok: false, error: 'Invalid credentials' }, { status: 401 });
  } catch (err) {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
}
