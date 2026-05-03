import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// In development we short-circuit middleware to avoid importing server SDKs
// which can cause issues in the edge runtime during local dev.

const ROLE_ROUTES: Record<string, string[]> = {
  "/admin":          ["super_admin"],
  "/owner":          ["owner"],
  "/staff/manager":  ["manager", "owner"],
  "/staff/host":     ["host", "manager", "owner"],
  "/staff/waiter":   ["waiter", "manager", "owner"],
  "/staff/chef":     ["chef", "manager", "owner"],
  "/staff/cashier":  ["cashier", "manager", "owner"],
  "/staff":          ["manager", "host", "waiter", "chef", "cashier", "owner"],
  "/delivery":       ["delivery_partner"],
};

function getRoleRequirement(pathname: string): string[] | null {
  for (const [prefix, roles] of Object.entries(ROLE_ROUTES)) {
    if (pathname.startsWith(prefix)) return roles;
  }
  return null;
}

function demoAuthEnabled() {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return process.env.NODE_ENV !== "production" || !key || key === "anon-key";
}

function dashboardForRole(role: string) {
  const dashboardMap: Record<string, string> = {
    super_admin: "/admin/dashboard",
    owner:       "/owner/dashboard",
    manager:     "/staff/manager/dashboard",
    host:        "/staff/host",
    waiter:      "/staff/waiter",
    chef:        "/staff/chef/kitchen",
    cashier:     "/staff/cashier",
    customer:    "/customer/home",
    delivery_partner: "/delivery",
  };
  return dashboardMap[role] ?? "/auth/login";
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const { pathname } = request.nextUrl;

  // Quick bypass for local development to avoid edge runtime import issues
  if (process.env.NODE_ENV !== 'production') return response;

  if (
    pathname.startsWith("/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico"
  ) {
    return response;
  }

  if (demoAuthEnabled() && request.cookies.get("dineluxe_demo_session")?.value === "1") {
    const demoRole = request.cookies.get("dineluxe_demo_role")?.value;
    const requiredRoles = getRoleRequirement(pathname);

    if (requiredRoles && demoRole && !requiredRoles.includes(demoRole)) {
      return NextResponse.redirect(new URL(dashboardForRole(demoRole), request.url));
    }

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
    return NextResponse.redirect(new URL(dashboardForRole(userRole), request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
