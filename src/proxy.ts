import { NextResponse, type NextRequest } from "next/server"
import { decode } from "next-auth/jwt"

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isAdminRoute = pathname.startsWith("/admin")
  const isLoginPage = pathname === "/admin/login"
  const isApiAuthRoute = pathname.startsWith("/api/auth")

  if (isLoginPage || isApiAuthRoute) {
    return NextResponse.next()
  }

  if (isAdminRoute) {
    const secureToken = request.cookies.get("__Secure-authjs.session-token")?.value
    const token = secureToken ?? request.cookies.get("authjs.session-token")?.value
    const salt = secureToken ? "__Secure-authjs.session-token" : "authjs.session-token"
    const secret = process.env.AUTH_SECRET

    if (!token || !secret) {
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }

    let session = null
    try {
      session = await decode({ token, secret, salt })
    } catch {
      session = null
    }

    if (!session?.sub) {
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
