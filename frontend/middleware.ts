import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const ROLE_ROUTES: Record<string, string[]> = {
  "/admin":          ["super_admin"],
  "/owner":          ["owner"],
  "/staff/manager":  ["manager", "owner"],
  "/staff/host":     ["host", "manager", "owner"],
  "/staff/waiter":   ["waiter", "manager", "owner"],
  "/staff/chef":     ["chef", "manager", "owner"],
  "/staff/cashier":  ["cashier", "manager", "owner"],
  "/staff":          ["manager", "host", "waiter", "chef", "cashier", "owner"],
};

function getRoleRequirement(pathname: string): string[] | null {
  for (const [prefix, roles] of Object.entries(ROLE_ROUTES)) {
    if (pathname.startsWith(prefix)) return roles;
  }
  return null;
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico"
  ) {
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet: { name: string; value: string; options: Record<string, any> }[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const userRole = session.user.user_metadata?.role as string | undefined;
  const requiredRoles = getRoleRequirement(pathname);

  if (requiredRoles && userRole && !requiredRoles.includes(userRole)) {
    const dashboardMap: Record<string, string> = {
      super_admin: "/admin/dashboard",
      owner:       "/owner/dashboard",
      manager:     "/staff/dashboard",
      host:        "/staff/dashboard",
      waiter:      "/staff/dashboard",
      chef:        "/staff/dashboard",
      cashier:     "/staff/dashboard",
      customer:    "/home",
    };
    return NextResponse.redirect(new URL(dashboardMap[userRole] ?? "/auth/login", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
