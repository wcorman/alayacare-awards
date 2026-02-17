import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const LOCALE_COOKIE = "NEXT_LOCALE";
const SUPPORTED_LOCALES = ["en", "fr"] as const;

export function middleware(request: NextRequest) {
  const lang = request.nextUrl.searchParams.get("lang");

  if (lang && SUPPORTED_LOCALES.includes(lang as (typeof SUPPORTED_LOCALES)[number])) {
    const url = request.nextUrl.clone();
    url.searchParams.delete("lang");
    const response = NextResponse.redirect(url);
    response.cookies.set(LOCALE_COOKIE, lang, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year, same as Navbar
      sameSite: "lax",
    });
    return response;
  }

  return NextResponse.next();
}
