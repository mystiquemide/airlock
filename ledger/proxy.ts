import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const PROTECTED_ROUTES = [
  "/dashboard",
  "/ledger",
  "/agents",
  "/policy",
  "/settings"
]

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isProtected = PROTECTED_ROUTES.some(route =>
    pathname.startsWith(route)
  )

  if (!isProtected) return NextResponse.next()

  const session = request.cookies.get("airlock_session")

  if (!session) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("from", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/ledger/:path*",
    "/agents/:path*",
    "/policy/:path*",
    "/settings/:path*"
  ]
}
