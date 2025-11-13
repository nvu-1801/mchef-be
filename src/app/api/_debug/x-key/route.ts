// app/api/_debug/x-key/route.ts
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const got = (req.headers.get('x-api-key') || '').trim();
  const expected = (process.env.INTERNAL_API_KEY || '').trim();

  const ok = !!got && !!expected && got === expected;

  console.log('[_debug/x-key]', {
    present: !!got, ok, gotLen: got.length, expLen: expected.length,
    // Không in full key. In vài ký tự đầu để đối chiếu
    gotHead: got.slice(0, 4), expHead: expected.slice(0, 4),
  });

  return NextResponse.json(
    { ok, present: !!got, gotLen: got.length, expLen: expected.length, gotHead: got.slice(0, 4), expHead: expected.slice(0, 4) },
    { status: ok ? 200 : 403 },
  );
}
