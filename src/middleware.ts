import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // NOTE If not signed in and tries to access /dashboard -- redirect to login page
  if (req.nextUrl.pathname.startsWith("/dashboard")) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // NOTE: Atempting to open signup page via expired email verification link
  const emailLinkError = "Email link is invalid or has been expired";

  if (
    req.nextUrl.searchParams.get("error_description") === emailLinkError &&
    req.nextUrl.pathname !== "/signup"
  ) {
    return NextResponse.redirect(
      new URL(
        `/signup?error_description=${req.nextUrl.searchParams.get(
          "error_description"
        )}`,
        req.url
      )
    );
  }

  // NOTE: if session already exists -- redirecting to /dashboard
  if (["/login", "/signup"].includes(req.nextUrl.pathname)) {
    if (session) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }
}
