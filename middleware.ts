import { NextResponse, type NextRequest } from 'next/server';
export function middleware(req: NextRequest) {
  if (!req.cookies.get('np_session')) { const u = req.nextUrl.clone(); u.pathname = '/giris'; u.search = req.nextUrl.pathname.startsWith('/yonetim') ? '?tur=yonetici' : req.nextUrl.pathname.startsWith('/portfoy') ? '?tur=portfoy' : req.nextUrl.pathname.startsWith('/taseron') ? '?tur=taseron' : ''; return NextResponse.redirect(u); }
  return NextResponse.next();
}
export const config = { matcher: ['/panel/:path*', '/yonetim/:path*', '/portfoy/:path*', '/taseron/:path*'] };
