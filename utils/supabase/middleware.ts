// src/middleware.ts
import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export const updateSession = async (request: NextRequest) => {
  try {
    const response = NextResponse.next();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options),
            );
          },
        },
      }
    );

    const { data: { user }, error } = await supabase.auth.getUser();

    // Protected routes handling
    if (request.nextUrl.pathname.startsWith("/protected")) {
      if (error || !user) {
        return NextResponse.redirect(new URL("/sign-in", request.url));
      }

      // Role-based access control
      const role = user.user_metadata?.role;
      if (role === 'teacher' && request.nextUrl.pathname.startsWith("/protected/school")) {
        return NextResponse.redirect(new URL("/protected/teacher/dashboard", request.url));
      }
      if (role === 'school' && request.nextUrl.pathname.startsWith("/protected/teacher")) {
        return NextResponse.redirect(new URL("/protected/school/dashboard", request.url));
      }
    }

    // Redirect authenticated users from public pages
    if (["/", "/sign-in"].includes(request.nextUrl.pathname) && user) {
      const role = user.user_metadata?.role;
      const redirectPath = role === 'teacher' ? '/protected/teacher/dashboard' : '/protected/school/dashboard';
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }

    return response;
  } catch (e) {
    return NextResponse.next();
  }
};

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
